import {Injectable} from '@angular/core';
import {ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(public toastController: ToastController) {
  }

  async create(message: string = '', color: string = 'primary', duration: number = 2000, showDismiss = false) {
    const options: any = {
      message,
      color,
      duration
    };
    if (showDismiss) {
      options.buttons = [
        {
          side: 'end',
          icon: 'close-circle-outline',
          role: 'cancel',
          handler: () => {
            console.log('Favorite clicked');
          }
        }
      ];
    }
    const toast = await this.toastController.create(options);
    await toast.present();
  }
}
