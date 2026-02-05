# Event & Conference Management Backend

API REST complète pour la gestion d'événements et de conférences.

## 🚀 Fonctionnalités

- ✅ Authentification JWT avec rôles (admin, organizer, participant)
- ✅ Gestion complète des événements
- ✅ Système de tickets avec QR codes
- ✅ Check-in des participants
- ✅ Gestion du programme (sessions)
- ✅ Génération de certificats PDF

## 📋 Prérequis

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm ou yarn

## 🔧 Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer la base de données**

Créer une base de données PostgreSQL:
```sql
CREATE DATABASE event_conference_db;
```

3. **Configurer les variables d'environnement**

Modifier le fichier `.env` avec vos paramètres:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_conference_db
DB_USER=votre_user
DB_PASSWORD=votre_password
JWT_SECRET=votre_secret_jwt_securise
```

4. **Démarrer le serveur**

Mode développement:
```bash
npm run dev
```

Mode production:
```bash
npm start
```

Le serveur démarre sur http://localhost:5000

## 📚 Endpoints API

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (auth requis)

### Events
- `GET /api/events` - Liste des événements
- `GET /api/events/:id` - Détails d'un événement
- `POST /api/events` - Créer un événement (admin/organizer)
- `PUT /api/events/:id` - Modifier un événement (admin/organizer)
- `DELETE /api/events/:id` - Supprimer un événement (admin/organizer)
- `GET /api/events/:id/participants` - Participants d'un événement

### Tickets
- `POST /api/tickets` - Créer un ticket (auth requis)
- `GET /api/tickets/my-tickets` - Mes tickets (auth requis)
- `GET /api/tickets/:id` - Détails d'un ticket (auth requis)
- `DELETE /api/tickets/:id` - Annuler un ticket (auth requis)

### Check-in
- `POST /api/checkin/scan` - Scanner un QR code (admin/organizer)
- `GET /api/checkin/stats/:eventId` - Statistiques check-in (admin/organizer)

### Sessions
- `POST /api/sessions/events/:eventId/sessions` - Créer une session (admin/organizer)
- `GET /api/sessions/events/:eventId/sessions` - Sessions d'un événement
- `PUT /api/sessions/:id` - Modifier une session (admin/organizer)
- `DELETE /api/sessions/:id` - Supprimer une session (admin/organizer)

### Certificates
- `POST /api/certificates` - Générer un certificat (auth requis)
- `GET /api/certificates/my-certificates` - Mes certificats (auth requis)
- `GET /api/certificates/:id` - Détails d'un certificat (auth requis)

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header:
```
Authorization: Bearer <votre_token>
```

## 👥 Rôles

- **admin**: Accès complet à toutes les fonctionnalités
- **organizer**: Peut créer et gérer ses propres événements
- **participant**: Peut s'inscrire aux événements et obtenir des certificats

## 📦 Structure du Projet

```
event-conference-backend/
├── src/
│   ├── config/          # Configuration (DB, etc.)
│   ├── controllers/     # Logique métier
│   ├── middlewares/     # Middlewares (auth, errors)
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires (QR, PDF)
│   ├── validators/      # Validateurs
│   └── server.js        # Point d'entrée
├── uploads/             # Fichiers générés (QR, PDF)
├── .env                 # Variables d'environnement
└── package.json
```

## 🧪 Tests

Pour lancer les tests:
```bash
npm test
```

## 📖 Documentation API

La documentation Swagger sera disponible sur:
```
http://localhost:5000/api-docs
```

## 🚢 Déploiement

### Heroku
```bash
heroku create
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Render/Railway
- Connecter votre repo GitHub
- Ajouter les variables d'environnement
- Déployer automatiquement

## 📝 Notes

- Les QR codes sont générés automatiquement lors de la création d'un ticket
- Les certificats ne sont disponibles qu'après le check-in
- La base de données se synchronise automatiquement en mode développement

## 🤝 Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

## 📄 Licence

MIT
