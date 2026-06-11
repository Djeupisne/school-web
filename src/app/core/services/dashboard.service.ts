import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  students: number;
  teachers: number;
  grades: number;
  payments: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface GradeBySubject {
  subject: string;
  average: number;
}

export interface RecentActivity {
  type: 'student' | 'grade' | 'payment';
  title: string;
  subtitle: string;
  date: string;
  icon: string;
  color: string;
}

export interface Alert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  count?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return forkJoin({
      students: this.http.get<any[]>(`${this.apiUrl}/students`),
      teachers: this.http.get<any[]>(`${this.apiUrl}/teachers`),
      grades: this.http.get<any[]>(`${this.apiUrl}/grades`),
      payments: this.http.get<any[]>(`${this.apiUrl}/payments`)
    }).pipe(
      map(({ students, teachers, grades, payments }) => ({
        students: students.length,
        teachers: teachers.length,
        grades: grades.length,
        payments: payments.length,
        totalRevenue: payments
          .filter((p: any) => p.status === 'COMPLETED')
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0),
        pendingPayments: payments.filter((p: any) => p.status === 'PENDING').length
      }))
    );
  }

  getGradesBySubject(): Observable<GradeBySubject[]> {
    return this.http.get<any[]>(`${this.apiUrl}/grades`).pipe(
      map(grades => {
        const bySubject: { [key: string]: number[] } = {};
        grades.forEach(g => {
          if (!bySubject[g.subject]) bySubject[g.subject] = [];
          bySubject[g.subject].push(g.score);
        });
        return Object.keys(bySubject).map(subject => ({
          subject,
          average: bySubject[subject].reduce((a, b) => a + b, 0) / bySubject[subject].length
        }));
      })
    );
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return forkJoin({
      students: this.http.get<any[]>(`${this.apiUrl}/students`),
      grades: this.http.get<any[]>(`${this.apiUrl}/grades`),
      payments: this.http.get<any[]>(`${this.apiUrl}/payments`)
    }).pipe(
      map(({ students, grades, payments }) => {
        const activities: RecentActivity[] = [];

        students.slice(-3).reverse().forEach(s => {
          activities.push({
            type: 'student',
            title: `${s.firstName} ${s.lastName}`,
            subtitle: 'Nouvel étudiant inscrit',
            date: new Date().toISOString(),
            icon: '👨‍🎓',
            color: '#3b82f6'
          });
        });

        grades.slice(-3).reverse().forEach(g => {
          activities.push({
            type: 'grade',
            title: `${g.subject} - ${g.score}/20`,
            subtitle: `Trimestre ${g.term}`,
            date: new Date().toISOString(),
            icon: '📝',
            color: '#10b981'
          });
        });

        payments.slice(-3).reverse().forEach(p => {
          activities.push({
            type: 'payment',
            title: `${p.amount} ${p.currency}`,
            subtitle: `Paiement ${p.status}`,
            date: p.paymentDate || new Date().toISOString(),
            icon: '💰',
            color: p.status === 'COMPLETED' ? '#10b981' : '#f59e0b'
          });
        });

        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
      })
    );
  }

  getAlerts(): Observable<Alert[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments`).pipe(
      map(payments => {
        const alerts: Alert[] = [];
        const pending = payments.filter(p => p.status === 'PENDING').length;
        if (pending > 0) {
          alerts.push({
            type: 'warning',
            title: 'Paiements en attente',
            message: `${pending} paiement(s) nécessitent votre attention`,
            count: pending
          });
        }
        if (alerts.length === 0) {
          alerts.push({
            type: 'info',
            title: 'Tout est en ordre',
            message: 'Aucune alerte pour le moment'
          });
        }
        return alerts;
      })
    );
  }
}