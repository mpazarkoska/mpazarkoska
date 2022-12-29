import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPostsPageRoutingModule } from './list-posts-routing.module';

import { ListPostsPage } from './list-posts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPostsPageRoutingModule
  ],
  declarations: [ListPostsPage]
})
export class ListPostsPageModule {}
