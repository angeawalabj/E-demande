const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const User = require('../models/User');

const router = express.Router();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Remplacez par votre service d'email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware pour vérifier le token JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Route pour envoyer un message de contact
router.post(
  '/',
  authenticate,
  [
    body('subject').notEmpty().withMessage('Le sujet est requis'),
    body('message').notEmpty().withMessage('Le message est requis')
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const { subject, message } = req.body;

      // Enregistrer le message dans MongoDB
      const contact = new Contact({
        userId: req.userId,
        subject,
        message
      });
      await contact.save();

      // Envoyer une notification par email à l'administrateur
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL, // Ajoutez cette variable dans .env
        subject: `Nouveau message de contact: ${subject}`,
        html: `
          <p>Un utilisateur a envoyé un message via le formulaire de contact.</p>
          <p><strong>Utilisateur:</strong> ${user.name} ${user.surname} (${user.email})</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <p><strong>Message:</strong> ${message}</p>
        `
      });

      res.status(201).json({ message: 'Message envoyé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
    }
  }
);

module.exports = router;