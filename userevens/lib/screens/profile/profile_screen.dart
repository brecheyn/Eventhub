import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/event_provider.dart';
import '../../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _nameController = TextEditingController(text: authProvider.user?.name ?? '');
    _phoneController = TextEditingController(text: authProvider.user?.phone ?? '');
    _bioController = TextEditingController(text: authProvider.user?.bio ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.check : Icons.edit),
            onPressed: _toggleEditing,
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const SizedBox(height: 16),
                _buildProfileAvatar(authProvider),
                const SizedBox(height: 32),
                _buildProfileForm(),
                const SizedBox(height: 32),
                _buildLogoutButton(context, authProvider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileAvatar(AuthProvider authProvider) {
    return Column(
      children: [
        CircleAvatar(
          radius: 50,
          backgroundColor: AppTheme.primaryRed,
          child: Text(
            (authProvider.user?.name ?? 'U').characters.first.toUpperCase(),
            style: AppTheme.headingLarge.copyWith(
              color: AppTheme.primaryWhite,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          authProvider.user?.name ?? 'Utilisateur',
          style: AppTheme.headingSmall,
        ),
        const SizedBox(height: 4),
        Text(
          authProvider.user?.email ?? '',
          style: AppTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildProfileForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Informations personnelles',
          style: AppTheme.headingSmall,
        ),
        const SizedBox(height: 16),
        _buildTextField('Nom', _nameController, Icons.person),
        const SizedBox(height: 16),
        _buildTextField('Téléphone', _phoneController, Icons.phone),
        const SizedBox(height: 16),
        _buildTextField('Bio', _bioController, Icons.description, maxLines: 4),
      ],
    );
  }

  Widget _buildTextField(
      String label,
      TextEditingController controller,
      IconData icon, {
        int maxLines = 1,
      }) {
    return TextField(
      controller: controller,
      enabled: _isEditing,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppTheme.primaryRed),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthProvider authProvider) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => _handleLogout(context, authProvider),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primaryRed,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: const Text('Se déconnecter'),
      ),
    );
  }

  void _toggleEditing() {
    if (_isEditing) {
      _saveProfile();
    }
    setState(() => _isEditing = !_isEditing);
  }

  Future<void> _saveProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.updateProfile(
      name: _nameController.text,
      phone: _phoneController.text,
      bio: _bioController.text,
    );
  }

  Future<void> _handleLogout(
      BuildContext context,
      AuthProvider authProvider,
      ) async {
    await authProvider.logout();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }
}