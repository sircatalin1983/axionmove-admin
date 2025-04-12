import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    console.log('Login attempt with:', this.loginForm.value);
    
    // Send simplified credentials
    const loginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    this.authService.login(loginCredentials)
      .subscribe({
        next: (response) => {
          console.log('Login response received:', response);
          
          if (response && response.success === true) {
            // Hard-set a static route for now to debug the navigation
            this.router.navigateByUrl('/dashboard').then(success => {
              console.log('Navigation result:', success);
              if (!success) {
                console.error('Navigation failed, trying with returnUrl:', this.returnUrl);
                this.router.navigateByUrl(this.returnUrl);
              }
            });
          } else {
            console.error('Login response not successful:', response);
            this.loading = false;
            this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          this.router.navigateByUrl('/dashboard').then(success => {
            console.log('Navigation result:', success);
            if (!success) {
              console.error('Navigation failed, trying with returnUrl:', this.returnUrl);
              this.router.navigateByUrl(this.returnUrl);
            }
          });
          
          console.error('Login error:', error);
          this.loading = false;
          this.snackBar.open('Login failed. Please check your credentials and try again.', 'Close', {
            duration: 5000
          });
        }
      });
  }
}
