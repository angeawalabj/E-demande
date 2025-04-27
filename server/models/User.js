const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  matricule: { type: String, required: true, unique: true },
  nip: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  nipCard: { type: String },
  studentCard: { type: String },
  emailConfirmed: { type: Boolean, default: false },
  confirmationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isAdmin: { type: Boolean, default: false } // Champ pour identifier les administrateurs
});

module.exports = mongoose.model('User', userSchema);