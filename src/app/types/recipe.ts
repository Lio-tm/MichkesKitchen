import {Difficulty} from './difficulty';
import {Tag} from './tag';

export interface Recipe {
  recipeName: string;
  description: string;
  servings: number;
  difficulty: Difficulty;
  time: string;
  ingredients: string[];
  steps: string[];
  tag: Tag;
  fileUrl: string;
  id?: string;
}
