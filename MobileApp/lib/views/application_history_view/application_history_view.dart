import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../viewmodels/application_history_view_model.dart';
import '../../models/job_application_result_model.dart';
import '../../constants/color_constants.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';

/// Application History View - Shows paginated list of job applications
class ApplicationHistoryView extends StatefulWidget {
  const ApplicationHistoryView({Key? key}) : super(key: key);

  @override
  State<ApplicationHistoryView> createState() => _ApplicationHistoryViewState();
}

class _ApplicationHistoryViewState extends State<ApplicationHistoryView> {
  final ScrollController _scrollController = ScrollController();
  bool _isLoadingMore = false;
  bool _showFilters = false;

  // Filter controllers
  String? _selectedStatus;
  DateTimeRange? _selectedDateRange;
  RangeValues _scoreRange = const RangeValues(0, 5);

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Load initial data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ApplicationHistoryViewModel>().loadResults();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;

    final viewModel = context.read<ApplicationHistoryViewModel>();
    if (!viewModel.hasMore || viewModel.isBusy) return;

    setState(() {
      _isLoadingMore = true;
    });

    await viewModel.loadMore();

    setState(() {
      _isLoadingMore = false;
    });
  }

  Future<void> _onRefresh() async {
    await context.read<ApplicationHistoryViewModel>().refresh();
  }

  void _toggleFilters() {
    setState(() {
      _showFilters = !_showFilters;
    });
  }

  Future<void> _applyFilters() async {
    final viewModel = context.read<ApplicationHistoryViewModel>();

    await viewModel.applyFilters(
      status: _selectedStatus,
      startDate: _selectedDateRange?.start.toIso8601String(),
      endDate: _selectedDateRange?.end.toIso8601String(),
      minScore: _scoreRange.start.toInt(),
      maxScore: _scoreRange.end.toInt(),
    );

    setState(() {
      _showFilters = false;
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Filters applied')),
    );
  }

  Future<void> _clearFilters() async {
    setState(() {
      _selectedStatus = null;
      _selectedDateRange = null;
      _scoreRange = const RangeValues(0, 5);
    });

    await context.read<ApplicationHistoryViewModel>().clearFilters();

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Filters cleared')),
    );
  }

  Future<void> _exportResults() async {
    final viewModel = context.read<ApplicationHistoryViewModel>();

    // Show format selection dialog
    final format = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Export Format'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.description),
              title: const Text('CSV'),
              onTap: () => Navigator.pop(context, 'csv'),
            ),
            ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: const Text('PDF'),
              onTap: () => Navigator.pop(context, 'pdf'),
            ),
          ],
        ),
      ),
    );

    if (format == null || !mounted) return;

    final downloadUrl = await viewModel.exportResults(
      format: format,
      startDate: _selectedDateRange?.start.toIso8601String(),
      endDate: _selectedDateRange?.end.toIso8601String(),
    );

    if (!mounted) return;

    if (downloadUrl != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Export ready: $downloadUrl'),
          action: SnackBarAction(
            label: 'Open',
            onPressed: () {
              // TODO: Open URL in browser or download
            },
          ),
        ),
      );
    }
  }

  Future<void> _deleteResult(JobApplicationResultModel result) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Application'),
        content: Text(
          'Are you sure you want to delete the application for ${result.jobTitle ?? "this job"}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: ColorConstants.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await context
          .read<ApplicationHistoryViewModel>()
          .deleteResult(result.id.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Application History'),
        backgroundColor: ColorConstants.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _toggleFilters,
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: _exportResults,
          ),
        ],
      ),
      body: Column(
        children: [
          if (_showFilters) _buildFiltersPanel(),
          Expanded(
            child: Consumer<ApplicationHistoryViewModel>(
              builder: (context, viewModel, child) {
                // Show loading on first load
                if (viewModel.isBusy && viewModel.results.isEmpty) {
                  return const LoadingWidget(
                    message: 'Loading applications...',
                  );
                }

                // Show error
                if (viewModel.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: ColorConstants.error.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          viewModel.errorMessage ?? 'An error occurred',
                          style: const TextStyle(
                            fontSize: 16,
                            color: ColorConstants.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => viewModel.refresh(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                // Show empty state
                if (viewModel.results.isEmpty) {
                  return EmptyStateWidget(
                    title: 'No Applications Yet',
                    subtitle: 'Your job applications will appear here',
                    icon: Icons.work_outline,
                  );
                }

                // Show list with pull-to-refresh
                return RefreshIndicator(
                  onRefresh: _onRefresh,
                  color: ColorConstants.primaryBlue,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: viewModel.results.length + 1,
                    itemBuilder: (context, index) {
                      if (index == viewModel.results.length) {
                        // Load more indicator
                        if (_isLoadingMore) {
                          return const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Center(
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        if (!viewModel.hasMore) {
                          return Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              'End of results (${viewModel.total} total)',
                              style: const TextStyle(
                                color: ColorConstants.textSecondary,
                                fontSize: 12,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          );
                        }
                        return const SizedBox.shrink();
                      }

                      final result = viewModel.results[index];
                      return _ApplicationCard(
                        result: result,
                        onDelete: () => _deleteResult(result),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFiltersPanel() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorConstants.cardLight,
        boxShadow: [
          BoxShadow(
            color: ColorConstants.shadowLight,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filters',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: _clearFilters,
                child: const Text('Clear All'),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Status Filter
          DropdownButtonFormField<String>(
            value: _selectedStatus,
            decoration: const InputDecoration(
              labelText: 'Status',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            items: const [
              DropdownMenuItem(value: null, child: Text('All Statuses')),
              DropdownMenuItem(value: 'Applied', child: Text('Applied')),
              DropdownMenuItem(value: 'Skipped', child: Text('Skipped')),
              DropdownMenuItem(value: 'Failed', child: Text('Failed')),
            ],
            onChanged: (value) {
              setState(() {
                _selectedStatus = value;
              });
            },
          ),
          const SizedBox(height: 16),

          // Date Range Filter
          OutlinedButton.icon(
            onPressed: () async {
              final range = await showDateRangePicker(
                context: context,
                firstDate: DateTime(2020),
                lastDate: DateTime.now(),
                initialDateRange: _selectedDateRange,
              );
              if (range != null) {
                setState(() {
                  _selectedDateRange = range;
                });
              }
            },
            icon: const Icon(Icons.calendar_today),
            label: Text(
              _selectedDateRange == null
                  ? 'Select Date Range'
                  : '${DateFormat('MMM d').format(_selectedDateRange!.start)} - ${DateFormat('MMM d').format(_selectedDateRange!.end)}',
            ),
          ),
          const SizedBox(height: 16),

          // Score Range Filter
          const Text(
            'Match Score Range',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
          RangeSlider(
            values: _scoreRange,
            min: 0,
            max: 5,
            divisions: 5,
            labels: RangeLabels(
              _scoreRange.start.toInt().toString(),
              _scoreRange.end.toInt().toString(),
            ),
            activeColor: ColorConstants.primaryBlue,
            onChanged: (values) {
              setState(() {
                _scoreRange = values;
              });
            },
          ),
          const SizedBox(height: 16),

          // Apply Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _applyFilters,
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorConstants.primaryBlue,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Apply Filters',
                style: TextStyle(fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Application Card Widget
class _ApplicationCard extends StatelessWidget {
  final JobApplicationResultModel result;
  final VoidCallback onDelete;

  const _ApplicationCard({
    Key? key,
    required this.result,
    required this.onDelete,
  }) : super(key: key);

  Color _getStatusColor() {
    switch (result.applicationStatus.toLowerCase()) {
      case 'applied':
        return ColorConstants.success;
      case 'failed':
        return ColorConstants.error;
      case 'skipped':
      default:
        return ColorConstants.warning;
    }
  }

  String _getStatusText() {
    return result.applicationStatus.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          // TODO: Navigate to detail view
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Detail view coming soon')),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with company and delete button
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Company logo placeholder
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: ColorConstants.primaryBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.business,
                      color: ColorConstants.primaryBlue,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Company and role info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          result.companyName ?? 'Unknown Company',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: ColorConstants.textDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          result.jobTitle ?? result.role ?? 'No title',
                          style: const TextStyle(
                            fontSize: 14,
                            color: ColorConstants.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Delete button
                  IconButton(
                    icon: const Icon(Icons.delete_outline),
                    color: ColorConstants.error,
                    onPressed: onDelete,
                    tooltip: 'Delete',
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Status badge and match score
              Row(
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _getStatusColor(),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      _getStatusText(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _getStatusColor(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Match score
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: ColorConstants.info.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: ColorConstants.info,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${result.matchScore}/${result.matchScoreTotal}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: ColorConstants.info,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Match percentage
                  Text(
                    '${result.matchPercentage}%',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: result.matchPercentage >= 60
                          ? ColorConstants.success
                          : ColorConstants.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Additional details
              Row(
                children: [
                  if (result.location != null) ...[
                    const Icon(
                      Icons.location_on_outlined,
                      size: 14,
                      color: ColorConstants.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        result.location!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: ColorConstants.textSecondary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  if (result.experienceRequired != null) ...[
                    const Icon(
                      Icons.work_outline,
                      size: 14,
                      color: ColorConstants.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      result.experienceRequired!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),

              // Applied date
              Row(
                children: [
                  const Icon(
                    Icons.calendar_today,
                    size: 14,
                    color: ColorConstants.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Applied: ${DateFormat('MMM d, yyyy').format(result.datetime)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    DateFormat('h:mm a').format(result.datetime),
                    style: const TextStyle(
                      fontSize: 12,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                ],
              ),

              // Match indicators
              if (result.earlyApplicant ||
                  result.keySkillsMatch ||
                  result.locationMatch ||
                  result.experienceMatch) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (result.earlyApplicant)
                      _buildMatchChip('Early Applicant', Icons.flash_on),
                    if (result.keySkillsMatch)
                      _buildMatchChip('Skills Match', Icons.check_circle_outline),
                    if (result.locationMatch)
                      _buildMatchChip('Location Match', Icons.location_on),
                    if (result.experienceMatch)
                      _buildMatchChip('Experience Match', Icons.verified_outlined),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMatchChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: ColorConstants.success.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: ColorConstants.success,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: ColorConstants.success,
            ),
          ),
        ],
      ),
    );
  }
}
