import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {ContentService} from "../../../services/database/content.service";
import {DomSanitizer} from "@angular/platform-browser";
import * as $ from "jquery";
import {PathService} from "../../../services/database/path.service";
import {PointService} from "../../../services/database/point.service";

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
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private content: ContentService,
              private sanitizer: DomSanitizer,
              private points: PointService) {
    this.mode = this.navParams.get("mode") || "point";
    this.selectedItem = this.navParams.get("item");
    this.ionSelected();
  }

  ionSelected() {
    this.mode = this.navParams.get("mode") || "point";
    this.selectedItem = this.navParams.get("item");
    if (this.selectedItem !== undefined)
      this.content.getContent(this.selectedItem.key, (content) => {
        console.log(content);
        if (content != null) {
          if (this.mode == "point")
            this.htmlContent = content.html;
          else if (this.mode = "editpoint")
            (<any>$('div#froala')).froalaEditor('html.set', content.html);

        }
      });
  }
  public save() {
    const htmlString = (<any>$('div#froala')).froalaEditor('html.get');
    if (htmlString != '' && htmlString != '<p></p>') {
      this.content.updateContent('-LHAZIfMKmon0qQJ9Okp', {html: htmlString + ''});
    }
  };


  ionViewDidLoad() {
    console.log('ionViewDidLoad PointEditPage');
  }


}
