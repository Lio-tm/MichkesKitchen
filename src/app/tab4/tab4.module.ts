import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {Tab4PageRoutingModule} from './tab4-routing.module';
import {Tab4Page} from './tab4.page';
import {RecipeModule} from '../recipe/recipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
    RecipeModule
  ],
  declarations: [Tab4Page]
})
export class Tab4PageModule {
}
