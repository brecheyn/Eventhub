import '../../../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  AuthService(this._client);

  final ApiClient _client;

  Future<(UserModel, String)> login({
    required String email,
    required String password,
  }) async {
    final data = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
    });

    return (
      UserModel.fromJson(data['user'] as Map<String, dynamic>),
      data['token'] as String,
    );
  }

  Future<(UserModel, String)> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final data = await _client.post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
      'role': 'participant',
    });

    return (
      UserModel.fromJson(data['user'] as Map<String, dynamic>),
      data['token'] as String,
    );
  }

  Future<UserModel> getProfile() async {
    final data = await _client.get('/auth/profile');
    return UserModel.fromJson(data['user'] as Map<String, dynamic>);
  }
}
