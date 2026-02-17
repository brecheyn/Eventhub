# EventHub Mobile Participant

Frontend Flutter pour les participants, connecté au backend REST déjà présent dans cette branche.

## Fonctionnalités

- Authentification participant (inscription, connexion, profil, déconnexion)
- Liste des événements
- Détail d’un événement + inscription (création de ticket)
- Liste des tickets avec QR code
- Liste des certificats
- Génération de certificat (après check-in admin/organizer)
- Ouverture/téléchargement du certificat PDF

## Stack

- Flutter + Material 3
- Riverpod (state management)
- Dio (HTTP)
- Flutter Secure Storage (JWT)

## Configuration

Base URL configurable avec `--dart-define`.

Exemple Android emulator:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000
```

Exemple appareil physique:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.20:5000
```

## Démarrage

```bash
cd mobile_participant_flutter
flutter pub get
flutter run
```

## Endpoints utilisés

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/tickets`
- `GET /api/tickets/my-tickets`
- `POST /api/certificates`
- `GET /api/certificates/my-certificates`

## Note métier

Cette app est strictement orientée **participants**. Si un compte `admin` ou `organizer` se connecte, l’accès est refusé côté mobile.

