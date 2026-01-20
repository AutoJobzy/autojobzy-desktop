import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/automation_log_model.dart';
import 'api_service.dart';

/// Automation Service
class AutomationService {
  final ApiService _apiService = ApiService();

  /// Start automation bot
  Future<ApiResponse<Map<String, dynamic>>> startAutomation({
    Map<String, dynamic>? filters,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.automationRunBot,
        data: filters ?? {},
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Automation started successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Stop automation bot
  Future<ApiResponse<void>> stopAutomation() async {
    try {
      final response = await _apiService.post(ApiConstants.automationStop);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Automation stopped successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get automation status
  Future<ApiResponse<AutomationStatusModel>> getAutomationStatus() async {
    try {
      final response = await _apiService.get(ApiConstants.automationStatus);

      final status = AutomationStatusModel.fromJson(response.data);

      return ApiResponse(
        success: true,
        message: 'Status fetched successfully',
        data: status,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get automation logs
  Future<ApiResponse<List<AutomationLogModel>>> getLogs({
    int limit = 100,
    int offset = 0,
  }) async {
    try {
      final response = await _apiService.get(
        ApiConstants.automationLogs,
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );

      final logs = (response.data['logs'] as List)
          .map((log) => AutomationLogModel.fromJson(log))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Logs fetched successfully',
        data: logs,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Schedule automation
  Future<ApiResponse<void>> scheduleAutomation({
    required String scheduleTime,
    required bool enabled,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.automationSchedule,
        data: {
          'scheduleTime': scheduleTime,
          'enabled': enabled,
        },
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Schedule updated successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get schedule
  Future<ApiResponse<Map<String, dynamic>>> getSchedule() async {
    try {
      final response = await _apiService.get(ApiConstants.automationSchedule);

      return ApiResponse(
        success: true,
        message: 'Schedule fetched successfully',
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
