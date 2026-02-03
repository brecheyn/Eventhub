class EventModel {
  final String id;
  final String title;
  final String? description;
  final String startDate;
  final String endDate;
  final String location;
  final String? venue;
  final int maxCapacity;
  final int currentCapacity;
  final String ticketPrice;
  final bool isFree;
  final String status;
  final String? imageUrl;
  final String organizerId;
  final Map<String, dynamic>? organizer;

  EventModel({
    required this.id,
    required this.title,
    this.description,
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
    required this.organizerId,
    this.organizer,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      startDate: json['startDate'] as String,
      endDate: json['endDate'] as String,
      location: json['location'] as String,
      venue: json['venue'] as String?,
      maxCapacity: (json['maxCapacity'] as num?)?.toInt() ?? 100,
      currentCapacity: (json['currentCapacity'] as num?)?.toInt() ?? 0,
      ticketPrice: json['ticketPrice']?.toString() ?? '0',
      isFree: json['isFree'] as bool? ?? true,
      status: json['status'] as String? ?? 'draft',
      imageUrl: json['imageUrl'] as String?,
      organizerId: json['organizerId'] as String,
      organizer: json['organizer'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'startDate': startDate,
      'endDate': endDate,
      'location': location,
      'venue': venue,
      'maxCapacity': maxCapacity,
      'currentCapacity': currentCapacity,
      'ticketPrice': ticketPrice,
      'isFree': isFree,
      'status': status,
      'imageUrl': imageUrl,
      'organizerId': organizerId,
      'organizer': organizer,
    };
  }
}
