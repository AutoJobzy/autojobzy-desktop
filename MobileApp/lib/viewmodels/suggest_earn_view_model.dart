import '../models/suggestion_model.dart';
import '../services/suggestion_service.dart';
import 'base_view_model.dart';

/// Suggest & Earn ViewModel
class SuggestEarnViewModel extends BaseViewModel {
  final SuggestionService _suggestionService = SuggestionService();

  List<SuggestionModel> _suggestions = [];
  Map<String, dynamic>? _stats;

  List<SuggestionModel> get suggestions => _suggestions;
  Map<String, dynamic>? get stats => _stats;

  /// Load all suggestions
  Future<bool> loadSuggestions() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _suggestionService.getSuggestions();

        if (response.success && response.data != null) {
          _suggestions = response.data!;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load suggestions');
        }
      },
      errorMessage: 'Failed to load suggestions',
    );

    return result ?? false;
  }

  /// Create new suggestion
  Future<bool> createSuggestion({
    required String title,
    required String description,
    required String category,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _suggestionService.createSuggestion(
          title: title,
          description: description,
          category: category,
        );

        if (response.success && response.data != null) {
          // Add new suggestion to list
          _suggestions.insert(0, response.data!);
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to create suggestion');
        }
      },
      errorMessage: 'Failed to create suggestion',
      successMessage: 'Suggestion submitted successfully',
    );

    return result ?? false;
  }

  /// Delete suggestion
  Future<bool> deleteSuggestion(String id) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _suggestionService.deleteSuggestion(id);

        if (response.success) {
          // Remove from local list
          _suggestions.removeWhere((s) => s.id == id);
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to delete suggestion');
        }
      },
      errorMessage: 'Failed to delete suggestion',
      successMessage: 'Suggestion deleted successfully',
    );

    return result ?? false;
  }

  /// Get suggestion statistics
  Future<bool> getStats() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _suggestionService.getStats();

        if (response.success && response.data != null) {
          _stats = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load statistics');
        }
      },
      errorMessage: 'Failed to load statistics',
    );

    return result ?? false;
  }

  /// Refresh suggestions and stats
  Future<bool> refresh() async {
    final result = await runBusyFuture<bool>(
      () async {
        await loadSuggestions();
        await getStats();
        return true;
      },
      errorMessage: 'Failed to refresh',
    );

    return result ?? false;
  }

  /// Initialize - Load suggestions and stats
  Future<bool> initialize() async {
    final result = await runBusyFuture<bool>(
      () async {
        await loadSuggestions();
        await getStats();
        return true;
      },
      errorMessage: 'Failed to initialize',
    );

    return result ?? false;
  }
}
