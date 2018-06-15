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



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    HelloIonicPage,
    ListPage,
    ItemDetailsPage,
    TabsPage
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
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
