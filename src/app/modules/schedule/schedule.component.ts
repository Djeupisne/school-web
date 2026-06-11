import { Component, OnInit } from '@angular/core';
import { Schedule, ScheduleService } from '../../core/services/schedule.service';
import { NotificationService } from '../../core/services/notification.service';
import { SchoolDataService } from '../../core/services/school-data.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  selectedClass = '';
  showForm = false;
  editingSchedule: Schedule | null = null;

  scheduleForm = {
    className: '',
    subject: '',
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  };

  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  classes: string[] = [];
  primaryClasses: string[] = [];
  collegeClasses: string[] = [];
  lyceeClasses: string[] = [];
  availableSubjects: string[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private notification: NotificationService,
    private schoolData: SchoolDataService
  ) {
    this.classes = this.schoolData.classes;
    this.primaryClasses = this.classes.filter(c => this.schoolData.getClassLevel(c) === 'Primaire');
    this.collegeClasses = this.classes.filter(c => this.schoolData.getClassLevel(c) === 'Collège');
    this.lyceeClasses = this.classes.filter(c => this.schoolData.getClassLevel(c) === 'Lycée');
  }

  ngOnInit() { this.loadSchedules(); }

  loadSchedules() {
    this.scheduleService.getAll().subscribe({
      next: (data) => {
        this.schedules = data;
        this.filterSchedules();
      },
      error: () => this.notification.error('Erreur lors du chargement')
    });
  }

  filterSchedules() {
    if (this.selectedClass) {
      this.filteredSchedules = this.schedules.filter(s => s.className === this.selectedClass);
    } else {
      this.filteredSchedules = this.schedules;
    }
  }

  onClassChange() {
    if (this.scheduleForm.className) {
      this.availableSubjects = this.schoolData.getSubjectsByClass(this.scheduleForm.className);
    } else {
      this.availableSubjects = [];
    }
  }

  openForm(schedule?: Schedule) {
    this.showForm = true;
    if (schedule) {
      this.editingSchedule = schedule;
      this.scheduleForm = { ...schedule };
      this.onClassChange();
    } else {
      this.editingSchedule = null;
      this.scheduleForm = { className: '', subject: '', dayOfWeek: '', startTime: '', endTime: '' };
      this.availableSubjects = [];
    }
  }

  closeForm() {
    this.showForm = false;
    this.editingSchedule = null;
  }

  onSubmit() {
    if (this.editingSchedule) {
      this.scheduleService.update(this.editingSchedule.id!, this.scheduleForm).subscribe({
        next: () => {
          this.notification.success('Cours mis à jour');
          this.closeForm();
          this.loadSchedules();
        }
      });
    } else {
      this.scheduleService.create(this.scheduleForm).subscribe({
        next: () => {
          this.notification.success('Cours créé');
          this.closeForm();
          this.loadSchedules();
        }
      });
    }
  }

  deleteSchedule(id?: number) {
    if (!id || !confirm('Supprimer ce cours ?')) return;
    this.scheduleService.delete(id).subscribe({
      next: () => {
        this.notification.success('Cours supprimé');
        this.loadSchedules();
      }
    });
  }

  getDayColor(day: string): string {
    const colors: any = {
      'Lundi': '#3b82f6',
      'Mardi': '#10b981',
      'Mercredi': '#f59e0b',
      'Jeudi': '#ef4444',
      'Vendredi': '#8b5cf6',
      'Samedi': '#ec4899'
    };
    return colors[day] || '#64748b';
  }

  getClassLevel(className: string): string {
    return this.schoolData.getClassLevel(className);
  }
}