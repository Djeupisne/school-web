import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent {
  student = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    nationality: '',
    previousSchool: '',
    medicalInfo: '',
    emergencyContact: '',
    emergencyPhone: ''
  };

  errors: any = {};
  submitting = false;
  genders = ['Masculin', 'Féminin'];

  constructor(
    private studentService: StudentService,
    private notification: NotificationService,
    private router: Router
  ) {}

  validate(): boolean {
    this.errors = {};
    if (!this.student.firstName.trim()) this.errors.firstName = 'Le prénom est requis';
    if (!this.student.lastName.trim()) this.errors.lastName = 'Le nom est requis';
    if (!this.student.dateOfBirth) this.errors.dateOfBirth = 'La date de naissance est requise';
    if (!this.student.gender) this.errors.gender = 'Le genre est requis';
    if (this.student.email && !this.isValidEmail(this.student.email)) {
      this.errors.email = 'Email invalide';
    }
    if (this.student.phone && !this.isValidPhone(this.student.phone)) {
      this.errors.phone = 'Numéro de téléphone invalide';
    }
    return Object.keys(this.errors).length === 0;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^[\d\s\-\+\(\)]+$/.test(phone);
  }

  onSubmit() {
    if (!this.validate()) {
      this.notification.warning('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.submitting = true;
    this.studentService.create(this.student as any).subscribe({
      next: () => {
        this.notification.success('Étudiant créé avec succès');
        this.router.navigate(['/students']);
      },
      error: () => this.submitting = false
    });
  }
}