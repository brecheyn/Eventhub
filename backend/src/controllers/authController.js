const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/tokenGenerator');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, organization } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'participant',
      phone,
      organization
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const updateProfile = async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const userId = req.user.id;

    console.log(' Mise à jour du profil pour:', userId);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Vérifier si le username est déjà utilisé par un autre utilisateur
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }

    // Mettre à jour les champs fournis
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    await user.update(updateData);

    console.log('Profil mis à jour');

    // Retourner l'utilisateur mis à jour (sans le mot de passe)
    const { password, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(' Erreur updateProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log(' Changement de mot de passe pour:', userId);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Mot de passe actuel incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    console.log(' Mot de passe changé avec succès');

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(' Erreur changePassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('  Suppression du compte:', userId);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Supprimer toutes les données associées
    // (Les relations avec onDelete: 'CASCADE' feront le travail)
    await user.destroy();

    console.log('Compte supprimé');

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(' Erreur deleteAccount:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
