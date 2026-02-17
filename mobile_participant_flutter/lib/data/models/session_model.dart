class SessionModel {
  const SessionModel({
    required this.id,
    required this.title,
    this.description,
    this.speaker,
    this.room,
    required this.startTime,
    required this.endTime,
  });

  final String id;
  final String title;
  final String? description;
  final String? speaker;
  final String? room;
  final DateTime startTime;
  final DateTime endTime;

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      speaker: json['speaker'] as String?,
      room: json['room'] as String?,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
    );
  }
}

