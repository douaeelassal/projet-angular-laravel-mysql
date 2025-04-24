import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      // Vérifier s'il y a des restrictions de rôle
      const requiredRole = route.data['role'] as string;
      if (!requiredRole) {
        return true; // Pas de rôle requis, donc accès autorisé
      }
      
      const user = this.authService.currentUserValue;
      if (user && user.role === requiredRole) {
        return true; // L'utilisateur a le rôle requis
      } else {
        // Rediriger vers la page d'accueil ou afficher un message d'erreur
        this.router.navigate(['/']);
        return false;
      }
    }
    
    // Utilisateur non connecté, rediriger vers la page de connexion
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}