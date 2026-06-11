import { Component, OnInit } from '@angular/core';
import { Teacher, TeacherService } from '../../core/services/teacher.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  searchQuery = '';
  showForm = false;
  editingTeacher: Teacher | null = null;

  teacherForm = {
    firstName: '',
    lastName: '',
    specialization: '',
    email: '',
    phone: ''
  };

  constructor(
    private teacherService: TeacherService,
    private notification: NotificationService
  ) {}

  ngOnInit() { this.loadTeachers(); }

  loadTeachers() {
    this.teacherService.getAll().subscribe({
      next: (data: Teacher[]) => {
        this.teachers = data;
        this.filteredTeachers = data;
      },
      error: () => this.notification.error('Erreur lors du chargement')
    });
  }

  filterTeachers() {
    const q = this.searchQuery.toLowerCase();
    this.filteredTeachers = this.teachers.filter(t =>
      t.firstName?.toLowerCase().includes(q) ||
      t.lastName?.toLowerCase().includes(q) ||
      t.specialization?.toLowerCase().includes(q)
    );
  }

  openForm(teacher?: Teacher) {
    this.showForm = true;
    if (teacher) {
      this.editingTeacher = teacher;
      this.teacherForm = {
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        specialization: teacher.specialization || '',
        email: teacher.email || '',
        phone: teacher.phone || ''
      };
    } else {
      this.editingTeacher = null;
      this.teacherForm = { firstName: '', lastName: '', specialization: '', email: '', phone: '' };
    }
  }

  closeForm() {
    this.showForm = false;
    this.editingTeacher = null;
  }

  onSubmit() {
    if (this.editingTeacher) {
      this.teacherService.update(this.editingTeacher.id!, this.teacherForm).subscribe({
        next: () => {
          this.notification.success('Enseignant mis à jour');
          this.closeForm();
          this.loadTeachers();
        },
        error: () => this.notification.error('Erreur lors de la mise à jour')
      });
    } else {
      this.teacherService.create(this.teacherForm).subscribe({
        next: () => {
          this.notification.success('Enseignant créé');
          this.closeForm();
          this.loadTeachers();
        },
        error: () => this.notification.error('Erreur lors de la création')
      });
    }
  }

  deleteTeacher(id?: number) {
    if (!id || !confirm('Supprimer cet enseignant ?')) return;
    this.teacherService.delete(id).subscribe({
      next: () => {
        this.notification.success('Enseignant supprimé');
        this.loadTeachers();
      },
      error: () => this.notification.error('Erreur lors de la suppression')
    });
  }
}