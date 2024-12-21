import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { DataApiService, workInstructionsInterface } from '../../services/data-api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SupervisorService } from '../../services/supervisor.service';
import { RealtimeSupervisorsService } from '../../services/realtime-supervisors.service';

@Component({
  selector: 'app-work-instructions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-instructions.component.html',
  styleUrl: './work-instructions.component.css',
})
export class WorkInstructionsComponent implements OnInit {
  workInstructionsForm: FormGroup;
  supervisors: any[] = [];
  

  constructor(
    public global: GlobalService,
    private fb: FormBuilder,
    private dataApiService: DataApiService,
    private supervisorService: SupervisorService,
    public realtimeSupervisors: RealtimeSupervisorsService
  ){ 
    this.workInstructionsForm = this.fb.group({
      companyName: ['', [Validators.required]],
      contactName: ['', [Validators.required]],
      billingAddress: ['', [Validators.required]],
      cityStateCountryZip: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      financeContactPosition: ['', [Validators.required]],
      financeContactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      financeEmail: ['', [Validators.required, Validators.email]],
      supervisorId: ['', Validators.required],
      customer: ['', [Validators.required]],
      numberOfControl: ['', [Validators.required]],
      area: ['', [Validators.required]],
      partNumber: ['', [Validators.required]],
      operation: ['', [Validators.required]],
    });}

  ngOnInit() {
       this.realtimeSupervisors.supervisors$;

    this.loadSupervisors();
  }

  loadSupervisors() {
    this.realtimeSupervisors.supervisors$.subscribe(
      (data: any) => {
        this.supervisors = data;
    },
      (error: any) => {
        console.error('Error loading supervisors:', error);
      }
    );
  }



  onSubmit() {
    if (this.workInstructionsForm.valid) {
      const request: workInstructionsInterface = this.workInstructionsForm.value;
      this.dataApiService.saveworkInstructions(request).subscribe(
        response => {
          console.log('Datos guardados exitosamente:', response);
          this.global.setRoute('home');
          // Muestra el mensaje de éxito con SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success  ',
            text: 'The work instructions has been created successfully.',
            confirmButtonText: 'Accept'
          });

          this.workInstructionsForm.reset(); // Reinicia el formulario
        },
        error => {
          console.error('Error al guardar los datos:', error);

          // Muestra el mensaje de error con SweetAlert2
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was a problem creating the work instructions. Please try again.',
            confirmButtonText: 'Accept'
          });
        }
      );
    }
  }
 
}
