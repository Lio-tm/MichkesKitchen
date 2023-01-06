import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, from, Subscription} from 'rxjs';
import {ItemReorderEventDetail} from '@ionic/angular';

import {Recipe} from '../types/recipe';
import {AuthService} from '../services/auth.service';
import {DatabaseService} from '../services/database.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit, OnDestroy {

  #subscriptions: Subscription[] = [];
  userID: string;
  recipes: Recipe[] = [];
  favorites: string[] = [];

  constructor(public authService: AuthService, private dbService: DatabaseService) {
  }

  ngOnInit(): void {
    const s = from(this.authService.currentUser).subscribe((user) => {
      this.userID = user?.uid;
    });
    this.#subscriptions.push(s);
  }

  ionViewDidEnter(): void {
    this.setData();
  }

  ionViewDidLeave(): void {
    this.#subscriptions.forEach((s) => s.unsubscribe());
  }

  ngOnDestroy(): void {
    this.#subscriptions.forEach((s) => s.unsubscribe());
  }

  setData(): void {
    const s = from(this.dbService.getPreferences(this.userID, 'shopping'))
      .pipe(first())
      .subscribe((favorites) => {
        this.recipes = [];
        if (favorites) {
          this.favorites = favorites.recipes;
          const recipes = [];
          favorites.recipes.forEach((recipeID) => {
            const r = from(this.dbService.getSingleRecipe(recipeID))
              .pipe(first())
              .subscribe((recipe) => {
                recipes.push(recipe);
              });
            this.#subscriptions.push(r);
          });
          this.recipes = recipes;
        }
      });
    this.#subscriptions.push(s);
  }

  removeShopping(id: string): void {
    const newPreference = this.favorites.filter((item) => item !== id);
    const s = from(this.dbService.savePreference(this.userID, newPreference, 'shopping'))
      .subscribe(() => this.setData());
    this.#subscriptions.push(s);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>): void {
    ev.detail.complete();
  }
}
