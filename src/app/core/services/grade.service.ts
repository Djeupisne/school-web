import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Grade {
  id?: number;
  studentId: number;
  subject: string;
  score: number;
  term: string;
}

@Injectable({ providedIn: 'root' })
export class GradeService {
  private apiUrl = `${environment.apiUrl}/grades`;

  constructor(private http: HttpClient) {}

  create(grade: Grade): Observable<Grade> { return this.http.post<Grade>(this.apiUrl, grade); }
  getByStudent(studentId: number): Observable<Grade[]> { return this.http.get<Grade[]>(`${this.apiUrl}/student/${studentId}`); }
}