import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  template: `
    <app-header class='z-10'/>
    <div class='h-[calc(100%-64px)] overflow-auto'>
    <router-outlet />

    </div>
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('ng-ecommerce');
}
