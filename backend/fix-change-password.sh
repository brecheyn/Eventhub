#!/bin/bash

# Vérifier si bcrypt est importé
if ! grep -q "const bcrypt" src/controllers/authController.js; then
  echo "🔧 Ajout de l'import bcrypt..."
  
  # Créer une sauvegarde
  cp src/controllers/authController.js src/controllers/authController.js.backup
  
  # Ajouter bcrypt en première ligne
  echo "const bcrypt = require('bcryptjs');" > /tmp/new_controller.js
  cat src/controllers/authController.js >> /tmp/new_controller.js
  mv /tmp/new_controller.js src/controllers/authController.js
  
  echo " bcrypt importé"
else
  echo "✓ bcrypt déjà importé"
fi

echo ""
echo "Redémarrez le backend : npm start"
