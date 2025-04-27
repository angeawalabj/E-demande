const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateDocument(request, user, outputPath) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // En-tête
  doc.font('Helvetica-Bold').fontSize(20).text('Plateforme Étudiante', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(request.type === 'attestation' ? 'Attestation de Réussite' : 'Diplôme', { align: 'center' });
  doc.moveDown(2);

  // Informations de l'utilisateur
  doc.font('Helvetica').fontSize(12);
  doc.text(`Nom: ${user.surname}`, { align: 'left' });
  doc.text(`Prénom: ${user.name}`, { align: 'left' });
  doc.text(`Matricule: ${user.matricule}`, { align: 'left' });
  doc.text(`NIP: ${user.nip}`, { align: 'left' });
  doc.moveDown();

  // Détails de la demande
  doc.text(`Type de document: ${request.type === 'attestation' ? 'Attestation' : 'Diplôme'}`, { align: 'left' });
  doc.text(`Niveau: ${request.level}`, { align: 'left' });
  doc.text(`Année d'obtention: ${request.year}`, { align: 'left' });
  doc.moveDown();

  // Corps du document
  doc.font('Helvetica-Bold').fontSize(14).text('Certificat', { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica').fontSize(12);
  doc.text(
    `Par la présente, nous certifions que ${user.surname} ${user.name} a obtenu ` +
    `${request.type === 'attestation' ? 'une attestation de réussite' : 'un diplôme'} ` +
    `pour le niveau ${request.level} en ${request.year}.`
  );
  doc.moveDown(2);

  // Signature
  doc.text('Fait à [Ville], le ' + new Date().toLocaleDateString('fr-FR'), { align: 'left' });
  doc.moveDown();
  doc.text('Signature:', { align: 'left' });
  doc.text('[Nom de l\'administrateur]', { align: 'left' });

  // Pied de page
  doc.moveDown(2);
  doc.fontSize(10).text('Plateforme Étudiante - Tous droits réservés', { align: 'center' });

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

module.exports = { generateDocument };