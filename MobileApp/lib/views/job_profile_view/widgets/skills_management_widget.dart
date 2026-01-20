import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../constants/color_constants.dart';
import '../../../models/skill_model.dart';
import '../../../widgets/common_button.dart';
import '../../../widgets/common_text_field.dart';

/// Skills Management Widget
/// Allows users to add, edit, and delete skills
class SkillsManagementWidget extends StatefulWidget {
  final List<SkillModel> skills;
  final String userId;
  final Function(List<SkillModel>) onSkillsChanged;
  final Function(String) onDeleteSkill;

  const SkillsManagementWidget({
    Key? key,
    required this.skills,
    required this.userId,
    required this.onSkillsChanged,
    required this.onDeleteSkill,
  }) : super(key: key);

  @override
  State<SkillsManagementWidget> createState() => _SkillsManagementWidgetState();
}

class _SkillsManagementWidgetState extends State<SkillsManagementWidget> {
  final _skillNameController = TextEditingController();
  final _experienceController = TextEditingController();
  double _rating = 3.0;
  bool _isAddingSkill = false;
  SkillModel? _editingSkill;

  @override
  void dispose() {
    _skillNameController.dispose();
    _experienceController.dispose();
    super.dispose();
  }

  void _clearForm() {
    _skillNameController.clear();
    _experienceController.clear();
    _rating = 3.0;
    _editingSkill = null;
    _isAddingSkill = false;
  }

  void _showAddSkillDialog() {
    _clearForm();
    setState(() {
      _isAddingSkill = true;
    });
  }

  void _showEditSkillDialog(SkillModel skill) {
    setState(() {
      _editingSkill = skill;
      _skillNameController.text = skill.displayName;
      _experienceController.text = skill.experience ?? '';
      _rating = skill.rating;
      _isAddingSkill = true;
    });
  }

  void _saveSkill() {
    if (_skillNameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter skill name'),
          backgroundColor: ColorConstants.error,
        ),
      );
      return;
    }

    final newSkill = SkillModel(
      id: _editingSkill?.id,
      userId: widget.userId,
      skillName: _skillNameController.text.toLowerCase().replaceAll(' ', '_'),
      displayName: _skillNameController.text,
      rating: _rating,
      outOf: 5,
      experience: _experienceController.text.isEmpty ? null : _experienceController.text,
      createdAt: _editingSkill?.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final updatedSkills = List<SkillModel>.from(widget.skills);

    if (_editingSkill != null) {
      // Update existing skill
      final index = updatedSkills.indexWhere((s) => s.id == _editingSkill!.id);
      if (index != -1) {
        updatedSkills[index] = newSkill;
      }
    } else {
      // Add new skill
      updatedSkills.add(newSkill);
    }

    widget.onSkillsChanged(updatedSkills);
    _clearForm();
    setState(() {});
  }

  void _deleteSkill(SkillModel skill) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Skill'),
        content: Text('Are you sure you want to delete "${skill.displayName}"?'),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (skill.id != null) {
                widget.onDeleteSkill(skill.id!);
              } else {
                final updatedSkills = List<SkillModel>.from(widget.skills);
                updatedSkills.remove(skill);
                widget.onSkillsChanged(updatedSkills);
              }
              Navigator.pop(context);
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: ColorConstants.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ColorConstants.borderLight),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Skills',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.textDark,
                ),
              ),
              IconButton(
                onPressed: _showAddSkillDialog,
                icon: const Icon(
                  Icons.add_circle,
                  color: ColorConstants.primaryBlue,
                  size: 28,
                ),
                tooltip: 'Add Skill',
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Skills List
          if (widget.skills.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(
                      Icons.workspace_premium_outlined,
                      size: 64,
                      color: ColorConstants.textSecondary.withOpacity(0.5),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No skills added yet',
                      style: TextStyle(
                        fontSize: 16,
                        color: ColorConstants.textSecondary.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap the + button to add your skills',
                      style: TextStyle(
                        fontSize: 14,
                        color: ColorConstants.textSecondary.withOpacity(0.5),
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
              itemCount: widget.skills.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final skill = widget.skills[index];
                return _buildSkillCard(skill);
              },
            ),

          // Add/Edit Skill Form
          if (_isAddingSkill) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            _buildSkillForm(),
          ],
        ],
      ),
    );
  }

  Widget _buildSkillCard(SkillModel skill) {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.cardLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: ColorConstants.borderLight),
      ),
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          // Skill Icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: ColorConstants.primaryGradient,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.code,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),

          // Skill Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  skill.displayName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: ColorConstants.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    // Rating Stars
                    Row(
                      children: List.generate(5, (index) {
                        return Icon(
                          index < skill.rating.round()
                              ? Icons.star
                              : Icons.star_border,
                          size: 16,
                          color: ColorConstants.warning,
                        );
                      }),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      skill.ratingDisplay,
                      style: const TextStyle(
                        fontSize: 12,
                        color: ColorConstants.textSecondary,
                      ),
                    ),
                    if (skill.experience != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        '• ${skill.experience}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: ColorConstants.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Action Buttons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                onPressed: () => _showEditSkillDialog(skill),
                icon: const Icon(
                  Icons.edit,
                  color: ColorConstants.primaryBlue,
                  size: 20,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () => _deleteSkill(skill),
                icon: const Icon(
                  Icons.delete,
                  color: ColorConstants.error,
                  size: 20,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSkillForm() {
    return Container(
      decoration: BoxDecoration(
        color: ColorConstants.backgroundLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ColorConstants.borderLight),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Form Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _editingSkill != null ? 'Edit Skill' : 'Add New Skill',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: ColorConstants.textDark,
                ),
              ),
              IconButton(
                onPressed: _clearForm,
                icon: const Icon(Icons.close),
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Skill Name
          CommonTextField(
            controller: _skillNameController,
            label: 'Skill Name',
            hint: 'e.g., Flutter, React, Python',
            prefixIcon: const Icon(Icons.code),
          ),
          const SizedBox(height: 16),

          // Experience
          CommonTextField(
            controller: _experienceController,
            label: 'Years of Experience (Optional)',
            hint: 'e.g., 2 years, 6 months',
            prefixIcon: const Icon(Icons.timeline),
          ),
          const SizedBox(height: 16),

          // Rating
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Skill Level',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: ColorConstants.textDark,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Slider(
                      value: _rating,
                      min: 1.0,
                      max: 5.0,
                      divisions: 4,
                      label: _rating.toStringAsFixed(0),
                      activeColor: ColorConstants.primaryBlue,
                      inactiveColor: ColorConstants.borderLight,
                      onChanged: (value) {
                        setState(() {
                          _rating = value;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: ColorConstants.primaryBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${_rating.toStringAsFixed(0)}/5',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ColorConstants.primaryBlue,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Rating Stars Display
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < _rating.round() ? Icons.star : Icons.star_border,
                    size: 24,
                    color: ColorConstants.warning,
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: CommonButton(
                  text: 'Cancel',
                  onPressed: _clearForm,
                  isOutlined: true,
                  height: 44,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CommonButton(
                  text: _editingSkill != null ? 'Update' : 'Add',
                  onPressed: _saveSkill,
                  height: 44,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
