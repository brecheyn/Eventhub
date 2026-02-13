class EventSessionModel {
  EventSessionModel({
    required this.id,
    required this.title,
    required this.startTime,
    required this.endTime,
    this.speaker,
    this.room,
    this.description,
  });

  final String id;
  final String title;
  final DateTime startTime;
  final DateTime endTime;
  final String? speaker;
  final String? room;
  final String? description;

  factory EventSessionModel.fromJson(Map<String, dynamic> json) {
    return EventSessionModel(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      startTime: DateTime.parse(json['startTime'].toString()),
      endTime: DateTime.parse(json['endTime'].toString()),
      speaker: json['speaker']?.toString(),
      room: json['room']?.toString(),
      description: json['description']?.toString(),
    );
  }
}

class EventModel {
  EventModel({
    required this.id,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.location,
    required this.maxCapacity,
    required this.currentCapacity,
    required this.status,
    this.description,
    this.venue,
    this.ticketPrice,
    this.isFree = true,
    this.imageUrl,
    this.organizerName,
    this.sessions = const [],
  });

  final String id;
  final String title;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final int maxCapacity;
  final int currentCapacity;
  final String status;
  final String? description;
  final String? venue;
  final double? ticketPrice;
  final bool isFree;
  final String? imageUrl;
  final String? organizerName;
  final List<EventSessionModel> sessions;

  bool get isFull => currentCapacity >= maxCapacity;

  factory EventModel.fromJson(Map<String, dynamic> json) {
    final sessionsRaw = json['sessions'] as List<dynamic>? ?? const [];
    final organizerJson = json['organizer'] as Map<String, dynamic>?;

    return EventModel(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      startDate: DateTime.parse(json['startDate'].toString()),
      endDate: DateTime.parse(json['endDate'].toString()),
      location: json['location']?.toString() ?? '',
      maxCapacity: int.tryParse(json['maxCapacity'].toString()) ?? 0,
      currentCapacity: int.tryParse(json['currentCapacity'].toString()) ?? 0,
      status: json['status']?.toString() ?? 'draft',
      description: json['description']?.toString(),
      venue: json['venue']?.toString(),
      ticketPrice: double.tryParse(json['ticketPrice']?.toString() ?? ''),
      isFree: json['isFree'] == true,
      imageUrl: json['imageUrl']?.toString(),
      organizerName: organizerJson?['name']?.toString(),
      sessions: sessionsRaw
          .whereType<Map<String, dynamic>>()
          .map(EventSessionModel.fromJson)
          .toList(),
    );
  }
}
