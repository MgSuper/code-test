import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmployeeListPageRoutingModule } from './employee-list-routing.module';

import { EmployeeListPage } from './employee-list.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeListPageRoutingModule
  ],
  declarations: [EmployeeListPage]
})
export class EmployeeListPageModule { }
