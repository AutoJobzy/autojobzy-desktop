import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import 'api_service.dart';

/// Profile Update Service
class ProfileUpdateService {
  final ApiService _apiService = ApiService();

  /// Update Naukri resume/profile
  Future<ApiResponse<Map<String, dynamic>>> updateNaukriProfile() async {
    try {
      final response = await _apiService.post(
        ApiConstants.profileUpdateNaukriUpdate,
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Profile updated successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get profile update result
  Future<ApiResponse<Map<String, dynamic>>> getUpdateResult() async {
    try {
      final response = await _apiService.get(
        ApiConstants.profileUpdateResult,
      );

      return ApiResponse(
        success: true,
        message: 'Update result fetched successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Configure scheduler for automatic profile updates
  Future<ApiResponse<Map<String, dynamic>>> configureScheduler({
    required bool enabled,
    required String frequency,
    String? time,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.profileUpdateSchedulerConfigure,
        data: {
          'enabled': enabled,
          'frequency': frequency,
          if (time != null) 'time': time,
        },
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Scheduler configured successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get scheduler status
  Future<ApiResponse<Map<String, dynamic>>> getSchedulerStatus() async {
    try {
      final response = await _apiService.get(
        ApiConstants.profileUpdateSchedulerStatus,
      );

      return ApiResponse(
        success: true,
        message: 'Scheduler status fetched successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
