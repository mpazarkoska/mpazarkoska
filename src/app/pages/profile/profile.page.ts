import {Component, OnInit} from '@angular/core';
import {CameraService} from '../../services/camera.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';
import {FirebaseService} from '../../services/FirebaseService';
import {SpinnerService} from '../../services/spinner.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public user: any = null;

  constructor(public cameraService: CameraService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private toastService: ToastService,
              private spinnerService: SpinnerService,
              private firebaseService: FirebaseService) {
  }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.getUser();
  }

  async getUser() {
    this.spinnerService.isVisible$.next(true);
    this.user = await this.firebaseService.getUserInfo();
    this.spinnerService.isVisible$.next(false);
    console.log(this.user);
  }

  signOut() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

}
