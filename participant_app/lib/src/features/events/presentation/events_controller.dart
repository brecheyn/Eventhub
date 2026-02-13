import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../data/event_service.dart';
import '../models/event_model.dart';

class EventsController extends ChangeNotifier {
  EventsController(this._service);

  final EventService _service;
  static const int _pageSize = 8;

  List<EventModel> _allEvents = [];
  List<EventModel> _events = [];
  EventModel? _selected;
  bool _isLoading = false;
  bool _isFetchingMore = false;
  bool _hasMore = false;
  int _currentPage = 0;
  String? _error;
  String _search = '';
  String? _status;

  List<EventModel> get events => _events;
  EventModel? get selected => _selected;
  bool get isLoading => _isLoading;
  bool get isFetchingMore => _isFetchingMore;
  bool get hasMore => _hasMore;
  String? get error => _error;
  String get search => _search;
  String? get status => _status;

  Future<void> loadEvents() async {
    await _fetchEvents();
  }

  Future<void> refresh() async {
    await _fetchEvents();
  }

  Future<void> setSearch(String value) async {
    _search = value.trim();
    await _fetchEvents();
  }

  Future<void> setStatus(String? value) async {
    _status = value;
    await _fetchEvents();
  }

  Future<void> loadMore() async {
    if (_isLoading || _isFetchingMore || !_hasMore) {
      return;
    }

    _isFetchingMore = true;
    notifyListeners();
    _appendNextPage();
    _isFetchingMore = false;
    notifyListeners();
  }

  Future<void> _fetchEvents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _allEvents = await _service.getEvents(
        search: _search.isEmpty ? null : _search,
        status: _status,
      );

      _events = [];
      _currentPage = 0;
      _hasMore = _allEvents.isNotEmpty;
      _appendNextPage();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  void _appendNextPage() {
    if (!_hasMore) {
      return;
    }

    final start = _currentPage * _pageSize;
    final end = (start + _pageSize) > _allEvents.length
        ? _allEvents.length
        : (start + _pageSize);

    if (start >= _allEvents.length) {
      _hasMore = false;
      return;
    }

    _events = [..._events, ..._allEvents.sublist(start, end)];
    _currentPage++;
    _hasMore = end < _allEvents.length;
  }

  Future<void> loadDetails(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selected = await _service.getEventById(id);
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}
