import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RealtimeEmployeesService } from '../../services/realtime-employees.service';
import Swal from 'sweetalert2';
interface Employee {
  name: string;
  role: string;
  description: string;
  tasks: number;
  rating: number;
  reviews: number;
  }
@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {
  showForm: boolean = false;
  employeeForm: FormGroup;
  previewImage: string = 'assets/images/thumbs/setting-profile-img.jpg';
  employees: Employee[] = []

  constructor (
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    private fb: FormBuilder,
    public realtimeEmployees: RealtimeEmployeesService
  ){
    this.realtimeEmployees.employees$;
    this.employeeForm = this.fb.group({
      fname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      image: [null]
    });
  }
  showNewEmployee() {
    this.showForm = !this.showForm;
  }

  // Manejar la selección de archivo e imagen de vista previa
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.employeeForm.patchValue({ image: file });
      this.previewImage = URL.createObjectURL(file);
    }
  }

  // Enviar el formulario para agregar un nuevo supervisor
  addNewEmployee() {
    if (this.employeeForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid form',
        text: 'Please complete all fields correctly.'
      });
      return;
    }

    const { fname, email, phone } = this.employeeForm.value;

    // Llamar al servicio para crear el supervisor
    this.auth.addEmployee(email, fname,  phone).subscribe({
      next: (result) => {
        Swal.fire({
          icon: 'success',
          title: 'created employee',
          text: `employee created successfully. Generated password: ${result.password}`
        });
        this.employeeForm.reset();
        this.previewImage = 'assets/images/thumbs/setting-profile-img.jpg';
        this.showForm = false;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error creating the employee.'
        });
        console.error('Error when creating the employee:', error);
      }
    });
  }
}
