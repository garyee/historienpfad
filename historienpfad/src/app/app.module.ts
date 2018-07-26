import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ComponentsModule} from '../components/components.module';

import {ItemDetailsPage} from '../pages/item-details/item-details';
import {ListPage} from '../pages/list/list';
// Import the AF2 Module
import {AngularFireModule} from 'angularfire2';
import {firebaseConfig} from '../../firebase.credentials';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {AuthService} from "../../services/auth.service";
import {GeoService} from "../../services/database/geo.service";
import {PointService} from "../../services/database/point.service";
import {PositionService} from "../../services/position.service";
import {LoginPage} from "../pages/login/login";
import {PositionServiceProvider} from '../providers/position-service/position-service';
import {PathService} from "../../services/database/path.service";
import {ContentService} from "../../services/database/content.service";
// Import Froala Editor.
import "froala-editor/js/froala_editor.pkgd.min.js";
// Import Angular2 plugin.
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
import {Geolocation} from '@ionic-native/geolocation';
import {UserDataService} from "../../services/database/user-data.service";
import {BadgrService} from "../../services/badgr.service";
import {HttpClientModule} from "@angular/common/http";
import {ProfilPage} from "../pages/profil/profil";

@NgModule({
  declarations: [
    LoginPage,
    MyApp,
    HomePage,
    ListPage,
    ItemDetailsPage,
    ProfilPage,
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ItemDetailsPage,
    ListPage,
    LoginPage,
    ProfilPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    BadgrService,
    GeoService,
    PointService,
    UserDataService,
    AngularFireAuth,
    PositionService,
    PositionServiceProvider,
    Geolocation,
    PathService,
    ContentService,
  ]
})
export class AppModule {}
