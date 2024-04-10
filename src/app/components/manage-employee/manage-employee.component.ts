import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { filter } from 'rxjs';
import { Employee } from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-manage-employee',
  templateUrl: './manage-employee.component.html',
  styleUrls: ['./manage-employee.component.scss'],
})
export class ManageEmployeeComponent implements OnInit {
  @Input() mode!: 'add' | 'update' | 'filter';
  @Input() employee!: Employee;
  @Input() id!: string;

  employeeForm!: FormGroup;
  departments = ['HR', 'IT', 'Finance'];
  positions = ['Manager', 'Senior Developer', 'HR Executive'];
  title: string = '';

  constructor(private alertController: AlertController, private fb: FormBuilder, private modalCtrl: ModalController, private employeeService: EmployeeService) { }

  ngOnInit(): void {
    switch (this.mode) {
      case 'add':
        this.title = 'Employee New';
        this.employeeForm = this.fb.group({
          name: ['', Validators.required], // Required field
          department: ['', Validators.required], // Required field
          position: ['', Validators.required], // Required field
          dob: [''], // Non-required field
          nrc: [''], // Non-required field
          salary: [''], // Non-required field
        });
        break;
      case 'update':
        this.title = 'Employee Update';
        const dobDate = this.employee.dob ? new Date(this.employee.dob) : null;
        this.employeeForm = this.fb.group({
          name: new FormControl(this.employee.name, Validators.required),// Required field
          department: new FormControl(this.employee.department, Validators.required),// Required field
          position: new FormControl(this.employee.position, Validators.required),// Required field
          dob: new FormControl(dobDate),
          nrc: new FormControl(this.employee.nrc),
          salary: new FormControl(this.employee.salary),
        });
        break;
      case 'filter':
        this.title = 'Employee Search';
        this.employeeForm = this.fb.group({
          name: ['', Validators.required], // Required field
          department: ['', Validators.required], // Required field
          position: ['', Validators.required], // Required field
          dob: [''], // Non-required field
          nrc: [''], // Non-required field
          salary: [''], // Non-required field
        });
        break;
      default:
        break;
    }

    // this.employeeForm = this.fb.group({
    //   name: ['', this.mode !== 'filter' ? Validators.required : null],
    //   department: ['', this.mode !== 'filter' ? Validators.required : null],
    //   position: ['', this.mode !== 'filter' ? Validators.required : null],
    //   dob: ['', this.mode === 'add' ? Validators.required : null] // DOB required only for 'add', optional for 'update' and 'filter'
    // });
  }

  formatDate(date: Date): string {
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async onSubmit() {
    if (this.employeeForm.valid) {
      console.log('Form Value', this.employeeForm.value);
      let newEmployee = this.employeeForm.value as Employee;
      let filterProp = {
        name: newEmployee.name,
        department: newEmployee.department,
        position: newEmployee.position,
      };

      switch (this.mode) {
        case 'add':
          newEmployee.dob = this.formatDate(this.employeeForm.value.dob);
          await this.employeeService.addEmployee(this.employeeForm.value as Employee);
          await this.showAlert(this.mode);
          break;
        case 'update':
          newEmployee.dob = this.formatDate(this.employeeForm.value.dob);
          await this.employeeService.updateEmployeeByID(this.employeeForm.value as Employee, this.id);
          await this.showAlert(this.mode);
          break;
        case 'filter':
          await this.employeeService.loadEmployees(1, 10, filterProp);
          break;
        default:
          break;
      }
      this.modalCtrl.dismiss();
    } else {
      console.error('Form is not valid');
    }
  }

  async showAlert(mode: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: mode == 'add' ? 'Success' : 'Update',
      message: mode == 'add' ? 'This record was successful add' : 'This record was updated',
      buttons: [
        {
          text: 'OK',
          cssClass: 'ok-button-class',
        }
      ],
      backdropDismiss: true // Allows closing the alert by clicking outside
    });
    await alert.present();
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }
}
