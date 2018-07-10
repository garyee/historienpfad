import { Component } from '@angular/core';
import { IonicPage, MenuController, NavController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home';
import { AuthService } from '../../../services/auth.service';
import {TabsPage} from "../tabs/tabs";
import {HelloIonicPage} from "../hello-ionic/hello-ionic";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loginForm: FormGroup;
  loginError: string;

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    fb: FormBuilder,
    public menu: MenuController,
  ) {
    this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
    if(!this.auth.authenticated){
      this.menu.enable(false);
      this.navCtrl.setRoot(LoginPage);
      return
    }
    //TEMPORARiLY
    //this.navCtrl.setRoot(TabsPage);
    //return;

  }

  login() {
    let data = this.loginForm.value;

    if (!data.email) {
      return;
    }

    let credentials = {
      email: data.email,
      password: data.password
    };
    this.auth.signInWithEmail(credentials)
      .then(
        () => {
          this.menu.enable(true);
          this.navCtrl.setRoot(TabsPage);
        },
        error => this.loginError = error.message
      );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }


  loginWithGoogle() {
    this.auth.signInWithGoogle()
      .then(
        () => {
          this.menu.enable(true);
          this.navCtrl.setRoot(TabsPage);
          },
        error => console.log(error.message)
      );
  }

}
