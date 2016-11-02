import { Component, ViewContainerRef, Input, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import * as d3 from 'd3';

import { ProjectTree } from "@maxxton/microdocs-core/domain";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import { ProjectService } from "../../services/project.service";
import * as colorHelper from '../../helpers/color.helper';

// import {Observable} from "rxjs";

@Component( {
  selector: 'dependency-graph',
  templateUrl: 'dependency-graph.html'
} )
export class DependencyGraph {

  error:string;
  force:any;
  filteredData:{dependencies:{}};
  data:ProjectTree;
  subscription:Subscription;

  showVersions:boolean = false;
  showInheritance:boolean = true;
  dropdownExpanded:boolean = false;
  groupToggles:GroupItem[] = [];

  @Input()
  nodes:Subject<ProjectTree>;

  @Input()
  projectName:string;

  @Input()
  env:string;

  constructor( private containerRef:ViewContainerRef, private router:Router, private projectService:ProjectService ) {
  }

  ngOnChanges( changes:SimpleChanges ) {
    this.nodes.next( this.data );
  }

  ngOnInit() {
    this.subscription = this.nodes.subscribe( data => {
      this.data         = data;
      this.groupToggles = [];
      if ( this.data && this.data.projects ) {
        this.data.projects.forEach( project => {
          if ( this.groupToggles.filter( groupToggle => groupToggle.name === project.group ).length == 0 ) {
            this.groupToggles.push( new GroupItem( project.group, this.isGroupVisible( project.group ) ) );
          }
        } );
      }
      this.updateData();
    } );
  }

  private updateData() {
    var dependencies  = {};
    if ( this.data && this.data.projects ) {
      this.data.projects
          .filter( projectNode => this.groupToggles.filter( groupToggle => groupToggle.name === projectNode.group && groupToggle.visible ).length > 0 )
          .forEach( projectNode => dependencies[ projectNode.title ] = projectNode );

      if ( this.projectName ) {
        var removeNames:string[] = [];
        for ( var key in dependencies ) {
          if ( key !== this.projectName ) {
            if ( dependencies[ key ].dependencies == undefined || dependencies[ key ].dependencies[ this.projectName ] == undefined ) {
              removeNames.push( key );
            } else {
              var removeDeps:string[] = [];
              for ( var depName in dependencies[ key ].dependencies ) {
                if ( depName !== this.projectName ) {
                  removeDeps.push( depName );
                }
              }
              removeDeps.forEach( name => delete dependencies[ key ].dependencies[ name ] );
            }
          }
        }
        removeNames.forEach( name => delete dependencies[ name ] );
      }
    }
    this.filteredData   = { dependencies: dependencies };
    var transformedData = this.transformData( this.filteredData );
    this.chartData( transformedData );
  }

  ngOnDestroy() {
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }
  }

  onResize() {
    if ( this.force != undefined ) {
      this.force.size( [ this.containerRef.element.nativeElement.getBoundingClientRect().width, this.containerRef.element.nativeElement.getBoundingClientRect().height ] );
      // this.force.restart();
      // this.force.force('size', [this.containerRef.element.nativeElement.getBoundingClientRect().width, this.containerRef.element.nativeElement.getBoundingClientRect().height]);
    }
  }

  ngAfterViewInit() {
    setTimeout( () => this.onResize(), 200 );
  }

  navigate( name:string ) {
    var results = this.data.projects.filter( projectNode => projectNode.title === name );
    if ( results.length == 0 ) {
      console.error( 'could not find project ' + name );
    } else {
      this.router.navigate( [ '/projects/' + name ], {
        queryParams: {
          version: results[ 0 ].version,
          env: this.projectService.getSelectedEnv()
        }
      } );
    }
  }

  isGroupVisible( name:string ):boolean {
    var value = window.localStorage.getItem( 'dashboard.visible-groups.' + name );
    if ( value === 'false' ) {
      return false;
    }
    return true;
  }

  toggleGroup( item:GroupItem ):void {
    item.visible = !item.visible;
    var key      = 'dashboard.visible-groups.' + item.name;
    if ( !item.visible ) {
      localStorage.setItem( key, 'false' );
    } else {
      localStorage.removeItem( key );
    }
    this.updateData();
  }

  transformData( data:{dependencies:{}} ) {
    var nodes = {};
    var links = [];
    if ( data.dependencies ) {
      for ( var key in data.dependencies ) {
        nodes[ key ] = ({ name: key });
        var node     = data.dependencies[ key ];
        if ( node.dependencies ) {
          node.dependencies.forEach( dependency => {
            if ( typeof(dependency.item[ '$ref' ]) === 'string' && dependency.item[ '$ref' ].indexOf( '#/projects/' ) == 0 ) {

            }
            links.push( { source: key, target: dependency.item.title, type: dependency.type } );
          } );
        }
      }
    }
    return { nodes: nodes, links: links };
  }

  chartData( data:{} ):void {
    var svg = d3.select( this.containerRef.element.nativeElement ).select( '.container' ).select( 'svg' ).remove();
    if ( !data ) {
      //handle
      console.warn( 'No chart data' );

      return;
    }
    this.error = null;
    var nodes  = data[ 'nodes' ]
    var links  = data[ 'links' ];
    links.forEach( function ( link ) {
      link.source = nodes[ link.source ] || (nodes[ link.source ] = { name: link.source });
      link.target = nodes[ link.target ] || (nodes[ link.target ] = { name: link.target });
    } );

    var svg    = d3.select( this.containerRef.element.nativeElement ).select( '.container' ).append( "svg" );
    this.force = d3.layout.force()
        .nodes( d3.values( nodes ) )
        .links( links )
        .size( [ this.containerRef.element.nativeElement.getBoundingClientRect().width, this.containerRef.element.nativeElement.getBoundingClientRect().height ] )
        .linkStrength( 0.1 )
        .charge( -300 )
        .on( "tick", tick )
        .start();

    // Per-type markers, as they don't inherit styles.
    svg.append( "defs" ).selectAll( "marker" )
        .data( [ "marker-rest", "dependency" ] )
        .enter().append( "marker" )
        .attr( "id", function ( d ) {
          return d;
        } )
        .attr( "viewBox", "0 -5 10 10" )
        .attr( "refX", 15 )
        .attr( "refY", -1.5 )
        .attr( "markerWidth", 6 )
        .attr( "markerHeight", 6 )
        .attr( "orient", "auto" )
        .append( "path" )
        .attr( "d", "M0,-5L10,0L0,5" );

    var self = this;

    var path = svg.append( "g" ).selectAll( "path" )
        .data( self.force.links() )
        .enter().append( "path" )
        .attr( "class", function ( d ) {
          return "overview-link " + d.type;
        } )
        .attr( "marker-end", function ( d ) {
          return "url(#marker-" + d.type + ")";
        } );

    var circle = svg.append( "g" ).selectAll( "circle" )
        .data( self.force.nodes() )
        .enter().append( "circle" )
        .attr( "r", 6 )
        .attr( "class", d => colorHelper.getColorByTitle( d.name ) )
        .call( self.force.drag );

    var text = svg.append( "g" ).selectAll( "text" )
        .data( self.force.nodes() )
        .enter().append( "text" )
        .attr( "x", 8 )
        .attr( "y", ".31em" )
        .on( {
          "click": function () {
            self.navigate( this.textContent );
          }
        } )
        .text( function ( d ) {
          return d.name;
        } );

    function tick() {
      path.attr( "d", linkArc );
      circle.attr( "transform", transform );
      text.attr( "transform", transform );
    }

    function linkArc( d ) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt( dx * dx + dy * dy );
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform( d ) {
      return "translate(" + d.x + "," + d.y + ")";
    }
  }

}

export class GroupItem {

  constructor( public name:string, public visible:boolean = true ) {

  }

}