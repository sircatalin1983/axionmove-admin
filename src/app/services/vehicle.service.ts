import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Vehicle {
  id?: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  mileage: number;
  status: 'active' | 'maintenance' | 'retired';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

export interface VehicleHistory {
  id: number;
  vehicleId: number;
  action: 'create' | 'update' | 'delete';
  changes: any;
  performedBy: string;
  performedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<{success: boolean, data: Vehicle[]}>(`${this.apiUrl}`).pipe(
      map(response => response.data)
    );
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<{success: boolean, data: Vehicle}>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  getVehicleHistory(id: number): Observable<VehicleHistory[]> {
    return this.http.get<{success: boolean, data: VehicleHistory[]}>(`${this.apiUrl}/${id}/history`).pipe(
      map(response => response.data)
    );
  }

  createVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    return this.http.post<{success: boolean, data: Vehicle}>(this.apiUrl, vehicle).pipe(
      map(response => response.data)
    );
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<{success: boolean, data: Vehicle}>(`${this.apiUrl}/${id}`, vehicle).pipe(
      map(response => response.data)
    );
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0)
    );
  }

  // Helper method to track changes between old and new values
  private getChanges(oldValue: any, newValue: any): any {
    const changes: any = {};
    Object.keys(newValue).forEach(key => {
      if (oldValue[key] !== newValue[key]) {
        changes[key] = {
          old: oldValue[key],
          new: newValue[key]
        };
      }
    });
    return changes;
  }
} 