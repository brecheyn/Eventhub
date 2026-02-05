# EventHub - Frontend Next.js

🎨 **Design:** Orange & Blanc Professionnel (Style Postman)  
⚡ **Framework:** Next.js 14 + TypeScript + Tailwind CSS

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur de développement
npm run dev

# 3. Ouvrir dans le navigateur
http://localhost:3000
```

## ✨ Fonctionnalités

- ✅ Landing page professionnelle et moderne
- ✅ Authentification complète (Login/Register)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Design responsive (Mobile + Desktop)
- ✅ Thème Orange & Blanc épuré
- ✅ Animations fluides
- ✅ Intégration API complète

## 📁 Structure

```
app/
├── auth/
│   ├── login/         # Page de connexion
│   └── register/      # Page d'inscription
├── dashboard/         # Tableau de bord
├── layout.tsx         # Layout principal
└── page.tsx           # Landing page

components/
├── ui/                # Composants réutilisables
└── layout/            # Navbar, Footer

lib/
└── api/               # Services API (6 services)

contexts/
└── AuthContext.tsx    # Gestion authentification
```

## 🎨 Personnalisation

### Changer le Logo

1. Placer votre logo dans `public/images/logo.png`
2. Éditer `components/layout/Navbar.tsx`
3. Remplacer l'icône Calendar par votre image

### Modifier les Couleurs

Éditer `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#votre-couleur',
    // ...
  }
}
```

## 🔐 Comptes de Test

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Participant:**
- Email: `participant@example.com`
- Password: `participant123`

## 📦 Scripts Disponibles

```bash
npm run dev      # Développement
npm run build    # Build production
npm start        # Démarrer production
npm run lint     # Linter
```

## 🌐 Variables d'Environnement

Fichier `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## ⚙️ Configuration Backend

Assurez-vous que le backend tourne sur le port 5000.

## 📝 Notes

- TypeScript strict activé
- ESLint configuré
- Tailwind CSS avec JIT
- Responsive design first
- Optimisé pour la performance

## 🎯 Pages Créées

✅ Landing Page (/)  
✅ Login (/auth/login)  
✅ Register (/auth/register)  
✅ Dashboard (/dashboard)  

## 🚀 Prochaines Étapes

À ajouter selon vos besoins:
- Page liste événements
- Page création événement
- Page détails événement
- Page participants
- Page check-in
- Page certificats

## 💡 Support

Pour toute question, consultez la documentation Next.js:  
https://nextjs.org/docs

---

**Créé avec ❤️ et Next.js 14**
