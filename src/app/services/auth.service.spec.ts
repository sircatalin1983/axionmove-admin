import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User, AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockRegisterRequest: RegisterRequest = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockForgotPasswordRequest: ForgotPasswordRequest = {
    email: 'test@example.com'
  };

  const mockResetPasswordRequest: ResetPasswordRequest = {
    token: 'reset-token',
    password: 'newpassword123'
  };

  const mockAuthResponse: AuthResponse = {
    success: true,
    token: 'mock-jwt-token',
    user: mockUser,
    message: 'Authentication successful'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      service.login(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
        expect(service.currentUserValue).toEqual(mockAuthResponse.user);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register new user', () => {
      service.register(mockRegisterRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
        expect(service.currentUserValue).toEqual(mockAuthResponse.user);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', () => {
      const mockResponse = { success: true, message: 'Reset email sent' };

      service.forgotPassword(mockForgotPasswordRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', () => {
      const mockResponse = { success: true, message: 'Password reset successful' };

      service.resetPassword(mockResetPasswordRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear user data and token', () => {
      // Set up initial state
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for non-admin user', () => {
      const nonAdminUser = { ...mockUser, role: 'user' as const };
      service['currentUserSubject'].next(nonAdminUser);
      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.isAdmin()).toBe(false);
    });
  });
});
