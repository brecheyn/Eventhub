const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (certificateData, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfPath = path.join(__dirname, '../../uploads/certificates', filename);
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

      // Title
      doc.fontSize(40)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF PARTICIPATION', 50, 100, {
           align: 'center'
         });

      // Decorative line
      doc.moveTo(200, 160)
         .lineTo(doc.page.width - 200, 160)
         .stroke();

      // Content
      doc.fontSize(16)
         .font('Helvetica')
         .text('This is to certify that', 50, 200, { align: 'center' });

      doc.fontSize(30)
         .font('Helvetica-Bold')
         .text(certificateData.participantName, 50, 240, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica')
         .text('has successfully participated in', 50, 300, { align: 'center' });

      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(certificateData.eventTitle, 50, 340, { align: 'center' });

      doc.fontSize(14)
         .font('Helvetica')
         .text(`Held on ${certificateData.eventDate}`, 50, 400, { align: 'center' });

      doc.fontSize(14)
         .text(`at ${certificateData.eventLocation}`, 50, 425, { align: 'center' });

      // Certificate number
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Certificate No: ${certificateData.certificateNumber}`, 50, 500, { align: 'center' });

      doc.fontSize(10)
         .text(`Issue Date: ${certificateData.issueDate}`, 50, 520, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({
          path: pdfPath,
          url: `/uploads/certificates/${filename}`
        });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };
