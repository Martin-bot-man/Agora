import { Component } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import{MatBadge} from '@angular/material/badge'
import { EcommerceStore } from '../../ecommerce-store';
import { inject } from '@angular/core';

@Component({
  selector: 'app-header-actions',
  imports: [MatButtonModule, MatIconButton, MatIconModule, RouterLink, MatBadge],
  template: ` <div class='flex items-center gap-2'>
    <button matIconButto routerLink='/wishlist' [matBadge]="store.wishlistCount()" [matBadgeHidden]="store.wishlistCount()=== 0">
      <mat-icon>favorite</mat-icon>
    </button>
    <button matIconButton>
      <mat-icon>shopping_cart</mat-icon>
    </button>
    <button matButton>
      Sign in
    </button>
    <button matButton='filled'>
      Sign up
    </button>
  </div> `,
  styles: ``,
})
export class HeaderActions {
  store = inject(EcommerceStore)
}
