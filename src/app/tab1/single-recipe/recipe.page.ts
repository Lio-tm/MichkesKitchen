import {Component, OnDestroy} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {from, Observable, Subscription} from 'rxjs';
import {Share} from '@capacitor/share';

import {AuthService} from '../../services/auth.service';
import {Recipe} from '../../types/recipe';
import {DatabaseService} from '../../services/database.service';


@Component({
  selector: 'app-single-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss'],
})
export class RecipePage implements OnDestroy {
  #subscriptions: Subscription[] = [];
  id: string;
  userId: string;
  recipe: Observable<Recipe>;
  favorites: string[] = [];
  shopping: string[] = [];
  isFavorite = false;
  isShopped = false;

  constructor(
    private dbService: DatabaseService,
    public activatedRoute: ActivatedRoute,
    public authService: AuthService,
    private toastController: ToastController
  ) {
  }

  ionViewDidEnter(): void {
    this.setData();
  }

  ngOnDestroy(): void {
    this.#subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  };

  async setData(): Promise<void> {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.recipe = await this.dbService.getSingleRecipe(this.id);
    const s = from(this.authService.currentUser).subscribe((user) => {
      this.userId = user?.uid;
      const fav = from(this.dbService.getPreferences(this.userId, 'favorites'))
        .subscribe((favorites) => {
          if (favorites) {
            this.favorites = favorites.recipes;
            this.isFavorite = this.favorites.includes(this.id);
          }
          ;
        });
      const shop = from(this.dbService.getPreferences(this.userId, 'shopping'))
        .subscribe((shopping) => {
          if (shopping) {
            this.shopping = shopping.recipes;
            this.isShopped = this.shopping.includes(this.id);
          }
          ;
        });
      this.#subscriptions.push(fav);
      this.#subscriptions.push(shop);
    });
    this.#subscriptions.push(s);
  }

  changePreference(isFavorite: boolean): void {
    const source = isFavorite ? this.favorites : this.shopping;
    const sourceBoolean = isFavorite ? this.isFavorite : this.isShopped;
    const sourceTarget = isFavorite ? 'favorites' : 'shopping';
    const newPrefrence = sourceBoolean
      ? source.filter((item) => item !== this.id)
      : [...source, this.id];

    const removeMessage = 'Removed from ';
    const addMessage = 'Added to ';
    const endmessage = isFavorite ? 'favorites' : 'shoppping list';
    const message =
      (isFavorite && this.isFavorite) || (!isFavorite && this.isShopped)
        ? removeMessage
        : addMessage;

    const s = from(
      this.dbService.savePreference(
        this.userId,
        newPrefrence,
        sourceTarget
      )
    ).subscribe(() => {
      this.presentToast(message + endmessage);
    });
    this.#subscriptions.push(s);
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom',
      icon: 'checkmark-outline',
      color: 'success',
    });
    await toast.present();
  }

  async share(title: string, text: string): Promise<void> {
    await Share.share({
      title,
      text,
      url: window.location.href,
      dialogTitle: 'Share this recipe'
    });
  }
}
