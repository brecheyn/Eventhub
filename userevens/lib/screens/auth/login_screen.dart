import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/event_provider.dart';
import '../../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: AppTheme.blackRedGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 32),
                Text(
                  'EventHub',
                  style: AppTheme.headingLarge.copyWith(color: AppTheme.primaryWhite),
                ),
                const SizedBox(height: 8),
                Text(
                  'Connectez-vous à votre compte',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppTheme.primaryWhite.withOpacity(0.8),
                  ),
                ),
                const SizedBox(height: 48),
                _buildEmailField(),
                const SizedBox(height: 16),
                _buildPasswordField(),
                const SizedBox(height: 32),
                _buildLoginButton(context),
                const SizedBox(height: 16),
                _buildSignupLink(context),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailField() {
    return TextField(
      controller: _emailController,
      style: const TextStyle(color: AppTheme.primaryBlack),
      decoration: InputDecoration(
        hintText: 'Email',
        hintStyle: AppTheme.bodyMedium.copyWith(color: Colors.grey),
        prefixIcon: const Icon(Icons.email, color: AppTheme.primaryRed),
      ),
    );
  }

  Widget _buildPasswordField() {
    return TextField(
      controller: _passwordController,
      obscureText: _obscurePassword,
      style: const TextStyle(color: AppTheme.primaryBlack),
      decoration: InputDecoration(
        hintText: 'Mot de passe',
        hintStyle: AppTheme.bodyMedium.copyWith(color: Colors.grey),
        prefixIcon: const Icon(Icons.lock, color: AppTheme.primaryRed),
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off : Icons.visibility,
            color: AppTheme.primaryRed,
          ),
          onPressed: () {
            setState(() => _obscurePassword = !_obscurePassword);
          },
        ),
      ),
    );
  }

  Widget _buildLoginButton(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: authProvider.isLoading
                ? null
                : () => _handleLogin(context, authProvider),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryWhite,
              foregroundColor: AppTheme.primaryRed,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: authProvider.isLoading
                ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor:
                AlwaysStoppedAnimation(AppTheme.primaryRed),
              ),
            )
                : const Text('Se connecter'),
          ),
        );
      },
    );
  }

  Widget _buildSignupLink(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: () {
          Navigator.of(context).pushNamed('/signup');
        },
        child: RichText(
          text: TextSpan(
            text: 'Pas encore de compte? ',
            style: AppTheme.bodyMedium.copyWith(color: AppTheme.primaryWhite),
            children: [
              TextSpan(
                text: 'S\'inscrire',
                style: AppTheme.bodyMedium.copyWith(
                  color: AppTheme.primaryWhite,
                  fontWeight: FontWeight.bold,
                  decoration: TextDecoration.underline,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin(
      BuildContext context,
      AuthProvider authProvider,
      ) async {
    // Validation basique
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez remplir tous les champs')),
        );
      }
      return;
    }

    final success = await authProvider.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (success && mounted) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Erreur de connexion'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}