import {Content} from "./content.model";
import {Observable} from "rxjs/Observable";

export interface Point {
  key?: string,
  name: string,
  coords?: Array<number> | Observable<{}> | {},
  content?: Content | Observable<{}> | {},
}
