import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/color_constants.dart';
import '../../viewmodels/auto_profile_update_view_model.dart';
import '../../widgets/common_button.dart';

/// Auto Profile Update Screen
class AutoProfileUpdateView extends StatefulWidget {
  const AutoProfileUpdateView({Key? key}) : super(key: key);

  @override
  State<AutoProfileUpdateView> createState() => _AutoProfileUpdateViewState();
}

class _AutoProfileUpdateViewState extends State<AutoProfileUpdateView> {
  bool _schedulerEnabled = false;
  String _selectedFrequency = 'daily';
  TimeOfDay _selectedTime = const TimeOfDay(hour: 9, minute: 0);

  final List<String> _frequencies = ['daily', 'weekly', 'monthly'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeData();
    });
  }

  Future<void> _initializeData() async {
    final viewModel = context.read<AutoProfileUpdateViewModel>();
    await viewModel.initialize();

    if (mounted && viewModel.schedulerConfig != null) {
      setState(() {
        final enabled = viewModel.schedulerConfig!['enabled'];
        _schedulerEnabled = enabled is bool ? enabled : (enabled == 1 || enabled == true);

        final frequency = viewModel.schedulerConfig!['frequency'];
        _selectedFrequency = frequency is String ? frequency : (frequency == 1 ? 'daily' : frequency == 7 ? 'weekly' : 'monthly');

        final timeStr = viewModel.schedulerConfig!['time'] as String?;
        if (timeStr != null) {
          final parts = timeStr.split(':');
          if (parts.length == 2) {
            _selectedTime = TimeOfDay(
              hour: int.tryParse(parts[0]) ?? 9,
              minute: int.tryParse(parts[1]) ?? 0,
            );
          }
        }
      });
    }
  }

  Future<void> _handleManualUpdate() async {
    final viewModel = context.read<AutoProfileUpdateViewModel>();
    final success = await viewModel.updateProfile();

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: ColorConstants.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage ?? 'Failed to update profile'),
          backgroundColor: ColorConstants.error,
        ),
      );
    }
  }

  Future<void> _handleSchedulerToggle(bool value) async {
    setState(() {
      _schedulerEnabled = value;
    });

    final viewModel = context.read<AutoProfileUpdateViewModel>();
    final success = await viewModel.configureScheduler(
      enabled: value,
      frequency: _selectedFrequency,
      time: '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}',
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(value ? 'Scheduler enabled' : 'Scheduler disabled'),
          backgroundColor: ColorConstants.success,
        ),
      );
    } else {
      setState(() {
        _schedulerEnabled = !value;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage ?? 'Failed to update scheduler'),
          backgroundColor: ColorConstants.error,
        ),
      );
    }
  }

  Future<void> _handleFrequencyChange(String? value) async {
    if (value == null) return;

    setState(() {
      _selectedFrequency = value;
    });

    if (_schedulerEnabled) {
      final viewModel = context.read<AutoProfileUpdateViewModel>();
      await viewModel.configureScheduler(
        enabled: _schedulerEnabled,
        frequency: _selectedFrequency,
        time: '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}',
      );
    }
  }

  Future<void> _handleTimeChange() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );

    if (picked != null && picked != _selectedTime) {
      setState(() {
        _selectedTime = picked;
      });

      if (_schedulerEnabled) {
        final viewModel = context.read<AutoProfileUpdateViewModel>();
        await viewModel.configureScheduler(
          enabled: _schedulerEnabled,
          frequency: _selectedFrequency,
          time: '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auto Profile Update'),
        elevation: 0,
      ),
      body: Consumer<AutoProfileUpdateViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isBusy) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return RefreshIndicator(
            onRefresh: () => viewModel.initialize(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Manual Update Section
                _buildManualUpdateSection(viewModel),
                const SizedBox(height: 20),

                // Scheduler Configuration
                _buildSchedulerSection(viewModel),
                const SizedBox(height: 20),

                // Last Update Result
                if (viewModel.updateResult != null) ...[
                  _buildLastUpdateResultCard(viewModel.updateResult!),
                  const SizedBox(height: 20),
                ],

                // Update History
                _buildUpdateHistorySection(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildManualUpdateSection(AutoProfileUpdateViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.update,
                    color: ColorConstants.primaryBlue,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Manual Update',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: ColorConstants.textDark,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Update your Naukri profile instantly',
                        style: TextStyle(
                          fontSize: 13,
                          color: ColorConstants.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            CommonButton(
              text: 'Update Profile Now',
              onPressed: _handleManualUpdate,
              isLoading: viewModel.isBusy,
              icon: const Icon(Icons.refresh, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSchedulerSection(AutoProfileUpdateViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryPurple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.schedule,
                    color: ColorConstants.primaryPurple,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Scheduler Configuration',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Enable Toggle
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: ColorConstants.cardLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Enable Auto Update',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: ColorConstants.textDark,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Automatically update profile',
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _schedulerEnabled,
                    onChanged: _handleSchedulerToggle,
                    activeColor: ColorConstants.primaryBlue,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Frequency Dropdown
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Frequency',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: ColorConstants.textDark,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: _schedulerEnabled
                        ? ColorConstants.backgroundLight
                        : ColorConstants.borderLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: ColorConstants.borderLight,
                    ),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedFrequency,
                      isExpanded: true,
                      onChanged: _schedulerEnabled ? _handleFrequencyChange : null,
                      items: _frequencies.map((String frequency) {
                        return DropdownMenuItem<String>(
                          value: frequency,
                          child: Text(
                            frequency.substring(0, 1).toUpperCase() +
                                frequency.substring(1),
                            style: const TextStyle(fontSize: 16),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Time Picker
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Time',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: ColorConstants.textDark,
                  ),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: _schedulerEnabled ? _handleTimeChange : null,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: _schedulerEnabled
                          ? ColorConstants.backgroundLight
                          : ColorConstants.borderLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: ColorConstants.borderLight,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.access_time,
                          color: ColorConstants.textSecondary,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          _selectedTime.format(context),
                          style: const TextStyle(
                            fontSize: 16,
                            color: ColorConstants.textDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLastUpdateResultCard(Map<String, dynamic> result) {
    final success = result['success'] ?? false;
    final message = result['message'] ?? 'No message';
    final timestamp = result['timestamp'] != null
        ? DateTime.tryParse(result['timestamp'])
        : null;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: success
                        ? ColorConstants.success.withOpacity(0.1)
                        : ColorConstants.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    success ? Icons.check_circle : Icons.error,
                    color: success ? ColorConstants.success : ColorConstants.error,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Last Update Result',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.cardLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        success ? Icons.check_circle : Icons.error,
                        color: success ? ColorConstants.success : ColorConstants.error,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        success ? 'Success' : 'Failed',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: success ? ColorConstants.success : ColorConstants.error,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    message,
                    style: const TextStyle(
                      fontSize: 13,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                  if (timestamp != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Updated: ${DateFormat('MMM dd, yyyy HH:mm').format(timestamp)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpdateHistorySection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ColorConstants.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.history,
                    color: ColorConstants.info,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Update History',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Text(
                  'No update history available',
                  style: TextStyle(
                    fontSize: 14,
                    color: ColorConstants.textSecondary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
