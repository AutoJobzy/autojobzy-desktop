import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/color_constants.dart';
import '../../viewmodels/suggest_earn_view_model.dart';
import '../../widgets/common_button.dart';
import '../../widgets/common_text_field.dart';
import '../../models/suggestion_model.dart';

/// Suggest & Earn Screen
class SuggestEarnView extends StatefulWidget {
  const SuggestEarnView({Key? key}) : super(key: key);

  @override
  State<SuggestEarnView> createState() => _SuggestEarnViewState();
}

class _SuggestEarnViewState extends State<SuggestEarnView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = 'feature_request';

  final List<Map<String, String>> _categories = [
    {'value': 'feature_request', 'label': 'Feature Request'},
    {'value': 'bug_report', 'label': 'Bug Report'},
    {'value': 'ux_improvement', 'label': 'UX Improvement'},
    {'value': 'general_feedback', 'label': 'General Feedback'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SuggestEarnViewModel>().initialize();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final viewModel = context.read<SuggestEarnViewModel>();
    final success = await viewModel.createSuggestion(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      category: _selectedCategory,
    );

    if (!mounted) return;

    if (success) {
      _titleController.clear();
      _descriptionController.clear();
      setState(() {
        _selectedCategory = 'feature_request';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Suggestion submitted successfully!'),
          backgroundColor: ColorConstants.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(viewModel.errorMessage ?? 'Failed to submit suggestion'),
          backgroundColor: ColorConstants.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Suggest & Earn'),
        elevation: 0,
      ),
      body: Consumer<SuggestEarnViewModel>(
        builder: (context, viewModel, child) {
          return RefreshIndicator(
            onRefresh: () => viewModel.refresh(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Stats Card
                _buildStatsCard(viewModel),
                const SizedBox(height: 20),

                // Submit Suggestion Form
                _buildSubmissionForm(viewModel),
                const SizedBox(height: 20),

                // My Suggestions Section
                _buildMySuggestionsSection(viewModel),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatsCard(SuggestEarnViewModel viewModel) {
    final stats = viewModel.stats;
    final totalSuggestions = stats?['total'] ?? 0;
    final implemented = stats?['implemented'] ?? 0;
    final points = stats?['points'] ?? 0;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: ColorConstants.primaryGradient,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.stars,
                  color: Colors.white,
                  size: 32,
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Reward Points',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$points pts',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Total',
                    totalSuggestions.toString(),
                    Icons.lightbulb_outline,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: Colors.white.withOpacity(0.3),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Implemented',
                    implemented.toString(),
                    Icons.check_circle_outline,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmissionForm(SuggestEarnViewModel viewModel) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
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
                      Icons.lightbulb,
                      color: ColorConstants.primaryBlue,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Text(
                      'Submit Suggestion',
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

              // Title Field
              CommonTextField(
                controller: _titleController,
                label: 'Title',
                hint: 'Enter suggestion title',
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Category',
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
                      color: ColorConstants.backgroundLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: ColorConstants.borderLight,
                      ),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedCategory,
                        isExpanded: true,
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            setState(() {
                              _selectedCategory = newValue;
                            });
                          }
                        },
                        items: _categories.map((Map<String, String> category) {
                          return DropdownMenuItem<String>(
                            value: category['value'],
                            child: Text(
                              category['label']!,
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

              // Description Field
              CommonTextField(
                controller: _descriptionController,
                label: 'Description',
                hint: 'Describe your suggestion in detail',
                maxLines: 5,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a description';
                  }
                  if (value.trim().length < 10) {
                    return 'Description must be at least 10 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Submit Button
              CommonButton(
                text: 'Submit Suggestion',
                onPressed: _handleSubmit,
                isLoading: viewModel.isBusy,
                icon: const Icon(Icons.send, color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMySuggestionsSection(SuggestEarnViewModel viewModel) {
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
                    Icons.list_alt,
                    color: ColorConstants.primaryPurple,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    'My Suggestions (${viewModel.suggestions.length})',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Suggestions List
            if (viewModel.isBusy && viewModel.suggestions.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (viewModel.suggestions.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      Icon(
                        Icons.lightbulb_outline,
                        size: 64,
                        color: ColorConstants.textSecondary.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'No suggestions yet',
                        style: TextStyle(
                          fontSize: 16,
                          color: ColorConstants.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Submit your first suggestion above',
                        style: TextStyle(
                          fontSize: 14,
                          color: ColorConstants.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: viewModel.suggestions.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final suggestion = viewModel.suggestions[index];
                  return _buildSuggestionCard(suggestion, viewModel);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuggestionCard(SuggestionModel suggestion, SuggestEarnViewModel viewModel) {
    Color statusColor;
    IconData statusIcon;

    if (suggestion.isImplemented) {
      statusColor = ColorConstants.success;
      statusIcon = Icons.check_circle;
    } else if (suggestion.isUnderReview) {
      statusColor = ColorConstants.info;
      statusIcon = Icons.info;
    } else if (suggestion.isRejected) {
      statusColor = ColorConstants.error;
      statusIcon = Icons.cancel;
    } else {
      statusColor = ColorConstants.warning;
      statusIcon = Icons.pending;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorConstants.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: ColorConstants.borderLight,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      suggestion.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _getCategoryLabel(suggestion.category),
                      style: const TextStyle(
                        fontSize: 13,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      statusIcon,
                      size: 14,
                      color: statusColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      suggestion.statusDisplay,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            suggestion.description,
            style: const TextStyle(
              fontSize: 14,
              color: ColorConstants.textSecondary,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                Icons.access_time,
                size: 14,
                color: ColorConstants.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                DateFormat('MMM dd, yyyy').format(suggestion.createdAt),
                style: const TextStyle(
                  fontSize: 12,
                  color: ColorConstants.textSecondary,
                ),
              ),
              if (suggestion.rewardPoints != null && suggestion.rewardPoints! > 0) ...[
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: ColorConstants.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.stars,
                        size: 14,
                        color: ColorConstants.primaryBlue,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '+${suggestion.rewardPoints} pts',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: ColorConstants.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          if (suggestion.response != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.info.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: ColorConstants.info.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.reply,
                        size: 14,
                        color: ColorConstants.info,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Response',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: ColorConstants.info,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    suggestion.response!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: ColorConstants.textDark,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _getCategoryLabel(String category) {
    final match = _categories.firstWhere(
      (c) => c['value'] == category,
      orElse: () => {'value': category, 'label': category},
    );
    return match['label']!;
  }
}
