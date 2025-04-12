import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  
  // Dashboard stats (to be replaced with actual data)
  stats = [
    { title: 'Users', value: '25', icon: 'people', color: '#6772e5' },
    { title: 'Trips', value: '158', icon: 'directions_car', color: '#3ecf8e' },
    { title: 'Revenue', value: '$12,400', icon: 'attach_money', color: '#f5b400' },
    { title: 'Pending Requests', value: '8', icon: 'schedule', color: '#e97b40' }
  ];
  
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loading = false;
    
    // Get user profile
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.success) {
          // Update current user value if needed
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.loading = false;
      }
    });
  }
}
