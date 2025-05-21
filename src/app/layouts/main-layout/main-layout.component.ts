import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  isSidebarExpanded = true;

  constructor() { }

  ngOnInit(): void {
    // Check if there's a saved preference for sidebar state
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      this.isSidebarExpanded = savedState === 'true';
    }
  }

  toggleSidebar(expanded: boolean): void {
    this.isSidebarExpanded = expanded;
    // Save preference
    localStorage.setItem('sidebarExpanded', expanded.toString());
  }
}
