import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from './student.service';
import { SchoolDataService } from './school-data.service';

export interface SubjectGrade {
  subject: string;
  coefficient: number;
  score: number;
  weightedScore: number; // score × coefficient
  teacher: string;
  isMissing: boolean;
  category: 'scientific' | 'literary' | 'sports' | 'other';
}

export interface SectionStats {
  name: string;
  subjects: SubjectGrade[];
  totalCoefficient: number;
  totalWeightedScore: number;
  average: number;
  rank: number;
  totalStudents: number;
}

export interface BulletinData {
  student: Student;
  term: string;
  allSubjects: string[];

  // Notes détaillées
  grades: SubjectGrade[];

  // Statistiques globales
  totalCoefficient: number;
  totalWeightedScore: number;
  totalScore: number;
  generalAverage: number;
  generalRank: number;
  totalStudents: number;

  // Statistiques par section
  scientificSection: SectionStats;
  literarySection: SectionStats;
  sportsSection: SectionStats;

  // Informations supplémentaires
  teachers: { [subject: string]: string };
  missingGrades: string[];
  appreciation: string;
}

@Injectable({ providedIn: 'root' })
export class BulletinService {
  private apiUrl = environment.apiUrl;

  // Coefficients par matière (à adapter selon votre système)
  private subjectCoefficients: { [subject: string]: number } = {
    'Mathématiques': 4,
    'Physique-Chimie': 3,
    'Sciences de la vie et de la Terre (SVT)': 2,
    'Sciences de l\'ingénieur': 3,
    'Informatique': 2,
    'Français': 4,
    'Philosophie': 3,
    'Histoire-Géographie': 3,
    'Anglais': 2,
    'Espagnol': 2,
    'Allemand': 2,
    'Latin': 1,
    'Grec': 1,
    'Éducation physique et sportive (EPS)': 1,
    'Éducation physique et sportive': 1,
    'Éveil scientifique': 2,
    'Éveil historique et géographique': 2,
    'Éducation civique': 1,
    'Arts plastiques': 1,
    'Musique': 1,
    'Technologie': 2,
    'Économie': 2,
    'Droit': 2,
    'Management': 2,
    'Enseignement moral et civique (EMC)': 1
  };

  // Catégories de matières
  private scientificSubjects = ['Mathématiques', 'Physique-Chimie', 'Sciences de la vie et de la Terre (SVT)', 'Sciences de l\'ingénieur', 'Informatique', 'Éveil scientifique', 'Technologie'];
  private literarySubjects = ['Français', 'Philosophie', 'Histoire-Géographie', 'Anglais', 'Espagnol', 'Allemand', 'Latin', 'Grec', 'Éveil historique et géographique', 'Éducation civique', 'Enseignement moral et civique (EMC)', 'Économie', 'Droit', 'Management'];
  private sportsSubjects = ['Éducation physique et sportive (EPS)', 'Éducation physique et sportive'];

  constructor(
    private http: HttpClient,
    private schoolData: SchoolDataService
  ) {}

  getBulletinData(studentId: number, term: string): Observable<BulletinData> {
    return forkJoin({
      student: this.http.get<Student>(`${this.apiUrl}/students/${studentId}`),
      grades: this.http.get<any[]>(`${this.apiUrl}/grades/student/${studentId}`),
      allStudents: this.http.get<Student[]>(`${this.apiUrl}/students`),
      allGrades: this.http.get<any[]>(`${this.apiUrl}/grades`)
    }).pipe(
      map(({ student, grades, allStudents, allGrades }) => {
        const filteredGrades = term ? grades.filter(g => g.term === term) : grades;

        // Déterminer le niveau de l'étudiant
        let studentLevel = 'Lycée';
        const allSubjects = this.schoolData.subjectsByLevel[studentLevel] || this.schoolData.getAllSubjects();

        // Créer les notes détaillées avec coefficients
        const detailedGrades: SubjectGrade[] = allSubjects.map(subject => {
          const existingGrade = filteredGrades.find(g => g.subject === subject);
          const coefficient = this.subjectCoefficients[subject] || 1;
          const score = existingGrade ? existingGrade.score : 0;
          const weightedScore = score * coefficient;

          let category: 'scientific' | 'literary' | 'sports' | 'other' = 'other';
          if (this.scientificSubjects.includes(subject)) category = 'scientific';
          else if (this.literarySubjects.includes(subject)) category = 'literary';
          else if (this.sportsSubjects.includes(subject)) category = 'sports';

          return {
            subject,
            coefficient,
            score,
            weightedScore,
            teacher: existingGrade?.teacher ? `${existingGrade.teacher.firstName} ${existingGrade.teacher.lastName}` : '—',
            isMissing: !existingGrade,
            category
          };
        });

        // Calcul des statistiques globales
        const gradedSubjects = detailedGrades.filter(g => !g.isMissing);
        const totalCoefficient = detailedGrades.reduce((sum, g) => sum + g.coefficient, 0);
        const totalWeightedScore = gradedSubjects.reduce((sum, g) => sum + g.weightedScore, 0);
        const totalScore = gradedSubjects.reduce((sum, g) => sum + g.score, 0);
        const generalAverage = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

        // Calcul des rangs globaux
        const studentAverages = allStudents.map(s => {
          const studentGrades = allGrades.filter(g => g.studentId === s.id);
          const filtered = term ? studentGrades.filter(g => g.term === term) : studentGrades;

          let totalWeighted = 0;
          let totalCoeff = 0;
          filtered.forEach(g => {
            const coeff = this.subjectCoefficients[g.subject] || 1;
            totalWeighted += g.score * coeff;
            totalCoeff += coeff;
          });

          const avg = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
          return { id: s.id, average: avg };
        }).sort((a, b) => b.average - a.average);

        const generalRank = studentAverages.findIndex(s => s.id === studentId) + 1;

        // Calcul des statistiques par section
        const scientificSection = this.calculateSectionStats('Scientifique', detailedGrades.filter(g => g.category === 'scientific'), studentId, allStudents, allGrades, term);
        const literarySection = this.calculateSectionStats('Littéraire', detailedGrades.filter(g => g.category === 'literary'), studentId, allStudents, allGrades, term);
        const sportsSection = this.calculateSectionStats('Sportive', detailedGrades.filter(g => g.category === 'sports'), studentId, allStudents, allGrades, term);

        // Noms des professeurs
        const teachers: { [subject: string]: string } = {};
        filteredGrades.forEach(g => {
          if (g.teacher) {
            teachers[g.subject] = `${g.teacher.firstName} ${g.teacher.lastName}`;
          }
        });

        // Matières manquantes
        const missingGrades = detailedGrades.filter(g => g.isMissing).map(g => g.subject);

        // Appréciation générale
        const appreciation = this.getAppreciation(generalAverage);

        return {
          student,
          term,
          allSubjects,
          grades: detailedGrades,
          totalCoefficient,
          totalWeightedScore,
          totalScore,
          generalAverage,
          generalRank,
          totalStudents: allStudents.length,
          scientificSection,
          literarySection,
          sportsSection,
          teachers,
          missingGrades,
          appreciation
        };
      })
    );
  }

  private calculateSectionStats(
    sectionName: string,
    sectionGrades: SubjectGrade[],
    studentId: number,
    allStudents: Student[],
    allGrades: any[],
    term: string
  ): SectionStats {
    const gradedSubjects = sectionGrades.filter(g => !g.isMissing);
    const totalCoefficient = sectionGrades.reduce((sum, g) => sum + g.coefficient, 0);
    const totalWeightedScore = gradedSubjects.reduce((sum, g) => sum + g.weightedScore, 0);
    const average = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

    // Calcul du rang dans la section
    const sectionAverages = allStudents.map(s => {
      const studentGrades = allGrades.filter(g => g.studentId === s.id);
      const filtered = term ? studentGrades.filter(g => g.term === term) : studentGrades;

      let totalWeighted = 0;
      let totalCoeff = 0;

      filtered.forEach(g => {
        if (sectionGrades.some(sg => sg.subject === g.subject)) {
          const coeff = this.subjectCoefficients[g.subject] || 1;
          totalWeighted += g.score * coeff;
          totalCoeff += coeff;
        }
      });

      const avg = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
      return { id: s.id, average: avg };
    }).sort((a, b) => b.average - a.average);

    const rank = sectionAverages.findIndex(s => s.id === studentId) + 1;

    return {
      name: sectionName,
      subjects: sectionGrades,
      totalCoefficient,
      totalWeightedScore,
      average,
      rank,
      totalStudents: allStudents.length
    };
  }

  private getAppreciation(average: number): string {
    if (average >= 16) return 'Excellent travail. Félicitations!';
    if (average >= 14) return 'Très bon travail. Continuez ainsi.';
    if (average >= 12) return 'Bon travail. Quelques efforts à fournir.';
    if (average >= 10) return 'Travail satisfaisant. Peut mieux faire.';
    if (average >= 8) return 'Travail insuffisant. Des efforts importants sont nécessaires.';
    return 'Travail très insuffisant. Réorientation à envisager.';
  }

  generateBulletinsForStudents(students: Student[], term: string): Observable<BulletinData[]> {
    if (students.length === 0) {
      return of([]);
    }
    const observables = students.map(s => this.getBulletinData(s.id!, term));
    return forkJoin(observables);
  }
}