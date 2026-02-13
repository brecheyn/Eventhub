import '../../../core/network/api_client.dart';
import '../models/certificate_model.dart';

class CertificateService {
  CertificateService(this._client);

  final ApiClient _client;

  Future<List<CertificateModel>> getMyCertificates() async {
    final data = await _client.get('/certificates/my-certificates');
    final items = data['certificates'] as List<dynamic>? ?? [];

    return items
        .whereType<Map<String, dynamic>>()
        .map(CertificateModel.fromJson)
        .toList();
  }

  Future<CertificateModel> generateForEvent(String eventId) async {
    final data = await _client.post('/certificates', body: {'eventId': eventId});
    return CertificateModel.fromJson(data['certificate'] as Map<String, dynamic>);
  }
}
