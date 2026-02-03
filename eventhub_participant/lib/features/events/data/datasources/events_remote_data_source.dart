import '../../../../core/network/dio_client.dart';
import '../models/event_model.dart';

class EventsRemoteDataSource {
  final DioClient client;
  EventsRemoteDataSource({required this.client});

  Future<List<EventModel>> getAllEvents({String? status, String? search, String? startDate, String? endDate}) async {
    final query = <String, dynamic>{};
    if (status != null) query['status'] = status;
    if (search != null) query['search'] = search;
    if (startDate != null && endDate != null) {
      query['startDate'] = startDate;
      query['endDate'] = endDate;
    }
    final resp = await client.get('/api/events', queryParameters: query.isEmpty ? null : query);
    final eventsJson = resp.data is Map<String, dynamic> ? (resp.data['events'] as List<dynamic>? ?? []) : (resp.data as List<dynamic>? ?? []);
    final rawList = eventsJson.cast<Map<String, dynamic>>();
    return rawList.map((e) => EventModel.fromJson(e)).toList();
  }

  Future<EventModel> getEventById(String id) async {
    final resp = await client.get('/api/events/$id');
    final data = resp.data as Map<String, dynamic>;
    final eventJson = data['event'] as Map<String, dynamic>? ?? data;
    return EventModel.fromJson(eventJson);
  }
}
