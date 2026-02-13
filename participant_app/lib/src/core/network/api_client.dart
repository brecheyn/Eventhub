import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../storage/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({
    required this.tokenStorage,
    required this.baseApiUrl,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();

  final TokenStorage tokenStorage;
  final String baseApiUrl;
  final http.Client _httpClient;

  String? _token;

  Future<void> initialize() async {
    _token = await tokenStorage.read();
  }

  Future<void> setToken(String token) async {
    _token = token;
    await tokenStorage.save(token);
  }

  Future<void> clearToken() async {
    _token = null;
    await tokenStorage.clear();
  }

  Future<Map<String, dynamic>> get(String path) {
    return _send('GET', path);
  }

  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? body}) {
    return _send('POST', path, body: body);
  }

  Future<Map<String, dynamic>> put(String path, {Map<String, dynamic>? body}) {
    return _send('PUT', path, body: body);
  }

  Future<Map<String, dynamic>> delete(String path) {
    return _send('DELETE', path);
  }

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$baseApiUrl$path');
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };

    late http.Response response;

    try {
      switch (method) {
        case 'GET':
          response = await _httpClient
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 25));
          break;
        case 'POST':
          response = await _httpClient
              .post(uri, headers: headers, body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 25));
          break;
        case 'PUT':
          response = await _httpClient
              .put(uri, headers: headers, body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 25));
          break;
        case 'DELETE':
          response = await _httpClient
              .delete(uri, headers: headers)
              .timeout(const Duration(seconds: 25));
          break;
        default:
          throw ApiException(
            message: 'Unsupported HTTP method: $method',
            statusCode: 500,
          );
      }
    } on TimeoutException {
      throw ApiException(
        message: 'Timeout: impossible de joindre le serveur.',
        statusCode: 0,
      );
    } on http.ClientException catch (e) {
      throw ApiException(
        message: 'Erreur reseau: ${e.message}',
        statusCode: 0,
      );
    }

    final decoded = _tryDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    throw ApiException(
      message: decoded['message']?.toString() ?? 'Erreur serveur inconnue.',
      statusCode: response.statusCode,
      errors: decoded['errors'],
    );
  }

  Map<String, dynamic> _tryDecode(String body) {
    if (body.isEmpty) {
      return {};
    }

    try {
      final dynamic jsonBody = jsonDecode(body);
      if (jsonBody is Map<String, dynamic>) {
        return jsonBody;
      }
      return {'data': jsonBody};
    } catch (_) {
      return {'raw': body};
    }
  }
}
