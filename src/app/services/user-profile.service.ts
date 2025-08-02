import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private firestore = inject(Firestore);

  // Guardar perfil de usuario en Firestore
  saveUserProfile(profile: UserProfile): Observable<void> {
    const userDocRef = doc(this.firestore, 'users', profile.uid);
    const profileData = {
      ...profile,
      fechaRegistro: Timestamp.fromDate(profile.fechaRegistro)
    };
    return from(setDoc(userDocRef, profileData));
  }

  // Obtener perfil de usuario desde Firestore
  getUserProfile(uid: string): Observable<UserProfile | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            ...data,
            fechaRegistro: data['fechaRegistro']?.toDate() || new Date()
          } as UserProfile;
        }
        return null;
      })
    );
  }
}