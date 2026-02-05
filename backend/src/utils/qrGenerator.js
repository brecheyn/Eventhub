const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateQRCode = async (data, filename) => {
  try {
    const qrPath = path.join(__dirname, '../../uploads/qrcodes', filename);
    
    // Générer le QR code
    await QRCode.toFile(qrPath, data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 1,
      width: 300
    });

    // Générer aussi en base64 pour l'affichage direct
    const qrBase64 = await QRCode.toDataURL(data);

    return {
      path: qrPath,
      base64: qrBase64,
      url: `/uploads/qrcodes/${filename}`
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = { generateQRCode };
