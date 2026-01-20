import '../models/user_model.dart';
import '../services/auth_service.dart';
import 'base_view_model.dart';

/// Authentication ViewModel
/// Handles login, signup, and authentication state
class AuthViewModel extends BaseViewModel {
  final AuthService _authService = AuthService();

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  /// Login with email and password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _authService.login(
          email: email,
          password: password,
        );

        if (response.success && response.data != null) {
          _currentUser = response.data!.user;
          notifyListeners();
          return true;
        } else {
          throw Exception(response.error ?? 'Login failed');
        }
      },
      errorMessage: 'Failed to login. Please check your credentials.',
    );

    return result ?? false;
  }

  /// Sign up with user details
  Future<bool> signup({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _authService.signup(
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
        );

        if (response.success && response.data != null) {
          _currentUser = response.data!.user;
          notifyListeners();
          return true;
        } else {
          throw Exception(response.error ?? 'Signup failed');
        }
      },
      errorMessage: 'Failed to create account. Please try again.',
    );

    return result ?? false;
  }

  /// Verify Naukri credentials
  Future<bool> verifyNaukriCredentials({
    required String username,
    required String password,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _authService.verifyNaukriCredentials(
          username: username,
          password: password,
        );

        if (response.success) {
          return true;
        } else {
          throw Exception(response.error ?? 'Invalid Naukri credentials');
        }
      },
      errorMessage: 'Failed to verify Naukri credentials.',
    );

    return result ?? false;
  }

  /// Complete onboarding
  Future<bool> completeOnboarding() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _authService.completeOnboarding();

        if (response.success && response.data != null) {
          _currentUser = response.data;
          notifyListeners();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to complete onboarding');
        }
      },
      errorMessage: 'Failed to complete onboarding.',
    );

    return result ?? false;
  }

  /// Load current user from storage
  Future<void> loadCurrentUser() async {
    _currentUser = await _authService.getCurrentUser();
    notifyListeners();
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return await _authService.isLoggedIn();
  }

  /// Logout user
  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    notifyListeners();
  }
}
