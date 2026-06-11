import { Component, OnInit } from '@angular/core';
import { Student, StudentService } from '../../../core/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchQuery = '';
  loading = true;

  constructor(
    private studentService: StudentService,
    private notification: NotificationService
  ) {}

  ngOnInit() { this.loadStudents(); }

  loadStudents() {
    this.loading = true;
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterStudents() {
    const q = this.searchQuery.toLowerCase();
    this.filteredStudents = this.students.filter(s =>
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.parentName?.toLowerCase().includes(q)
    );
  }

  deleteStudent(id?: number) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;

    this.studentService.delete(id).subscribe({
      next: () => {
        this.notification.success('Étudiant supprimé avec succès');
        this.loadStudents();
      },
      error: () => this.notification.error('Impossible de supprimer cet étudiant')
    });
  }
}