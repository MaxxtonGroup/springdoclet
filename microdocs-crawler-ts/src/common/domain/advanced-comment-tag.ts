
import {Schema} from '@maxxton/microdocs-core-ts/dist/domain';

export interface AdvancedCommentTag{

  tagName: string;
  paramName: string;
  text: string;
  defaultValue?: string;
  type?: string;
  optional?:boolean;

}