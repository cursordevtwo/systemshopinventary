import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import { RealtimeSupervisorsService } from '../../services/realtime-supervisors.service';
import { GlobalService } from '../../services/global.service';
import { RealtimeTechnicalsService } from '../../services/realtime-technicals.service';
interface Technical {
  name: string;
  role: string;
  description: string;
  tasks: number;
  rating: number;
  reviews: number;
}
@Component({
  selector: 'app-technicals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './technicals.component.html',
  styleUrl: './technicals.component.css'
})
export class TechnicalsComponent {
  showForm: boolean = false;
  technicalForm: FormGroup;
  previewImage: string = 'assets/images/thumbs/setting-profile-img.jpg';
  technicals: Technical[] = [
    {
      name: 'Maria Prova',
      role: 'Content Writer',
      description: 'Experienced content writer with a focus on UX writing.',
      tasks: 45,
      rating: 4.8,
      reviews: 750
    },
    {
      name: 'Alex John',
      role: 'Web Developer',
      description: 'Specialized in front-end development with Angular and React.',
      tasks: 30,
      rating: 4.7,
      reviews: 500
    },
    // Agrega más supervisores según sea necesario
  ];
  constructor(
    public global: GlobalService,
    private fb: FormBuilder,
    public auth: AuthPocketbaseService,
    public realtimeTechnicals: RealtimeTechnicalsService

  ) { 
    this.realtimeTechnicals.technicals$;

    // Configurar el formulario con validadores
    this.technicalForm = this.fb.group({
      fname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      image: [null]
    });
  }

  // Alternar la visibilidad del formulario
  showNewTechnical() {
    this.showForm = !this.showForm;
  }

  // Manejar la selección de archivo e imagen de vista previa
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.technicalForm.patchValue({ image: file });
      this.previewImage = URL.createObjectURL(file);
    }
  }

  // Enviar el formulario para agregar un nuevo supervisor
  addNewThecnical() {
    if (this.technicalForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid form',
        text: 'Please complete all fields correctly.'
      });
      return;
    }

    const { fname, email, phone } = this.technicalForm.value;
    const address = ''; // Añade la dirección si es necesario

    // Llamar al servicio para crear el supervisor
    this.auth.addTechnical(email, fname, address, phone).subscribe({
      next: (result) => {
        Swal.fire({
          icon: 'success',
          title: 'created technical',
          text: `technical created successfully. Generated password: ${result.password}`
        });
        this.technicalForm.reset();
        this.previewImage = 'assets/images/thumbs/setting-profile-img.jpg';
        this.showForm = false;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error creating the technical.'
        });
        console.error('Error when creating the technical:', error);
      }
    });
  }
}
