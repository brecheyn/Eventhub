import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../models/certificate_model.dart';

class CertificateService {
  const CertificateService(this._client);

  final ApiClient _client;

  Future<CertificateModel> generateCertificate(String eventId) async {
    try {
      final response = await _client.dio.post(
        '/api/certificates',
        data: {'eventId': eventId},
      );
      final payload = response.data as Map<String, dynamic>;
      return CertificateModel.fromJson(payload['certificate'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de générer le certificat');
    }
  }

  Future<List<CertificateModel>> getMyCertificates() async {
    try {
      final response = await _client.dio.get('/api/certificates/my-certificates');
      final payload = response.data as Map<String, dynamic>;
      final rows = payload['certificates'] as List<dynamic>? ?? const [];
      return rows
          .whereType<Map<String, dynamic>>()
          .map(CertificateModel.fromJson)
          .toList();
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de récupérer les certificats');
    }
  }
}

