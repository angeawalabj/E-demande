Plateforme Étudiante
Une plateforme web permettant aux étudiants de soumettre des demandes de documents (attestations ou diplômes), de gérer leur profil, et de contacter l'administration. Les administrateurs peuvent gérer les utilisateurs, les demandes, et les messages via une interface AdminJS, avec génération automatique de PDF pour les demandes traitées.
Table des matières

Fonctionnalités
Prérequis
Installation
Structure du projet
Utilisation
Tests
Contribuer
Licence

Fonctionnalités

Inscription et connexion : Création de compte avec téléversement de carte NIP et carte d'étudiant, confirmation par email, connexion sécurisée avec JWT.
Récupération de mot de passe : Réinitialisation du mot de passe via un lien envoyé par email.
Tableau de bord utilisateur :
Affichage des demandes avec statut (en attente, traité, non trouvé) et lien PDF pour les demandes traitées.
Boutons pour faire une demande, confirmer l'email, modifier le profil, ou contacter l'administration.


Soumission de demande : Formulaire pour demander une attestation ou un diplôme (niveau L1, L2, L3, année 2000-2025), requiert un email confirmé.
Modification de profil : Mise à jour des informations personnelles (nom, prénom, email, matricule, NIP, téléphone) avec confirmation du mot de passe.
Contact : Formulaire pour envoyer des messages à l'administration, avec notification par email.
Génération de PDF : Génération automatique de PDF pour les demandes marquées comme "traitées" par les administrateurs.
Interface AdminJS :
Gestion des utilisateurs (modifier, supprimer, gérer isAdmin et emailConfirmed).
Gestion des demandes (changer le statut, générer/télécharger des PDF).
Gestion des messages de contact (voir, supprimer).



Prérequis

Node.js : v16 ou supérieur
MongoDB : v4.4 ou supérieur
Compte Gmail : Pour l'envoi d'emails (ou un autre service SMTP)
Navigateur web : Chrome, Firefox, ou Edge (pour tester l'interface)

Installation

Cloner le dépôt :
git clone https://github.com/votre-utilisateur/plateforme-etudiante.git
cd plateforme-etudiante


Installer les dépendances :
npm install


Configurer les variables d'environnement :Créez un fichier .env à la racine du projet avec le contenu suivant :
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
ADMIN_EMAIL=admin@example.com
ADMIN_COOKIE_SECRET=your_admin_cookie_secret
PORT=3000


Créer les dossiers nécessaires :
mkdir -p public/uploads server/components
chmod -R 755 public/uploads


Démarrer MongoDB :Assurez-vous que MongoDB est en cours d'exécution :
mongod


Démarrer le serveur :
node server/server.js

Le serveur sera accessible à http://localhost:3000 et l'interface AdminJS à http://localhost:3000/admin.


Structure du projet
project/
├── public/                   # Fichiers statiques (HTML, CSS, JS, images)
│   ├── *.html               # Pages frontend (login, register, dashboard, etc.)
│   ├── css/
│   │   └── styles.css       # Styles globaux
│   ├── js/
│   │   └── *.js             # Scripts pour chaque page
│   ├── assets/images/       # Images de fond
│   ├── uploads/             # Fichiers PDF générés et uploadés
├── server/
│   ├── server.js            # Point d'entrée du serveur
│   ├── routes/
│   │   ├── auth.js          # Routes pour l'authentification
│   │   ├── requests.js      # Routes pour les demandes
│   │   ├── users.js         # Routes pour les utilisateurs
│   │   ├── contact.js       # Routes pour les messages de contact
│   ├── models/
│   │   ├── User.js          # Modèle MongoDB pour les utilisateurs
│   │   ├── Request.js       # Modèle MongoDB pour les demandes
│   │   ├── Contact.js       # Modèle MongoDB pour les messages de contact
│   ├── templates/
│   │   └── documentTemplate.js # Modèle pour générer les PDF
│   ├── components/
│   │   └── request-document-path.jsx # Composant AdminJS pour les liens PDF
├── package.json             # Dépendances et scripts
├── .env                     # Variables d'environnement
└── README.md                # Documentation

Utilisation

Créer un compte utilisateur :

Accédez à http://localhost:3000/register.html.
Remplissez le formulaire et téléversez les fichiers requis (carte NIP, carte d'étudiant).
Confirmez votre email via le lien envoyé.


Se connecter :

Accédez à http://localhost:3000/login.html et connectez-vous.
Vous serez redirigé vers le tableau de bord.


Faire une demande :

Depuis le tableau de bord, cliquez sur "Faire une demande".
Remplissez le formulaire (type, année, niveau) et soumettez.


Modifier le profil :

Cliquez sur "Modifier les informations" pour mettre à jour vos données.
Confirmez avec votre mot de passe.


Contacter l'administration :

Cliquez sur "Nous contacter" pour envoyer un message.
Une notification sera envoyée à l'administrateur.


Administration (AdminJS) :

Connectez-vous à http://localhost:3000/admin avec un compte administrateur (isAdmin: true).
Gérez les utilisateurs, changez le statut des demandes, générez des PDF, et consultez les messages de contact.


Générer un PDF :

Dans AdminJS, modifiez une demande et définissez le statut à "traité".
Un PDF sera généré automatiquement dans public/uploads/ et accessible via le tableau de bord utilisateur.



Tests

Frontend :

Testez chaque page (login.html, register.html, etc.) pour vérifier la validation des formulaires et les redirections.
Vérifiez les animations (AOS, GSAP, Anime.js) sur chaque page.
Assurez-vous que les liens PDF dans le tableau de bord fonctionnent.


Backend :

Utilisez Postman pour tester les routes API :
POST /api/auth/register : Créer un utilisateur.
POST /api/auth/login : Se connecter.
POST /api/requests : Soumettre une demande.
PUT /api/users/profile : Mettre à jour le profil.
POST /api/contact : Envoyer un message.
PATCH /api/requests/:id : Changer le statut d'une demande (administrateur uniquement).


Vérifiez que les emails sont envoyés (inscription, réinitialisation, contact).


AdminJS :

Connectez-vous avec un compte administrateur et testez :
La modification des utilisateurs (isAdmin, emailConfirmed).
Le changement de statut des demandes et la génération de PDF.
La suppression des messages de contact.


Essayez avec un compte non-administrateur (doit échouer).


MongoDB :

Vérifiez que les collections (users, requests, contacts) sont correctement mises à jour.
Assurez-vous que les fichiers PDF sont stockés dans public/uploads/.



Contribuer

Forkez le dépôt.
Créez une branche pour votre fonctionnalité (git checkout -b feature/nouvelle-fonctionnalite).
Commitez vos changements (git commit -m "Ajout de nouvelle fonctionnalité").
Poussez votre branche (git push origin feature/nouvelle-fonctionnalite).
Ouvrez une Pull Request.

Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
