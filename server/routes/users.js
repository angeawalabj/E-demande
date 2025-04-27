const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

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

// Route pour récupérer le profil de l'utilisateur
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -nipCard -studentCard');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Route pour mettre à jour le profil de l'utilisateur
router.put(
  '/profile',
  authenticate,
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('surname').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('matricule').notEmpty().withMessage('Numéro matricule requis'),
    body('nip').notEmpty().withMessage('Numéro NIP requis'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide (10 chiffres requis)'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, surname, email, matricule, nip, phone, password } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe incorrect' });
      }

      // Vérifier l'unicité de l'email, matricule, et NIP (sauf pour l'utilisateur actuel)
      const existingUser = await User.findOne({
        $or: [{ email }, { matricule }, { nip }],
        _id: { $ne: req.userId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email, matricule ou NIP déjà utilisé' });
      }

      // Mettre à jour les informations
      user.name = name;
      user.surname = surname;
      user.email = email;
      user.matricule = matricule;
      user.nip = nip;
      user.phone = phone;

      await user.save();

      res.status(200).json({ message: 'Profil mis à jour avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
    }
  }
);

module.exports = router;