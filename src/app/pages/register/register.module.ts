import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {RegisterComponent} from './register.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
  }
];



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RegisterComponent]
})
export class RegisterModule { }
