import { Injectable } from '@angular/core';

export interface Subject {
  name: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class SchoolDataService {

  // Classes du primaire au lycée
  classes = [
    // Primaire
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    // Collège
    '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B',
    // Lycée
    '2nde A', '2nde B', '2nde C', '2nde D',
    '1ère A', '1ère D', '1ère C',
    'Terminale A', 'Terminale D', 'Terminale C'
  ];

  // Matières par niveau
  subjectsByLevel: { [key: string]: string[] } = {
    'Primaire': [
      'Français',
      'Mathématiques',
      'Éveil scientifique',
      'Éveil historique et géographique',
      'Éducation civique',
      'Éducation physique et sportive',
      'Arts plastiques',
      'Musique',
      'Anglais'
    ],
    'Collège': [
      'Français',
      'Mathématiques',
      'Histoire-Géographie',
      'Éducation civique',
      'Sciences de la vie et de la Terre (SVT)',
      'Physique-Chimie',
      'Technologie',
      'Éducation physique et sportive (EPS)',
      'Arts plastiques',
      'Musique',
      'Anglais',
      'Espagnol',
      'Latin'
    ],
    'Lycée': [
      'Philosophie',
      'Français',
      'Mathématiques',
      'Histoire-Géographie',
      'Enseignement moral et civique (EMC)',
      'Sciences de la vie et de la Terre (SVT)',
      'Physique-Chimie',
      'Sciences de l\'ingénieur',
      'Informatique',
      'Éducation physique et sportive (EPS)',
      'Arts plastiques',
      'Musique',
      'Anglais',
      'Espagnol',
      'Allemand',
      'Latin',
      'Grec',
      'Économie',
      'Droit',
      'Management'
    ]
  };

  getAllSubjects(): string[] {
    const allSubjects = new Set<string>();
    Object.values(this.subjectsByLevel).forEach(subjects => {
      subjects.forEach(subject => allSubjects.add(subject));
    });
    return Array.from(allSubjects).sort();
  }

  getSubjectsByClass(className: string): string[] {
    if (className.startsWith('CP') || className.startsWith('CE') || className.startsWith('CM')) {
      return this.subjectsByLevel['Primaire'];
    } else if (className.includes('ème')) {
      return this.subjectsByLevel['Collège'];
    } else {
      return this.subjectsByLevel['Lycée'];
    }
  }

  getClassLevel(className: string): string {
    if (className.startsWith('CP') || className.startsWith('CE') || className.startsWith('CM')) {
      return 'Primaire';
    } else if (className.includes('ème')) {
      return 'Collège';
    } else {
      return 'Lycée';
    }
  }
}