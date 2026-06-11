import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({ providedIn: 'root' })
export class PdfService {

  async generatePdf(elementId: string, fileName: string = 'document'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Cacher les boutons d'action avant la capture
    const actionButtons = element.querySelectorAll('.no-print');
    actionButtons.forEach(btn => btn.classList.add('hidden-for-pdf'));

    try {
      // Capturer l'élément en canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restaurer les boutons
      actionButtons.forEach(btn => btn.classList.remove('hidden-for-pdf'));

      // Convertir en PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // Largeur A4 en mm
      const pageHeight = 297; // Hauteur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Première page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Pages supplémentaires si nécessaire
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Télécharger le PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  printElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer');
      return;
    }

    // Copier les styles
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulletin Scolaire</title>
        ${styles}
        <style>
          @media print {
            body { margin: 0; padding: 20mm; }
            .no-print { display: none !important; }
            .bulletin-card { box-shadow: none; border: none; }
            @page { size: A4; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Attendre le chargement puis imprimer
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
}