class TicketModel {
  final String id;
  final String ticketNumber;
  final String? qrCode;
  final String status;
  final bool checkedIn;
  final String? checkedInAt;
  final String participantId;
  final String eventId;
  final String? createdAt;
  final String? updatedAt;
  final Map<String, dynamic>? event;
  final Map<String, dynamic>? participant;

  TicketModel({
    required this.id,
    required this.ticketNumber,
    this.qrCode,
    required this.status,
    required this.checkedIn,
    this.checkedInAt,
    required this.participantId,
    required this.eventId,
    this.createdAt,
    this.updatedAt,
    this.event,
    this.participant,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['id'] as String,
      ticketNumber: json['ticketNumber'] as String,
      qrCode: json['qrCode'] as String?,
      status: json['status'] as String? ?? 'confirmed',
      checkedIn: json['checkedIn'] as bool? ?? false,
      checkedInAt: json['checkedInAt'] as String?,
      participantId: json['participantId'] as String,
      eventId: json['eventId'] as String,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
      event: json['event'] as Map<String, dynamic>?,
      participant: json['participant'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticketNumber': ticketNumber,
      'qrCode': qrCode,
      'status': status,
      'checkedIn': checkedIn,
      'checkedInAt': checkedInAt,
      'participantId': participantId,
      'eventId': eventId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'event': event,
      'participant': participant,
    };
  }
}
