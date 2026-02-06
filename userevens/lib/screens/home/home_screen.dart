import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/event_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/event_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late TextEditingController _searchController;
  String _selectedCategory = 'Tous';
  final List<String> _categories = [
    'Tous',
    'Technologie',
    'Musique',
    'Sports',
    'Art',
    'Affaires'
  ];

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<EventProvider>(context, listen: false).fetchAllEvents();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('EventHub'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSearchBar(),
              const SizedBox(height: 24),
              _buildCategoryFilter(),
              const SizedBox(height: 24),
              Text(
                'Événements',
                style: AppTheme.headingMedium,
              ),
              const SizedBox(height: 16),
              _buildEventsList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Rechercher un événement...',
        prefixIcon: const Icon(Icons.search, color: AppTheme.primaryRed),
        suffixIcon: _searchController.text.isNotEmpty
            ? IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            _searchController.clear();
            setState(() {});
            Provider.of<EventProvider>(context, listen: false)
                .fetchAllEvents();
          },
        )
            : null,
      ),
      onChanged: (value) {
        setState(() {});
        _performSearch(value);
      },
    );
  }

  void _performSearch(String query) {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    eventProvider.fetchAllEvents(
      search: query.isEmpty ? null : query,
      category: _selectedCategory == 'Tous' ? null : _selectedCategory,
    );
  }

  Widget _buildCategoryFilter() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = category == _selectedCategory;

          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedCategory = category);
                _updateCategoryFilter(category);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.blackRedGradient : null,
                  color: isSelected ? null : AppTheme.lightGray,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    category,
                    style: AppTheme.bodyMedium.copyWith(
                      color: isSelected ? AppTheme.primaryWhite : AppTheme.primaryBlack,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _updateCategoryFilter(String category) {
    final eventProvider = Provider.of<EventProvider>(context, listen: false);
    eventProvider.fetchAllEvents(
      category: category == 'Tous' ? null : category,
      search: _searchController.text.isEmpty ? null : _searchController.text,
    );
  }

  Widget _buildEventsList() {
    return Consumer<EventProvider>(
      builder: (context, eventProvider, child) {
        if (eventProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryRed),
          );
        }

        if (eventProvider.error != null) {
          return Center(
            child: Text(
              eventProvider.error ?? 'Une erreur est survenue',
              style: AppTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          );
        }

        if (eventProvider.events.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.event_note,
                  size: 64,
                  color: AppTheme.lightGray,
                ),
                const SizedBox(height: 16),
                Text(
                  'Aucun événement trouvé',
                  style: AppTheme.bodyMedium,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: eventProvider.events.length,
          itemBuilder: (context, index) {
            final event = eventProvider.events[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: EventCard(
                event: event,
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/event-details',
                    arguments: event.id,
                  );
                },
              ),
            );
          },
        );
      },
    );
  }
}