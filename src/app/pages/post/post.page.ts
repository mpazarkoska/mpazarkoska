import {Component, OnInit} from '@angular/core';
import {CameraService} from '../../services/camera.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GeneralService, IResponse} from '../../services/general.service';
import {FirebaseService} from '../../services/FirebaseService';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
  public imgSrc: any = '';
  public showPreloader = false;
  public showComment = false;
  public commentText = '';
  public postID = 0;

  constructor(public cameraService: CameraService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private toastService: ToastService,
              private firebaseService: FirebaseService,
              private generalService: GeneralService) {
    this.generalService.get().subscribe((resp: IResponse) => {
      if (resp.type === 'postPhoto' && resp.data) {
        this.resetProps();
        this.showPreloader = true;
        this.imgSrc = resp.data;
      }
    });
    this.activeRoute.params.subscribe(async val => {
      this.resetProps();
      await this.getPhoto();
    });
  }

  ngOnInit() {
  }


  resetProps() {
    this.postID = 0;
    this.showComment = false;
    this.imgSrc = '';
    this.commentText = '';
  }

  async getPhoto() {
    const state = this.router.getCurrentNavigation().extras.state;
    if (state) {
      if ('photo' in state) {
        this.imgSrc = state.photo;
        this.showPreloader = true;
      }
    }
  }

  async takePhoto() {
    this.resetProps();
    this.imgSrc = await this.cameraService.takePhoto();
  }

  async createNewPost() {
    const postID = await this.firebaseService.addPost({
      content: this.commentText,
      image: this.imgSrc
    });
    if (postID) {
      await this.toastService.create('Post created', 'success');
      this.resetProps();
      this.postID = postID;
    }
  }

  viewPost(postID) {
    this.router.navigate(['/list-posts']);
  }

}
