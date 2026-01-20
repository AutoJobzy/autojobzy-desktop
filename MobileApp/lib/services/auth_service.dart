import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';
import 'api_service.dart';
import 'local_storage_service.dart';

/// Authentication Service
class AuthService {
  final ApiService _apiService = ApiService();
  final LocalStorageService _storageService = LocalStorageService();

  /// Login with email and password
  Future<ApiResponse<AuthResponseModel>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.authLogin,
        data: {
          'email': email,
          'password': password,
        },
      );

      final authResponse = AuthResponseModel.fromJson(response.data);

      // Save token and user data locally
      await _storageService.saveToken(authResponse.token);
      await _storageService.saveUser(authResponse.user);
      await _storageService.setLoggedIn(true);

      return ApiResponse(
        success: true,
        message: authResponse.message,
        data: authResponse,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Sign up with user details
  Future<ApiResponse<AuthResponseModel>> signup({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.authSignup,
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          if (phone != null) 'phone': phone,
        },
      );

      final authResponse = AuthResponseModel.fromJson(response.data);

      // Save token and user data locally
      await _storageService.saveToken(authResponse.token);
      await _storageService.saveUser(authResponse.user);
      await _storageService.setLoggedIn(true);

      return ApiResponse(
        success: true,
        message: authResponse.message,
        data: authResponse,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Complete onboarding
  Future<ApiResponse<UserModel>> completeOnboarding() async {
    try {
      final response = await _apiService.post(
        ApiConstants.authCompleteOnboarding,
      );

      final user = UserModel.fromJson(response.data['user']);

      // Update user data locally
      await _storageService.saveUser(user);
      await _storageService.setOnboardingCompleted(true);

      return ApiResponse(
        success: true,
        message: response.data['message'],
        data: user,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Verify Naukri credentials
  Future<ApiResponse<Map<String, dynamic>>> verifyNaukriCredentials({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.authVerifyNaukriCredentials,
        data: {
          'naukriUsername': username,
          'naukriPassword': password,
        },
      );

      return ApiResponse(
        success: true,
        message: response.data['message'],
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get current user from local storage
  Future<UserModel?> getCurrentUser() async {
    return await _storageService.getUser();
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return await _storageService.isLoggedIn();
  }

  /// Logout user
  Future<void> logout() async {
    await _storageService.logout();
  }
}
