# EventHub Participant (Flutter)

Frontend mobile Flutter reserve aux participants EventHub.

## Fonctionnalites

- Login participant
- Inscription participant
- Liste des evenements
- Details d'un evenement
- Inscription a un evenement (generation automatique du ticket + QR code)
- Liste des tickets utilisateur
- Liste des certificats utilisateur
- Telechargement/consultation certificat PDF

## Connexion au backend (branche master)

Le mobile consomme directement l'API REST existante:

- `/api/auth/*`
- `/api/events/*`
- `/api/tickets/*`
- `/api/certificates/*`

Par defaut:

- Web: `http://localhost:5000/api`
- Android emulator: `http://10.0.2.2:5000/api`

Pour surcharger:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:5000/api
```

## Lancement

```bash
flutter pub get
flutter run
```

## Notes metier

- L'app force le role `participant` a l'inscription.
- Si un compte `admin`/`organizer` se connecte, l'acces est refuse.
- Le certificat n'est genere que si le check-in admin est deja effectue (regle backend).
