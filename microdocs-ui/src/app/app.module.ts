import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import {PrettyJsonModule} from 'angular2-prettyjson';

import { environment } from "../environments/environment";
import { AppComponent } from './app.component';
import { ProjectService } from "./services/project.service";
import { RestProjectClient } from "./clients/rest-project.client";
import { StandaloneProjectClient } from "./clients/standalone-project.client";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { SidebarListComponent } from './components/sidebar-list/sidebar-list.component';
import { IconGeneratorComponent } from './components/icon-generator/icon-generator.component';
import { SortByHttpMethodPipe } from "./pipes/sort-by-http-method.pipe";
import { ProjectComponent } from "./components/project/project.component";
import { NotEmptyPipe } from "./pipes/not-empty.pipe";
import { SimpleCardComponent } from './components/simple-card/simple-card.component';
import { SortByKeyPipe } from "./pipes/sort-by-key.pipe";
import { ObjectIteratorPipe } from "./pipes/object-iterator.pipe";
import { FilterByFieldPipe } from "./pipes/filter-by-field.pipe";
import { EmptyPipe } from "./pipes/empty.pipe";
import { EndpointGroupComponent } from "./components/endpoint-group/endpoint-group.component";
import { EndpointComponent } from "./components/endpoint/endpoint.component";
import { PathHighlightComponent } from "./components/path-highlight/path-highlight.component";
import { ProblemBoxComponent } from "./components/problem-box/problem-box.component";
import { BodyRenderComponent } from "./components/body-render/body-render.component";
import { ModelComponent } from "./components/model/model.component";
import { DependencyGraphComponent } from "./components/dependency-graph/dependency-graph.component";
import { WelcomeComponent } from "./components/welcome/welcome.component";
import { ImportDialogComponent } from "./components/import-dialog/import-dialog.component";
import { ExportPanelComponent } from "./components/export-panel/export-panel.component";
import { DialogBaseComponent } from './components/dialog-base/dialog-base.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatInputModule } from "@angular/material/input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    SidebarListComponent,
    IconGeneratorComponent,
    ProjectComponent,
    SimpleCardComponent,
    EndpointGroupComponent,
    EndpointComponent,
    PathHighlightComponent,
    ProblemBoxComponent,
    BodyRenderComponent,
    ModelComponent,
    DependencyGraphComponent,
    WelcomeComponent,
    ImportDialogComponent,
    ExportDialogComponent,
    DialogBaseComponent,
    ExportPanelComponent,

    SortByHttpMethodPipe,
    SortByKeyPipe,
    FilterByFieldPipe,
    NotEmptyPipe,
    EmptyPipe,
    ObjectIteratorPipe
  ],
  entryComponents: [
    ImportDialogComponent,
    ExportPanelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    CommonModule,
    RouterModule.forRoot([
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'projects/:project',
        component: ProjectComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ], {useHash: true}),
    PrettyJsonModule
  ],
  providers: [
    ProjectService,
    {provide: 'ProjectClient', useClass: environment.standalone ? StandaloneProjectClient : RestProjectClient }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
