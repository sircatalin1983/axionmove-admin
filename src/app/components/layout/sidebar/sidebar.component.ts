import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  link?: string;
  children?: MenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard'
    },
    {
      label: 'Users',
      icon: 'people',
      link: '/users',
      roles: ['admin']
    },
    {
      label: 'Vehicles',
      icon: 'directions_car',
      link: '/vehicles'
    },
    {
      label: 'Trips',
      icon: 'directions_car',
      link: '/trips'
    },
    {
      label: 'Drivers',
      icon: 'person',
      link: '/drivers'
    },
    {
      label: 'Reports',
      icon: 'assessment',
      link: '/reports'
    },
    {
      label: 'Settings',
      icon: 'settings',
      children: [
        {
          label: 'Profile',
          icon: 'person',
          link: '/profile'
        },
        {
          label: 'Preferences',
          icon: 'tune',
          link: '/preferences'
        },
        {
          label: 'System Settings',
          icon: 'build',
          link: '/settings/system',
          roles: ['admin']
        }
      ]
    }
  ];
  
  filteredMenuItems: MenuItem[] = [];
  isAdmin = false;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.filterMenuItems();
  }
  
  filterMenuItems() {
    this.filteredMenuItems = this.menuItems.filter(item => {
      // If no roles are specified or user is admin and 'admin' is in roles, include item
      if (!item.roles || (this.isAdmin && item.roles.includes('admin'))) {
        // Filter children if any
        if (item.children) {
          item.children = item.children.filter(child => 
            !child.roles || (this.isAdmin && child.roles.includes('admin'))
          );
        }
        return true;
      }
      return false;
    });
  }
}
