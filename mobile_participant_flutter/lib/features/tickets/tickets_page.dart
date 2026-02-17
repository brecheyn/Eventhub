import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../auth/auth_controller.dart';

class TicketsPage extends ConsumerWidget {
  const TicketsPage({super.key});

  Uint8List? _decodeQr(String? raw) {
    if (raw == null || raw.isEmpty) {
      return null;
    }

    final normalized = raw.contains(',') ? raw.split(',').last : raw;
    try {
      return base64Decode(normalized);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tickets = ref.watch(ticketsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mes tickets')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(ticketsProvider),
        child: tickets.when(
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 120),
                  Center(child: Text('Aucun ticket pour le moment.')),
                ],
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final ticket = items[index];
                final qr = _decodeQr(ticket.qrCode);

                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ticket.event?.title ?? 'Événement',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text('N° Ticket: ${ticket.ticketNumber}'),
                        Text('Statut: ${ticket.status}'),
                        Text('Check-in: ${ticket.checkedIn ? 'Oui' : 'Non'}'),
                        Text(
                          'Créé le: ${DateFormat('dd/MM/yyyy HH:mm').format(ticket.createdAt)}',
                        ),
                        const SizedBox(height: 10),
                        if (qr != null)
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.white,
                              ),
                              child: Image.memory(qr, width: 180, height: 180),
                            ),
                          )
                        else
                          const Text('QR code indisponible.'),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 120),
              Center(child: Text('Erreur: $error')),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}

