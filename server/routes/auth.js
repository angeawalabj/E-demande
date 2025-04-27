const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images (JPEG, PNG) et PDF sont acceptées.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5 Mo
});

// Configuration de Nodemailer pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Remplacez par votre service d'email
  auth: {
    user: process.env.EMAIL_USER, // Configurez via variables d'environnement
    pass: process.env.EMAIL_PASS
  }
});

// Route d'inscription
router.post(
  '/register',
  upload.fields([
    { name: 'nipCard', maxCount: 1 },
    { name: 'studentCard', maxCount: 1 }
  ]),
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('surname').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('matricule').notEmpty().withMessage('Numéro matricule requis'),
    body('nip').notEmpty().withMessage('Numéro NIP requis'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide (10 chiffres requis)'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, matricule, nip } = req.body;
      const existingUser = await User.findOne({ $or: [{ email }, { matricule }, { nip }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email, matricule ou NIP déjà utilisé' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const nipCardPath = req.files['nipCard'] ? req.files['nipCard'][0].path : null;
      const studentCardPath = req.files['studentCard'] ? req.files['studentCard'][0].path : null;

      const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email,
        matricule,
        nip,
        phone: req.body.phone,
        password: hashedPassword,
        nipCard: nipCardPath,
        studentCard: studentCardPath
      });

      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const confirmationLink = `http://${req.headers.host}/api/auth/confirm-email/${token}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmez votre email',
        html: `<p>Merci de vous être inscrit ! Cliquez sur le lien suivant pour confirmer votre email : <a href="${confirmationLink}">Confirmer</a></p>`
      });

      res.status(201).json({ token, message: 'Inscription réussie. Veuillez confirmer votre email.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Erreur serveur lors de l\'inscription' });
    }
  }
);

// Route de confirmation d'email
router.get('/confirm-email/:token', async (req, res) => {
  try {
    const { userId } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }
    user.emailConfirmed = true;
    await user.save();
    res.redirect('/dashboard.html');
  } catch (error) {
    res.status(400).json({ message: 'Lien de confirmation invalide ou expiré' });
  }
});

// Route de connexion
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      if (!user.emailConfirmed) {
        return res.status(400).json({ message: 'Veuillez confirmer votre email avant de vous connecter' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token, message: 'Connexion réussie' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    }
  }
);

// Route pour demander la réinitialisation du mot de passe
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Aucun compte associé à cet email' });
      }

      // Générer un token de réinitialisation (valide 1 heure)
      const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `http://${req.headers.host}/reset-password.html?token=${resetToken}`;

      // Envoyer l'email de réinitialisation
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `<p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant pour procéder : <a href="${resetLink}">Réinitialiser</a>. Ce lien expire dans 1 heure.</p>`
      });

      res.status(200).json({ message: 'Lien de réinitialisation envoyé à votre email' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du lien' });
    }
  }
);

// Route pour réinitialiser le mot de passe
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requis'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { token, password } = req.body;

      // Vérifier le token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé' });
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la réinitialisation' });
    }
  }
);

module.exports = router;