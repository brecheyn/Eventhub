import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../models/ticket_model.dart';

class TicketService {
  const TicketService(this._client);

  final ApiClient _client;

  Future<TicketModel> registerToEvent(String eventId) async {
    try {
      final response = await _client.dio.post(
        '/api/tickets',
        data: {'eventId': eventId},
      );
      final payload = response.data as Map<String, dynamic>;
      return TicketModel.fromJson(payload['ticket'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException("Impossible de s'inscrire à cet événement");
    }
  }

  Future<List<TicketModel>> getMyTickets() async {
    try {
      final response = await _client.dio.get('/api/tickets/my-tickets');
      final payload = response.data as Map<String, dynamic>;
      final rows = payload['tickets'] as List<dynamic>? ?? const [];
      return rows
          .whereType<Map<String, dynamic>>()
          .map(TicketModel.fromJson)
          .toList();
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de récupérer les tickets');
    }
  }
}

