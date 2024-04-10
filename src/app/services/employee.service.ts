import { Injectable, WritableSignal, signal } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Employee } from '../models/employee';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  // private employees: WritableSignal<Employee[]> = signal<Employee[]>([]);
  private employees = new BehaviorSubject<Employee[]>([]);
  // private totalEmployees: WritableSignal<number> = signal<number>(0);
  private totalEmployees = new BehaviorSubject<number>(0);

  constructor() {
  }

  async initialize() {
    this.db = await this.sqlite.createConnection(environment.databaseName, false, 'no-encryption', 1, false);
    await this.db.open();

    const employeeSchema = `
CREATE TABLE IF NOT EXISTS employee (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  dob TEXT NOT NULL,
  nrc TEXT NOT NULL,
  position TEXT NOT NULL,
  salary TEXT NOT NULL
  );
`;

    await this.db.execute(employeeSchema);
    this.loadEmployees(1, 10);
    this.countTotalEmployees();
    return true;
  }

  getEmployees() {
    return this.employees.asObservable();
  }

  getTotalEmployees() {
    return this.totalEmployees.asObservable();
    // console.log('this.totalEmployees  this.totalEmployees, ', this.totalEmployees);
    // return this.totalEmployees;
  }

  async countTotalEmployees() {
    const countQuery = `SELECT COUNT(*) as count FROM employee;`;
    const result = await this.db.query(countQuery);
    this.totalEmployees.next(result.values?.[0]?.count || 0);
    // this.totalEmployees.set(result.values?.[0]?.count || 0);
  }

  async loadEmployees(page: number = 1, pageSize: number = 10, filters: { name?: string, department?: string; position?: string } = {}) {
    const offset = (page - 1) * pageSize;

    let query = `SELECT * FROM employee`;

    const whereClauses = [];

    if (filters.name) {
      whereClauses.push(`name = '${filters.name}'`);
    }

    if (filters.department) {
      whereClauses.push(`department = '${filters.department}'`);
    }
    if (filters.position) {
      whereClauses.push(`position = '${filters.position}'`);
    }

    if (whereClauses.length) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` LIMIT ${pageSize} OFFSET ${offset};`;

    const employees = await this.db.query(query);
    // this.employees.set(employees.values || []);
    this.employees.next(employees.values || []);
  }

  async addEmployee(newEmployee: Employee) {
    console.log('new Employee, ', newEmployee);
    const employeeAddSchema = `INSERT INTO employee (name, department, dob, nrc, position, salary) VALUES ('${newEmployee.name}', '${newEmployee.department}', '${newEmployee.dob}', '${newEmployee.nrc}', '${newEmployee.position}', '${newEmployee.salary}');`;
    const result = await this.db.query(employeeAddSchema);
    console.log('result, ', result);
    this.loadEmployees();
    this.countTotalEmployees();
    return result;
  }

  async updateEmployeeByID(updateEmployee: Employee, id: string) {
    console.log('updateEmployee, ', updateEmployee);
    console.log('updateEmployee.id, ', id);
    console.log('updateEmployee.id, ', typeof (id));
    const employeeUpdateSchema = `UPDATE employee SET name = '${updateEmployee.name}', department = '${updateEmployee.department}', dob = '${updateEmployee.dob}', nrc = '${updateEmployee.nrc}', position = '${updateEmployee.position}', salary = '${updateEmployee.salary}' WHERE id = ${id};`;
    const result = await this.db.query(employeeUpdateSchema);
    this.loadEmployees();
    return result;
  }

  async deleteEmployeeByID(id: string) {
    const employeeDeleteSchema = `DELETE FROM employee WHERE id='${id}';`;
    const result = await this.db.query(employeeDeleteSchema);
    this.loadEmployees();
    this.countTotalEmployees();
    return result;
  }
}
