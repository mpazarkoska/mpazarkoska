import {Component, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {Animation, AnimationController} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {

  @ViewChild('animWrapper') animWrapper!: ElementRef;

  constructor(private animationCtrl: AnimationController) {
  }

  ngAfterViewInit() {
    const animation: Animation = this.animationCtrl.create()
      .addElement(this.animWrapper.nativeElement)
      .duration(500)
      .to('opacity', '1')
      .easing('ease');
  }
}
