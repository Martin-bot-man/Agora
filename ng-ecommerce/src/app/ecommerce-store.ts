import { Product} from "./models/products";
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import { computed, inject } from "@angular/core";
import {produce} from 'immer'
import { Toaster } from "./services/toaster";

export type EcommerceState= {
    products: Product[];
    category: string;
    wishlistItems: Product[]

}
export const EcommerceStore = signalStore(
    {
       providedIn: 'root'
    },
    withState<EcommerceState>({
        products:[{
            id: '1',
            name: 'Apple iPhone 15',
            description: 'Latest Apple smartphone with Dynamic Island and A16 Bionic chip.',
            price: 999,
            imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            rating: 4.8,
            reviewCount: 152,
            inStock: true,
            category: 'electronics'
          },
          {
            id: '2',
            name: 'Nike Air Max 270',
            description: 'Comfortable and stylish sneakers for everyday wear.',
            price: 149,
            imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80',
            rating: 4.4,
            reviewCount: 89,
            inStock: true,
            category: 'shoes'
          },
          {
            id: '3',
            name: 'Sony WH-1000XM5',
            description: 'Industry-leading noise cancelling headphones.',
            price: 349,
            imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
            rating: 4.7,
            reviewCount: 211,
            inStock: true,
            category: 'electronics'
          },
          {
            id: '4',
            name: 'Levi’s 501 Original Fit Jeans',
            description: 'Classic straight leg jeans for all occasions.',
            price: 69,
            imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
            rating: 4.2,
            reviewCount: 47,
            inStock: true,
            category: 'clothing'
          },
          {
            id: '5',
            name: 'The North Face Borealis Backpack',
            description: 'Durable, versatile backpack for school or the outdoors.',
            price: 89,
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            rating: 4.6,
            reviewCount: 102,
            inStock: false,
            category: 'bags'
          },
          {
            id: '6',
            name: 'Fjällräven Kånken',
            description: 'Swedish design classic, hardwearing and practical.',
            price: 79,
            imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=600&q=80',
            rating: 4.5,
            reviewCount: 65,
            inStock: true,
            category: 'bags'
          },
          {
            id: '7',
            name: 'Samsung Galaxy S23',
            description: 'Flagship phone with pro-grade camera and vivid display.',
            price: 899,
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            rating: 4.6,
            reviewCount: 98,
            inStock: true,
            category: 'electronics'
          },
          {
            id: '8',
            name: 'Adidas Ultraboost 22',
            description: 'Ultra-comfortable running shoes for all distances.',
            price: 180,
            imageUrl: 'https://images.unsplash.com/photo-1528701800484-90546a93690b?auto=format&fit=crop&w=600&q=80',
            rating: 4.7,
            reviewCount: 73,
            inStock: true,
            category: 'shoes'
          },
          {
            id: '9',
            name: 'Patagonia Down Sweater',
            description: 'Warm, lightweight, and windproof jacket.',
            price: 229,
            imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
            rating: 4.9,
            reviewCount: 50,
            inStock: false,
            category: 'clothing'
          },
          {
            id: '10',
            name: 'Converse Chuck Taylor All Star',
            description: 'Iconic canvas sneakers loved worldwide.',
            price: 55,
            imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
            rating: 4.5,
            reviewCount: 132,
            inStock: true,
            category: 'shoes'
          }],
        category: 'all',
        wishlistItems: []
    }),

  withComputed(({ category, products, wishlistItems}) => ({
    filteredProducts: computed(()=> {
        const currentCategory = category().toLowerCase();

        if (currentCategory === 'all' || currentCategory === 'home'){
            return products();
        }
        return products().filter((p) => p.category.toLowerCase() === currentCategory);
    }),
    wishlistCount: computed(()=>{return wishlistItems().length

    })
  })),
 withMethods((store, toaster = inject(Toaster))=>({
    setCategory(category: string){
        patchState(store, {category})
    },
    addToWishList: (product: Product)=> {
       const updatedWishlistItems=produce(store.wishlistItems() as Product[], (draft)=>{
           if (!draft.find(p => p.id === product.id)){
            draft.push(product);
           }
       }) as Product[];
       patchState(store, {wishlistItems: updatedWishlistItems});
       toaster.success('Product added to wishlist')
    },
    
    removeFromWishList: (product: Product)=> {
      patchState(store, {
        wishlistItems: store.wishlistItems().filter((p)=> p.id !== product.id),

      });
      toaster.success('product removed from wishlist ')
    }
 }))
)