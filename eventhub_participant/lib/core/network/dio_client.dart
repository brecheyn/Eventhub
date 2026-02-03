import 'package:dio/dio.dart';
import 'auth_interceptor.dart';
import '../security/secure_storage.dart';
import '../config/env.dart';
import 'package:flutter/foundation.dart';

class DioClient {
  final Dio dio;

  DioClient({
    required SecureStorage secureStorage,
    required Future<void> Function() logoutCallback,
  }) : dio = Dio(BaseOptions(baseUrl: Env.apiBaseUrl, connectTimeout: 15000, receiveTimeout: 15000)) {
    dio.interceptors.add(AuthInterceptor(secureStorage: secureStorage, onLogout: logoutCallback));
    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
    }
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) {
    return dio.post(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> put(String path, {dynamic data}) {
    return dio.put(path, data: data);
  }

  Future<Response> delete(String path, {dynamic data}) {
    return dio.delete(path, data: data);
  }
}
