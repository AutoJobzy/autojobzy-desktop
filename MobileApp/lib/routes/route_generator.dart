import 'package:flutter/material.dart';
import 'app_routes.dart';
import '../views/auth_view/splash_view.dart';
import '../views/auth_view/login_view.dart';
import '../views/auth_view/signup_view.dart';
import '../views/auth_view/onboarding_view.dart';
import '../views/dashboard_view/dashboard_view.dart';
import '../views/job_profile_view/job_profile_view.dart';
import '../views/job_engine_view/job_engine_view.dart';
import '../views/my_activity_view/my_activity_view.dart';
import '../views/application_history_view/application_history_view.dart';
import '../views/my_plan_view/my_plan_view.dart';
import '../views/auto_profile_update_view/auto_profile_update_view.dart';
import '../views/suggest_earn_view/suggest_earn_view.dart';
import '../views/app_settings_view/app_settings_view.dart';

/// Route Generator for Navigation
class RouteGenerator {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    // ignore: unused_local_variable
    final args = settings.arguments;

    switch (settings.name) {
      case AppRoutes.splash:
        return _buildRoute(
          const SplashView(),
          settings,
        );

      case AppRoutes.onboarding:
        return _buildRoute(
          const OnboardingView(),
          settings,
        );

      case AppRoutes.login:
        return _buildRoute(
          const LoginView(),
          settings,
        );

      case AppRoutes.signup:
        return _buildRoute(
          const SignupView(),
          settings,
        );

      case AppRoutes.dashboard:
      // ignore: unreachable_switch_case
      case AppRoutes.home:
        return _buildRoute(
          const DashboardView(),
          settings,
        );

      case AppRoutes.jobEngine:
        return _buildRoute(
          const JobEngineView(),
          settings,
        );

      case AppRoutes.myActivity:
        return _buildRoute(
          const MyActivityView(),
          settings,
        );

      case AppRoutes.jobProfile:
        return _buildRoute(
          const JobProfileView(),
          settings,
        );

      case AppRoutes.autoProfileUpdate:
        return _buildRoute(
          const AutoProfileUpdateView(),
          settings,
        );

      case AppRoutes.applicationHistory:
        return _buildRoute(
          const ApplicationHistoryView(),
          settings,
        );

      case AppRoutes.myPlan:
        return _buildRoute(
          const MyPlanView(),
          settings,
        );

      case AppRoutes.suggestEarn:
        return _buildRoute(
          const SuggestEarnView(),
          settings,
        );

      case AppRoutes.appSettings:
        return _buildRoute(
          const AppSettingsView(),
          settings,
        );

      default:
        return _buildRoute(
          _errorRoute(settings.name ?? 'unknown'),
          settings,
        );
    }
  }

  static MaterialPageRoute _buildRoute(Widget page, RouteSettings settings) {
    return MaterialPageRoute(
      builder: (_) => page,
      settings: settings,
    );
  }

  // ignore: unused_element
  static Widget _placeholderScreen(String title) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Coming soon...',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _errorRoute(String routeName) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text(
              'Route not found!',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Route: $routeName',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
