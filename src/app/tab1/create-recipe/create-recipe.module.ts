import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {CreateRecipePageRoutingModule} from './create-recipe-routing.module';
import {CreateRecipePage} from './create-recipe.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CreateRecipePageRoutingModule
  ],
  declarations: [CreateRecipePage]
})
export class CreateRecipePageModule {
}
