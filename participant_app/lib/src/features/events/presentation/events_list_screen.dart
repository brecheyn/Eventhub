import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../data/event_service.dart';
import 'event_detail_screen.dart';
import 'events_controller.dart';

class EventsListScreen extends StatelessWidget {
  const EventsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EventsController(
        EventService(context.read<ApiClient>()),
      )..loadEvents(),
      child: const _EventsListView(),
    );
  }
}

class _EventsListView extends StatelessWidget {
  const _EventsListView();

  @override
  Widget build(BuildContext context) {
    return const _EventsListBody();
  }
}

class _EventsListBody extends StatefulWidget {
  const _EventsListBody();

  @override
  State<_EventsListBody> createState() => _EventsListBodyState();
}

class _EventsListBodyState extends State<_EventsListBody> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<EventsController>();
    return Container(
      decoration: AppTheme.pageGradient(),
      child: RefreshIndicator(
        onRefresh: ctrl.refresh,
        child: ListView(
          controller: _scrollController,
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'Evenements',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            const Text('Parcourez, recherchez et inscrivez-vous.'),
            const SizedBox(height: 16),
            TextField(
              controller: _searchController,
              textInputAction: TextInputAction.search,
              onSubmitted: (value) => ctrl.setSearch(value),
              decoration: InputDecoration(
                hintText: 'Rechercher un evenement...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward),
                  onPressed: () => ctrl.setSearch(_searchController.text),
                ),
              ),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String?>(
              value: ctrl.status,
              decoration: const InputDecoration(labelText: 'Filtrer par statut'),
              items: const [
                DropdownMenuItem<String?>(value: null, child: Text('Tous')),
                DropdownMenuItem<String?>(value: 'published', child: Text('Published')),
                DropdownMenuItem<String?>(value: 'ongoing', child: Text('Ongoing')),
                DropdownMenuItem<String?>(value: 'completed', child: Text('Completed')),
              ],
              onChanged: (value) => ctrl.setStatus(value),
            ),
            const SizedBox(height: 14),
            if (ctrl.isLoading && ctrl.events.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (ctrl.error != null && ctrl.events.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 80),
                child: Center(child: Text(ctrl.error!)),
              )
            else
              ...ctrl.events.map((event) {
                final formatter = DateFormat('dd MMM yyyy - HH:mm');
                final when = formatter.format(event.startDate);
                final capacity = '${event.currentCapacity}/${event.maxCapacity}';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Card(
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(14),
                      title: Text(
                        event.title,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(when),
                            Text(event.location),
                            Text('Places: $capacity'),
                          ],
                        ),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded),
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          EventDetailScreen.routeName,
                          arguments: EventDetailArgs(eventId: event.id),
                        );
                      },
                    ),
                  ),
                );
              }),
            if (ctrl.isFetchingMore)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }

  void _onScroll() {
    if (!_scrollController.hasClients) {
      return;
    }

    final position = _scrollController.position;
    if (position.pixels >= (position.maxScrollExtent - 180)) {
      context.read<EventsController>().loadMore();
    }
  }
}
