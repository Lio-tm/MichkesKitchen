import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RecipeComponent} from './recipe.component';
import {RouterModule} from '@angular/router';
import {IonicModule} from '@ionic/angular';

@NgModule({
  declarations: [RecipeComponent],
  exports: [RecipeComponent],
  imports: [
    RouterModule,
    IonicModule,
    CommonModule
  ]
})
export class RecipeModule { }
