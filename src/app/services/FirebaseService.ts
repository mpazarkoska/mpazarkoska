import {getStorage, ref, uploadBytes} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  startAfter,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot
} from 'firebase/firestore';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged} from 'firebase/auth';
import {Injectable} from '@angular/core';
import {initializeApp} from 'firebase/app';
import {ToastService} from './toast.service';
import {SpinnerService} from './spinner.service';
import {BehaviorSubject} from 'rxjs';


@Injectable({providedIn: 'root'})
export class FirebaseService {
  public app: any;
  public db: any;
  public auth: any;
  public user: any = null;
  public allPosts: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public limit = 2;
  public docsSnapshot: any = false;
  public watcherUnsubscribe: any;
  public loadedAll = false;
  private readonly firebaseConfig!: { [key: string]: string };

  constructor(private toastService: ToastService, private spinnerService: SpinnerService) {
    /**
     * Configuration for firebase database
     */
    this.firebaseConfig = {
      apiKey: 'AIzaSyDZDE0VU1BN3dZmb3GOUIdB3Jxs-D_iuvg',
      authDomain: 'instapics-78521.firebaseapp.com',
      projectId: 'instapics-78521',
      storageBucket: 'instapics-78521.appspot.com',
      messagingSenderId: '177676554549',
      appId: '1:177676554549:web:127fdae88530167b4dbc7c',
      measurementId: 'G-6D65H1T0TJ'
    };
    this.app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.observeUser();
  }

  /**
   * Create new user
   *
   * @param model
   */
  public async createUser(model: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.spinnerService.isVisible$.next(true);
      createUserWithEmailAndPassword(this.auth, model.email, model.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await this.saveUserRegisterInfo({...model, ...user});
          this.spinnerService.isVisible$.next(false);
          await this.toastService.create(`User ${model.firstName} ${model.lastName} successfully created.`);
          resolve(user);

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          this.spinnerService.isVisible$.next(false);
          reject({errorCode, errorMessage});
        });
    });
  }

  /**
   * Login new user
   *
   * @param email
   * @param password
   */
  public loginUser(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.spinnerService.isVisible$.next(true);
      signInWithEmailAndPassword(this.auth, email, password)
        .then(async (userCredential) => {
          localStorage.setItem('user', JSON.stringify(userCredential.user));
          this.user = userCredential.user;
          this.spinnerService.isVisible$.next(false);
          await this.toastService.create(`Login Successful`, 'success');
          resolve(this.user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          this.user = null;
          this.spinnerService.isVisible$.next(false);
          reject({errorCode, errorMessage});
        });
    });
  }

  /**
   * Save user info
   *
   * @param userInfo
   */
  public async saveUserRegisterInfo(userInfo: any): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'users'), {
      id: userInfo.uid,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email
    });
    return docRef.id;
  }

  async getUserInfo() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const likeCollectionRef = collection(this.db, 'users');
      const q = query(likeCollectionRef, where('id', '==', user.uid));
      const fUser = await getDocs(q);
      if (fUser.docs.length === 1) {
        const fUserData = fUser.docs[0].data();
        const userLikedPosts = await this.getLikesForUser(fUserData.id);
        const userTotalPosts = await this.getUserPostCount(fUserData.id);
        return {...fUser.docs[0].data(), likes: userLikedPosts.length, totalPosts: userTotalPosts};
      }
    }
    return null;
  }

  /**
   * Add post
   *
   * @param postData
   */
  public async addPost(postData: any): Promise<any> {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.spinnerService.isVisible$.next(true);
      await this.uploadPhoto(postData.image);
      const docRef = await addDoc(collection(this.db, 'posts'), {
        postContent: postData.content,
        postImage: postData.image.filepath,
        userId: user.uid ?? 0,
        created: Date.now()
      });
      this.spinnerService.isVisible$.next(false);
      return docRef.id;
    }
  }

  async likePost(post) {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // check if post is already liked
      const likedPosts: any = await this.getLikesForPost(post.id);
      if (likedPosts.length) {
        const userLikes = likedPosts.filter(d => {
          console.log(d.data(), user.uid);
          return d.data().userID === user.uid;
        });
        if (userLikes.length) {
          return;
        }
      }
      const likedDoc = await addDoc(collection(this.db, 'liked_posts'), {
        postID: post.id,
        userID: user.uid
      });
      post.likes = likedPosts.length + 1;
      post.isPostLikedByUser = true;
    }
  }

  async getLikesForPost(postID) {
    const likeCollectionRef = collection(this.db, 'liked_posts');
    const q = query(likeCollectionRef, where('postID', '==', postID));
    const likedPosts = await getDocs(q);
    return likedPosts.docs;
  }

  async getLikesForUser(userID) {
    const likeCollectionRef = collection(this.db, 'liked_posts');
    const q = query(likeCollectionRef, where('userID', '==', userID));
    const likedPosts = await getDocs(q);
    return likedPosts.docs;
  }

  async getUserPostCount(userID) {
    const likeCollectionRef = collection(this.db, 'posts');
    const q = query(likeCollectionRef, where('userId', '==', userID));
    const posts = await getDocs(q);
    return posts.docs.length;
  }

  postLikedByLoggedUser(postDocs) {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (postDocs.length) {
        const userLikes = postDocs.filter(d => d.data().userID === user.uid);
        return userLikes.length > 0;
      }
    }
    return false;
  }

  /**
   * Upload photo
   *
   * @param o
   */
  public async uploadPhoto(o) {
    const storage = getStorage();
    const storageBase = ref(storage, `app-images/${o.filepath}`);
    return await uploadBytes(storageBase, o.blob);
  }

  /**
   * Get posts
   */
  async getFirstPosts(reset = false) {
    if (reset) {
      this.loadedAll = false;
      this.docsSnapshot = false;
    }
    return await this.loadMorePosts();
  }

  /**
   * Load more posts
   */
  async loadMorePosts() {
    if (this.loadedAll) {
      return [];
    }
    let posts;
    if (this.docsSnapshot && this.docsSnapshot !== false) {
      posts = query(collection(this.db, 'posts'), orderBy('created', 'desc'), startAfter(this.docsSnapshot), limit(this.limit));
    } else {
      posts = query(collection(this.db, 'posts'), orderBy('created', 'desc'), limit(this.limit));
    }
    const documentSnapshots = await getDocs(posts);
    this.docsSnapshot = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    if (documentSnapshots.docs.length === 0) {
      this.loadedAll = true;
    }
    return documentSnapshots.docs;
  }

  /**
   * Watch for new posts
   *
   * @param queryInstance
   */
  watchPosts(queryInstance) {
    this.watcherUnsubscribe = onSnapshot(queryInstance, (snapshot) => {
      this.allPosts.next(snapshot.docs);
    });
  }

  /**
   * Observe signed in user
   *
   * @protected
   */
  protected observeUser(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        this.user = user;
      } else {
        this.user = null;
        // User is signed out
      }
    });
  }
}
