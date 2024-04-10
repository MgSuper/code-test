import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSelect, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { ManageEmployeeComponent } from 'src/app/components/manage-employee/manage-employee.component';
import { Employee } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
})
export class EmployeeListPage implements OnInit, OnDestroy {
  pageSize: number = 10;
  // employees = this.employeeService.getEmployees();
  employees: Employee[] = [];
  pagers = ['10', '20', '30'];
  currentPage: number = 1;
  totalEmployees: number = 0;
  private subscription = new Subscription();
  totalPages: number = 0;
  private employeeObserver: (() => void) | undefined;
  private totalObserver: (() => void) | undefined;

  constructor(private cdRef: ChangeDetectorRef, private employeeService: EmployeeService, private modalController: ModalController, private alertController: AlertController) {

    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalEmployees / this.pageSize);
  }


  ngOnInit() {
    this.subscription.add(this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
    }))

    this.subscription.add(
      this.employeeService.getTotalEmployees().subscribe(total => {
        this.totalEmployees = total;
        this.totalPages = Math.ceil(this.totalEmployees / this.pageSize);
      })
    );
    this.cdRef.detectChanges();
  }

  onPageSizeChange() {
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page with new page size
    this.employeeService.loadEmployees(this.currentPage, this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.employeeService.loadEmployees(this.currentPage, this.pageSize);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.employeeObserver) this.employeeObserver();
    if (this.totalObserver) this.totalObserver();
  }

  async updateEmployee(employee: Employee, id: string) {
    console.log('nid id id id ', id);
    const modal = await this.modalController.create({
      component: ManageEmployeeComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        employee: employee,
        id: id,
        mode: 'update'
      }
    });
    return await modal.present();
  }

  async deleteEmployee(id: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Warning',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'OK',
          cssClass: 'ok-button-class',
          handler: () => {
            this.employeeService.deleteEmployeeByID(id);
            this.presentDeletionSuccessAlert();
          }
        }
      ],
      backdropDismiss: true // Allows closing the alert by clicking outside
    });
    await alert.present();
  }

  async presentDeletionSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Success',
      message: 'The recorded was deleted.',
      buttons: ['OK'], // Only one button needed
      backdropDismiss: false // Does not allow closing the alert by clicking outside
    });

    await alert.present();
  }

  async addNewEmployee() {
    const modal = await this.modalController.create({
      component: ManageEmployeeComponent,
      cssClass: 'my-custom-class', // Optional: you can define custom styles in your global.scss or the component's scss
      componentProps: {
        mode: 'add'
      }
    });
    return await modal.present();
  }

  async filterEmployee() {
    const modal = await this.modalController.create({
      component: ManageEmployeeComponent,
      cssClass: 'my-custom-class', // Optional: you can define custom styles in your global.scss or the component's scss
      componentProps: {
        mode: 'filter'
      }
    });
    return await modal.present();
  }
}
