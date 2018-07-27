import {Component} from '@angular/core';
import {AlertController, IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {UserDataService} from "../../../services/database/user-data.service";
import {BadgrService} from "../../../services/badgr.service";
import {UserData} from "../../models/database/userdata.model";

/**
 * Generated class for the ProfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({name: 'profil-page'})
@Component({
  selector: 'page-profil',
  templateUrl: 'profil.html',
})
export class ProfilPage {

  private name: string;
  private email: string;
  private lp: number;
  private badgeArr: Array<Object>;

  items: any = [];
  itemExpandHeight: number = 100;

  constructor(private user: UserDataService,
              private  badge: BadgrService,
              public alertCtrl: AlertController) {

    this.items = [
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false}
    ];

    var that = this;
    this.user.getUserObsv((data) => {
      that.name = data.name;
      that.email = data.email;
      that.lp = data.lp;
    });
    this.badge.getAllBadgesAndUserForFE(data=>that.badgeArr=data);
  }

  reset() {
    this.name = '';
    this.email = '';
    this.lp = 0;
  }

  save() {
    const saveObj: UserData = {};
    saveObj.name = this.name;
    saveObj.email = this.email;
    this.user.updateUserData(saveObj);
  }

  rewardLP(){
    this.user.addLPToUser(200);
  }

  rewardBadge(){
    var that= this;
    this.badge.assertBadgeToUser('stBkgfHqQxmUjBlkJO7Tmg',(assertionObj)=>{
      that.badge.getBadgeByID(assertionObj['result'][0]['badgeclass'],(badgeObj)=>{
        const prompt = this.alertCtrl.create({
          title: 'Glückwunsch!',
          message: "Sie haben den Badge '"+badgeObj[0]['name']+"' erhalten!",
        });
        prompt.present();
      });

    });
  }

  expandItem(item) {

    this.items.map((listItem) => {
      if (item == listItem) {
        listItem.expanded = !listItem.expanded;
      } else {
        listItem.expanded = false;
      }
      return listItem;
    });
  }

}

