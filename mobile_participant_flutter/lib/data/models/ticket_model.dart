import 'event_model.dart';

class TicketModel {
  const TicketModel({
    required this.id,
    required this.ticketNumber,
    this.qrCode,
    required this.status,
    required this.checkedIn,
    this.checkedInAt,
    required this.eventId,
    required this.participantId,
    this.event,
    required this.createdAt,
  });

  final String id;
  final String ticketNumber;
  final String? qrCode;
  final String status;
  final bool checkedIn;
  final DateTime? checkedInAt;
  final String eventId;
  final String participantId;
  final EventModel? event;
  final DateTime createdAt;

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['id'] as String,
      ticketNumber: json['ticketNumber'] as String? ?? '',
      qrCode: json['qrCode'] as String?,
      status: json['status'] as String? ?? 'confirmed',
      checkedIn: json['checkedIn'] as bool? ?? false,
      checkedInAt: json['checkedInAt'] != null
          ? DateTime.parse(json['checkedInAt'] as String)
          : null,
      eventId: json['eventId'] as String,
      participantId: json['participantId'] as String,
      event: json['event'] is Map<String, dynamic>
          ? EventModel.fromJson(json['event'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

