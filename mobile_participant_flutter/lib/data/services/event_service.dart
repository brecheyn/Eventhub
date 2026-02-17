import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../models/event_model.dart';

class EventService {
  const EventService(this._client);

  final ApiClient _client;

  Future<List<EventModel>> getAllEvents() async {
    try {
      final response = await _client.dio.get('/api/events');
      final payload = response.data as Map<String, dynamic>;
      final rows = payload['events'] as List<dynamic>? ?? const [];
      return rows
          .whereType<Map<String, dynamic>>()
          .map(EventModel.fromJson)
          .toList();
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de récupérer les événements');
    }
  }

  Future<EventModel> getEventById(String id) async {
    try {
      final response = await _client.dio.get('/api/events/$id');
      final payload = response.data as Map<String, dynamic>;
      return EventModel.fromJson(payload['event'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw (error.error is ApiException)
          ? error.error as ApiException
          : ApiException('Impossible de récupérer le détail de cet événement');
    }
  }
}

