import {Injectable} from '@angular/core';
import {Camera, CameraResultType, CameraSource, PermissionStatus, Photo} from '@capacitor/camera';
import {AngularFireStorage, AngularFireStorageReference} from '@angular/fire/compat/storage';
import {Observable} from 'rxjs';
import {UploadTaskSnapshot} from '@angular/fire/compat/storage/interfaces';
import {Capacitor} from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  #permissionGranted: PermissionStatus = {camera: 'prompt', photos: 'prompt'};

  constructor(private storage: AngularFireStorage) {
  }

  getPhotoRef(filePath: string): AngularFireStorageReference {
    return this.storage.ref(filePath);
  }

  savePhoto(filePath: string, file: File): Observable<UploadTaskSnapshot> {
    return this.storage.upload(filePath, file).snapshotChanges();
  }

  async takePhoto(): Promise<File> {
    let image;
    if (!this.#haveCameraPermission() || !this.#havePhotosPermission()) {
      await this.#requestPermissions();
    }

    if (Capacitor.isNativePlatform()) {
      image = await this.#takePhotoNative();
    } else {
      image = await this.#takePhotoPWA();
    }
    return image;
  }

  async #requestPermissions(): Promise<void> {
    try {
      this.#permissionGranted = await Camera.requestPermissions({
        permissions: ['photos', 'camera'],
      });
    } catch (error) {
      console.error(
        `Permissions aren't available on this device: ${Capacitor.getPlatform()} platform.`
      );
    }
  }

  async #retrievePermissions(): Promise<void> {
    try {
      this.#permissionGranted = await Camera.checkPermissions();
    } catch (error) {
      console.error(
        `Permissions aren't available on this device: ${Capacitor.getPlatform()} platform.`
      );
    }
  }

  #haveCameraPermission(): boolean {
    return this.#permissionGranted.camera === 'granted';
  }

  #havePhotosPermission(): boolean {
    return this.#permissionGranted.photos === 'granted';
  }

  #determinePhotoSource(): CameraSource {
    if (this.#havePhotosPermission() && this.#haveCameraPermission()) {
      return CameraSource.Prompt;
    } else {
      return this.#havePhotosPermission()
        ? CameraSource.Photos
        : CameraSource.Camera;
    }
  }

  async #takePhotoNative(): Promise<File> {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64,
      saveToGallery: this.#havePhotosPermission(),
      source: this.#determinePhotoSource(),
    });
    return this.convertBlobToFile(image);
  }

  async #takePhotoPWA(): Promise<File> {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    return this.convertBlobToFile(image);
  }

  convertBlobToFile(image: Photo): File {
    const rawData = atob(image.base64String);
    const bytes = new Array(rawData.length);
    for (let x = 0; x < rawData.length; x++) {
      bytes[x] = rawData.charCodeAt(x);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], {type: 'image/png'});
    return new File([blob], Date.now().toString(), {
      lastModified: Date.now(),
      type: blob.type,
    });
  }
}
