import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {ContentService} from "../../../services/database/content.service";
import {DomSanitizer} from "@angular/platform-browser";
import * as $ from "jquery";
import {PathService} from "../../../services/database/path.service";
import {PointService} from "../../../services/database/point.service";
import {encodeUriFragment} from "@angular/router/src/url_tree";

@IonicPage()
@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  selectedItem: any;
  htmlContent = 'test';
  mode: string;
  public titleOptions: Object = {
    placeholderText: 'Edit Your Content Here!',
    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insertVideo', 'undo', 'redo']
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private content: ContentService,
              private sanitizer: DomSanitizer,
              private points: PointService) {
    this.ionSelected();
  }

  /**
   * Action to be called when tab details clicked
   */
  ionSelected() {
    //select the mode of the site to work with
    this.mode = this.navParams.get("mode") || "point";
    //get the selected item to display
    this.selectedItem = this.navParams.get("item");
    //Called with Item as parameter
    if (this.selectedItem !== undefined)
    //If item has name, use as title as well
      if (this.selectedItem.name != undefined) {
        this.selectedItem.title = this.selectedItem.name;
      }
    //Item has a key, retrieve it from db
    if (this.selectedItem.key !== undefined)
    //get Content of Point - Show it
      this.content.getContent(this.selectedItem.key, (content) => {
        if (content != null) {
          //Show editor or content box
          if (this.mode == "point")
            this.htmlContent = content.html;
          else if (this.mode = "editpoint")
            (<any>$('div#froala')).froalaEditor('html.set', content.html);

        }
      });
  }

  /**
   * Function that saves entered changes to the DB
   */
  public save() {
    //Read the Content of the Editor
    const htmlString = (<any>$('div#froala')).froalaEditor('html.get');
    if (htmlString != '' && htmlString != '<p></p>') {
      this.content.updateContent(this.selectedItem.key, {html: htmlString + ''});
    }
  };

  /**
   * Function to be called when manually changed the Tab
   */
  ionViewDidLoad() {

  }


}
