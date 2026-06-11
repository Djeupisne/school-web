import { Component, OnInit } from '@angular/core';
import { GradeService } from '../../../core/services/grade.service';
import { StudentService } from '../../../core/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SchoolDataService } from '../../../core/services/school-data.service';

@Component({
  selector: 'app-grade-entry',
  templateUrl: './grade-entry.component.html',
  styleUrls: ['./grade-entry.component.css']
})
export class GradeEntryComponent implements OnInit {
  students: any[] = [];
  grade = {
    studentId: null as number | null,
    subject: '',
    score: null as number | null,
    term: ''
  };
  errors: any = {};
  submitting = false;
  terms = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

  // Toutes les matières de tous les niveaux
  allSubjects: string[] = [];

  // Matières groupées par niveau pour l'affichage
  subjectsByLevel: { [key: string]: string[] } = {};

  constructor(
    private gradeService: GradeService,
    private studentService: StudentService,
    private notification: NotificationService,
    private schoolData: SchoolDataService
  ) {
    this.allSubjects = this.schoolData.getAllSubjects();
    this.subjectsByLevel = this.schoolData.subjectsByLevel;
  }

  ngOnInit() {
    this.studentService.getAll().subscribe(s => this.students = s);
  }

  validate(): boolean {
    this.errors = {};
    if (!this.grade.studentId) this.errors.studentId = 'Sélectionnez un étudiant';
    if (!this.grade.subject) this.errors.subject = 'La matière est requise';
    if (this.grade.score === null || this.grade.score < 0 || this.grade.score > 20)
      this.errors.score = 'La note doit être entre 0 et 20';
    if (!this.grade.term) this.errors.term = 'Le trimestre est requis';
    return Object.keys(this.errors).length === 0;
  }

  onSubmit() {
    if (!this.validate()) {
      this.notification.warning('Veuillez corriger les erreurs');
      return;
    }

    this.submitting = true;
    this.gradeService.create(this.grade as any).subscribe({
      next: () => {
        this.notification.success('Note enregistrée avec succès');
        this.grade = { studentId: null, subject: '', score: null, term: '' };
        this.submitting = false;
      },
      error: () => this.submitting = false
    });
  }
}