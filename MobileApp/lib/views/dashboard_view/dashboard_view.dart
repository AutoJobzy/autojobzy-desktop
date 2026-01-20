import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/color_constants.dart';
import '../../constants/route_constants.dart';
import '../../viewmodels/auth_view_model.dart';
import '../job_engine_view/job_engine_view.dart';
import '../job_profile_view/job_profile_view.dart';
import '../application_history_view/application_history_view.dart';
import '../my_activity_view/my_activity_view.dart';
import '../my_plan_view/my_plan_view.dart';
import '../auto_profile_update_view/auto_profile_update_view.dart';
import '../suggest_earn_view/suggest_earn_view.dart';
import '../app_settings_view/app_settings_view.dart';

/// Dashboard View - Main Screen with Drawer Navigation
/// Matches Desktop Electron App Structure
class DashboardView extends StatefulWidget {
  final String? initialTab;

  const DashboardView({Key? key, this.initialTab}) : super(key: key);

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  String _activeTab = 'overview'; // Default tab matching desktop

  // Tab configurations matching desktop Dashboard.tsx
  final List<DashboardTab> _tabs = [
    DashboardTab(
      id: 'overview',
      title: 'Job Engine',
      subtitle: 'Control automation & view logs',
      icon: Icons.play_circle_outline,
      activeIcon: Icons.play_circle,
    ),
    DashboardTab(
      id: 'config',
      title: 'Job Profile',
      subtitle: 'Manage your profile & settings',
      icon: Icons.person_outline,
      activeIcon: Icons.person,
    ),
    DashboardTab(
      id: 'history',
      title: 'Application History',
      subtitle: 'View all your applications',
      icon: Icons.history,
      activeIcon: Icons.history,
    ),
    DashboardTab(
      id: 'analytics',
      title: 'My Activity',
      subtitle: 'Stats & analytics',
      icon: Icons.analytics_outlined,
      activeIcon: Icons.analytics,
    ),
    DashboardTab(
      id: 'plans',
      title: 'My Plan',
      subtitle: 'Manage subscription',
      icon: Icons.card_membership_outlined,
      activeIcon: Icons.card_membership,
    ),
    DashboardTab(
      id: 'auto-profile',
      title: 'Auto Profile Update',
      subtitle: 'Keep profile fresh',
      icon: Icons.update_outlined,
      activeIcon: Icons.update,
    ),
    DashboardTab(
      id: 'suggestions',
      title: 'Suggest & Earn',
      subtitle: 'Share feedback & earn',
      icon: Icons.lightbulb_outline,
      activeIcon: Icons.lightbulb,
    ),
    DashboardTab(
      id: 'settings',
      title: 'App Settings',
      subtitle: 'Preferences & configuration',
      icon: Icons.settings_outlined,
      activeIcon: Icons.settings,
    ),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialTab != null) {
      _activeTab = widget.initialTab!;
    }
  }

  Widget _buildCurrentTabContent() {
    switch (_activeTab) {
      case 'overview':
        return const JobEngineView();
      case 'config':
        return const JobProfileView();
      case 'history':
        return const ApplicationHistoryView();
      case 'analytics':
        return const MyActivityView();
      case 'plans':
        return const MyPlanView();
      case 'auto-profile':
        return const AutoProfileUpdateView();
      case 'suggestions':
        return const SuggestEarnView();
      case 'settings':
        return const AppSettingsView();
      default:
        return const JobEngineView();
    }
  }

  DashboardTab _getCurrentTab() {
    return _tabs.firstWhere(
      (tab) => tab.id == _activeTab,
      orElse: () => _tabs[0],
    );
  }

  void _handleTabChange(String tabId) {
    setState(() {
      _activeTab = tabId;
    });
    Navigator.pop(context); // Close drawer
  }

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
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
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (shouldLogout == true && mounted) {
      Navigator.pop(context); // Close drawer
      await context.read<AuthViewModel>().logout();
      if (mounted) {
        Navigator.pushReplacementNamed(context, RouteConstants.login);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentTab = _getCurrentTab();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              currentTab.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              currentTab.subtitle,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.normal,
                color: Colors.white70,
              ),
            ),
          ],
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: ColorConstants.primaryGradient,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      drawer: _buildDrawer(),
      body: _buildCurrentTabContent(),
    );
  }

  Widget _buildDrawer() {
    final authViewModel = context.watch<AuthViewModel>();
    final user = authViewModel.currentUser;

    return Drawer(
      child: Column(
        children: [
          // User Profile Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 50, 16, 20),
            decoration: BoxDecoration(
              gradient: ColorConstants.primaryGradient,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 35,
                  backgroundColor: Colors.white,
                  child: Text(
                    user != null && user.fullName.isNotEmpty
                        ? user.fullName.substring(0, 1).toUpperCase()
                        : user?.email.substring(0, 1).toUpperCase() ?? 'A',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.primaryBlue,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  user != null && user.fullName.isNotEmpty
                      ? user.fullName
                      : 'AutoJobzy User',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? 'user@autojobzy.com',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),

          // Menu Items
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                ..._tabs.map((tab) => _buildDrawerItem(tab)),
                const Divider(height: 1),
                _buildLogoutItem(),
              ],
            ),
          ),

          // App Version Footer
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'AutoJobzy Mobile v1.0.0',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(DashboardTab tab) {
    final isActive = _activeTab == tab.id;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isActive
            ? ColorConstants.primaryBlue.withValues(alpha: 0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          isActive ? tab.activeIcon : tab.icon,
          color: isActive ? ColorConstants.primaryBlue : Colors.grey.shade700,
        ),
        title: Text(
          tab.title,
          style: TextStyle(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? ColorConstants.primaryBlue : Colors.grey.shade900,
          ),
        ),
        subtitle: Text(
          tab.subtitle,
          style: TextStyle(
            fontSize: 12,
            color: isActive ? ColorConstants.primaryBlue : Colors.grey.shade600,
          ),
        ),
        selected: isActive,
        onTap: () => _handleTabChange(tab.id),
      ),
    );
  }

  Widget _buildLogoutItem() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          Icons.logout,
          color: ColorConstants.error,
        ),
        title: const Text(
          'Logout',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: ColorConstants.error,
          ),
        ),
        subtitle: Text(
          'Sign out of your account',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
        onTap: _handleLogout,
      ),
    );
  }
}

/// Dashboard Tab Model
class DashboardTab {
  final String id;
  final String title;
  final String subtitle;
  final IconData icon;
  final IconData activeIcon;

  DashboardTab({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.activeIcon,
  });
}
