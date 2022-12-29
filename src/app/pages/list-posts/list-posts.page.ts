import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {getStorage, ref, getDownloadURL} from 'firebase/storage';
import {CameraService} from '../../services/camera.service';
import {FirebaseService} from '../../services/FirebaseService';
import {collection, getDocs, query} from 'firebase/firestore';
import {SpinnerService} from '../../services/spinner.service';
import {IonContent} from '@ionic/angular';

@Component({
  selector: 'app-list-posts',
  templateUrl: './list-posts.page.html',
  styleUrls: ['./list-posts.page.scss'],
})
export class ListPostsPage implements OnInit, OnDestroy {
  @ViewChild('contentArea') contentArea: IonContent;
  public allPosts: any[] = [];
  public storage: any = getStorage();
  public loadedAll = false;
  public users: any = {};
  public loadInProgress = false;
  public threshold = 100;

  constructor(public cameraService: CameraService, private firebaseService: FirebaseService, private spinnerService: SpinnerService) {
  }

  ngOnInit(): void {

  }

  async ionViewDidEnter() {
    await this.resetProps();
    this.loadInProgress = true;
    this.spinnerService.isVisible$.next(true);
    const allUsers = query(collection(this.firebaseService.db, 'users'));
    const userDocs = await getDocs(allUsers);
    this.processUsers(userDocs);
    const startPosts = await this.firebaseService.getFirstPosts(true);
    if (startPosts.length) {
      await this.processPosts(startPosts);
    }
    this.loadInProgress = false;
    this.spinnerService.isVisible$.next(false);
  }

  processUsers(userDocs) {
    if (userDocs.docs.length) {
      userDocs.docs.forEach(async (doc) => {
        const user = doc.data();
        this.users[user.id] = user;
      });
    }
  }

  async processPosts(posts) {
    for (const doc of posts) {
      const postData = doc.data();
      const likes = await this.firebaseService.getLikesForPost(doc.id);
      const isPostLikedByUser = this.firebaseService.postLikedByLoggedUser(likes);
      const postCopy = {
        ...postData,
        id: doc.id,
        user: this.users[postData.userId] ?? null,
        likes: likes.length,
        isPostLikedByUser
      };
      try {
        const imgUrl = await this.getImgUrl(postCopy.postImage);
        if (imgUrl) {
          postCopy.imgUrl = imgUrl;
        }
      } catch (err) {
        postCopy.imgUrl = '';
      }
      console.log(postCopy);
      this.allPosts.push(postCopy);
    }
  }

  async getImgUrl(imgPath) {
    return await getDownloadURL(ref(this.storage, `app-images/${imgPath}`));
  }

  getExcerpt(content) {
    if (content.length > 50) {
      return `${content.substring(0, 40)} ... more`;
    }
    return content;
  }

  showFullContent(event, postContent) {
    event.target.innerHTML = postContent;
  }

  async resetProps() {
    this.loadInProgress = false;
    this.allPosts = [];
    this.loadedAll = false;
    this.users = {};
    await this.contentArea.scrollToTop(0);
  }

  loadMore(event) {
    this.contentArea.getScrollElement().then(async scrollEl => {
      if (this.loadedAll || this.loadInProgress) {
        return;
      }
      const maxScrollPos = scrollEl.scrollHeight;
      const currScrollPos = scrollEl.offsetHeight + scrollEl.scrollTop;
      const triggerPosition = currScrollPos >= maxScrollPos - this.threshold;
      console.log('SCROLL', currScrollPos, maxScrollPos - this.threshold);
      if (triggerPosition) {
        this.loadInProgress = true;
        const newPosts = await this.firebaseService.loadMorePosts();
        if (newPosts.length) {
          await this.processPosts(newPosts);
        } else {
          this.loadedAll = true;
        }
        this.loadInProgress = false;
      }
    });
  }

  likePost(post) {
    this.firebaseService.likePost(post);
  }

  ngOnDestroy(): void {
    if (typeof this.firebaseService.watcherUnsubscribe === 'function') {
      this.firebaseService.watcherUnsubscribe();
    }
  }
}
