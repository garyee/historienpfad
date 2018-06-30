import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {HomePage} from "../pages/home/home";
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../../services/auth.service";
import {TabsPage} from "../pages/tabs/tabs";
import {LogoutPage} from "../pages/logout/logout";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = LoginPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthService
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Irgendwas', component: HelloIonicPage },
      { title: 'Spielen', component: HomePage },
      { title: 'Pfad auswählen', component: ListPage },
      { title: 'Pfad bearbeiten', component: HomePage },
      { title: 'Logout', component: LogoutPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.auth.afAuth.authState
      .subscribe(
        user => {
          if (user) {
            this.nav.setRoot(TabsPage);
            this.menu.enable(true);

          } else {
            this.rootPage = LoginPage;
            this.menu.enable(false);
          }
        },
        () => {
          this.rootPage = LoginPage;
          this.menu.enable(false);
        }
      );
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if(this.auth.authenticated) {
      this.nav.setRoot(page.component);
    }else{
      this.nav.setRoot(LoginPage);
    }
  }

  login() {
    this.menu.close();
    this.auth.signOut();
    this.nav.setRoot(LoginPage);
  }

  logout() {
    this.menu.close();
    this.auth.signOut();
    this.nav.setRoot(LoginPage);
  }
}
