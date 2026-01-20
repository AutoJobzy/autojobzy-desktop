import '../models/job_settings_model.dart';
import '../models/skill_model.dart';
import '../services/job_settings_service.dart';
import '../services/skill_service.dart';
import 'base_view_model.dart';

/// Job Profile ViewModel
class JobProfileViewModel extends BaseViewModel {
  final JobSettingsService _jobSettingsService = JobSettingsService();
  final SkillService _skillService = SkillService();

  JobSettingsModel? _jobSettings;
  List<SkillModel> _skills = [];

  JobSettingsModel? get jobSettings => _jobSettings;
  List<SkillModel> get skills => _skills;

  /// Load job settings
  Future<bool> loadJobSettings() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobSettingsService.getJobSettings();

        if (response.success && response.data != null) {
          _jobSettings = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load job settings');
        }
      },
      errorMessage: 'Failed to load job settings',
    );

    return result ?? false;
  }

  /// Load skills
  Future<bool> loadSkills() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _skillService.getSkills();

        if (response.success && response.data != null) {
          _skills = response.data!;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load skills');
        }
      },
      errorMessage: 'Failed to load skills',
    );

    return result ?? false;
  }

  /// Save job settings
  Future<bool> saveJobSettings(JobSettingsModel jobSettings) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobSettingsService.saveJobSettings(
          jobSettings: jobSettings,
        );

        if (response.success && response.data != null) {
          _jobSettings = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to save job settings');
        }
      },
      errorMessage: 'Failed to save job settings',
      successMessage: 'Job settings saved successfully',
    );

    return result ?? false;
  }

  /// Upload resume
  Future<bool> uploadResume(String filePath) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobSettingsService.uploadResume(
          filePath: filePath,
        );

        if (response.success) {
          // Reload job settings to get updated resume info
          await loadJobSettings();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to upload resume');
        }
      },
      errorMessage: 'Failed to upload resume',
      successMessage: 'Resume uploaded successfully',
    );

    return result ?? false;
  }

  /// Delete resume
  Future<bool> deleteResume() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobSettingsService.deleteResume();

        if (response.success) {
          // Reload job settings to get updated info
          await loadJobSettings();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to delete resume');
        }
      },
      errorMessage: 'Failed to delete resume',
      successMessage: 'Resume deleted successfully',
    );

    return result ?? false;
  }

  /// Create multiple skills
  Future<bool> createSkills(List<SkillModel> skills) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _skillService.createBulkSkills(skills: skills);

        if (response.success && response.data != null) {
          _skills = response.data!;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to create skills');
        }
      },
      errorMessage: 'Failed to create skills',
      successMessage: 'Skills added successfully',
    );

    return result ?? false;
  }

  /// Update skill
  Future<bool> updateSkill(String skillId, SkillModel skill) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _skillService.updateSkill(
          skillId: skillId,
          skill: skill,
        );

        if (response.success && response.data != null) {
          // Update local list
          final index = _skills.indexWhere((s) => s.id == skillId);
          if (index != -1) {
            _skills[index] = response.data!;
          }
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to update skill');
        }
      },
      errorMessage: 'Failed to update skill',
      successMessage: 'Skill updated successfully',
    );

    return result ?? false;
  }

  /// Delete skill
  Future<bool> deleteSkill(String skillId) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _skillService.deleteSkill(skillId);

        if (response.success) {
          // Remove from local list
          _skills.removeWhere((s) => s.id == skillId);
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to delete skill');
        }
      },
      errorMessage: 'Failed to delete skill',
      successMessage: 'Skill deleted successfully',
    );

    return result ?? false;
  }

  /// Delete all skills
  Future<bool> deleteAllSkills() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _skillService.deleteAllSkills();

        if (response.success) {
          _skills.clear();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to delete all skills');
        }
      },
      errorMessage: 'Failed to delete all skills',
      successMessage: 'All skills deleted successfully',
    );

    return result ?? false;
  }

  /// Update Naukri credentials
  Future<bool> updateNaukriCredentials({
    required String username,
    required String password,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobSettingsService.updateNaukriCredentials(
          username: username,
          password: password,
        );

        if (response.success) {
          // Reload job settings
          await loadJobSettings();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to update credentials');
        }
      },
      errorMessage: 'Failed to update Naukri credentials',
      successMessage: 'Naukri credentials updated successfully',
    );

    return result ?? false;
  }
}
