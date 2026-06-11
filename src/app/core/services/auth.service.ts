import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Flag pour indiquer qu'une déconnexion est en cours
  private isLoggingOut = false;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.roleKey, response.role);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout() {
    // Activer le flag AVANT de supprimer le token
    this.isLoggingOut = true;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.isAuthenticatedSubject.next(false);

    // Réinitialiser le flag après un court délai (le temps que les requêtes en cours échouent)
    setTimeout(() => {
      this.isLoggingOut = false;
    }, 2000);
  }

  // Méthode pour vérifier si on est en train de se déconnecter
  getIsLoggingOut(): boolean {
    return this.isLoggingOut;
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  getRole(): string | null { return localStorage.getItem(this.roleKey); }
  isAuthenticated(): boolean { return this.hasToken(); }
  private hasToken(): boolean { return !!localStorage.getItem(this.tokenKey); }
}