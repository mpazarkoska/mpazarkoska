import {Component, OnInit} from '@angular/core';
import {FirebaseService} from '../../services/FirebaseService';
import {ToastService} from '../../services/toast.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public registerModel: { email: string; firstName: string; lastName: string; password: string } = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  };

  constructor(private firebaseService: FirebaseService, private toastService: ToastService, private router: Router) {
  }

  ngOnInit() {
    if (localStorage.getItem('user')) {
      this.router.navigate(['/home']);
    }
  }

  public async registerUser() {
    console.log(this.registerModel);
    if (!this.registerModel.email ||
      this.registerModel.email.indexOf('@') === -1 ||
      !this.registerModel.firstName ||
      !this.registerModel.lastName ||
      !this.registerModel.password) {
      return;
    }
    await this.firebaseService.createUser(this.registerModel)
      .then((user: any) => {
        this.registerModel = {
          email: '',
          firstName: '',
          lastName: '',
          password: '',
        };
        this.router.navigate(['/login']);
      })
      .catch(async (err: any) => {
        await this.toastService.create(err, 'danger');
      });
  }

  /**
   * Update register model
   *
   * @param event
   */
  public updateModel(event, prop): void {
    this.registerModel[prop] = event.target.value;
  }

}
