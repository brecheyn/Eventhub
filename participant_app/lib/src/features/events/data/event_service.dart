import '../../../core/network/api_client.dart';
import '../models/event_model.dart';

class EventService {
  EventService(this._client);

  final ApiClient _client;

  Future<List<EventModel>> getEvents({
    String? search,
    String? status,
  }) async {
    final query = <String, String>{};
    if (search != null && search.trim().isNotEmpty) {
      query['search'] = search.trim();
    }
    if (status != null && status.trim().isNotEmpty) {
      query['status'] = status.trim();
    }

    final queryString = Uri(queryParameters: query).query;
    final path = queryString.isEmpty ? '/events' : '/events?$queryString';

    final data = await _client.get(path);
    final items = data['events'] as List<dynamic>? ?? [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(EventModel.fromJson)
        .toList();
  }

  Future<EventModel> getEventById(String id) async {
    final data = await _client.get('/events/$id');
    return EventModel.fromJson(data['event'] as Map<String, dynamic>);
  }
}
