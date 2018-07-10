import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ComponentsModule } from '../components/components.module';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import {TabsPage} from "../pages/tabs/tabs";

//import { Geolocation } from '@ionic-native/geolocation';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { firebaseConfig } from '../../firebase.credentials';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import {AuthService} from "../../services/auth.service";
import {GeoService} from "../../services/database/geo.service";
import {PointService} from "../../services/database/point.service";
import {PositionService} from "../../services/position.service";
import {LoginPage} from "../pages/login/login";
import { PositionServiceProvider } from '../providers/position-service/position-service';
import {LogoutPage} from "../pages/logout/logout";
import {PathService} from "../../services/database/path.service";
import {ContentService} from "../../services/database/content.service";

@NgModule({
  declarations: [
    LoginPage,
    MyApp,
    HomePage,
    HelloIonicPage,
    ListPage,
    ItemDetailsPage,
    TabsPage,
    LogoutPage
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    TabsPage,
    LoginPage,
    LogoutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    GeoService,
    PointService,
    AngularFireAuth,
    PositionService,
    PositionServiceProvider,
    Geolocation
    PositionServiceProvider,
    PathService,
    ContentService,
  ]
})
export class AppModule {}
