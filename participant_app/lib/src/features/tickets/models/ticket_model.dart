import '../../events/models/event_model.dart';

class TicketModel {
  TicketModel({
    required this.id,
    required this.ticketNumber,
    required this.status,
    required this.checkedIn,
    required this.createdAt,
    required this.event,
    this.qrCode,
    this.checkedInAt,
  });

  final String id;
  final String ticketNumber;
  final String status;
  final bool checkedIn;
  final DateTime createdAt;
  final DateTime? checkedInAt;
  final String? qrCode;
  final EventModel event;

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['id'].toString(),
      ticketNumber: json['ticketNumber']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      checkedIn: json['checkedIn'] == true,
      createdAt: DateTime.parse(json['createdAt'].toString()),
      checkedInAt: json['checkedInAt'] == null
          ? null
          : DateTime.parse(json['checkedInAt'].toString()),
      qrCode: json['qrCode']?.toString(),
      event: EventModel.fromJson(json['event'] as Map<String, dynamic>),
    );
  }
}
