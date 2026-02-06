import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/event_model.dart';

class EventProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Event> _events = [];
  List<Event> _myEvents = [];
  Event? _selectedEvent;
  bool _isLoading = false;
  String? _error;

  List<Event> get events => _events;
  List<Event> get myEvents => _myEvents;
  Event? get selectedEvent => _selectedEvent;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAllEvents({
    String? category,
    String? search,
    String? sortBy,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String endpoint = '/events';
      List<String> params = [];

      if (category != null && category.isNotEmpty) {
        params.add('category=$category');
      }
      if (search != null && search.isNotEmpty) {
        params.add('search=$search');
      }
      if (sortBy != null && sortBy.isNotEmpty) {
        params.add('sortBy=$sortBy');
      }

      if (params.isNotEmpty) {
        endpoint += '?${params.join('&')}';
      }

      final response = await _apiService.get(endpoint);

      if (response['success']) {
        _events = (response['data']['events'] as List)
            .map((e) => Event.fromJson(e))
            .toList();
      } else {
        _error = response['message'] ?? 'Erreur lors du chargement des événements';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchMyEvents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/participants/my-events');

      if (response['success']) {
        _myEvents = (response['data']['events'] as List)
            .map((e) => Event.fromJson(e))
            .toList();
      } else {
        _error = response['message'] ?? 'Erreur lors du chargement';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> getEventDetails(String eventId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/events/$eventId');

      if (response['success']) {
        _selectedEvent = Event.fromJson(response['data']['event']);
      } else {
        _error = response['message'] ?? 'Erreur lors du chargement';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> joinEvent(String eventId) async {
    try {
      final response = await _apiService.post('/participants/join/$eventId', {});

      if (response['success']) {
        if (_selectedEvent != null) {
          _selectedEvent = Event(
            id: _selectedEvent!.id,
            title: _selectedEvent!.title,
            description: _selectedEvent!.description,
            category: _selectedEvent!.category,
            startDate: _selectedEvent!.startDate,
            endDate: _selectedEvent!.endDate,
            location: _selectedEvent!.location,
            capacity: _selectedEvent!.capacity,
            participantsCount: _selectedEvent!.participantsCount + 1,
            image: _selectedEvent!.image,
            organizer: _selectedEvent!.organizer,
            isBookmarked: _selectedEvent!.isBookmarked,
            hasJoined: true,
          );
        }
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Erreur';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }
    return false;
  }

  Future<bool> leaveEvent(String eventId) async {
    try {
      final response = await _apiService.delete('/participants/leave/$eventId');

      if (response['success']) {
        if (_selectedEvent != null) {
          _selectedEvent = Event(
            id: _selectedEvent!.id,
            title: _selectedEvent!.title,
            description: _selectedEvent!.description,
            category: _selectedEvent!.category,
            startDate: _selectedEvent!.startDate,
            endDate: _selectedEvent!.endDate,
            location: _selectedEvent!.location,
            capacity: _selectedEvent!.capacity,
            participantsCount: _selectedEvent!.participantsCount - 1,
            image: _selectedEvent!.image,
            organizer: _selectedEvent!.organizer,
            isBookmarked: _selectedEvent!.isBookmarked,
            hasJoined: false,
          );
        }
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Erreur';
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }
    return false;
  }

  Future<bool> bookmarkEvent(String eventId) async {
    try {
      final response = await _apiService.post('/participants/bookmark/$eventId', {});

      if (response['success']) {
        if (_selectedEvent != null) {
          _selectedEvent = Event(
            id: _selectedEvent!.id,
            title: _selectedEvent!.title,
            description: _selectedEvent!.description,
            category: _selectedEvent!.category,
            startDate: _selectedEvent!.startDate,
            endDate: _selectedEvent!.endDate,
            location: _selectedEvent!.location,
            capacity: _selectedEvent!.capacity,
            participantsCount: _selectedEvent!.participantsCount,
            image: _selectedEvent!.image,
            organizer: _selectedEvent!.organizer,
            isBookmarked: true,
            hasJoined: _selectedEvent!.hasJoined,
          );
        }
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }
    return false;
  }

  Future<bool> removeBookmark(String eventId) async {
    try {
      final response = await _apiService.delete('/participants/bookmark/$eventId');

      if (response['success']) {
        if (_selectedEvent != null) {
          _selectedEvent = Event(
            id: _selectedEvent!.id,
            title: _selectedEvent!.title,
            description: _selectedEvent!.description,
            category: _selectedEvent!.category,
            startDate: _selectedEvent!.startDate,
            endDate: _selectedEvent!.endDate,
            location: _selectedEvent!.location,
            capacity: _selectedEvent!.capacity,
            participantsCount: _selectedEvent!.participantsCount,
            image: _selectedEvent!.image,
            organizer: _selectedEvent!.organizer,
            isBookmarked: false,
            hasJoined: _selectedEvent!.hasJoined,
          );
        }
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Erreur: $e';
    }
    return false;
  }
}