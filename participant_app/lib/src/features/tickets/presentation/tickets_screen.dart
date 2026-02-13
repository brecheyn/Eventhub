import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/ticket_model.dart';
import 'tickets_controller.dart';

class TicketsScreen extends StatefulWidget {
  const TicketsScreen({super.key});

  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<TicketsController>().loadMyTickets());
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<TicketsController>();

    return RefreshIndicator(
      onRefresh: ctrl.loadMyTickets,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Mes tickets',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('QR code et details de vos inscriptions.'),
          const SizedBox(height: 16),
          if (ctrl.isLoading && ctrl.tickets.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (ctrl.error != null && ctrl.tickets.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 80),
              child: Center(child: Text(ctrl.error!)),
            )
          else if (ctrl.tickets.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: Text('Aucun ticket pour le moment.')),
            )
          else
            ...ctrl.tickets.map((ticket) => _TicketCard(ticket: ticket)),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.ticket});

  final TicketModel ticket;

  @override
  Widget build(BuildContext context) {
    final created = DateFormat('dd/MM/yyyy HH:mm').format(ticket.createdAt);
    final qrBytes = _decodeQr(ticket.qrCode);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ticket.event.title,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text('Ticket #: ${ticket.ticketNumber}'),
              Text('Statut: ${ticket.status} ${ticket.checkedIn ? '(Checked-in)' : ''}'),
              Text('Cree le: $created'),
              const SizedBox(height: 10),
              if (qrBytes == null)
                const Text('QR code indisponible')
              else
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.memory(qrBytes, width: 170, height: 170),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Uint8List? _decodeQr(String? raw) {
    if (raw == null || raw.trim().isEmpty) {
      return null;
    }

    try {
      final payload = raw.contains(',') ? raw.split(',').last : raw;
      return base64Decode(payload);
    } catch (_) {
      return null;
    }
  }
}
