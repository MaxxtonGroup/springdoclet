
import {ProjectRepository} from '../repositories/project.repo';
import {ProjectJsonRepository} from '../repositories/json/project-json.repo';
import {SchemaHelper} from "microdocs-core-ts/dist/helpers/schema/schema.helper";
import {TreeNode, Project, Schema, ProjectInfo} from "microdocs-core-ts/dist/domain";
import {Config} from "../config";

export class ProjectService{

  private projectRepo:ProjectRepository;

  constructor(private projectRepo:ProjectRepository){}

  public storeAggregatedProjects(env:string, node:TreeNode) : void{
    this.projectRepo.storeAggregatedProjects(env, node);
  }

  public storeAggregatedProject(env:string, project:Project) : void{
    this.addResponseExamples(project);

    this.projectRepo.storeAggregatedProject(env, project);
  }

  private addResponseExamples(project:Project){
    project.swagger = "2.0";
    if(project.paths != undefined){
      for(var path in project.paths){
        for(var method in project.paths[path]){
          var endpoint = project.paths[path][method];
          if(endpoint.responses != undefined && endpoint.responses['default'] != undefined && endpoint.responses['default'].schema != undefined){
            var response = endpoint.responses['default'];
            var schema = response.schema;
            var example = SchemaHelper.generateExample(schema, undefined, [], project);
            schema.default = example;
          }
        }
      }
    }
  }


}