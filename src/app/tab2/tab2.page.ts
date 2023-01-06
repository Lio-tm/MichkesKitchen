import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';

import {Tag} from '../types/tag';
import {Recipe} from '../types/recipe';
import {DatabaseService} from '../services/database.service';
import {Difficulty} from '../types/difficulty';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  #subscriptions: Subscription[] = [];
  tags: Tag[] = [
    Tag.breakfast,
    Tag.dessert,
    Tag.salad,
    Tag.lunch,
    Tag.dinner,
    Tag.appetizersAndSnacks
  ];
  difficulties: Difficulty[] = [
    Difficulty.easy,
    Difficulty.medium,
    Difficulty.hard,
    Difficulty.expert
  ];
  searchResults: Recipe[] = [];
  title: string;
  tag: Tag;
  difficulty: Difficulty;
  ingredient: string;
  recipes: Recipe[];
  isSubmitted = false;

  constructor(private dbService: DatabaseService) {
  }

  ngOnInit(): void {
    this.setData();
  }

  ngOnDestroy(): void {
    this.#subscriptions.forEach(s => s.unsubscribe());
  }

  setData(): void {
    const s = this.dbService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes;
    });
    this.#subscriptions.push(s);
  }

  searchRecipes(): void {
    const title = this.title || '';
    const tag = this.tag || '';
    const difficulty = this.difficulty || '';
    const ingredient = this.ingredient || '';
    this.isSubmitted = true;
    this.searchResults = this.recipes.filter(recipe => {
      const searchTag = tag ? recipe.tag === tag : true;
      const searchDifficulty = difficulty ? recipe.difficulty === difficulty : true;
      return recipe.recipeName.toUpperCase().includes(title.toUpperCase())
        && searchTag && searchDifficulty && recipe.ingredients.some((ingr) => ingr
          .toUpperCase().includes(ingredient.toUpperCase()));
    });
  }
}
