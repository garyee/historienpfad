import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {GeoService} from "./geo.service";
import {Content} from "../../src/models/database/content.model";

/**
 * Service Component which corresponds to the firebase database document 'content'
 * It holds the html content that the user adds to a point
 * The Id of a content node is the id of the corresponding point (document points)
 */
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

  /**
   * Create a pushId without pushing data or contacting the database at all
   * Use to create pushKey in order to push a new content node to db, if you need to set the pushId before pushing and
   * not  after like usual
   * @returns {string | null}
   */
  getPushKey(){
    return this.db.createPushId();
  }

  /**
   * Get html content with
   *
   * @param key - id of the content which is the same as the id of the point
   * @param {any} cb - callback if set the callback will subscribe on result
   * @returns {Observable<Content | null>} - will return an observable
   */
  getContent(key,cb=undefined){
    if(key!=null) {
      const observable=this.db.object<Content>(`content/${key}`).valueChanges()
      if(cb!=undefined){
        observable.subscribe(cb);
      }
      return observable
    }
  }

  /**
   * Add Content object to the content document
   * @param data - html string
   * @returns {string | null} -pushKey will be returned
   */
  pushContent(data){
    return this.contentRef.push({html:data}).key;
  }

  /**
   * Update content object from content node
   * @param key - id of the point object (points document)
   * @param {Content} data - html string
   */
  updateContent(key,data: Content){
    this.contentRef.update(key, data);
  }

  /**
   * Delete content object from content node
   * @param key
   */
  removeContent(key){
    this.contentRef.remove(key);
  }
}
