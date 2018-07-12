import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PointDisplayPage } from './point-display';

@NgModule({
  declarations: [
    PointDisplayPage,
  ],
  imports: [
    IonicPageModule.forChild(PointDisplayPage),
  ],
})
export class PointDisplayPageModule {}
