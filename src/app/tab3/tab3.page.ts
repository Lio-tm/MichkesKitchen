import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, from, Subscription} from 'rxjs';

import {Recipe} from '../types/recipe';
import {AuthService} from '../services/auth.service';
import {DatabaseService} from '../services/database.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  #subscriptions: Subscription[] = [];
  userID: string;
  recipes: Recipe[] = [];
  favorites: string[];

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

  private setData(): void {
    const s = from(this.dbService.getPreferences(this.userID, 'favorites'))
      .pipe(first())
      .subscribe((favorites) => {
        this.recipes = [];
        if (favorites) {
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
}
