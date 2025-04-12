import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../models/user.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  // Mock data
  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockAuthResponse: AuthResponse = {
    success: true,
    token: 'mock-token-xyz',
    user: mockUser,
    message: 'Successfully authenticated'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store user data on success', () => {
      const loginRequest: LoginRequest = {
        email: 'john@example.com',
        password: 'password123'
      };

      service.login(loginRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.currentUserValue).toEqual(mockUser);
        expect(service.getToken()).toEqual(mockAuthResponse.token);
        expect(service.isLoggedIn()).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });

    it('should not update user state on login failure', () => {
      const loginRequest: LoginRequest = {
        email: 'invalid@example.com',
        password: 'wrong'
      };

      const errorResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      service.login(loginRequest).subscribe({
        next: () => {},
        error: error => {
          expect(error).toBeTruthy();
          expect(service.currentUserValue).toBeNull();
          expect(service.isLoggedIn()).toBeFalse();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should send register request and store user data on success', () => {
      const registerRequest: RegisterRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      service.register(registerRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.currentUserValue).toEqual(mockUser);
        expect(service.getToken()).toEqual(mockAuthResponse.token);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', () => {
      const forgotRequest: ForgotPasswordRequest = {
        email: 'john@example.com'
      };

      const response = {
        success: true,
        message: 'Password reset email sent'
      };

      service.forgotPassword(forgotRequest).subscribe(res => {
        expect(res).toEqual(response);
      });

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });
  });

  describe('resetPassword', () => {
    it('should send reset password request', () => {
      const resetRequest: ResetPasswordRequest = {
        token: 'reset-token-xyz',
        password: 'newpassword123'
      };

      const response = {
        success: true,
        message: 'Password reset successful'
      };

      service.resetPassword(resetRequest).subscribe(res => {
        expect(res).toEqual(response);
      });

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });
  });

  describe('logout', () => {
    it('should clear user data and token from storage', () => {
      // Setup: simulate logged in state
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Force the BehaviorSubject to have the user
      service.login({
        email: mockUser.email,
        password: 'password'
      }).subscribe();
      
      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockAuthResponse);
      
      expect(service.currentUserValue).toEqual(mockUser);
      
      // Act: logout
      service.logout();
      
      // Assert
      expect(service.currentUserValue).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user has admin role', () => {
      // Setup admin user
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);
      
      expect(service.isAdmin()).toBeTrue();
    });
    
    it('should return false when user is not admin', () => {
      const nonAdminUser: User = {...mockUser, role: 'user'};
      localStorage.setItem('user', JSON.stringify(nonAdminUser));
      service['currentUserSubject'].next(nonAdminUser);
      
      expect(service.isAdmin()).toBeFalse();
    });
    
    it('should return false when user is not logged in', () => {
      service['currentUserSubject'].next(null);
      
      expect(service.isAdmin()).toBeFalse();
    });
  });

  describe('user storage functions', () => {
    it('should store and retrieve token correctly', () => {
      const token = 'test-token-123';
      service['storeToken'](token);
      
      expect(localStorage.getItem('auth_token')).toEqual(token);
      expect(service.getToken()).toEqual(token);
    });
    
    it('should store and retrieve user correctly', () => {
      service['storeUser'](mockUser);
      
      const retrievedUser = service['getUserFromStorage']();
      expect(retrievedUser).toEqual(mockUser);
    });
  });
});
