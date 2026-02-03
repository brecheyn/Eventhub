import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';

class AuthRemoteDataSource {
  final DioClient client;
  AuthRemoteDataSource({required this.client});

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    final resp = await client.post('/api/auth/login', data: {'email': email, 'password': password});
    return Map<String, dynamic>.from(resp.data);
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? role,
    String? phone,
    String? organization,
  }) async {
    final data = {'name': name, 'email': email, 'password': password};
    if (role != null) data['role'] = role;
    if (phone != null) data['phone'] = phone;
    if (organization != null) data['organization'] = organization;
    final resp = await client.post('/api/auth/register', data: data);
    return Map<String, dynamic>.from(resp.data);
  }

  Future<Map<String, dynamic>> getProfile() async {
    final resp = await client.get('/api/auth/profile');
    return Map<String, dynamic>.from(resp.data);
  }
}
