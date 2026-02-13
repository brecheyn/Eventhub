import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';
import '../../certificates/presentation/certificates_screen.dart';
import '../../events/presentation/events_list_screen.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../tickets/presentation/tickets_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  static const _tabs = [
    EventsListScreen(),
    TicketsScreen(),
    CertificatesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = context.watch<AuthController>().isAuthenticated;

    if (!isAuthenticated) {
      return const LoginScreen();
    }

    return Scaffold(
      body: IndexedStack(index: _index, children: _tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.event), label: 'Evenements'),
          NavigationDestination(icon: Icon(Icons.confirmation_num), label: 'Tickets'),
          NavigationDestination(icon: Icon(Icons.workspace_premium), label: 'Certificats'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
