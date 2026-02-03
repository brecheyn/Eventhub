import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/datasources/auth_remote_data_source.dart';
import '../../../data/models/user_model.dart';
import '../../../../core/security/secure_storage.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? token;
  final String? message;

  AuthState({required this.status, this.user, this.token, this.message});

  factory AuthState.initial() => AuthState(status: AuthStatus.initial);
  AuthState copyWith({AuthStatus? status, UserModel? user, String? token, String? message}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      token: token ?? this.token,
      message: message ?? this.message,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRemoteDataSource remote;
  final SecureStorage secureStorage;
  final Future<void> Function() onLogoutCallback;

  AuthNotifier({required this.remote, required this.secureStorage, required this.onLogoutCallback})
      : super(AuthState.initial()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final token = await secureStorage.readToken();
    if (token != null) {
      try {
        state = state.copyWith(status: AuthStatus.loading);
        final profileResp = await remote.getProfile();
        final userJson = profileResp['user'] as Map<String, dynamic>? ?? profileResp;
        final user = UserModel.fromJson(userJson);
        state = state.copyWith(status: AuthStatus.authenticated, user: user, token: token);
      } catch (e) {
        await secureStorage.deleteToken();
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String email, String password) async {
    try {
      state = state.copyWith(status: AuthStatus.loading);
      final resp = await remote.login(email: email, password: password);
      final token = resp['token'] as String;
      final userJson = resp['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      await secureStorage.writeToken(token);
      state = state.copyWith(status: AuthStatus.authenticated, user: user, token: token);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, message: _extractMessage(e));
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String? role,
    String? phone,
    String? organization,
  }) async {
    try {
      state = state.copyWith(status: AuthStatus.loading);
      final resp = await remote.register(
        name: name,
        email: email,
        password: password,
        role: role,
        phone: phone,
        organization: organization,
      );
      final token = resp['token'] as String;
      final userJson = resp['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      await secureStorage.writeToken(token);
      state = state.copyWith(status: AuthStatus.authenticated, user: user, token: token);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, message: _extractMessage(e));
    }
  }

  Future<void> logout() async {
    await secureStorage.deleteToken();
    state = AuthState.initial().copyWith(status: AuthStatus.unauthenticated);
    await onLogoutCallback();
  }

  String _extractMessage(Object e) {
    return e.toString();
  }
}
