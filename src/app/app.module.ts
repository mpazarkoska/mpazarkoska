import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {FirebaseService} from './services/FirebaseService';
import {ToastService} from './services/toast.service';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SpinnerService} from './services/spinner.service';
import {SpinnerComponent} from './shared/spinner/spinner.component';
import {AuthGuard} from './services/AuthGuard';
import {LazyLoadImageModule} from 'ng-lazyload-image';

@NgModule({
  declarations: [AppComponent, SpinnerComponent],
  entryComponents: [],
  imports: [BrowserModule, LazyLoadImageModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    FirebaseService,
    ToastService,
    SpinnerService,
    AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
