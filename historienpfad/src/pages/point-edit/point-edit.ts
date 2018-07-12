import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

import {PathService} from "../../../services/database/path.service";
import {ContentService} from "../../../services/database/content.service";



import * as $ from 'jquery';
/**
 * Generated class for the PointEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-point-edit',
  templateUrl: 'point-edit.html',
})
export class PointEditPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private content: ContentService) {

    this.content.getContent('-LHAZIfMKmon0qQJ9Okp',(content)=>{
      if(content!=null){
        (<any>$('div#froala')).froalaEditor('html.set',content.html);
      }
    });
  }

  public titleOptions: Object = {
    placeholderText: 'Edit Your Content Here!',
  }

  public save() {
    const htmlString = (<any>$('div#froala')).froalaEditor('html.get');
    if (htmlString != '' && htmlString != '<p></p>') {
      this.content.updateContent('-LHAZIfMKmon0qQJ9Okp',{html:htmlString + ''});
    }
  };


  ionViewDidLoad() {
    console.log('ionViewDidLoad PointEditPage');
  }

}
