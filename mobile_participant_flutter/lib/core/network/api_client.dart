import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required FlutterSecureStorage storage})
    : _storage = storage,
      dio = Dio(
        BaseOptions(
          baseUrl: AppConfig.apiBaseUrl,
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 20),
          headers: const {'Content-Type': 'application/json'},
        ),
      ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: _tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.reject(_mapError(error));
        },
      ),
    );
  }

  static const String _tokenKey = 'auth_token';

  final Dio dio;
  final FlutterSecureStorage _storage;

  DioException _mapError(DioException error) {
    final statusCode = error.response?.statusCode;
    final payload = error.response?.data;

    String message = 'Une erreur est survenue';

    if (error.response == null) {
      message =
          'Connexion API impossible (${AppConfig.apiBaseUrl}). Vérifiez que le backend est démarré et que API_BASE_URL est correct.';
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      message =
          'Le serveur met trop de temps à répondre (${AppConfig.apiBaseUrl}).';
    }

    if (error.type == DioExceptionType.connectionError) {
      message =
          'API inaccessible (${AppConfig.apiBaseUrl}). Vérifiez réseau et adresse IP/port.';
    }

    if (payload is Map<String, dynamic>) {
      final serverMessage = payload['message'];
      if (serverMessage is String && serverMessage.isNotEmpty) {
        message = serverMessage;
      }
    }

    return DioException(
      requestOptions: error.requestOptions,
      response: error.response,
      error: ApiException(message, statusCode: statusCode),
      type: error.type,
    );
  }
}

