import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/color_constants.dart';
import '../../constants/route_constants.dart';
import '../../viewmodels/auth_view_model.dart';

/// Home Screen - Main Dashboard with Bottom Navigation
class HomeView extends StatefulWidget {
  const HomeView({Key? key}) : super(key: key);

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const _JobEngineTab(),
    const _MyActivityTab(),
    const _JobProfileTab(),
    const _MoreTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: ColorConstants.primaryBlue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.play_circle_outline),
            activeIcon: Icon(Icons.play_circle),
            label: 'Job Engine',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics_outlined),
            activeIcon: Icon(Icons.analytics),
            label: 'Activity',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu),
            activeIcon: Icon(Icons.menu_open),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

/// Job Engine Tab - Placeholder
class _JobEngineTab extends StatelessWidget {
  const _JobEngineTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Engine'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.play_circle_outline,
              size: 80,
              color: ColorConstants.primaryBlue.withOpacity(0.5),
            ),
            const SizedBox(height: 20),
            const Text(
              'Job Engine',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Control your job automation here',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// My Activity Tab - Placeholder
class _MyActivityTab extends StatelessWidget {
  const _MyActivityTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Activity'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.analytics_outlined,
              size: 80,
              color: ColorConstants.primaryBlue.withOpacity(0.5),
            ),
            const SizedBox(height: 20),
            const Text(
              'My Activity',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'View your application statistics',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Job Profile Tab - Placeholder
class _JobProfileTab extends StatelessWidget {
  const _JobProfileTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Profile'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.person_outline,
              size: 80,
              color: ColorConstants.primaryBlue.withOpacity(0.5),
            ),
            const SizedBox(height: 20),
            const Text(
              'Job Profile',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Manage your job profile and preferences',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// More Tab - Settings and Other Options
class _MoreTab extends StatelessWidget {
  const _MoreTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('More'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildMenuItem(
            context,
            icon: Icons.update,
            title: 'Auto Profile Update',
            subtitle: 'Keep your profile fresh',
            onTap: () {
              Navigator.pushNamed(context, RouteConstants.autoProfileUpdate);
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.history,
            title: 'Application History',
            subtitle: 'View all your applications',
            onTap: () {
              Navigator.pushNamed(context, RouteConstants.applicationHistory);
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.card_membership,
            title: 'My Plan',
            subtitle: 'Manage your subscription',
            onTap: () {
              Navigator.pushNamed(context, RouteConstants.myPlan);
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.lightbulb_outline,
            title: 'Suggest & Earn',
            subtitle: 'Share feedback and earn rewards',
            onTap: () {
              Navigator.pushNamed(context, RouteConstants.suggestEarn);
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.settings,
            title: 'App Settings',
            subtitle: 'Preferences and configuration',
            onTap: () {
              Navigator.pushNamed(context, RouteConstants.appSettings);
            },
          ),
          const Divider(height: 32),
          _buildMenuItem(
            context,
            icon: Icons.logout,
            title: 'Logout',
            subtitle: 'Sign out of your account',
            isDestructive: true,
            onTap: () async {
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
                      child: const Text('Logout'),
                    ),
                  ],
                ),
              );

              if (shouldLogout == true && context.mounted) {
                await context.read<AuthViewModel>().logout();
                if (context.mounted) {
                  Navigator.pushReplacementNamed(context, RouteConstants.login);
                }
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isDestructive
                ? ColorConstants.error.withOpacity(0.1)
                : ColorConstants.primaryBlue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: isDestructive ? ColorConstants.error : ColorConstants.primaryBlue,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: isDestructive ? ColorConstants.error : null,
          ),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
