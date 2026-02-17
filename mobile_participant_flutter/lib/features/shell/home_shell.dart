import 'package:flutter/material.dart';

import '../certificates/certificates_page.dart';
import '../events/events_page.dart';
import '../home/home.dart';
import '../profile/profile_page.dart';
import '../tickets/tickets_page.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  late int _index;

  static const _pages = [
    HomePage(),
    EventsPage(),
    TicketsPage(),
    CertificatesPage(),
    ProfilePage(),
  ];

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.event), label: 'Événements'),
          NavigationDestination(
              icon: Icon(Icons.confirmation_number), label: 'Tickets'),
          NavigationDestination(
              icon: Icon(Icons.workspace_premium), label: 'Certificats'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
