import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/config/app_config.dart';
import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/auth_service.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/certificates/data/certificate_service.dart';
import 'features/certificates/presentation/certificates_controller.dart';
import 'features/events/presentation/event_detail_screen.dart';
import 'features/home/presentation/home_shell.dart';
import 'features/tickets/data/ticket_service.dart';
import 'features/tickets/presentation/tickets_controller.dart';

void runEventHubParticipantApp() {
  final tokenStorage = TokenStorage();
  final apiClient = ApiClient(
    tokenStorage: tokenStorage,
    baseApiUrl: AppConfig.baseApiUrl,
  );

  runApp(EventHubParticipantApp(
    tokenStorage: tokenStorage,
    apiClient: apiClient,
  ));
}

class EventHubParticipantApp extends StatelessWidget {
  const EventHubParticipantApp({
    super.key,
    required this.tokenStorage,
    required this.apiClient,
  });

  final TokenStorage tokenStorage;
  final ApiClient apiClient;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider.value(value: apiClient),
        ChangeNotifierProvider(
          create: (_) => AuthController(
            authService: AuthService(apiClient),
            tokenStorage: tokenStorage,
            apiClient: apiClient,
          )..bootstrap(),
        ),
        ChangeNotifierProvider(
          create: (_) => TicketsController(TicketService(apiClient)),
        ),
        ChangeNotifierProvider(
          create: (_) => CertificatesController(CertificateService(apiClient)),
        ),
      ],
      child: MaterialApp(
        title: 'EventHub Participant',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routes: {
          LoginScreen.routeName: (_) => const LoginScreen(),
          RegisterScreen.routeName: (_) => const RegisterScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == EventDetailScreen.routeName) {
            final args = settings.arguments as EventDetailArgs;
            return MaterialPageRoute(
              builder: (_) => EventDetailScreen(args: args),
            );
          }
          return null;
        },
        home: const _AppEntryPoint(),
      ),
    );
  }
}

class _AppEntryPoint extends StatefulWidget {
  const _AppEntryPoint();

  @override
  State<_AppEntryPoint> createState() => _AppEntryPointState();
}

class _AppEntryPointState extends State<_AppEntryPoint> {
  bool _loadedInitialData = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = context.watch<AuthController>();
    if (auth.isAuthenticated && !_loadedInitialData) {
      _loadedInitialData = true;
      context.read<TicketsController>().loadMyTickets();
      context.read<CertificatesController>().loadMyCertificates();
    }
    if (!auth.isAuthenticated) {
      _loadedInitialData = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    if (auth.isBootstrapping) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return auth.isAuthenticated ? const HomeShell() : const LoginScreen();
  }
}

