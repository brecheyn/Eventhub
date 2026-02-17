import 'session_model.dart';
import 'user_model.dart';

class EventModel {
  const EventModel({
    required this.id,
    required this.title,
    this.description,
    required this.eventType,
    required this.startDate,
    required this.endDate,
    required this.location,
    this.venue,
    required this.maxCapacity,
    required this.currentCapacity,
    required this.ticketPrice,
    required this.isFree,
    required this.status,
    this.imageUrl,
    this.organizer,
    this.sessions = const [],
  });

  final String id;
  final String title;
  final String? description;
  final String eventType;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final String? venue;
  final int maxCapacity;
  final int currentCapacity;
  final double ticketPrice;
  final bool isFree;
  final String status;
  final String? imageUrl;
  final UserModel? organizer;
  final List<SessionModel> sessions;

  static int _toInt(dynamic value) {
    if (value is int) {
      return value;
    }
    if (value is num) {
      return value.toInt();
    }
    if (value is String) {
      return int.tryParse(value) ?? 0;
    }
    return 0;
  }

  static double _toDouble(dynamic value) {
    if (value is double) {
      return value;
    }
    if (value is num) {
      return value.toDouble();
    }
    if (value is String) {
      return double.tryParse(value) ?? 0;
    }
    return 0;
  }

  factory EventModel.fromJson(Map<String, dynamic> json) {
    final sessionsJson = json['sessions'] as List<dynamic>? ?? const [];
    return EventModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      eventType: json['eventType'] as String? ?? 'conference',
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      location: json['location'] as String? ?? '',
      venue: json['venue'] as String?,
      maxCapacity: _toInt(json['maxCapacity']),
      currentCapacity: _toInt(json['currentCapacity']),
      ticketPrice: _toDouble(json['ticketPrice']),
      isFree: json['isFree'] as bool? ?? true,
      status: json['status'] as String? ?? 'draft',
      imageUrl: json['imageUrl'] as String?,
      organizer: json['organizer'] is Map<String, dynamic>
          ? UserModel.fromJson(json['organizer'] as Map<String, dynamic>)
          : null,
      sessions: sessionsJson
          .whereType<Map<String, dynamic>>()
          .map(SessionModel.fromJson)
          .toList(),
    );
  }
}

