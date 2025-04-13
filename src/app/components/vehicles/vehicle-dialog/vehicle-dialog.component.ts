import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Vehicle } from '../../../services/vehicle.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vehicle-dialog',
  templateUrl: './vehicle-dialog.component.html',
  styleUrls: ['./vehicle-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class VehicleDialogComponent {
  vehicleForm: FormGroup;
  currentYear = new Date().getFullYear();
  showDebugButton = environment.debug;

  private carMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Hyundai'];
  private carModels: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7'],
    'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Atlas'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe']
  };
  private colors = ['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green'];
  private statuses: ('active' | 'maintenance' | 'retired')[] = ['active', 'maintenance', 'retired'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<VehicleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vehicle?: Vehicle }
  ) {
    this.vehicleForm = this.fb.group({
      make: [data.vehicle?.make || '', Validators.required],
      model: [data.vehicle?.model || '', Validators.required],
      year: [
        data.vehicle?.year || this.currentYear,
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(this.currentYear + 1)
        ]
      ],
      licensePlate: [data.vehicle?.licensePlate || '', Validators.required],
      vin: [
        data.vehicle?.vin || '',
        [
          Validators.required,
          Validators.minLength(17),
          Validators.maxLength(17)
        ]
      ],
      color: [data.vehicle?.color || '', Validators.required],
      mileage: [
        data.vehicle?.mileage || 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      status: [data.vehicle?.status || 'active', Validators.required],
      lastMaintenanceDate: [data.vehicle?.lastMaintenanceDate || null],
      nextMaintenanceDate: [data.vehicle?.nextMaintenanceDate || null]
    });
  }

  private generateRandomVIN(): string {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  }

  private generateRandomLicensePlate(): string {
    const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
    const numbers = '0123456789';
    return `${letters.charAt(Math.floor(Math.random() * letters.length))}${letters.charAt(Math.floor(Math.random() * letters.length))}${numbers.charAt(Math.floor(Math.random() * numbers.length))}${numbers.charAt(Math.floor(Math.random() * numbers.length))}${letters.charAt(Math.floor(Math.random() * letters.length))}${letters.charAt(Math.floor(Math.random() * letters.length))}`;
  }

  fillDummyData() {
    const make = this.carMakes[Math.floor(Math.random() * this.carMakes.length)];
    const models = this.carModels[make];
    const model = models[Math.floor(Math.random() * models.length)];
    const year = Math.floor(Math.random() * (this.currentYear - 2015 + 1)) + 2015;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const status = this.statuses[Math.floor(Math.random() * this.statuses.length)];
    const mileage = Math.floor(Math.random() * 150000);

    const lastMaintenanceDate = new Date();
    lastMaintenanceDate.setMonth(lastMaintenanceDate.getMonth() - Math.floor(Math.random() * 6));

    const nextMaintenanceDate = new Date();
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + Math.floor(Math.random() * 6) + 1);

    this.vehicleForm.patchValue({
      make,
      model,
      year,
      licensePlate: this.generateRandomLicensePlate(),
      vin: this.generateRandomVIN(),
      color,
      mileage,
      status,
      lastMaintenanceDate,
      nextMaintenanceDate
    });
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const vehicle = {
        ...this.data.vehicle,
        ...this.vehicleForm.value
      };
      this.dialogRef.close(vehicle);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 