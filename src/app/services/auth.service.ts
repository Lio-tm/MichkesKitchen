import {Injectable} from '@angular/core';
import {FirebaseAuthentication} from '@capacitor-firebase/authentication';
import {Router} from '@angular/router';
import {Auth, signInWithCredential, signOut} from '@angular/fire/auth';
import {updateProfile, GoogleAuthProvider, PhoneAuthProvider, User} from 'firebase/auth';
import {Capacitor} from '@capacitor/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: BehaviorSubject<null | User> = new BehaviorSubject<null | User>(undefined);
  private verificationId: string;

  constructor(private auth: Auth, private router: Router) {
    this.auth.onAuthStateChanged(user => this.setCurrentUser(user));
  }

  isLoggedIn(): boolean {
    return this.currentUser.value !== null && this.currentUser.value !== undefined;
  }

  getProfilePic(): string {
    const placeholder = '/assets/Portrait_Placeholder.png';
    if (!this.isLoggedIn()) {
      return placeholder;
    }
    return this.currentUser.value.photoURL ? this.currentUser.value.photoURL : placeholder;
  }

  getDisplayName(): string | undefined {
    return this.isLoggedIn() ? this.currentUser.value.displayName : undefined;
  }

  getEmail(): string | undefined {
    return this.isLoggedIn() ? this.currentUser.value.email : undefined;
  }

  getUserUID(): string | undefined {
    return this.isLoggedIn() ? this.currentUser.value.uid : undefined;
  }

  async signOut(): Promise<void> {
    await FirebaseAuthentication.signOut();

    if (Capacitor.isNativePlatform()) {
      await signOut(this.auth);
    }
  }

  async signInWithGoogle(): Promise<void> {
    // Sign in on the native layer.
    const {credential: {idToken}} = await FirebaseAuthentication.signInWithGoogle();

    // Sign in on the web layer.
    // The plug-in only handles the native layer, for PWA this isn't a problem.
    // However, for native apps this is a problem, as the app is web-based.
    if (Capacitor.isNativePlatform()) {
      // A credential can be generated for each supported provider,
      // however, the signature of these methods is varied.
      // Make sure to check the Firebase JavaScript SDK docs to find the required parameters.
      // https://firebase.google.com/docs/auth/web/google-signin
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(this.auth, credential);
    }
  }

  /**
   * The login process for a phone is seperated in 2 part.
   *  1. A Verification code is send to the user. <-- This method.
   *  2. The verification code is entered on the website and used to log in.
   *
   * @param phoneNumber The phone number to which the verification code must be sent.
   */
  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    const {verificationId} = await FirebaseAuthentication.signInWithPhoneNumber({phoneNumber});
    this.verificationId = verificationId;
  }

  /**
   * Authenticate the user through the verification send to his phone number.
   *
   * @param verificationCode
   */
  async signInWithPhoneNumber(verificationCode: string): Promise<void> {
    const credential = PhoneAuthProvider.credential(this.verificationId, verificationCode);
    await signInWithCredential(this.auth, credential);
  };

  async updateDisplayName(displayName: string): Promise<void> {
    await updateProfile(this.auth.currentUser, {
      displayName
    });
  }

  /**
   * Save the new user as an instance variable, and perform any necessary reroutes.
   *
   * @param user The new user.
   * @private
   */
  private async setCurrentUser(user: User): Promise<void> {
    this.currentUser.next(user);
    if (this.currentUser.value) {
      await this.router.navigate(['/']);
    } else {
      await this.router.navigate(['/login']);
    }
  }
}
