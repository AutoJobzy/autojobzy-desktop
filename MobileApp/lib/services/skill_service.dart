import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/skill_model.dart';
import 'api_service.dart';

/// Skill Service
class SkillService {
  final ApiService _apiService = ApiService();

  /// Get all user skills
  Future<ApiResponse<List<SkillModel>>> getSkills() async {
    try {
      final response = await _apiService.get(ApiConstants.skills);

      final skills = (response.data['skills'] as List)
          .map((skill) => SkillModel.fromJson(skill))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Skills fetched successfully',
        data: skills,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Create multiple skills
  Future<ApiResponse<List<SkillModel>>> createBulkSkills({
    required List<SkillModel> skills,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.skillsBulk,
        data: {
          'skills': skills.map((s) => s.toJson()).toList(),
        },
      );

      final createdSkills = (response.data['skills'] as List)
          .map((skill) => SkillModel.fromJson(skill))
          .toList();

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Skills created successfully',
        data: createdSkills,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Update skill
  Future<ApiResponse<SkillModel>> updateSkill({
    required String skillId,
    required SkillModel skill,
  }) async {
    try {
      final response = await _apiService.put(
        '${ApiConstants.skills}/$skillId',
        data: skill.toJson(),
      );

      final updatedSkill = SkillModel.fromJson(response.data['skill']);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Skill updated successfully',
        data: updatedSkill,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete skill
  Future<ApiResponse<void>> deleteSkill(String skillId) async {
    try {
      final response = await _apiService.delete('${ApiConstants.skills}/$skillId');

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Skill deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete all skills
  Future<ApiResponse<void>> deleteAllSkills() async {
    try {
      final response = await _apiService.delete(ApiConstants.skills);

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'All skills deleted successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
