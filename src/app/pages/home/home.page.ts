import { Component } from '@angular/core';
import {CameraService} from '../../services/camera.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GeneralService} from '../../services/general.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  constructor(public cameraService: CameraService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private generalService: GeneralService) {}

}
