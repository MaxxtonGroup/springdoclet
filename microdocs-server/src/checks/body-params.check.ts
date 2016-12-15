import {PathCheck} from "./path-check";
import {Project, Path, Schema, ProblemLevels, ParameterPlacings, SchemaTypes} from "@maxxton/microdocs-core/domain";
import {SchemaHelper, ProblemReporter} from "@maxxton/microdocs-core/helpers";

export class BodyParamsCheck implements PathCheck {

  public getName():string {
    return "body-param";
  }

  public check(clientEndpoint:Path, producerEndpoint:Path, project:Project, problemReport:ProblemReporter):void {
    var producerParams = producerEndpoint.parameters;
    var clientParams = clientEndpoint.parameters;
    if (producerParams == undefined || producerParams == null) {
      producerParams = [];
    }
    if (clientParams == undefined || clientParams == null) {
      clientParams = [];
    }
    producerParams.forEach(producerParam => {
      if (producerParam.in == ParameterPlacings.BODY) {
        var exists = false;
        clientParams.forEach(clientParam => {
          if (producerParam.in == clientParam.in) {
            exists = true;
            var producerSchema:Schema = SchemaHelper.collect(producerParam.schema, [], project);
            var clientSchema = SchemaHelper.collect(clientParam.schema, [], project);
            this.checkSchema(clientEndpoint, clientSchema, producerSchema, problemReport, "");
            return true;
          }
        });
        if (!exists && producerParam.required) {
          problemReport.report(ProblemLevels.ERROR, "Missing request body", clientEndpoint.controller, clientEndpoint.method);
        }
      }
    });
  }

  private checkSchema(endpoint:Path, clientSchema:Schema, producerSchema:Schema, problemReport:ProblemReporter, path:string):void {
    if(producerSchema != null && producerSchema != undefined){
      if(clientSchema != null && clientSchema != undefined){
        if(producerSchema.type != clientSchema.type){
          var position = "";
          if(path != ''){
            position = ' at ' + path;
          }
          problemReport.report(ProblemLevels.WARNING, "Type mismatches in request body" + position + ", expected: " + producerSchema.type + ", found: " + clientSchema.type, endpoint.controller, endpoint.method);
        }else{
          if(producerSchema.type == SchemaTypes.OBJECT){
            var producerProperties = producerSchema.properties;
            var clientProperties = clientSchema.properties;
            for(var key in producerProperties){
              this.checkSchema(endpoint, clientProperties[key], producerProperties[key], problemReport, path + (path == '' ? '' : '.') + key);
            }
          }else if(producerSchema.type == SchemaTypes.ARRAY){
            var producerItems = producerSchema.items;
            var clientItems = clientSchema.items;
            this.checkSchema(endpoint, clientItems, producerItems, problemReport, path + (path == '' ? '' : '.') + "0");
          }
        }
      }else if(producerSchema.required){
        problemReport.report(ProblemLevels.ERROR, "Missing required value at " + path, endpoint.controller, endpoint.method);
      }
    }
  }

}