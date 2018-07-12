import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PointEditPage } from './point-edit';

@NgModule({
  declarations: [
    PointEditPage,
  ],
  imports: [
    IonicPageModule.forChild(PointEditPage),
  ],
})
export class PointEditPageModule {}
