import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/job_settings_model.dart';
import 'api_service.dart';

/// Job Settings Service
class JobSettingsService {
  final ApiService _apiService = ApiService();

  /// Get user's job settings
  Future<ApiResponse<JobSettingsModel>> getJobSettings() async {
    try {
      final response = await _apiService.get(ApiConstants.jobSettings);

      final jobSettings = JobSettingsModel.fromJson(response.data['jobSettings']);

      return ApiResponse(
        success: true,
        message: 'Job settings fetched successfully',
        data: jobSettings,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Create or update job settings
  Future<ApiResponse<JobSettingsModel>> saveJobSettings({
    required JobSettingsModel jobSettings,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.jobSettings,
        data: jobSettings.toJson(),
      );

      final updatedJobSettings = JobSettingsModel.fromJson(response.data['jobSettings']);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Job settings saved successfully',
        data: updatedJobSettings,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Upload resume
  Future<ApiResponse<Map<String, dynamic>>> uploadResume({
    required String filePath,
  }) async {
    try {
      final response = await _apiService.uploadFile(
        ApiConstants.jobSettingsResume,
        filePath,
        'resume',
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Resume uploaded successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete resume
  Future<ApiResponse<void>> deleteResume() async {
    try {
      final response = await _apiService.delete(ApiConstants.jobSettingsResume);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Resume deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Update Naukri credentials
  Future<ApiResponse<void>> updateNaukriCredentials({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.jobSettingsNaukriCredentials,
        data: {
          'naukriUsername': username,
          'naukriPassword': password,
        },
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Naukri credentials updated',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
