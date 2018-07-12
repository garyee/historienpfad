import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ContentService} from "../../../services/database/content.service";
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the PointDisplayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-point-display',
  templateUrl: 'point-display.html',
})
export class PointDisplayPage {

  htmlContent='test';
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private content: ContentService,
              private sanitizer: DomSanitizer) {

      content.getContent('-LHAZIfMKmon0qQJ9Okp',(content)=>{
        if(content!=null) {
          console.log(content.html);
          this.htmlContent=content.html;
        }
      })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PointDisplayPage');
  }

}
