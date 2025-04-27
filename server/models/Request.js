const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['attestation', 'diplôme'], required: true },
  year: { type: Number, required: true },
  level: { type: String, enum: ['L1', 'L2', 'L3'], required: true },
  status: { type: String, enum: ['en attente', 'traité', 'non trouvé'], default: 'en attente' },
  documentPath: { type: String }, // Chemin du fichier PDF si traité
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);