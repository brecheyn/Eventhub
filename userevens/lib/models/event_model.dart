class Event {
  final String id;
  final String title;
  final String description;
  final String category;
  final DateTime startDate;
  final DateTime endDate;
  final String location;
  final int capacity;
  final int participantsCount;
  final String image;
  final String organizer;
  final bool isBookmarked;
  final bool hasJoined;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.startDate,
    required this.endDate,
    required this.location,
    required this.capacity,
    required this.participantsCount,
    required this.image,
    required this.organizer,
    this.isBookmarked = false,
    this.hasJoined = false,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      startDate: DateTime.parse(json['startDate'] ?? DateTime.now().toIso8601String()),
      endDate: DateTime.parse(json['endDate'] ?? DateTime.now().toIso8601String()),
      location: json['location'] ?? '',
      capacity: json['capacity'] ?? 0,
      participantsCount: json['participants']?.length ?? 0,
      image: json['image'] ?? '',
      organizer: json['organizer']['name'] ?? 'Organisateur',
      isBookmarked: json['isBookmarked'] ?? false,
      hasJoined: json['hasJoined'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'location': location,
      'capacity': capacity,
      'participantsCount': participantsCount,
      'image': image,
      'organizer': organizer,
      'isBookmarked': isBookmarked,
      'hasJoined': hasJoined,
    };
  }
}