import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BUYKI';
  activeTab = 'home';

  showTab(tab: string): void {
    this.activeTab = tab;
  }
}