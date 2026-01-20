import 'package:flutter/material.dart';
import '../../constants/color_constants.dart';
import '../../constants/string_constants.dart';
import '../../constants/route_constants.dart';
import '../../services/local_storage_service.dart';

/// Splash Screen - Initial loading and auth check
class SplashView extends StatefulWidget {
  const SplashView({Key? key}) : super(key: key);

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with SingleTickerProviderStateMixin {
  final LocalStorageService _storageService = LocalStorageService();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _checkAuthStatus();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutBack),
      ),
    );

    _animationController.forward();
  }

  Future<void> _checkAuthStatus() async {
    // Wait for animation to complete
    await Future.delayed(const Duration(milliseconds: 2000));

    try {
      final isLoggedIn = await _storageService.isLoggedIn();
      final token = await _storageService.getToken();

      if (!mounted) return;

      if (isLoggedIn && token != null) {
        // Check if onboarding is completed
        final isOnboardingCompleted = await _storageService.isOnboardingCompleted();

        if (isOnboardingCompleted) {
          // Navigate to home screen
          Navigator.pushReplacementNamed(context, RouteConstants.home);
        } else {
          // Navigate to onboarding screen
          Navigator.pushReplacementNamed(context, RouteConstants.onboarding);
        }
      } else {
        // Navigate to login screen
        Navigator.pushReplacementNamed(context, RouteConstants.login);
      }
    } catch (e) {
      // On error, navigate to login
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, RouteConstants.login);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: ColorConstants.primaryGradient,
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Opacity(
                opacity: _fadeAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // App Logo/Icon
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.work_outline,
                          size: 60,
                          color: ColorConstants.primaryBlue,
                        ),
                      ),
                      const SizedBox(height: 30),

                      // App Name
                      const Text(
                        StringConstants.appName,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Tagline
                      const Text(
                        'Automate Your Job Search',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white70,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 50),

                      // Loading Indicator
                      const SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 3,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
