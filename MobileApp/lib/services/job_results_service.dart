import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/job_application_result_model.dart';
import '../models/job_result_stats_model.dart';
import 'api_service.dart';

/// Job Results Service
class JobResultsService {
  final ApiService _apiService = ApiService();

  /// Get job application results with pagination
  Future<ApiResponse<Map<String, dynamic>>> getJobResults({
    int page = 1,
    int limit = 20,
    String? status,
    String? startDate,
    String? endDate,
    int? minScore,
    int? maxScore,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (status != null) queryParams['status'] = status;
      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;
      if (minScore != null) queryParams['minScore'] = minScore;
      if (maxScore != null) queryParams['maxScore'] = maxScore;

      final response = await _apiService.get(
        ApiConstants.jobResults,
        queryParameters: queryParams,
      );

      final results = (response.data['results'] as List)
          .map((result) => JobApplicationResultModel.fromJson(result))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Job results fetched successfully',
        data: {
          'results': results,
          'total': response.data['total'] ?? 0,
          'page': response.data['page'] ?? 1,
          'totalPages': response.data['totalPages'] ?? 1,
        },
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get job application statistics
  Future<ApiResponse<JobResultStatsModel>> getStats({
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{};

      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;

      final response = await _apiService.get(
        ApiConstants.jobResultsStats,
        queryParameters: queryParams,
      );

      final stats = JobResultStatsModel.fromJson(response.data);

      return ApiResponse(
        success: true,
        message: 'Stats fetched successfully',
        data: stats,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get single job result by ID
  Future<ApiResponse<JobApplicationResultModel>> getJobResultById(
    String id,
  ) async {
    try {
      final response = await _apiService.get('${ApiConstants.jobResults}/$id');

      final result = JobApplicationResultModel.fromJson(response.data['result']);

      return ApiResponse(
        success: true,
        message: 'Job result fetched successfully',
        data: result,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete job result
  Future<ApiResponse<void>> deleteJobResult(String id) async {
    try {
      final response = await _apiService.delete('${ApiConstants.jobResults}/$id');

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Job result deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Export job results
  Future<ApiResponse<String>> exportResults({
    String format = 'csv',
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'format': format,
      };

      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;

      final response = await _apiService.get(
        ApiConstants.jobResultsExport,
        queryParameters: queryParams,
      );

      return ApiResponse(
        success: true,
        message: 'Export generated successfully',
        data: response.data['downloadUrl'] as String,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
