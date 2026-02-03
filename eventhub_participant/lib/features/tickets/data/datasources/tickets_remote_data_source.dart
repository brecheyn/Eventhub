import '../../../../core/network/dio_client.dart';
import '../models/ticket_model.dart';

class TicketsRemoteDataSource {
  final DioClient client;
  TicketsRemoteDataSource({required this.client});

  Future<TicketModel> createTicket(String eventId) async {
    final resp = await client.post('/api/tickets', data: {'eventId': eventId});
    final data = resp.data as Map<String, dynamic>;
    final ticketJson = data['ticket'] as Map<String, dynamic>? ?? data;
    return TicketModel.fromJson(ticketJson);
  }

  Future<List<TicketModel>> getMyTickets() async {
    final resp = await client.get('/api/tickets/my-tickets');
    final data = resp.data as Map<String, dynamic>;
    final ticketsJson = data['tickets'] as List<dynamic>? ?? [];
    return ticketsJson.cast<Map<String, dynamic>>().map((e) => TicketModel.fromJson(e)).toList();
  }

  Future<TicketModel> getTicketById(String id) async {
    final resp = await client.get('/api/tickets/$id');
    final data = resp.data as Map<String, dynamic>;
    final ticketJson = data['ticket'] as Map<String, dynamic>? ?? data;
    return TicketModel.fromJson(ticketJson);
  }

  Future<void> cancelTicket(String id) async {
    await client.delete('/api/tickets/$id');
  }
}
