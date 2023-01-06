import {Component, OnInit} from '@angular/core';
import {from, Observable} from 'rxjs';

import {Tag} from '../types/tag';
import {Recipe} from '../types/recipe';
import {DatabaseService} from '../services/database.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {
  tags: Tag[] = [
    Tag.breakfast,
    Tag.dessert,
    Tag.salad,
    Tag.lunch,
    Tag.dinner,
    Tag.appetizersAndSnacks
  ];
  recipesByTag: Observable<Recipe[]> = from([]);

  constructor(private dbService: DatabaseService) {
  }

  ngOnInit(): void {
    this.setData();
  }

  setData(): void {
    this.tags.forEach((tag) => {
      this.recipesByTag[tag] = this.dbService.getRecipesByTag(tag);
    });
  }
}
