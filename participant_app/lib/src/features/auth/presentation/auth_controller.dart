import 'package:flutter/foundation.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../data/auth_service.dart';
import '../models/user_model.dart';

class AuthController extends ChangeNotifier {
  AuthController({
    required AuthService authService,
    required TokenStorage tokenStorage,
    required ApiClient apiClient,
  })  : _authService = authService,
        _tokenStorage = tokenStorage,
        _apiClient = apiClient;

  final AuthService _authService;
  final TokenStorage _tokenStorage;
  final ApiClient _apiClient;

  UserModel? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _isBootstrapping = true;
  String? _error;

  UserModel? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get isBootstrapping => _isBootstrapping;
  String? get error => _error;

  Future<void> bootstrap() async {
    _isBootstrapping = true;
    notifyListeners();

    await _apiClient.initialize();
    final token = await _tokenStorage.read();

    if (token == null || token.isEmpty) {
      _isBootstrapping = false;
      notifyListeners();
      return;
    }

    try {
      final profile = await _authService.getProfile();
      if (profile.role != 'participant') {
        await logout();
        _error = 'Cette application est reservee aux participants.';
      } else {
        _user = profile;
        _isAuthenticated = true;
      }
    } catch (_) {
      await logout();
    }

    _isBootstrapping = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _error = null;

    try {
      final (user, token) = await _authService.login(
        email: email,
        password: password,
      );

      if (user.role != 'participant') {
        _error = 'Connexion refusee: compte non participant.';
        _setLoading(false);
        return false;
      }

      await _apiClient.setToken(token);
      _user = user;
      _isAuthenticated = true;
      _setLoading(false);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _setLoading(false);
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    _setLoading(true);
    _error = null;

    try {
      final (user, token) = await _authService.register(
        name: name,
        email: email,
        password: password,
      );

      if (user.role != 'participant') {
        _error = 'Inscription invalide: role non participant.';
        _setLoading(false);
        return false;
      }

      await _apiClient.setToken(token);
      _user = user;
      _isAuthenticated = true;
      _setLoading(false);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _setLoading(false);
    return false;
  }

  Future<void> logout() async {
    await _apiClient.clearToken();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
