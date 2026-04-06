import { Routes } from '@angular/router';

export const routes: Routes = [{
    path:'',
    redirectTo: 'products/all',
    pathMatch: 'full'
},{
    path:'products/:category',
    loadComponent:  () => import('./pages/products-grid/products-grid').then(m => m.default)
},
{
    path:'wishlist',
    loadComponent: ()=> import('./pages/my-wishlist/my-wishlist').then(m => m.default)
}

];
