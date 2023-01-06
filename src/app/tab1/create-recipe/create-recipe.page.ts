import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {from, Subscription} from 'rxjs';
import {AlertController, ToastController} from '@ionic/angular';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DatabaseService} from '../../services/database.service';
import {Tag} from '../../types/tag';
import {Recipe} from '../../types/recipe';
import {Difficulty} from '../../types/difficulty';
import {PhotoService} from '../../services/photo.service';

@Component({
  selector: 'app-single-recipe',
  templateUrl: './create-recipe.page.html',
  styleUrls: ['./create-recipe.page.scss'],
})
export class CreateRecipePage implements OnInit, OnDestroy {
  #substriptions: Subscription[] = [];
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
  recipe: Recipe;
  id: string;
  tag: Tag;
  file: File;
  fileRef: string;
  fileUrl: string;
  isSubmitted = false;
  hasPicture = false;
  recipeForm: FormGroup;

  constructor(private dbService: DatabaseService, public activatedRoute: ActivatedRoute,
              private router: Router, private location: Location,
              private alertController: AlertController, private photoService: PhotoService,
              public formBuilder: FormBuilder, private toastController: ToastController) {
  }

  get errorControl() {
    return this.recipeForm.controls;
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  uploadPicture(): void {
    const s = from(this.photoService.takePhoto()).subscribe((img) => {
      this.file = img;
      this.hasPicture = true;
    });
    this.#substriptions.push(s);
  }

  addStep(): void {
    this.steps.push(new FormControl('', [Validators.required]));
  }

  removeStep(i: number): void {
    this.steps.removeAt(i);
  }

  addIngredient(): void {
    this.ingredients.push(new FormControl('', [Validators.required]));
  }

  removeIngredient(i: number): void {
    this.ingredients.removeAt(i);
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.fileRef = this.id ? `/recipe-${this.id}` : `/recipe-${Date.now()}`;
    if (this.id) {
      this.setData();
    }
    this.recipeForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      servings: [1, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      time: ['', [Validators.required]],
      tag: [Tag.breakfast, [Validators.required]],
      difficulty: [Difficulty.easy, [Validators.required]],
      steps: this.formBuilder.array([new FormControl('', [Validators.required])],
        [Validators.required]),
      ingredients: this.formBuilder.array([new FormControl('', [Validators.required])],
        [Validators.required])
    });
  }

  ngOnDestroy(): void {
    this.#substriptions.forEach(s => s.unsubscribe());
  }

  goBack(): void {
    this.location.back();
  }

  setData(): void {
    const s = from(this.dbService.getSingleRecipe(this.id)).subscribe((recipe) => {
      if (recipe) {
        this.recipe = recipe;
        this.recipeForm.controls.name.setValue(recipe.recipeName);
        this.recipeForm.controls.description.setValue(recipe.description);
        this.recipeForm.controls.servings.setValue(recipe.servings);
        this.recipeForm.controls.tag.setValue(recipe.tag);
        this.recipeForm.controls.time.setValue(recipe.time);
        this.recipeForm.controls.difficulty.setValue(recipe.difficulty);

        if (recipe.fileUrl) {
          this.fileUrl = recipe.fileUrl;
          this.hasPicture = true;
        }

        const formArrayIngredients = new FormArray([], [Validators.required]);
        recipe.ingredients.forEach((ingredient) => {
          formArrayIngredients.push(
            new FormControl(ingredient, [Validators.required])
          );
        });
        this.recipeForm.setControl('ingredients', formArrayIngredients);

        const formArraySteps = new FormArray([], [Validators.required]);
        recipe.steps.forEach((step) => {
          formArraySteps.push(new FormControl(step, [Validators.required]));
        });
        this.recipeForm.setControl('steps', formArraySteps);
      }
    });
    this.#substriptions.push(s);
  }

  submitRecipe(): boolean {
    this.isSubmitted = true;
    if (!this.recipeForm.valid) {
      this.presentToast('Please provide all the required values!');
      return false;
    } else if (!this.hasPicture) {
      this.presentToast('Please provide a picture');
      return false;
    } else {
      const formValues = this.recipeForm;
      this.recipe = {
        recipeName: formValues.get('name').value,
        description: formValues.get('description').value,
        servings: formValues.get('servings').value,
        difficulty: formValues.get('difficulty').value,
        time: formValues.get('time').value,
        ingredients: formValues.get('ingredients').value,
        steps: formValues.get('steps').value,
        tag: formValues.get('tag').value,
        fileUrl: this.fileUrl
      };
      if (this.file) {
        const p = this.photoService
          .savePhoto(this.fileRef, this.file)
          .subscribe((file) => {
            const ref = this.photoService.getPhotoRef(this.fileRef);
            const u = from(ref.getDownloadURL()).subscribe((url) => {
              this.recipe.fileUrl = url;
              this.saveRecipe();
            });
            this.#substriptions.push(u);
          });
        this.#substriptions.push(p);
      } else {
        this.saveRecipe();
      }
    }
  }


  saveRecipe(): void {
    let s: Subscription;
    if (this.id) {
      s = from(this.dbService.updateRecipe(this.id, this.recipe)).subscribe(
        () => this.goBack()
      );
    } else {
      s = from(this.dbService.saveRecipe(this.recipe)).subscribe(() =>
        this.goBack()
      );
    }
    this.#substriptions.push(s);
  }

  deleteRecipe(): void {
    if (this.id
    ) {
      const s = from(this.dbService.deleteRecipe(this.id))
        .subscribe(() => this.router.navigate(['tabs', 'tab1']));
      this.#substriptions.push(s);
    }
  }

  async presentDeleteAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: () => {
            this.deleteRecipe();
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom',
      icon: 'alert-circle-outline',
      color: 'danger',
    });
    await toast.present();
  }
}
