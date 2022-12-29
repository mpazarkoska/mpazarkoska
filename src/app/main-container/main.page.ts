import {Component} from '@angular/core';


@Component({
  selector: 'app-tabs',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss']
})
export class TabsPage {
  public user: any = null;

  constructor() {
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
  }

  getLoginProfileLink() {
    return localStorage.getItem('user') ? 'profile' : 'login';
  }

}
