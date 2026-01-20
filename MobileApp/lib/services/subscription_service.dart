import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/plan_model.dart';
import '../models/subscription_model.dart';
import 'api_service.dart';

/// Subscription Service
class SubscriptionService {
  final ApiService _apiService = ApiService();

  /// Get all available plans
  Future<ApiResponse<List<PlanModel>>> getPlans() async {
    try {
      final response = await _apiService.get(ApiConstants.subscriptionPlans);

      final plans = (response.data['plans'] as List)
          .map((plan) => PlanModel.fromJson(plan))
          .toList();

      return ApiResponse(
        success: true,
        message: 'Plans fetched successfully',
        data: plans,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get user's current subscription
  Future<ApiResponse<SubscriptionModel?>> getCurrentSubscription() async {
    try {
      final response = await _apiService.get(ApiConstants.subscriptionCurrent);

      if (response.data['subscription'] != null) {
        final subscription = SubscriptionModel.fromJson(
          response.data['subscription'],
        );

        return ApiResponse(
          success: true,
          message: 'Subscription fetched successfully',
          data: subscription,
        );
      } else {
        return ApiResponse(
          success: true,
          message: 'No active subscription',
          data: null,
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Create Razorpay order
  Future<ApiResponse<Map<String, dynamic>>> createOrder({
    required String planId,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.subscriptionCreateOrder,
        data: {'planId': planId},
      );

      return ApiResponse(
        success: true,
        message: 'Order created successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Verify payment
  Future<ApiResponse<SubscriptionModel>> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.subscriptionVerifyPayment,
        data: {
          'orderId': orderId,
          'paymentId': paymentId,
          'signature': signature,
        },
      );

      final subscription = SubscriptionModel.fromJson(
        response.data['subscription'],
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Payment verified successfully',
        data: subscription,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Cancel subscription
  Future<ApiResponse<void>> cancelSubscription() async {
    try {
      final response = await _apiService.post(
        ApiConstants.subscriptionCancel,
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Subscription cancelled successfully',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get subscription history
  Future<ApiResponse<List<SubscriptionModel>>> getSubscriptionHistory() async {
    try {
      final response = await _apiService.get(
        ApiConstants.subscriptionHistory,
      );

      final subscriptions = (response.data['subscriptions'] as List)
          .map((sub) => SubscriptionModel.fromJson(sub))
          .toList();

      return ApiResponse(
        success: true,
        message: 'History fetched successfully',
        data: subscriptions,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Apply coupon code
  Future<ApiResponse<Map<String, dynamic>>> applyCoupon({
    required String planId,
    required String couponCode,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.subscriptionApplyCoupon,
        data: {
          'planId': planId,
          'couponCode': couponCode,
        },
      );

      return ApiResponse(
        success: true,
        message: response.data['message'] ?? 'Coupon applied successfully',
        data: response.data,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: e.toString(),
      );
    }
  }
}
