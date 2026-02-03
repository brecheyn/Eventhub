import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/tickets_remote_data_source.dart';
import '../../data/models/ticket_model.dart';
import '../../../../core/network/dio_client.dart';

final myTicketsProvider = FutureProvider.autoDispose<List<TicketModel>>((ref) async {
  final dio = ref.read(dioClientProvider);
  final ds = TicketsRemoteDataSource(client: dio);
  return ds.getMyTickets();
});

class MyTicketsPage extends ConsumerWidget {
  const MyTicketsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ticketsAsync = ref.watch(myTicketsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My Tickets')),
      body: ticketsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (tickets) {
          if (tickets.isEmpty) return const Center(child: Text('No tickets'));
          return ListView.separated(
            itemCount: tickets.length,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, i) {
              final t = tickets[i];
              Uint8List? qrBytes;
              if (t.qrCode != null && t.qrCode!.startsWith('data:image')) {
                final base64Part = t.qrCode!.split(',').last;
                qrBytes = base64Decode(base64Part);
              }
              return ListTile(
                title: Text(t.ticketNumber),
                subtitle: Text('Event: ${t.event?['title'] ?? t.eventId}'),
                leading: qrBytes != null ? Image.memory(qrBytes, width: 48, height: 48) : null,
                trailing: t.status == 'cancelled' ? const Text('Cancelled') : Text(t.status),
              );
            },
          );
        },
      ),
    );
  }
}
