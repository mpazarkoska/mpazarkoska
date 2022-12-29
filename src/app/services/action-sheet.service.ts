import {Injectable} from '@angular/core';
import {ActionSheetController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ActionSheetService {

  constructor(public actionSheetController: ActionSheetController) {
  }

  public async createMediaSheet(cameraCallback, galleryCallback) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Media Type',
      buttons: [{
        text: 'Camera',
        icon: 'camera',
        id: 'camera-button',
        data: {
          type: 'camera'
        },
        handler: () => {
          cameraCallback();
        }
      }, {
        text: 'Gallery',
        icon: 'images',
        data: 'gallery',
        handler: () => {
          galleryCallback();
        }
      }]
    });
    await actionSheet.present();
  }
}
