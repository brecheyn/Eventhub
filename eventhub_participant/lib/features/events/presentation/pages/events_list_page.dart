import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/events_remote_data_source.dart';
import '../../data/models/event_model.dart';
import '../../../../core/network/dio_client.dart';
import '../../../tickets/data/datasources/tickets_remote_data_source.dart';
import '../../../tickets/presentation/pages/my_tickets_page.dart';

final eventsFutureProvider = FutureProvider.autoDispose<List<EventModel>>((ref) async {
  final dio = ref.read(dioClientProvider);
  final ds = EventsRemoteDataSource(client: dio);
  final list = await ds.getAllEvents();
  return list;
});

class EventsListPage extends ConsumerWidget {
  const EventsListPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(eventsFutureProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        actions: [
          IconButton(
            icon: const Icon(Icons.ticket),
            onPressed: () {
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MyTicketsPage()));
            },
          )
        ],
      ),
      body: eventsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (events) {
          if (events.isEmpty) return const Center(child: Text('No events found'));
          return ListView.separated(
            itemCount: events.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final e = events[index];
              return ListTile(
                title: Text(e.title),
                subtitle: Text('${e.location} • ${e.startDate}'),
                trailing: ElevatedButton(
                  child: const Text('View'),
                  onPressed: () {
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetailPage(eventId: e.id)));
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class EventDetailPage extends ConsumerWidget {
  final String eventId;
  const EventDetailPage({Key? key, required this.eventId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final future = ref.watch(FutureProvider.autoDispose<EventModel>((innerRef) async {
      final dio = innerRef.read(dioClientProvider);
      final ds = EventsRemoteDataSource(client: dio);
      return ds.getEventById(eventId);
    }));

    return Scaffold(
      appBar: AppBar(title: const Text('Event')),
      body: future.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (event) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(event.title, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text(event.description ?? ''),
                const SizedBox(height: 12),
                Text('Location: ${event.location}'),
                Text('From: ${event.startDate}'),
                Text('To: ${event.endDate}'),
                const Spacer(),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      final dio = ref.read(dioClientProvider);
                      final ds = TicketsRemoteDataSource(client: dio);
                      final ticket = await ds.createTicket(event.id);
                      showDialog(context: context, builder: (_) => AlertDialog(
                        title: const Text('Ticket created'),
                        content: Text('Ticket number: ${ticket.ticketNumber}'),
                        actions: [
                          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('OK'))
                        ],
                      ));
                    } catch (err) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Purchase failed: $err')));
                    }
                  },
                  child: const Text('Buy Ticket'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
