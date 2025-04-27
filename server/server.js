const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const jwt = require('jsonwebtoken');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/student_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connecté à MongoDB');
}).catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));

// Configuration AdminJS
AdminJS.registerAdapter(AdminJSMongoose);
const User = require('./models/User');
const Request = require('./models/Request');
const Contact = require('./models/Contact');
const { generateDocument } = require('./templates/documentTemplate');

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: { isVisible: false }, // Masquer le mot de passe
          nipCard: { isVisible: { list: false, show: true, edit: false, filter: false } },
          studentCard: { isVisible: { list: false, show: true, edit: false, filter: false } },
          confirmationToken: { isVisible: false },
          resetPasswordToken: { isVisible: false },
          resetPasswordExpires: { isVisible: false }
        }
      }
    },
    {
      resource: Request,
      options: {
        properties: {
          documentPath: {
            isVisible: { list: true, show: true, edit: false, filter: false },
            components: {
              show: AdminJS.bundle('./components/request-document-path.jsx') // Composant personnalisé pour le lien PDF
            }
          },
          status: {
            availableValues: [
              { value: 'en attente', label: 'En attente' },
              { value: 'traité', label: 'Traité' },
              { value: 'non trouvé', label: 'Non trouvé' }
            ]
          }
        },
        actions: {
          edit: {
            after: async (response, request, context) => {
              if (request.method === 'post' && response.record.params.status === 'traité') {
                const record = response.record;
                const user = await User.findById(record.params.userId);
                const outputPath = path.join(__dirname, 'public', 'uploads', `document_${record.params._id}.pdf`);
                await generateDocument(record.params, user, outputPath);
                record.params.documentPath = `document_${record.params._id}.pdf`;
                await Request.findByIdAndUpdate(record.params._id, { documentPath: record.params.documentPath });
              } else if (request.method === 'post' && response.record.params.status !== 'traité') {
                response.record.params.documentPath = null;
                await Request.findByIdAndUpdate(response.record.params._id, { documentPath: null });
              }
              return response;
            }
          }
        }
      }
    },
    {
      resource: Contact,
      options: {
        properties: {
          userId: { isVisible: { list: true, show: true, edit: false, filter: true } }
        }
      }
    }
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'Plateforme Étudiante',
    softwareBrothers: false,
    logo: false
  }
});

// Authentification AdminJS
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email });
    if (user && user.isAdmin && await require('bcrypt').compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return { email, token };
    }
    return false;
  },
  cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'your_cookie_secret'
}, null, {
  resave: false,
  saveUninitialized: false,
  secret: process.env.ADMIN_COOKIE_SECRET || 'your_cookie_secret'
});

app.use(adminJs.options.rootPath, adminRouter);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Interface AdminJS disponible sur http://localhost:${PORT}/admin`);
});