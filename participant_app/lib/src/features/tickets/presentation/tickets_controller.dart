import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../data/ticket_service.dart';
import '../models/ticket_model.dart';

class TicketsController extends ChangeNotifier {
  TicketsController(this._service);

  final TicketService _service;

  List<TicketModel> _tickets = [];
  bool _isLoading = false;
  String? _error;

  List<TicketModel> get tickets => _tickets;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadMyTickets() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _tickets = await _service.getMyTickets();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<TicketModel?> enroll(String eventId) async {
    _error = null;
    notifyListeners();

    try {
      final ticket = await _service.createTicket(eventId);
      _tickets = [ticket, ..._tickets];
      notifyListeners();
      return ticket;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  bool hasTicketForEvent(String eventId) {
    return _tickets.any((t) => t.event.id == eventId && t.status != 'cancelled');
  }
}
