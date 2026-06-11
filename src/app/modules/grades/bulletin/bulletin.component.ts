import { Component, OnInit } from '@angular/core';
import { Student, StudentService } from '../../../core/services/student.service';
import { BulletinService, BulletinData } from '../../../core/services/bulletin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SchoolDataService } from '../../../core/services/school-data.service';
import { PdfService } from '../../../core/services/pdf.service';

@Component({
  selector: 'app-bulletin',
  templateUrl: './bulletin.component.html',
  styleUrls: ['./bulletin.component.css']
})
export class BulletinComponent implements OnInit {
  students: Student[] = [];
  selectedStudent: Student | null = null;
  bulletinData: BulletinData | null = null;
  selectedTerm = '';
  terms = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
  loading = false;
  allBulletins: BulletinData[] = [];
  showAllBulletins = false;
  currentDate = new Date();

  generationMode: 'individual' | 'class' | 'college' | 'lycee' | 'school' = 'individual';

  allClasses: string[] = [];
  primaryClasses: string[] = [];
  collegeClasses: string[] = [];
  lyceeClasses: string[] = [];
  selectedClass = '';

  constructor(
    private studentService: StudentService,
    private bulletinService: BulletinService,
    private notification: NotificationService,
    private schoolData: SchoolDataService,
    private pdfService: PdfService
  ) {
    this.allClasses = this.schoolData.classes;
    this.primaryClasses = this.allClasses.filter(c => this.schoolData.getClassLevel(c) === 'Primaire');
    this.collegeClasses = this.allClasses.filter(c => this.schoolData.getClassLevel(c) === 'Collège');
    this.lyceeClasses = this.allClasses.filter(c => this.schoolData.getClassLevel(c) === 'Lycée');
  }

  ngOnInit() {
    this.studentService.getAll().subscribe(s => this.students = s);
  }

  loadBulletin() {
    if (!this.selectedStudent) {
      this.notification.warning('Sélectionnez un étudiant');
      return;
    }

    this.loading = true;
    this.bulletinService.getBulletinData(this.selectedStudent.id!, this.selectedTerm).subscribe({
      next: (data) => {
        this.bulletinData = data;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Erreur lors du chargement du bulletin');
        this.loading = false;
      }
    });
  }

  generateBulletins() {
    this.loading = true;
    this.allBulletins = [];
    this.showAllBulletins = true;
    this.bulletinData = null;

    let studentsToProcess: Student[] = [];

    switch (this.generationMode) {
      case 'individual':
        if (!this.selectedStudent) {
          this.notification.warning('Sélectionnez un étudiant');
          this.loading = false;
          return;
        }
        studentsToProcess = [this.selectedStudent];
        break;

      case 'class':
        if (!this.selectedClass) {
          this.notification.warning('Sélectionnez une classe');
          this.loading = false;
          return;
        }
        studentsToProcess = this.students;
        break;

      case 'college':
      case 'lycee':
      case 'school':
        studentsToProcess = this.students;
        break;
    }

    this.notification.info(`Génération de ${studentsToProcess.length} bulletin(s)...`);

    this.bulletinService.generateBulletinsForStudents(studentsToProcess, this.selectedTerm).subscribe({
      next: (bulletins) => {
        this.allBulletins = bulletins;

        if (this.generationMode === 'individual' && bulletins.length === 1) {
          this.bulletinData = bulletins[0];
        }

        this.loading = false;
        this.notification.success(`${bulletins.length} bulletin(s) généré(s) avec succès`);
      },
      error: () => {
        this.loading = false;
        this.notification.error('Erreur lors de la génération des bulletins');
      }
    });
  }

  async downloadBulletin() {
    if (!this.bulletinData) {
      this.notification.warning('Aucun bulletin à télécharger');
      return;
    }

    try {
      this.notification.info('Génération du PDF en cours...');
      const fileName = `Bulletin_${this.bulletinData.student.firstName}_${this.bulletinData.student.lastName}_${this.bulletinData.term || 'Année'}`;
      await this.pdfService.generatePdf('bulletin-content', fileName);
      this.notification.success('PDF téléchargé avec succès');
    } catch (error) {
      this.notification.error('Erreur lors de la génération du PDF');
    }
  }

  async downloadAllBulletins() {
    if (this.allBulletins.length === 0) {
      this.notification.warning('Aucun bulletin à télécharger');
      return;
    }

    try {
      this.notification.info(`Génération de ${this.allBulletins.length} PDF(s)...`);

      for (let i = 0; i < this.allBulletins.length; i++) {
        const bulletin = this.allBulletins[i];
        this.bulletinData = bulletin;

        // Attendre que le DOM se mette à jour
        await new Promise(resolve => setTimeout(resolve, 500));

        const fileName = `Bulletin_${bulletin.student.firstName}_${bulletin.student.lastName}_${bulletin.term || 'Année'}`;
        await this.pdfService.generatePdf('bulletin-content', fileName);

        // Petit délai entre chaque PDF
        if (i < this.allBulletins.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.notification.success(`${this.allBulletins.length} PDF(s) téléchargé(s) avec succès`);
    } catch (error) {
      this.notification.error('Erreur lors de la génération des PDF');
    }
  }

  printBulletin() {
    if (!this.bulletinData) {
      this.notification.warning('Aucun bulletin à imprimer');
      return;
    }

    try {
      this.pdfService.printElement('bulletin-content');
    } catch (error) {
      this.notification.error('Erreur lors de la préparation de l\'impression');
    }
  }

  getGradeLevel(score: number): string {
    if (score >= 16) return 'Excellent';
    if (score >= 14) return 'Bien';
    if (score >= 12) return 'Assez bien';
    if (score >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getGradeClass(score: number): string {
    if (score >= 16) return 'grade-excellent';
    if (score >= 14) return 'grade-bien';
    if (score >= 12) return 'grade-assez-bien';
    if (score >= 10) return 'grade-passable';
    return 'grade-insuffisant';
  }
}