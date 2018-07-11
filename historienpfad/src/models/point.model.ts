import {Content} from "./content.model";
import {Observable} from "rxjs/Observable";

export interface Point {
  key?: string,
  parentKey?: string,
  isStartPoint?: boolean,
  name: string,
  coords?: Array<number> | Observable<{}> | {},
  content?: Content | Observable<{}> | {},
}
