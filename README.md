# Nails by Sarah — Template prothésiste ongulaire à domicile

Application web complète pour prothésiste ongulaire / esthéticienne à domicile : site vitrine, réservation en ligne, galerie, blog et panel d'administration.

## Pré-requis

- **Node.js** >= 18.0.0
- **MySQL** 8.x ou **MariaDB** 10.6+
- Un compte SMTP pour les notifications email (Gmail, OVH, etc.)

## Installation

```bash
# 1. Cloner le projet
git clone https://github.com/fullDevSolutions/nails-domicile.git
cd nails-domicile

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
```

## Configuration (.env)

Ouvrir `.env` et remplir chaque variable :

```env
# Server
NODE_ENV=development          # production en ligne
PORT=3000

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=votre_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=nails_domicile

# Session — générer un secret sécurisé :
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
SESSION_SECRET=coller_le_resultat_ici

# Compte admin (utilisé lors du seed initial)
ADMIN_EMAIL=admin@votredomaine.fr
ADMIN_PASSWORD=MotDePasse8CaracMin!

# Email SMTP
SMTP_HOST=ssl0.ovh.net        # ou smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@votredomaine.fr
SMTP_PASS=votre_mot_de_passe_smtp
MAIL_FROM=noreply@votredomaine.fr

# URL publique du site
APP_URL=https://votredomaine.fr
```

## Base de données

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE nails_domicile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Lancer les migrations + données initiales
npm run setup
```

Cette commande crée les tables et insère les données de démonstration (services, témoignages, articles de blog, etc.).

## Lancement

```bash
# Développement (avec hot-reload)
npm run dev

# Production
NODE_ENV=production npm start
```

Le site est accessible sur `http://localhost:3000` (ou le port configuré).

## Personnalisation

### Informations métier

Éditer `config/site.config.json` ou utiliser le panel admin (`/admin`) :

- **Nom, téléphone, email, SIRET** de l'entreprise
- **Zone d'intervention** et tarif kilométrique
- **Couleurs et polices** du thème
- **SEO** : titre, description, Open Graph, Google Analytics
- **Fonctionnalités** : activer/désactiver réservation, galerie, témoignages, blog

### Panel d'administration

Accessible sur `/admin` avec les identifiants configurés dans `.env`.

Fonctionnalités :
- Gestion des réservations (statut, rappels)
- Services et tarifs
- Galerie photos (upload avec redimensionnement automatique)
- Témoignages clients
- Articles de blog
- Jours fermés / dates bloquées
- Horaires d'ouverture
- Paramètres du site

## Structure du projet

```
nails-domicile/
├── config/                 # Configuration (DB, mail, session, site)
├── migrations/             # Schéma de base de données (Knex)
├── seeds/                  # Données de démonstration
├── server/
│   ├── app.js             # Configuration Express + middlewares
│   ├── server.js          # Point d'entrée
│   ├── controllers/       # Logique métier
│   ├── models/            # Accès base de données
│   ├── middleware/         # Auth, CSRF, validation, upload, rate-limit
│   └── routes/            # Routes publiques, API, admin
├── views/                  # Templates EJS
│   ├── layouts/           # Layouts public + admin
│   ├── public/            # Pages visiteur
│   ├── admin/             # Pages administration
│   └── partials/          # Composants réutilisables
├── public/                 # Assets statiques
│   ├── css/               # Feuille de style
│   ├── js/                # JavaScript client
│   ├── images/            # Images et uploads
│   ├── icons/             # Icônes PWA
│   ├── sw.js              # Service Worker (PWA)
│   └── manifest.json      # Manifest PWA
└── .env.example            # Template de configuration
```

## Déploiement OVH (hébergement Node.js)

1. Créer la base de données MySQL depuis l'espace client OVH
2. Uploader les fichiers via Git ou SFTP
3. Créer le fichier `.env` avec les identifiants OVH (DB, SMTP)
4. Lancer les migrations : `npm run setup`
5. Configurer le point d'entrée sur `server/server.js`
6. Vérifier que `NODE_ENV=production` est défini

### SMTP OVH

```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@votredomaine.fr
SMTP_PASS=votre_mot_de_passe
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lancement en production |
| `npm run dev` | Lancement avec hot-reload (nodemon) |
| `npm run migrate` | Appliquer les migrations |
| `npm run migrate:rollback` | Annuler la dernière migration |
| `npm run seed` | Insérer les données de démonstration |
| `npm run setup` | Migrations + seed (installation initiale) |

## Sécurité

- Protection CSRF sur tous les formulaires
- Rate limiting (login, réservations, API)
- Helmet (headers HTTP de sécurité)
- Validation Joi côté serveur + validation HTML5/JS côté client
- Hachage bcrypt des mots de passe (12 rounds)
- Sessions sécurisées (httpOnly, secure en production, sameSite)

## Licence

ISC
