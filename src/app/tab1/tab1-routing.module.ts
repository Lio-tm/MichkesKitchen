import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
  {
    path: 'recipe/create',
    loadChildren: () => import('./create-recipe/create-recipe.module').then( m => m.CreateRecipePageModule)
  },
  {
    path: 'recipe/create/:id',
    loadChildren: () => import('./create-recipe/create-recipe.module').then( m => m.CreateRecipePageModule)
  },{
    path: 'recipe/:id',
    loadChildren: () => import('./single-recipe/recipe.module').then( m => m.RecipePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
