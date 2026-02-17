import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../models/user_model.dart';

class AuthResponse {
  const AuthResponse({
    required this.user,
    required this.token,
    required this.message,
  });

  final UserModel user;
  final String token;
  final String message;
}

class AuthService {
  const AuthService(this._client);

  final ApiClient _client;

  Future<AuthResponse> login({required String email, required String password}) async {
    try {
      final response = await _client.dio.post(
        '/api/auth/login',
        data: {'email': email, 'password': password},
      );

      final data = response.data as Map<String, dynamic>;
      return AuthResponse(
        user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
        token: data['token'] as String,
        message: data['message'] as String? ?? 'Login successful',
      );
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de se connecter');
    }
  }

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? organization,
  }) async {
    try {
      final response = await _client.dio.post(
        '/api/auth/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          'role': 'participant',
          'phone': phone,
          'organization': organization,
        },
      );

      final data = response.data as Map<String, dynamic>;
      return AuthResponse(
        user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
        token: data['token'] as String,
        message: data['message'] as String? ?? 'User registered successfully',
      );
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de créer le compte');
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _client.dio.get('/api/auth/profile');
      final data = response.data as Map<String, dynamic>;
      return UserModel.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de charger le profil');
    }
  }
}


