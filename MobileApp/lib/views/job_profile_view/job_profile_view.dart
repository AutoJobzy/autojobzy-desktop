import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../constants/color_constants.dart';
import '../../models/job_settings_model.dart';
import '../../models/skill_model.dart';
import '../../viewmodels/job_profile_view_model.dart';
import '../../viewmodels/auth_view_model.dart';
import '../../widgets/common_button.dart';
import '../../widgets/common_text_field.dart';
import '../../utils/validators.dart';
import 'widgets/skills_management_widget.dart';

/// Job Profile View
/// Complete profile management screen for job seekers
class JobProfileView extends StatefulWidget {
  const JobProfileView({Key? key}) : super(key: key);

  @override
  State<JobProfileView> createState() => _JobProfileViewState();
}

class _JobProfileViewState extends State<JobProfileView> {
  final _formKey = GlobalKey<FormState>();

  // Personal Information Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _experienceController = TextEditingController();
  final _currentCtcController = TextEditingController();
  final _expectedCtcController = TextEditingController();
  final _noticePeriodController = TextEditingController();
  final _preferredLocationsController = TextEditingController();
  final _currentRoleController = TextEditingController();

  // Naukri Credentials Controllers
  final _naukriEmailController = TextEditingController();
  final _naukriPasswordController = TextEditingController();

  bool _isInitialized = false;
  String? _resumeFileName;
  List<SkillModel> _localSkills = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProfileData();
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _experienceController.dispose();
    _currentCtcController.dispose();
    _expectedCtcController.dispose();
    _noticePeriodController.dispose();
    _preferredLocationsController.dispose();
    _currentRoleController.dispose();
    _naukriEmailController.dispose();
    _naukriPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    final viewModel = context.read<JobProfileViewModel>();

    // Load job settings and skills
    await Future.wait([
      viewModel.loadJobSettings(),
      viewModel.loadSkills(),
    ]);

    if (!mounted) return;

    // Populate form fields
    final jobSettings = viewModel.jobSettings;
    if (jobSettings != null) {
      _nameController.text = jobSettings.fullName ?? '';
      _emailController.text = jobSettings.naukriEmail ?? '';
      _phoneController.text = jobSettings.contactNumber ?? '';
      _locationController.text = jobSettings.location;
      _experienceController.text = jobSettings.yearsOfExperience?.toString() ?? '';
      _currentCtcController.text = jobSettings.currentCTC ?? '';
      _expectedCtcController.text = jobSettings.expectedCTC ?? '';
      _noticePeriodController.text = jobSettings.noticePeriod;
      _currentRoleController.text = jobSettings.targetRole;
      _naukriEmailController.text = jobSettings.naukriEmail ?? '';
      _resumeFileName = jobSettings.resumeFileName;
    }

    _localSkills = List.from(viewModel.skills);

    setState(() {
      _isInitialized = true;
    });
  }

  Future<void> _pickResume() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
      );

      if (result != null && result.files.single.path != null) {
        final viewModel = context.read<JobProfileViewModel>();
        final success = await viewModel.uploadResume(result.files.single.path!);

        if (!mounted) return;

        if (success) {
          setState(() {
            _resumeFileName = result.files.single.name;
          });
          _showSuccessSnackBar('Resume uploaded successfully');
        } else {
          _showErrorSnackBar(viewModel.errorMessage ?? 'Failed to upload resume');
        }
      }
    } catch (e) {
      _showErrorSnackBar('Error picking file: ${e.toString()}');
    }
  }

  Future<void> _deleteResume() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Resume'),
        content: const Text('Are you sure you want to delete your resume?'),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Delete',
              style: TextStyle(color: ColorConstants.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final viewModel = context.read<JobProfileViewModel>();
      final success = await viewModel.deleteResume();

      if (!mounted) return;

      if (success) {
        setState(() {
          _resumeFileName = null;
        });
        _showSuccessSnackBar('Resume deleted successfully');
      } else {
        _showErrorSnackBar(viewModel.errorMessage ?? 'Failed to delete resume');
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      _showErrorSnackBar('Please fix the errors in the form');
      return;
    }

    final authViewModel = context.read<AuthViewModel>();
    final userId = authViewModel.currentUser?.id;

    if (userId == null) {
      _showErrorSnackBar('User not found. Please login again.');
      return;
    }

    final viewModel = context.read<JobProfileViewModel>();

    // Create job settings model
    final jobSettings = JobSettingsModel(
      userId: userId,
      fullName: _nameController.text.trim(),
      contactNumber: _phoneController.text.trim(),
      naukriEmail: _emailController.text.trim(),
      credentialsVerified: viewModel.jobSettings?.credentialsVerified ?? false,
      targetRole: _currentRoleController.text.trim(),
      location: _locationController.text.trim(),
      currentCTC: _currentCtcController.text.trim(),
      expectedCTC: _expectedCtcController.text.trim(),
      noticePeriod: _noticePeriodController.text.trim(),
      maxPages: viewModel.jobSettings?.maxPages ?? 5,
      availability: viewModel.jobSettings?.availability ?? 'Flexible',
      resumeScore: viewModel.jobSettings?.resumeScore ?? 0,
      yearsOfExperience: int.tryParse(_experienceController.text.trim()),
      profileUpdateEnabled: viewModel.jobSettings?.profileUpdateEnabled ?? false,
      createdAt: viewModel.jobSettings?.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
    );

    // Save job settings
    final settingsSaved = await viewModel.saveJobSettings(jobSettings);

    if (!mounted) return;

    if (!settingsSaved) {
      _showErrorSnackBar(viewModel.errorMessage ?? 'Failed to save profile');
      return;
    }

    // Save skills if modified
    if (_localSkills.isNotEmpty) {
      final skillsToCreate = _localSkills.where((s) => s.id == null).toList();
      if (skillsToCreate.isNotEmpty) {
        await viewModel.createSkills(skillsToCreate);
      }
    }

    // Update Naukri credentials if provided
    if (_naukriEmailController.text.trim().isNotEmpty &&
        _naukriPasswordController.text.trim().isNotEmpty) {
      await viewModel.updateNaukriCredentials(
        username: _naukriEmailController.text.trim(),
        password: _naukriPasswordController.text.trim(),
      );
    }

    if (!mounted) return;

    _showSuccessSnackBar('Profile saved successfully');
  }

  void _onSkillsChanged(List<SkillModel> skills) {
    setState(() {
      _localSkills = skills;
    });
  }

  void _onDeleteSkill(String skillId) async {
    final viewModel = context.read<JobProfileViewModel>();
    await viewModel.deleteSkill(skillId);

    if (!mounted) return;

    setState(() {
      _localSkills.removeWhere((s) => s.id == skillId);
    });
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ColorConstants.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ColorConstants.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Job Profile',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: ColorConstants.textDark,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: ColorConstants.textDark),
      ),
      body: Consumer<JobProfileViewModel>(
        builder: (context, viewModel, child) {
          if (!_isInitialized && viewModel.isBusy) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Personal Information Section
                  _buildSectionHeader('Personal Information', Icons.person),
                  const SizedBox(height: 16),
                  _buildPersonalInfoSection(),
                  const SizedBox(height: 24),

                  // Resume Section
                  _buildSectionHeader('Resume', Icons.description),
                  const SizedBox(height: 16),
                  _buildResumeSection(viewModel),
                  const SizedBox(height: 24),

                  // Skills Section
                  _buildSectionHeader('Skills', Icons.workspace_premium),
                  const SizedBox(height: 16),
                  _buildSkillsSection(),
                  const SizedBox(height: 24),

                  // Naukri Credentials Section
                  _buildSectionHeader('Naukri Credentials', Icons.vpn_key),
                  const SizedBox(height: 16),
                  _buildNaukriCredentialsSection(),
                  const SizedBox(height: 32),

                  // Save Button
                  CommonButton(
                    text: 'Save Profile',
                    onPressed: _saveProfile,
                    isLoading: viewModel.isBusy,
                    icon: const Icon(Icons.save, color: Colors.white),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            gradient: ColorConstants.primaryGradient,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: ColorConstants.textDark,
          ),
        ),
      ],
    );
  }

  Widget _buildPersonalInfoSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ColorConstants.borderLight),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          CommonTextField(
            controller: _nameController,
            label: 'Full Name',
            hint: 'Enter your full name',
            prefixIcon: const Icon(Icons.person_outline),
            validator: Validators.name,
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _emailController,
            label: 'Email',
            hint: 'Enter your email',
            prefixIcon: const Icon(Icons.email_outlined),
            keyboardType: TextInputType.emailAddress,
            validator: Validators.email,
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _phoneController,
            label: 'Phone Number',
            hint: 'Enter your phone number',
            prefixIcon: const Icon(Icons.phone_outlined),
            keyboardType: TextInputType.phone,
            validator: Validators.phone,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(10),
            ],
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _currentRoleController,
            label: 'Current Role',
            hint: 'e.g., Software Engineer',
            prefixIcon: const Icon(Icons.work_outline),
            validator: (value) => Validators.required(value, fieldName: 'Current Role'),
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _locationController,
            label: 'Current Location',
            hint: 'e.g., Bangalore',
            prefixIcon: const Icon(Icons.location_on_outlined),
            validator: (value) => Validators.required(value, fieldName: 'Location'),
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _preferredLocationsController,
            label: 'Preferred Locations (Optional)',
            hint: 'e.g., Bangalore, Mumbai, Hyderabad',
            prefixIcon: const Icon(Icons.map_outlined),
            maxLines: 2,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: CommonTextField(
                  controller: _experienceController,
                  label: 'Experience (Years)',
                  hint: '0-20',
                  prefixIcon: const Icon(Icons.timeline),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CommonTextField(
                  controller: _noticePeriodController,
                  label: 'Notice Period',
                  hint: 'e.g., Immediate, 30 days',
                  prefixIcon: const Icon(Icons.schedule),
                  validator: (value) => Validators.required(value, fieldName: 'Notice Period'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: CommonTextField(
                  controller: _currentCtcController,
                  label: 'Current CTC (Optional)',
                  hint: 'e.g., 10 LPA',
                  prefixIcon: const Icon(Icons.currency_rupee),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CommonTextField(
                  controller: _expectedCtcController,
                  label: 'Expected CTC (Optional)',
                  hint: 'e.g., 15 LPA',
                  prefixIcon: const Icon(Icons.currency_rupee),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResumeSection(JobProfileViewModel viewModel) {
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
          if (_resumeFileName != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ColorConstants.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: ColorConstants.success.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: ColorConstants.success,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Resume Uploaded',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: ColorConstants.success,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _resumeFileName!,
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorConstants.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _deleteResume,
                    icon: const Icon(Icons.delete, color: ColorConstants.error),
                    tooltip: 'Delete Resume',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          CommonButton(
            text: _resumeFileName == null ? 'Upload Resume' : 'Replace Resume',
            onPressed: _pickResume,
            isOutlined: true,
            icon: Icon(
              _resumeFileName == null ? Icons.upload_file : Icons.refresh,
              color: ColorConstants.primaryBlue,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Supported formats: PDF, DOC, DOCX',
            style: TextStyle(
              fontSize: 12,
              color: ColorConstants.textSecondary.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsSection() {
    final authViewModel = context.read<AuthViewModel>();
    final userId = authViewModel.currentUser?.id ?? '';

    return SkillsManagementWidget(
      skills: _localSkills,
      userId: userId,
      onSkillsChanged: _onSkillsChanged,
      onDeleteSkill: _onDeleteSkill,
    );
  }

  Widget _buildNaukriCredentialsSection() {
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
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ColorConstants.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: ColorConstants.info,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Required for automated job applications on Naukri',
                    style: TextStyle(
                      fontSize: 12,
                      color: ColorConstants.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _naukriEmailController,
            label: 'Naukri Email/Username',
            hint: 'Enter your Naukri email',
            prefixIcon: const Icon(Icons.alternate_email),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          CommonTextField(
            controller: _naukriPasswordController,
            label: 'Naukri Password',
            hint: 'Enter your Naukri password',
            prefixIcon: const Icon(Icons.lock_outline),
            obscureText: true,
          ),
        ],
      ),
    );
  }
}
