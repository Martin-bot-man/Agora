import { inject, computed, Component,input} from '@angular/core';
import { EcommerceStore } from '../../ecommerce-store';
import { MatIcon } from '@angular/material/icon'
import { Product } from '../../models/products';
import { MatIconButton } from '@angular/material/button';


@Component({
  selector: 'app-toggle-wishlist-button',
  imports: [MatIcon, MatIconButton],
  template: ` <button class = "!absolute z-10 top-3 right-3 w-10 rounded-full !bg-white border-0 shadow-md flex items-center jusstify-center cursor-pointed transition-all duration-200 hover:scale-110 hover:shadow-lg" 
  [class]="isInWishlist() ? '!text-red-500': '!text-gray-400'"
  matIconButton (click)= "toggleWishlist(product())">
    <mat-icon>{{ isInWishlist() ? 'favorite':'favorite_border'}}</mat-icon>
  </button> `,
  styles: ``,
})
export class ToggleWishlistButton {
  product = input.required<Product>
  store = inject(EcommerceStore)
  isInWishlist = computed(()=> this.store.wishlistItems().find(p => p.id === this.product().id))

  toggleWishlist(product: Product){
    if(this.isInWishlist()){
       this.store.removeFromWishList(product);
    } else{
      this.store.addToWishList(product)
    }
  } 
}
