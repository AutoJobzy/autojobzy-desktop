import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/color_constants.dart';
import '../../viewmodels/app_settings_view_model.dart';
import '../../widgets/common_button.dart';

/// App Settings Screen
class AppSettingsView extends StatefulWidget {
  const AppSettingsView({Key? key}) : super(key: key);

  @override
  State<AppSettingsView> createState() => _AppSettingsViewState();
}

class _AppSettingsViewState extends State<AppSettingsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppSettingsViewModel>().initialize();
    });
  }

  Future<void> _handleClearCache() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cache'),
        content: const Text(
          'This will clear all cached data. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: ColorConstants.error,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final viewModel = context.read<AppSettingsViewModel>();
      final success = await viewModel.clearCache();

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cache cleared successfully'),
            backgroundColor: ColorConstants.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(viewModel.errorMessage ?? 'Failed to clear cache'),
            backgroundColor: ColorConstants.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('App Settings'),
        elevation: 0,
      ),
      body: Consumer<AppSettingsViewModel>(
        builder: (context, viewModel, child) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Theme Settings
              _buildThemeSection(viewModel),
              const SizedBox(height: 20),

              // Cache & Storage
              _buildCacheSection(viewModel),
              const SizedBox(height: 20),

              // App Info
              _buildAppInfoSection(viewModel),
              const SizedBox(height: 20),

              // About Section
              _buildAboutSection(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildThemeSection(AppSettingsViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.palette,
                    color: ColorConstants.primaryBlue,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Theme',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Theme Mode Options
            _buildThemeOption(
              viewModel,
              'Light',
              'light',
              Icons.light_mode,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              viewModel,
              'Dark',
              'dark',
              Icons.dark_mode,
            ),
            const SizedBox(height: 12),
            _buildThemeOption(
              viewModel,
              'System Default',
              'system',
              Icons.settings_brightness,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(
    AppSettingsViewModel viewModel,
    String label,
    String value,
    IconData icon,
  ) {
    final isSelected = viewModel.themeMode == value;

    return InkWell(
      onTap: () async {
        await viewModel.setThemeMode(value);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? ColorConstants.primaryBlue.withOpacity(0.1)
              : ColorConstants.cardLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? ColorConstants.primaryBlue
                : ColorConstants.borderLight,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? ColorConstants.primaryBlue
                  : ColorConstants.textSecondary,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected
                      ? ColorConstants.primaryBlue
                      : ColorConstants.textDark,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: ColorConstants.primaryBlue,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCacheSection(AppSettingsViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryPurple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.storage,
                    color: ColorConstants.primaryPurple,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Cache & Storage',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Clear cached data to free up storage space. This will not delete your saved information.',
              style: TextStyle(
                fontSize: 14,
                color: ColorConstants.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            CommonButton(
              text: 'Clear Cache',
              onPressed: _handleClearCache,
              isLoading: viewModel.isBusy,
              color: ColorConstants.error,
              icon: const Icon(Icons.delete_outline, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppInfoSection(AppSettingsViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.info_outline,
                    color: ColorConstants.info,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'App Information',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // App Version
            _buildInfoRow('App Version', viewModel.appVersion),
            const Divider(height: 24),
            _buildInfoRow('Build', '1'),
            const Divider(height: 24),
            _buildInfoRow('Platform', 'Flutter'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 15,
            color: ColorConstants.textSecondary,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: ColorConstants.textDark,
          ),
        ),
      ],
    );
  }

  Widget _buildAboutSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.help_outline,
                    color: ColorConstants.success,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'About',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'AutoJobzy',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: ColorConstants.textDark,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Your intelligent job application automation assistant. AutoJobzy helps you streamline your job search by automatically applying to relevant positions, keeping your profile updated, and tracking your application progress.',
              style: TextStyle(
                fontSize: 14,
                color: ColorConstants.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),

            // Contact & Support Links
            _buildAboutLink(
              icon: Icons.language,
              text: 'Website',
              onTap: () {
                // TODO: Open website
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening website...')),
                );
              },
            ),
            const SizedBox(height: 12),
            _buildAboutLink(
              icon: Icons.privacy_tip_outlined,
              text: 'Privacy Policy',
              onTap: () {
                // TODO: Open privacy policy
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening privacy policy...')),
                );
              },
            ),
            const SizedBox(height: 12),
            _buildAboutLink(
              icon: Icons.description_outlined,
              text: 'Terms of Service',
              onTap: () {
                // TODO: Open terms of service
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening terms of service...')),
                );
              },
            ),
            const SizedBox(height: 12),
            _buildAboutLink(
              icon: Icons.support_agent,
              text: 'Support',
              onTap: () {
                // TODO: Open support
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening support...')),
                );
              },
            ),
            const SizedBox(height: 20),

            // Copyright
            Center(
              child: Text(
                '© 2024 AutoJobzy. All rights reserved.',
                style: TextStyle(
                  fontSize: 12,
                  color: ColorConstants.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutLink({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        decoration: BoxDecoration(
          color: ColorConstants.cardLight,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: ColorConstants.textSecondary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 15,
                  color: ColorConstants.textDark,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right,
              size: 20,
              color: ColorConstants.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
