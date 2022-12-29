import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPostsPage } from './list-posts.page';

const routes: Routes = [
  {
    path: '',
    component: ListPostsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPostsPageRoutingModule {}
