import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    // Déconnecter et naviguer immédiatement
    this.authService.logout();
    // Utiliser navigateByUrl pour forcer une navigation complète
    this.router.navigateByUrl('/login', { skipLocationChange: true });
  }
}