import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/suggestion_model.dart';
import 'api_service.dart';

/// Suggestion/Feedback Service
class SuggestionService {
  final ApiService _apiService = ApiService();

  /// Get all user suggestions
  Future<ApiResponse<List<SuggestionModel>>> getSuggestions() async {
    try {
      final response = await _apiService.get(ApiConstants.suggestions);

      final suggestions = (response.data['suggestions'] as List)
          .map((suggestion) => SuggestionModel.fromJson(suggestion))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Suggestions fetched successfully',
        data: suggestions,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Create new suggestion
  Future<ApiResponse<SuggestionModel>> createSuggestion({
    required String title,
    required String description,
    required String category,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.suggestions,
        data: {
          'title': title,
          'description': description,
          'category': category,
        },
      );

      final suggestion = SuggestionModel.fromJson(response.data['suggestion']);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Suggestion submitted successfully',
        data: suggestion,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get suggestion by ID
  Future<ApiResponse<SuggestionModel>> getSuggestionById(String id) async {
    try {
      final response = await _apiService.get('${ApiConstants.suggestions}/$id');

      final suggestion = SuggestionModel.fromJson(response.data['suggestion']);

      return ApiResponse(
        success: true,
        message: 'Suggestion fetched successfully',
        data: suggestion,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete suggestion
  Future<ApiResponse<void>> deleteSuggestion(String id) async {
    try {
      final response = await _apiService.delete('${ApiConstants.suggestions}/$id');

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Suggestion deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get suggestion statistics
  Future<ApiResponse<Map<String, dynamic>>> getStats() async {
    try {
      final response = await _apiService.get(ApiConstants.suggestionsStats);

      return ApiResponse(
        success: true,
        message: 'Stats fetched successfully',
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
