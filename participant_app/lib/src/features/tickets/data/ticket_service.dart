import '../../../core/network/api_client.dart';
import '../models/ticket_model.dart';

class TicketService {
  TicketService(this._client);

  final ApiClient _client;

  Future<TicketModel> createTicket(String eventId) async {
    final data = await _client.post('/tickets', body: {'eventId': eventId});
    return TicketModel.fromJson(data['ticket'] as Map<String, dynamic>);
  }

  Future<List<TicketModel>> getMyTickets() async {
    final data = await _client.get('/tickets/my-tickets');
    final items = data['tickets'] as List<dynamic>? ?? [];

    return items
        .whereType<Map<String, dynamic>>()
        .map(TicketModel.fromJson)
        .toList();
  }
}
