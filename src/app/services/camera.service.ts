import {Injectable} from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {Router} from '@angular/router';
import {GeneralService} from './general.service';
import {ActionSheetService} from './action-sheet.service';
import {SpinnerService} from './spinner.service';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  public photos: UserPhoto[] = [];
  public imgSrc: any = '';

  constructor(private router: Router,
              private generalService: GeneralService,
              private spinnerService: SpinnerService,
              private toastService: ToastService,
              private actionSheetService: ActionSheetService) {
  }

  public async loadPhotoFromGallery() {
    return await this.takePhoto(CameraSource.Photos);
  }

  public async takePhoto(source = CameraSource.Camera): Promise<any> {
    try {
      const imgPic = await Camera.getPhoto({
        quality: 80,
        source,
        resultType: CameraResultType.Uri
      });
      const savedImageFile = await this.savePicture(imgPic, source);
      return savedImageFile;
    } catch (err) {
      this.toastService.create(err, 'danger', 4000);
    }
  }

  async selectMedia() {
    const currUrl = this.router.url;
    await this.actionSheetService.createMediaSheet(
      async () => {
        this.imgSrc = await this.takePhoto();
        if (currUrl === '/post') {
          this.generalService.send({
            type: 'postPhoto',
            data: this.imgSrc
          });
        } else {
          await this.router.navigate(['post'], {state: {photo: this.imgSrc}});
        }
      },
      async () => {
        this.imgSrc = await this.loadPhotoFromGallery();
        if (currUrl === '/post') {
          this.generalService.send({
            type: 'postPhoto',
            data: this.imgSrc
          });
        } else {
          await this.router.navigate(['post'], {state: {photo: this.imgSrc}});
        }
      });
  }

  private async savePicture(photo: Photo, cameraSource) {
    // Convert photo to base64 format, required by Filesystem API to save
    const source = await this.readAsBase64(photo);
    // Write the file to the data directory
    const fileName = `instapic-${new Date().getTime()}.jpeg`;
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      blob: source.blob
    };
  }

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath);
    const blob = await response.blob();

    const base64Img = await this.convertBlobToBase64(blob) as string;
    return {blob, base64Img};
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}
