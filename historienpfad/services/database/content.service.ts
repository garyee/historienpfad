import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Point} from "../../src/models/point.model";
import {Path} from "../../src/models/path.model";
import {map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {GeoService} from "./geo.service";
import {Content} from "../../src/models/content.model";
// import {Point} from "../../src/models/point/point.model";

@Injectable()
export class ContentService{

  contentRef: AngularFireList<Content>;
  content: Observable<Content[]>;

  constructor(private db: AngularFireDatabase,
              private geo: GeoService) {
    this.contentRef = db.list<Content>('content');
    this.content = this.contentRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    );
  }

  getPushKey(){
    return this.db.createPushId();
  }

  getContent(key,cb=undefined){
    if(key!=null) {
      const observable=this.db.object<Content>(`content/${key}`).valueChanges()
      if(cb!=undefined){
        observable.subscribe(cb);
      }
      return observable
    }
  }

  // addContent(key,data){
  //   this.contentRef.set(key,data);
  // }

  pushContent(data){
    return this.contentRef.push({html:data}).key;
  }

  updateContent(key,data: Content){
    this.contentRef.update(key, data);
  }

  removeContent(key){
    this.contentRef.remove(key);
  }


}
