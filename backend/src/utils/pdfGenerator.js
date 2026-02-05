const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (participant, event, certificateNumber) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer le dossier si nécessaire
      const dir = path.join(__dirname, '../../uploads/certificates');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `${certificateNumber}.pdf`);
      
      // Créer le document PDF en paysage A4
      const doc = new PDFDocument({ 
        layout: 'landscape',
        size: 'A4',
        margins: { 
          top: 40, 
          bottom: 40, 
          left: 60, 
          right: 60 
        },
        bufferPages: true
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // DIMENSIONS
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // ═══════════════════════════════════════════════════════════
      // BORDURES DÉCORATIVES
      // ═══════════════════════════════════════════════════════════
      
      // Bordure extérieure orange épaisse
      doc.roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 10)
         .lineWidth(4)
         .strokeColor('#f97316')
         .stroke();

      // Bordure intérieure fine orange clair
      doc.roundedRect(45, 45, pageWidth - 90, pageHeight - 90, 8)
         .lineWidth(2)
         .strokeColor('#fed7aa')
         .stroke();

      // ═══════════════════════════════════════════════════════════
      // EN-TÊTE
      // ═══════════════════════════════════════════════════════════
      
      let y = 80;
      
      // Titre principal
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('CERTIFICAT DE PARTICIPATION', 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 50;

      // Ligne décorative sous le titre
      const lineMargin = 180;
      doc.moveTo(lineMargin, y)
         .lineTo(pageWidth - lineMargin, y)
         .lineWidth(3)
         .strokeColor('#f97316')
         .stroke();

      y += 30;

      // ═══════════════════════════════════════════════════════════
      // CORPS DU CERTIFICAT
      // ═══════════════════════════════════════════════════════════
      
      // Texte "Ce certificat atteste que"
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Ce certificat atteste que', 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 35;

      // NOM DU PARTICIPANT (grand et en orange)
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#f97316')
         .text(participant.name.toUpperCase(), 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 50;

      // Texte "a participé avec succès à l'événement"
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('a participé avec succès à l\'événement', 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 35;

      // TITRE DE L'ÉVÉNEMENT
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text(event.title, 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 45;

      // DATE ET LIEU
      const eventDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(13)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Qui s'est tenu le ${eventDate}`, 60, y, {
           width: pageWidth - 120,
           align: 'center'
         });

      y += 20;

      doc.text(`à ${event.location}`, 60, y, {
        width: pageWidth - 120,
        align: 'center'
      });

      // ═══════════════════════════════════════════════════════════
      // PIED DU CERTIFICAT
      // ═══════════════════════════════════════════════════════════
      
      const footerY = pageHeight - 140;

      // ORGANISATEUR (gauche)
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Organisé par', 80, footerY, {
           width: 200,
           align: 'left'
         });

      doc.fontSize(13)
         .font('Helvetica-Bold')
         .fillColor('#f97316')
         .text(event.organizer?.name || 'Organisateur', 80, footerY + 20, {
           width: 200,
           align: 'left'
         });

      if (event.organizer?.organization) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text(event.organizer.organization, 80, footerY + 40, {
             width: 200,
             align: 'left'
           });
      }

      // NUMÉRO DE CERTIFICAT (centre bas)
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text(`N° ${certificateNumber}`, 60, pageHeight - 80, {
           width: pageWidth - 120,
           align: 'center'
         });

      const issuedDate = new Date().toLocaleDateString('fr-FR');
      doc.fontSize(9)
         .text(`Émis le ${issuedDate}`, 60, pageHeight - 65, {
           width: pageWidth - 120,
           align: 'center'
         });

      // SIGNATURE (droite)
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Signature', pageWidth - 280, footerY, {
           width: 200,
           align: 'right'
         });

      // Ligne de signature
      doc.moveTo(pageWidth - 260, footerY + 40)
         .lineTo(pageWidth - 80, footerY + 40)
         .lineWidth(1)
         .strokeColor('#d1d5db')
         .stroke();

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text('L\'organisateur', pageWidth - 280, footerY + 45, {
           width: 200,
           align: 'right'
         });

      // ═══════════════════════════════════════════════════════════
      // FINALISER
      // ═══════════════════════════════════════════════════════════
      
      doc.end();

      stream.on('finish', () => {
        resolve({
          path: filePath,
          url: `/uploads/certificates/${certificateNumber}.pdf`
        });
      });

      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };