import {
  collection,
  CollectionReference,
  Firestore,
  doc,
  DocumentReference,
  addDoc,
  collectionData, query, deleteDoc, updateDoc, where, docData, setDoc
} from '@angular/fire/firestore';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {AuthService} from './auth.service';
import {Recipe} from '../types/recipe';
import {Tag} from '../types/tag';
import {Preference} from '../types/preference';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private authService: AuthService, private firestore: Firestore) {
  }

  #getCollectionRef<T>(collectionName: string): CollectionReference<T> {
    return collection(this.firestore, collectionName) as CollectionReference<T>;
  }

  #getDocumentRef<T>(collectionName: string, id: string): DocumentReference<T> {
    return doc(this.firestore, `${collectionName}/${id}`) as DocumentReference<T>;
  }

  async savePreference(userID: string, favorites: string[], location: string): Promise<void> {
    await setDoc(this.#getDocumentRef(location, userID), {recipes: favorites});
  }

  async saveRecipe(newRecipe: Recipe): Promise<void> {
    await addDoc<Recipe>(this.#getCollectionRef<Recipe>('recipes'),
      newRecipe
    );
  }

  async deleteRecipe(id: string): Promise<void> {
    await deleteDoc(this.#getDocumentRef<Recipe>('recipes', id));
  }

  async updateRecipe(id: string, updatedRecipe: Recipe): Promise<void> {
    await updateDoc<Recipe>(this.#getDocumentRef<Recipe>('recipes', id),
      updatedRecipe
    );
  }

  getRecipes(): Observable<Recipe[]> {
    return collectionData<Recipe>(
      query<Recipe>(
        this.#getCollectionRef('recipes')
      ),
      {idField: 'id'}
    );
  }

  getRecipesByTag(tag: Tag): Observable<Recipe[]> {
    return collectionData<Recipe>(
      query<Recipe>(
        this.#getCollectionRef('recipes'),
        where('tag', '==', tag)
      ),
      {idField: 'id'}
    );
  }

  getSingleRecipe(id: string): Observable<Recipe> {
    return docData<Recipe>(this.#getDocumentRef('recipes', id),
      {idField: 'id'});
  }

  getPreferences(userid: string, location: string): Observable<Preference> {
    return docData<Preference>(this.#getDocumentRef(location, userid),
      {idField: 'id'});
  }
}
