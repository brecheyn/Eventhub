import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../data/models/certificate_model.dart';
import '../../data/models/event_model.dart';
import '../../data/models/ticket_model.dart';
import '../../data/models/user_model.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/certificate_service.dart';
import '../../data/services/event_service.dart';
import '../../data/services/ticket_service.dart';

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

const _tokenKey = 'auth_token';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(storage: ref.read(secureStorageProvider));
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider));
});

final eventServiceProvider = Provider<EventService>((ref) {
  return EventService(ref.read(apiClientProvider));
});

final ticketServiceProvider = Provider<TicketService>((ref) {
  return TicketService(ref.read(apiClientProvider));
});

final certificateServiceProvider = Provider<CertificateService>((ref) {
  return CertificateService(ref.read(apiClientProvider));
});

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
      final controller = AuthController(
        storage: ref.read(secureStorageProvider),
        authService: ref.read(authServiceProvider),
      );
      controller.loadSession();
      return controller;
    });

final eventsProvider = FutureProvider<List<EventModel>>((ref) {
  return ref.read(eventServiceProvider).getAllEvents();
});

final ticketsProvider = FutureProvider<List<TicketModel>>((ref) {
  return ref.read(ticketServiceProvider).getMyTickets();
});

final certificatesProvider = FutureProvider<List<CertificateModel>>((ref) {
  return ref.read(certificateServiceProvider).getMyCertificates();
});

class AuthController extends StateNotifier<AuthState> {
  AuthController({
    required FlutterSecureStorage storage,
    required AuthService authService,
  }) : _storage = storage,
       _authService = authService,
       super(const AuthState(status: AuthStatus.loading));

  final FlutterSecureStorage _storage;
  final AuthService _authService;

  Future<void> loadSession() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null || token.isEmpty) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final user = await _authService.getProfile();
      if (user.role != 'participant') {
        await _storage.delete(key: _tokenKey);
        state = const AuthState(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Cette application est réservée aux participants.',
        );
        return;
      }

      state = AuthState(status: AuthStatus.authenticated, user: user);
    } catch (_) {
      await _storage.delete(key: _tokenKey);
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);

    try {
      final response = await _authService.login(email: email, password: password);
      if (response.user.role != 'participant') {
        state = const AuthState(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Compte non autorisé sur cette application.',
        );
        return false;
      }

      await _storage.write(key: _tokenKey, value: response.token);
      state = AuthState(status: AuthStatus.authenticated, user: response.user);
      return true;
    } on ApiException catch (error) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: error.message,
      );
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? organization,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);

    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        organization: organization,
      );

      await _storage.write(key: _tokenKey, value: response.token);
      state = AuthState(status: AuthStatus.authenticated, user: response.user);
      return true;
    } on ApiException catch (error) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: error.message,
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

