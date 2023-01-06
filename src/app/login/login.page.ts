import {Component, OnInit} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {ModalController} from '@ionic/angular';

import {AuthService} from '../services/auth.service';
import {PhoneVerificationComponent} from './phone-verification/phone-verification.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isNative = Capacitor.isNativePlatform();

  constructor(public authService: AuthService, private modalController: ModalController) {
  }

  async showPhoneVerification(): Promise<void> {
    const modal = await this.modalController.create({
      component: PhoneVerificationComponent
    });
    return await modal.present();
  }

  ngOnInit() {
  }
}
