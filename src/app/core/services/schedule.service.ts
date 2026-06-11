import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Schedule {
  id?: number;
  className: string;
  subject: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  teacherId?: number;
  teacherName?: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  getByClass(className: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/class/${className}`);
  }

  create(schedule: Schedule): Observable<Schedule> {
    return this.http.post<Schedule>(this.apiUrl, schedule);
  }

  update(id: number, schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}