import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/auth_model.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  late SharedPreferences _prefs;

  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _isAuthenticated = _prefs.containsKey('auth_token');
    if (_isAuthenticated) {
      await _fetchUserProfile();
    }
  }

  Future<bool> signup({
    required String name,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
      });

      if (response['success']) {
        final authResponse = AuthResponse.fromJson(response['data']);
        if (authResponse.token != null && authResponse.user != null) {
          _apiService.setToken(authResponse.token!);
          _user = authResponse.user;
          _isAuthenticated = true;
          _isLoading = false;
          notifyListeners();
          return true;
        }
      } else {
        _error = response['message'] ?? 'Erreur d\'inscription';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response['success']) {
        final authResponse = AuthResponse.fromJson(response['data']);
        if (authResponse.token != null && authResponse.user != null) {
          _apiService.setToken(authResponse.token!);
          _user = authResponse.user;
          _isAuthenticated = true;
          _isLoading = false;
          notifyListeners();
          return true;
        }
      } else {
        _error = response['message'] ?? 'Erreur de connexion';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    _apiService.removeToken();
    _user = null;
    _isAuthenticated = false;
    _prefs.remove('auth_token');
    notifyListeners();
  }

  Future<void> _fetchUserProfile() async {
    try {
      final response = await _apiService.get('/auth/profile');
      if (response['success']) {
        _user = User.fromJson(response['data']['user']);
      }
    } catch (e) {
      _isAuthenticated = false;
      _prefs.remove('auth_token');
    }
    notifyListeners();
  }

  Future<bool> updateProfile({
    required String name,
    required String? phone,
    required String? bio,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.put('/auth/profile', {
        'name': name,
        'phone': phone,
        'bio': bio,
      });

      if (response['success']) {
        _user = User.fromJson(response['data']['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Erreur de mise à jour';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}