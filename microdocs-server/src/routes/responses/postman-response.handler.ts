
import { Project, Schema, Path, ProjectInfo, ProjectTree, ParameterPlacings } from "@maxxton/microdocs-core/domain";
import * as uuid from 'uuid';
import * as express from "express";
import { MicroDocsResponseHandler } from "./microdocs-response.handler";
import { Config } from "../../config";
import { ProjectJsonRepository } from "../../repositories/json/project-json.repo";
import { PostmanAdapter } from  "@maxxton/microdocs-core/adapter";
import { mergeProjects } from "@maxxton/microdocs-core/helpers"

export class PostmanResponseHandler extends MicroDocsResponseHandler {

  handleProjects(req: express.Request, res: express.Response, projectTree: ProjectTree, env: string) {
    if (projectTree.projects.length == 1) {
      var projectNode = projectTree.projects[0];
      var project = this.injection.ProjectRepository().getAggregatedProject(env, projectNode.title, projectNode.version);

      if (req.query['method']) {
        var filterMethods = req.query['method'].split(',');
        this.filterMethods(project, filterMethods);
      }
      this.response(req, res, 200, this.postman(project));
    } else {
      this.response(req, res, 200, this.postmans(projectTree, env));
    }
  }

  handleProject(req: express.Request, res: express.Response, project: Project, env: string) {
    if (req.query['method']) {
      var filterMethods = req.query['method'].split(',');
      this.filterMethods(project, filterMethods);
    }
    this.response(req, res, 200, this.postman(project));
  }

  postmans(projectTree: ProjectTree, env: string): {} {
    let config: { name: string, description: string, version: string, baseUrl: string } = {
      name: Config.get('application-name'),
      version: Config.get('application-version').toString(),
      description: Config.get('application-description'),
      baseUrl: this.getBaseUrl()
    };

    let projects = projectTree.projects.map(projectNode => this.injection.ProjectRepository().getAggregatedProject(env, projectNode.title, projectNode.version));
    let project: Project = mergeProjects(projects, config);

    return this.postman(project);
  }

  postman(project: Project): {} {
    let postmanAdapter = new PostmanAdapter();
    return postmanAdapter.adapt(project);
  }

  getBaseUrl(): string {
    // get base url
    let schema: string = Config.get('application-schema');
    let host: string = Config.get('application-host') || "localhost:8080";
    let basePath: string = Config.get('application-basePath');
    while (basePath.indexOf('/') == 0) {
      basePath = basePath.substr(1);
    }
    let baseUrl = schema + "://" + host + "/" + basePath;
    return baseUrl;
  }
}
