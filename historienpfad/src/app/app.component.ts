import {Component, ViewChild} from '@angular/core';
import {MenuController, Nav, Platform} from 'ionic-angular';
import {ListPage} from '../pages/list/list';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HomePage} from "../pages/home/home";
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../../services/auth.service";
import {PageInterface} from "../models/PageInterface.model";
import {ProfilPage} from "../pages/profil/profil";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = LoginPage;

  // Reference to the app's root nav

  pages: PageInterface[] = [
    {title: 'Spielen', pageName: 'tabs-page', tabComponent: 'HomePage', index: 0, icon: 'ios-map'},
    {title: 'Pfad auswählen', pageName: 'tabs-page', tabComponent: 'ListPage', index: 1, icon: 'ios-list-box'},
    {
      title: 'Pfad hinzufügen',
      pageName: 'tabs-page',
      tabComponent: 'ListPage',
      mode: "addpath",
      index: 1,
      icon: 'ios-add-circle'
    },
    {title: 'Profil', pageName: ProfilPage, icon: 'contact'},
  ];
  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthService
  ) {
    this.initializeApp();
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
            this.nav.setRoot("tabs-page");
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

  openPage(page: PageInterface) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if(this.auth.authenticated) {
      let params = {};
      if (page.index) {
        params["tabIndex"] = page.index;
      }
      if (page.mode) {
        params["mode"] = page.mode;
      }
        this.nav.setRoot(page.pageName, params);


      // The index is equal to the order of our tabs inside tabs.ts

      // The active child nav is our Tabs Navigation
      /*if (this.nav.getActiveChildNav() && page.index != undefined) {
        this.nav.setRoot(page.pageName, params);
        this.nav.getActiveChildNav().select(page.index);
      } else {
        // Tabs are not active, so reset the root page
        // In this case: moving to or from SpecialPage
        this.nav.setRoot(page.pageName, params);
      }*/
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
