import '../models/plan_model.dart';
import '../models/subscription_model.dart';
import '../services/subscription_service.dart';
import 'base_view_model.dart';

/// My Plan ViewModel
class MyPlanViewModel extends BaseViewModel {
  final SubscriptionService _subscriptionService = SubscriptionService();

  List<PlanModel> _plans = [];
  SubscriptionModel? _currentSubscription;

  List<PlanModel> get plans => _plans;
  SubscriptionModel? get currentSubscription => _currentSubscription;
  bool get hasActiveSubscription => _currentSubscription?.isActive ?? false;

  /// Load all available plans
  Future<bool> loadPlans() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _subscriptionService.getPlans();

        if (response.success && response.data != null) {
          _plans = response.data!;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load plans');
        }
      },
      errorMessage: 'Failed to load plans',
    );

    return result ?? false;
  }

  /// Load current subscription
  Future<bool> loadCurrentSubscription() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _subscriptionService.getCurrentSubscription();

        if (response.success) {
          _currentSubscription = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load subscription');
        }
      },
      errorMessage: 'Failed to load subscription',
    );

    return result ?? false;
  }

  /// Create Razorpay order
  Future<Map<String, dynamic>?> createOrder({required String planId}) async {
    final result = await runBusyFuture<Map<String, dynamic>?>(
      () async {
        final response = await _subscriptionService.createOrder(
          planId: planId,
        );

        if (response.success && response.data != null) {
          return response.data;
        } else {
          throw Exception(response.error ?? 'Failed to create order');
        }
      },
      errorMessage: 'Failed to create order',
    );

    return result;
  }

  /// Verify payment
  Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _subscriptionService.verifyPayment(
          orderId: orderId,
          paymentId: paymentId,
          signature: signature,
        );

        if (response.success && response.data != null) {
          _currentSubscription = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to verify payment');
        }
      },
      errorMessage: 'Failed to verify payment',
      successMessage: 'Payment verified successfully',
    );

    return result ?? false;
  }

  /// Cancel subscription
  Future<bool> cancelSubscription() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _subscriptionService.cancelSubscription();

        if (response.success) {
          // Reload subscription to get updated info
          await loadCurrentSubscription();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to cancel subscription');
        }
      },
      errorMessage: 'Failed to cancel subscription',
      successMessage: 'Subscription cancelled successfully',
    );

    return result ?? false;
  }

  /// Apply coupon code
  Future<Map<String, dynamic>?> applyCoupon({
    required String planId,
    required String couponCode,
  }) async {
    final result = await runBusyFuture<Map<String, dynamic>?>(
      () async {
        final response = await _subscriptionService.applyCoupon(
          planId: planId,
          couponCode: couponCode,
        );

        if (response.success && response.data != null) {
          return response.data;
        } else {
          throw Exception(response.error ?? 'Failed to apply coupon');
        }
      },
      errorMessage: 'Failed to apply coupon',
      successMessage: 'Coupon applied successfully',
    );

    return result;
  }

  /// Load plans and current subscription
  Future<bool> initialize() async {
    final result = await runBusyFuture<bool>(
      () async {
        await loadPlans();
        await loadCurrentSubscription();
        return true;
      },
      errorMessage: 'Failed to initialize',
    );

    return result ?? false;
  }
}
