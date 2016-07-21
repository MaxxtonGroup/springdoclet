import {Component} from "@angular/core";

import {COMPONENTS} from "@maxxton/components/dist/components";

import {DependencyGraph} from '../../panels/dependency-graph/dependency-graph';

/**
 * Dashboard route (page that shows the most important information to a user)
 *
 * @author R. Sonke
 */

@Component({
  selector: 'dashboard',
  providers: [],
  templateUrl: 'dashboard.tpl.html',
  directives: [COMPONENTS, DependencyGraph]
})

export class DashboardRoute {

}