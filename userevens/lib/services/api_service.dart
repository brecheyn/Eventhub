import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Change cette URL avec votre URL backend réelle
  static const String BASE_URL = 'http://192.168.100.42:5000/api';

  static final ApiService _instance = ApiService._internal();

  late SharedPreferences _prefs;
  String? _token;

  factory ApiService() {
    return _instance;
  }

  ApiService._internal();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _token = _prefs.getString('auth_token');
  }

  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL$endpoint'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 30));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$BASE_URL$endpoint'),
        headers: _getHeaders(),
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 30));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$BASE_URL$endpoint'),
        headers: _getHeaders(),
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 30));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('$BASE_URL$endpoint'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 30));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  Map<String, String> _getHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'status': response.statusCode,
          'data': decoded,
        };
      } else {
        return {
          'success': false,
          'status': response.statusCode,
          'message': decoded['message'] ?? 'Une erreur est survenue',
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'status': response.statusCode,
        'message': 'Erreur de parsage JSON',
      };
    }
  }

  Map<String, dynamic> _handleError(dynamic error) {
    return {
      'success': false,
      'status': 0,
      'message': 'Erreur de connexion: $error',
    };
  }

  void setToken(String token) {
    _token = token;
    _prefs.setString('auth_token', token);
  }

  void removeToken() {
    _token = null;
    _prefs.remove('auth_token');
  }

  String? getToken() => _token;
}