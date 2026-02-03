import 'package:dio/dio.dart';
import '../security/secure_storage.dart';

typedef LogoutCallback = Future<void> Function();

class AuthInterceptor extends Interceptor {
  final SecureStorage secureStorage;
  final LogoutCallback onLogout;

  AuthInterceptor({required this.secureStorage, required this.onLogout});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await secureStorage.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  @override
  void onError(DioError err, ErrorInterceptorHandler handler) async {
    final status = err.response?.statusCode;
    if (status == 401) {
      try {
        await secureStorage.deleteToken();
      } catch (_) {}
      await onLogout();
    }
    return handler.next(err);
  }
}
