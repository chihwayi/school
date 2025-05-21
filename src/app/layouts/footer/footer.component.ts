import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SchoolConfig } from '../../models/school-config.model';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  schoolInfo: Partial<SchoolConfig> | null = null;
  currentYear: number = new Date().getFullYear();
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to school info
    this.authService.schoolInfo$.subscribe(info => {
      this.schoolInfo = info;
    });
    
    // Check if user is logged in
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
}
