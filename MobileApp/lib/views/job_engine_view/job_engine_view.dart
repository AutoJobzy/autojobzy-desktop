import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/color_constants.dart';
import '../../viewmodels/job_engine_view_model.dart';
import '../../models/automation_log_model.dart';
import '../../widgets/common_button.dart';

/// Job Engine View - Main Control Panel for Job Automation
class JobEngineView extends StatefulWidget {
  const JobEngineView({Key? key}) : super(key: key);

  @override
  State<JobEngineView> createState() => _JobEngineViewState();
}

class _JobEngineViewState extends State<JobEngineView> {
  Timer? _autoRefreshTimer;
  final ScrollController _logsScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeData();
    });
  }

  Future<void> _initializeData() async {
    final viewModel = context.read<JobEngineViewModel>();
    await viewModel.refresh();
    _startAutoRefresh();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    final viewModel = context.read<JobEngineViewModel>();
    if (viewModel.isRunning) {
      _autoRefreshTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (mounted) {
          viewModel.refresh();
        } else {
          timer.cancel();
        }
      });
    }
  }

  void _stopAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = null;
  }

  @override
  void dispose() {
    _stopAutoRefresh();
    _logsScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.backgroundLight,
      appBar: AppBar(
        title: const Text(
          'Job Engine',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          Consumer<JobEngineViewModel>(
            builder: (context, viewModel, _) {
              return IconButton(
                icon: viewModel.isBusy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            ColorConstants.primaryBlue,
                          ),
                        ),
                      )
                    : const Icon(Icons.refresh),
                onPressed: viewModel.isBusy
                    ? null
                    : () async {
                        await viewModel.refresh();
                        _startAutoRefresh();
                      },
                tooltip: 'Refresh',
              );
            },
          ),
        ],
      ),
      body: Consumer<JobEngineViewModel>(
        builder: (context, viewModel, _) {
          return RefreshIndicator(
            onRefresh: () async {
              await viewModel.refresh();
              _startAutoRefresh();
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Automation Status Card
                  _buildStatusCard(viewModel),
                  const SizedBox(height: 20),

                  // Start/Stop Button
                  _buildControlButton(viewModel),
                  const SizedBox(height: 20),

                  // Schedule Configuration Section
                  _buildScheduleSection(viewModel),
                  const SizedBox(height: 20),

                  // Real-time Logs Section
                  _buildLogsSection(viewModel),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Build Status Card showing automation status
  Widget _buildStatusCard(JobEngineViewModel viewModel) {
    final status = viewModel.status;
    final isRunning = status?.isRunning ?? false;

    return Container(
      decoration: BoxDecoration(
        gradient: isRunning
            ? ColorConstants.primaryGradient
            : LinearGradient(
                colors: [
                  Colors.grey.shade300,
                  Colors.grey.shade400,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: isRunning
                ? ColorConstants.primaryBlue.withOpacity(0.3)
                : Colors.grey.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: isRunning ? Colors.greenAccent : Colors.red.shade300,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: isRunning
                            ? Colors.greenAccent.withOpacity(0.5)
                            : Colors.red.withOpacity(0.5),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  isRunning ? 'RUNNING' : 'STOPPED',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                const Spacer(),
                if (isRunning)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(
                          Icons.power_settings_new,
                          color: Colors.white,
                          size: 16,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'ACTIVE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),

            // Stats Grid
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    icon: Icons.work_outline,
                    label: 'Total Jobs',
                    value: status?.totalJobs.toString() ?? '0',
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatItem(
                    icon: Icons.check_circle_outline,
                    label: 'Applied',
                    value: status?.appliedJobs.toString() ?? '0',
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    icon: Icons.error_outline,
                    label: 'Failed',
                    value: status?.failedJobs.toString() ?? '0',
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatItem(
                    icon: Icons.schedule,
                    label: 'Last Run',
                    value: status?.lastRunAt != null
                        ? _formatTime(status!.lastRunAt!)
                        : 'Never',
                    color: Colors.white,
                  ),
                ),
              ],
            ),

            // Current Status Message
            if (status?.currentStatus != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        status!.currentStatus!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build individual stat item
  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color.withOpacity(0.8),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  /// Build Control Button (Start/Stop)
  Widget _buildControlButton(JobEngineViewModel viewModel) {
    final isRunning = viewModel.isRunning;

    return CommonButton(
      text: isRunning ? 'STOP AUTOMATION' : 'START AUTOMATION',
      height: 60,
      color: isRunning ? ColorConstants.error : ColorConstants.success,
      textColor: Colors.white,
      isLoading: viewModel.isBusy,
      icon: Icon(
        isRunning ? Icons.stop_circle : Icons.play_circle,
        color: Colors.white,
        size: 28,
      ),
      onPressed: () async {
        if (isRunning) {
          final confirmed = await _showConfirmDialog(
            title: 'Stop Automation',
            message: 'Are you sure you want to stop the job automation?',
          );
          if (confirmed == true) {
            final success = await viewModel.stopAutomation();
            if (success) {
              _stopAutoRefresh();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Automation stopped successfully'),
                    backgroundColor: ColorConstants.success,
                  ),
                );
              }
            }
          }
        } else {
          final success = await viewModel.startAutomation();
          if (success) {
            _startAutoRefresh();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Automation started successfully'),
                  backgroundColor: ColorConstants.success,
                ),
              );
            }
          }
        }
      },
    );
  }

  /// Build Schedule Configuration Section
  Widget _buildScheduleSection(JobEngineViewModel viewModel) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.schedule,
                    color: ColorConstants.primaryBlue,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Schedule Configuration',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.access_time, color: ColorConstants.info),
              title: const Text('Daily Schedule'),
              subtitle: const Text('Run automation at specific time'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                _showScheduleDialog(viewModel);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.repeat, color: ColorConstants.warning),
              title: const Text('Auto-Retry'),
              subtitle: const Text('Retry failed applications'),
              trailing: Switch(
                value: false,
                onChanged: (value) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Feature coming soon')),
                  );
                },
                activeColor: ColorConstants.primaryBlue,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build Real-time Logs Section
  Widget _buildLogsSection(JobEngineViewModel viewModel) {
    final logs = viewModel.logs;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: ColorConstants.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.article,
                    color: ColorConstants.info,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Real-time Logs',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${logs.length} logs',
                    style: const TextStyle(
                      color: ColorConstants.primaryBlue,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Container(
            height: 400,
            padding: const EdgeInsets.all(12),
            child: logs.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.article_outlined,
                          size: 64,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No logs available',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Start automation to see logs',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade400,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _logsScrollController,
                    itemCount: logs.length,
                    itemBuilder: (context, index) {
                      final log = logs[index];
                      return _buildLogItem(log);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  /// Build individual log item
  Widget _buildLogItem(AutomationLogModel log) {
    Color logColor;
    IconData logIcon;

    if (log.isError) {
      logColor = ColorConstants.error;
      logIcon = Icons.error;
    } else if (log.isWarning) {
      logColor = ColorConstants.warning;
      logIcon = Icons.warning;
    } else if (log.isSuccess) {
      logColor = ColorConstants.success;
      logIcon = Icons.check_circle;
    } else {
      logColor = ColorConstants.info;
      logIcon = Icons.info;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: logColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: logColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            logIcon,
            color: logColor,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: logColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        log.type.toUpperCase(),
                        style: TextStyle(
                          color: logColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      log.timeAgo,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  log.message,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                if (log.metadata != null && log.metadata!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      log.metadata.toString(),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade700,
                        fontFamily: 'monospace',
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Show confirm dialog
  Future<bool?> _showConfirmDialog({
    required String title,
    required String message,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Confirm',
              style: TextStyle(color: ColorConstants.error),
            ),
          ),
        ],
      ),
    );
  }

  /// Show schedule dialog
  void _showScheduleDialog(JobEngineViewModel viewModel) {
    TimeOfDay selectedTime = TimeOfDay.now();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Set Schedule'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Choose a time to run automation daily:'),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              icon: const Icon(Icons.access_time),
              label: Text(selectedTime.format(context)),
              onPressed: () async {
                final time = await showTimePicker(
                  context: context,
                  initialTime: selectedTime,
                );
                if (time != null) {
                  selectedTime = time;
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              final scheduleTime =
                  '${selectedTime.hour.toString().padLeft(2, '0')}:${selectedTime.minute.toString().padLeft(2, '0')}';
              await viewModel.scheduleAutomation(
                scheduleTime: scheduleTime,
                enabled: true,
              );
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Schedule set for $scheduleTime'),
                    backgroundColor: ColorConstants.success,
                  ),
                );
              }
            },
            child: const Text('Set'),
          ),
        ],
      ),
    );
  }

  /// Format time to readable string
  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return DateFormat('MMM dd, HH:mm').format(time);
    }
  }
}
