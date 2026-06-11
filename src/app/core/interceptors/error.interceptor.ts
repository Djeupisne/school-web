import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';  // ✅ Chemin corrigé
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notification: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si on est en train de se déconnecter, on ignore silencieusement les erreurs
        if (this.authService.getIsLoggingOut()) {
          return throwError(() => error);
        }

        let message = 'Une erreur inattendue est survenue.';

        if (error.error instanceof ErrorEvent) {
          message = `Erreur: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 0:
              message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
              break;
            case 400:
              message = this.extractMessage(error) || 'Requête invalide.';
              break;
            case 401:
              message = 'Session expirée. Veuillez vous reconnecter.';
              this.authService.logout();
              this.router.navigate(['/login']);
              break;
            case 403:
              message = 'Vous n\'avez pas les droits pour cette action.';
              break;
            case 404:
              message = 'Ressource introuvable.';
              break;
            case 500:
              message = 'Erreur interne du serveur.';
              break;
            default:
              message = `Erreur ${error.status}: ${this.extractMessage(error)}`;
          }
        }

        this.notification.error(message);
        return throwError(() => error);
      })
    );
  }

  private extractMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      return error.error.message || error.error.error || '';
    }
    if (typeof error.error === 'string') return error.error;
    return error.message || '';
  }
}