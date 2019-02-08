import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuEntry } from './MenuEntry';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  entries: MenuEntry[] = [];

  constructor(private router: Router) {
    this.addEntry('Home', '/home', 'desktop');
    this.addEntry('Login', '/login', 'desktop');
  }

  gotoRoute(url: string) {
    this.router.navigateByUrl(url);
  }

  addEntry(name: string, url: string, icon: string, isVisible: boolean = true) {
    this.entries.push(new MenuEntry(name, url, icon, isVisible));
  }

  ngOnInit() {}

}
