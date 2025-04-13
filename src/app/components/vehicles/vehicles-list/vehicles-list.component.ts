import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { VehicleDialogComponent } from '../vehicle-dialog/vehicle-dialog.component';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { VehicleService, Vehicle } from '../../../services/vehicle.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule
  ]
})
export class VehiclesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'make',
    'model',
    'year',
    'licensePlate',
    'vin',
    'color',
    'mileage',
    'status',
    'lastMaintenanceDate',
    'nextMaintenanceDate',
    'actions'
  ];
  dataSource: MatTableDataSource<Vehicle>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private vehicleService: VehicleService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Vehicle>([]);
  }

  ngOnInit() {
    this.loadVehicles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVehicles() {
    this.isLoading = true;
    this.vehicleService.getVehicles()
      .pipe(
        catchError(error => {
          console.error('Error loading vehicles:', error);
          this.snackBar.open('Error loading vehicles', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(vehicles => {
        this.dataSource.data = vehicles;
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addVehicle() {
    const dialogRef = this.dialog.open(VehicleDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehicleService.createVehicle(result)
          .pipe(
            catchError(error => {
              console.error('Error creating vehicle:', error);
              this.snackBar.open('Error creating vehicle', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              return of(null);
            })
          )
          .subscribe(vehicle => {
            if (vehicle) {
              this.loadVehicles();
              this.snackBar.open('Vehicle created successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          });
      }
    });
  }

  editVehicle(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(VehicleDialogComponent, {
      width: '600px',
      data: { vehicle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehicleService.updateVehicle(vehicle.id!, result)
          .pipe(
            catchError(error => {
              console.error('Error updating vehicle:', error);
              this.snackBar.open('Error updating vehicle', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              return of(null);
            })
          )
          .subscribe(updatedVehicle => {
            if (updatedVehicle) {
              this.loadVehicles();
              this.snackBar.open('Vehicle updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          });
      }
    });
  }

  deleteVehicle(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: { licensePlate: vehicle.licensePlate }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.vehicleService.deleteVehicle(vehicle.id!)
          .pipe(
            catchError(error => {
              console.error('Error deleting vehicle:', error);
              this.snackBar.open('Error deleting vehicle', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              return of(null);
            })
          )
          .subscribe(() => {
            this.loadVehicles();
            this.snackBar.open('Vehicle deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'maintenance':
        return 'status-maintenance';
      case 'retired':
        return 'status-retired';
      default:
        return '';
    }
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
} 