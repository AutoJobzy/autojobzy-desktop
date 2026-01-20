import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/user_filter_model.dart';
import 'api_service.dart';

/// Filter Service
class FilterService {
  final ApiService _apiService = ApiService();

  /// Get all available filter options
  Future<ApiResponse<List<FilterOptionModel>>> getAllFilterOptions() async {
    try {
      final response = await _apiService.get(ApiConstants.filtersAll);

      final filters = (response.data['filters'] as List)
          .map((filter) => FilterOptionModel.fromJson(filter))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Filter options fetched successfully',
        data: filters,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get user's saved filters
  Future<ApiResponse<List<UserFilterModel>>> getUserFilters() async {
    try {
      final response = await _apiService.get(ApiConstants.filtersUser);

      final filters = (response.data['filters'] as List)
          .map((filter) => UserFilterModel.fromJson(filter))
          .toList();

      return ApiResponse(
        success: true,
        message: 'User filters fetched successfully',
        data: filters,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Save user filter
  Future<ApiResponse<Map<String, dynamic>>> saveFilter({
    required Map<String, dynamic> filterData,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.filtersUser,
        data: filterData, // Send filter data directly (not wrapped)
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Filter saved successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Update user filter
  Future<ApiResponse<UserFilterModel>> updateFilter({
    required String filterId,
    String? name,
    Map<String, dynamic>? filters,
    bool? isActive,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (filters != null) data['filters'] = filters;
      if (isActive != null) data['isActive'] = isActive;

      final response = await _apiService.put(
        '${ApiConstants.filtersUser}/$filterId',
        data: data,
      );

      final filter = UserFilterModel.fromJson(response.data['filter']);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Filter updated successfully',
        data: filter,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete user filter
  Future<ApiResponse<void>> deleteFilter(String filterId) async {
    try {
      final response = await _apiService.delete(
        '${ApiConstants.filtersUser}/$filterId',
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Filter deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
