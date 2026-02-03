EventHub Participant - Flutter client

Quick start:
1. Ensure Flutter installed.
2. From project root run:
   flutter pub get

Run on Android emulator (dev backend):
   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000

Run on iOS simulator (use machine IP or ngrok for dev backend):
   flutter run --dart-define=API_BASE_URL=http://<YOUR_HOST_IP>:5000

Build release (prod):
   flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com
   flutter build ios --release --dart-define=API_BASE_URL=https://api.example.com

Notes:
- JWT stored securely via flutter_secure_storage.
- Interceptor injects Authorization: Bearer <token>.
- Auto-logout on 401 removes token.
- Endpoints used:
  POST /api/auth/login
  POST /api/auth/register
  GET  /api/auth/profile
  GET  /api/events
  GET  /api/events/:id
  POST /api/tickets
  GET  /api/tickets/my-tickets
  GET  /api/tickets/:id
  DELETE /api/tickets/:id

