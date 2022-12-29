import {Component, OnInit} from '@angular/core';
import {FirebaseService} from '../../services/FirebaseService';
import {Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginModel: { email: string; password: string } = {
    email: '',
    password: ''
  };

  constructor(private firebaseService: FirebaseService, private router: Router, private toastService: ToastService) {
    
  }

  ngOnInit() {
    if (localStorage.getItem('user')) {
      this.router.navigate(['/home']);
    }
  }

  async loginUser() {
    if (!this.loginModel.email || this.loginModel.email.indexOf('@') === -1 || !this.loginModel.password) {
      await this.toastService.create('Invalid email or password', 'danger');
      return;
    }
    this.firebaseService.loginUser(this.loginModel.email, this.loginModel.password)
      .then((user: any) => {
        this.router.navigate(['/home']);
      })
      .catch(async (err: any) => {
        console.log(err);
        await this.toastService.create('Invalid email or password', 'danger');
      });
  }

  public navigateToRegister(): void {
    this.router.navigateByUrl('/register');
  }

}
