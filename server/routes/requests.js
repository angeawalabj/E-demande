const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const User = require('../models/User');
const path = require('path');
const { generateDocument } = require('../templates/documentTemplate');

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

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des permissions' });
  }
};

// Route pour récupérer les demandes de l'utilisateur
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const requests = await Request.find({ userId: req.userId });
    res.status(200).json({ user, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des demandes' });
  }
});

// Route pour soumettre une nouvelle demande
router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['attestation', 'diplôme']).withMessage('Type de document invalide'),
    body('year').isInt({ min: 2000, max: 2025 }).withMessage('Année invalide (2000-2025)'),
    body('level').isIn(['L1', 'L2', 'L3']).withMessage('Niveau d\'études invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (!user.emailConfirmed) {
        return res.status(403).json({ message: 'Vous devez confirmer votre email avant de faire une demande' });
      }

      const { type, year, level } = req.body;

      const request = new Request({
        userId: req.userId,
        type,
        year,
        level
      });

      await request.save();

      res.status(201).json({ message: 'Demande soumise avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la soumission de la demande' });
    }
  }
);

// Route pour mettre à jour le statut d'une demande (administrateurs uniquement)
router.patch(
  '/:id',
  authenticate,
  isAdmin,
  [
    body('status').isIn(['en attente', 'traité', 'non trouvé']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const requestId = req.params.id;
      const { status } = req.body;

      const request = await Request.findById(requestId).populate('userId');
      if (!request) {
        return res.status(404).json({ message: 'Demande non trouvée' });
      }

      request.status = status;

      if (status === 'traité') {
        const outputPath = path.join(__dirname, '..', 'public', 'uploads', `document_${requestId}.pdf`);
        await generateDocument(request, request.userId, outputPath);
        request.documentPath = `document_${requestId}.pdf`;
      } else {
        request.documentPath = null; // Supprimer le chemin du document si le statut change
      }

      await request.save();

      res.status(200).json({ message: 'Demande mise à jour avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la demande' });
    }
  }
);

module.exports = router;