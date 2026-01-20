import '../models/job_application_result_model.dart';
import '../services/job_results_service.dart';
import 'base_view_model.dart';

/// Application History ViewModel
class ApplicationHistoryViewModel extends BaseViewModel {
  final JobResultsService _jobResultsService = JobResultsService();

  List<JobApplicationResultModel> _results = [];
  int _currentPage = 1;
  int _totalPages = 1;
  int _total = 0;

  // Filters
  String? _statusFilter;
  String? _startDateFilter;
  String? _endDateFilter;
  int? _minScoreFilter;
  int? _maxScoreFilter;

  List<JobApplicationResultModel> get results => _results;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  int get total => _total;
  bool get hasMore => _currentPage < _totalPages;

  String? get statusFilter => _statusFilter;
  String? get startDateFilter => _startDateFilter;
  String? get endDateFilter => _endDateFilter;
  int? get minScoreFilter => _minScoreFilter;
  int? get maxScoreFilter => _maxScoreFilter;

  /// Load job results
  Future<bool> loadResults({
    int page = 1,
    int limit = 20,
    bool resetList = true,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobResultsService.getJobResults(
          page: page,
          limit: limit,
          status: _statusFilter,
          startDate: _startDateFilter,
          endDate: _endDateFilter,
          minScore: _minScoreFilter,
          maxScore: _maxScoreFilter,
        );

        if (response.success && response.data != null) {
          final data = response.data!;
          final newResults =
              data['results'] as List<JobApplicationResultModel>;

          if (resetList) {
            _results = newResults;
          } else {
            _results.addAll(newResults);
          }

          _currentPage = data['page'] ?? page;
          _totalPages = data['totalPages'] ?? 1;
          _total = data['total'] ?? 0;

          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load results');
        }
      },
      errorMessage: 'Failed to load results',
    );

    return result ?? false;
  }

  /// Load more results (pagination)
  Future<bool> loadMore() async {
    if (!hasMore) return false;

    return await loadResults(
      page: _currentPage + 1,
      resetList: false,
    );
  }

  /// Apply filters
  Future<bool> applyFilters({
    String? status,
    String? startDate,
    String? endDate,
    int? minScore,
    int? maxScore,
  }) async {
    _statusFilter = status;
    _startDateFilter = startDate;
    _endDateFilter = endDate;
    _minScoreFilter = minScore;
    _maxScoreFilter = maxScore;

    return await loadResults(page: 1, resetList: true);
  }

  /// Clear filters
  Future<bool> clearFilters() async {
    _statusFilter = null;
    _startDateFilter = null;
    _endDateFilter = null;
    _minScoreFilter = null;
    _maxScoreFilter = null;

    return await loadResults(page: 1, resetList: true);
  }

  /// Export results
  Future<String?> exportResults({
    String format = 'csv',
    String? startDate,
    String? endDate,
  }) async {
    final result = await runBusyFuture<String?>(
      () async {
        final response = await _jobResultsService.exportResults(
          format: format,
          startDate: startDate,
          endDate: endDate,
        );

        if (response.success && response.data != null) {
          return response.data;
        } else {
          throw Exception(response.error ?? 'Failed to export results');
        }
      },
      errorMessage: 'Failed to export results',
      successMessage: 'Export generated successfully',
    );

    return result;
  }

  /// Delete result
  Future<bool> deleteResult(String id) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobResultsService.deleteJobResult(id);

        if (response.success) {
          // Remove from local list
          _results.removeWhere((r) => r.id.toString() == id);
          _total = _total > 0 ? _total - 1 : 0;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to delete result');
        }
      },
      errorMessage: 'Failed to delete result',
      successMessage: 'Result deleted successfully',
    );

    return result ?? false;
  }

  /// Refresh results
  Future<bool> refresh() async {
    return await loadResults(page: 1, resetList: true);
  }
}
