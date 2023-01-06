import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SwiperModule} from 'swiper/angular';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import {RecipeModule} from '../recipe/recipe.module';
import { Tab1Page } from './tab1.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SwiperModule,
    RecipeModule
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}
