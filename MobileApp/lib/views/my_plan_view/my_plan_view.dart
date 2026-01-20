import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:intl/intl.dart';
import '../../constants/color_constants.dart';
import '../../viewmodels/my_plan_view_model.dart';
import '../../widgets/common_button.dart';
import '../../models/plan_model.dart';
import '../../models/subscription_model.dart';

/// My Plan View - Subscription Management Screen
class MyPlanView extends StatefulWidget {
  const MyPlanView({Key? key}) : super(key: key);

  @override
  State<MyPlanView> createState() => _MyPlanViewState();
}

class _MyPlanViewState extends State<MyPlanView> {
  late Razorpay _razorpay;
  final TextEditingController _couponController = TextEditingController();
  String? _selectedPlanId;
  Map<String, dynamic>? _appliedCoupon;
  bool _isApplyingCoupon = false;

  @override
  void initState() {
    super.initState();
    _initializeRazorpay();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _initializeRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  Future<void> _loadData() async {
    final viewModel = context.read<MyPlanViewModel>();
    await viewModel.initialize();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    final viewModel = context.read<MyPlanViewModel>();

    try {
      final success = await viewModel.verifyPayment(
        orderId: response.orderId ?? '',
        paymentId: response.paymentId ?? '',
        signature: response.signature ?? '',
      );

      if (success && mounted) {
        _showSuccessDialog();
        setState(() {
          _selectedPlanId = null;
          _appliedCoupon = null;
          _couponController.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Payment verification failed: ${e.toString()}');
      }
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _showErrorSnackBar('Payment failed: ${response.message}');
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    _showErrorSnackBar('External wallet selected: ${response.walletName}');
  }

  Future<void> _initiatePayment(PlanModel plan) async {
    final viewModel = context.read<MyPlanViewModel>();

    try {
      final orderData = await viewModel.createOrder(planId: plan.id);

      if (orderData == null || !mounted) return;

      final options = {
        'key': orderData['razorpayKey'] ?? '',
        'amount': orderData['amount'] ?? 0,
        'name': 'AutoJobzy',
        'description': plan.name,
        'order_id': orderData['orderId'] ?? '',
        'prefill': {
          'contact': orderData['contact'] ?? '',
          'email': orderData['email'] ?? '',
        },
        'theme': {
          'color': '#00F3FF',
        }
      };

      _razorpay.open(options);
    } catch (e) {
      _showErrorSnackBar('Failed to initiate payment: ${e.toString()}');
    }
  }

  Future<void> _applyCoupon(String planId) async {
    if (_couponController.text.trim().isEmpty) {
      _showErrorSnackBar('Please enter a coupon code');
      return;
    }

    setState(() => _isApplyingCoupon = true);

    try {
      final viewModel = context.read<MyPlanViewModel>();
      final result = await viewModel.applyCoupon(
        planId: planId,
        couponCode: _couponController.text.trim(),
      );

      if (result != null && mounted) {
        setState(() {
          _appliedCoupon = result;
        });
        _showSuccessSnackBar('Coupon applied successfully!');
      }
    } catch (e) {
      _showErrorSnackBar('Failed to apply coupon');
    } finally {
      if (mounted) {
        setState(() => _isApplyingCoupon = false);
      }
    }
  }

  Future<void> _cancelSubscription() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: const Text(
          'Are you sure you want to cancel your subscription? '
          'You will lose access to premium features at the end of your billing period.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No, Keep It'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: ColorConstants.error,
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final viewModel = context.read<MyPlanViewModel>();
    final success = await viewModel.cancelSubscription();

    if (success && mounted) {
      _showSuccessSnackBar('Subscription cancelled successfully');
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Column(
          children: [
            Icon(
              Icons.check_circle,
              color: ColorConstants.success,
              size: 60,
            ),
            SizedBox(height: 16),
            Text('Payment Successful!'),
          ],
        ),
        content: const Text(
          'Your subscription has been activated successfully.',
          textAlign: TextAlign.center,
        ),
        actions: [
          CommonButton(
            text: 'Done',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ColorConstants.success,
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ColorConstants.error,
      ),
    );
  }

  @override
  void dispose() {
    _razorpay.clear();
    _couponController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('My Plan'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Consumer<MyPlanViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isBusy) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: _loadData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Current Subscription Card
                  if (viewModel.currentSubscription != null) ...[
                    _buildCurrentSubscriptionCard(viewModel.currentSubscription!),
                    const SizedBox(height: 24),
                  ],

                  // Available Plans Section
                  const Text(
                    'Available Plans',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: ColorConstants.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Choose the plan that fits your needs',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Plans List
                  ...viewModel.plans.map((plan) {
                    return _buildPlanCard(plan, viewModel);
                  }).toList(),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCurrentSubscriptionCard(SubscriptionModel subscription) {
    final startDate = DateFormat('MMM dd, yyyy').format(subscription.startDate);
    final endDate = DateFormat('MMM dd, yyyy').format(subscription.endDate);
    final daysRemaining = subscription.daysRemaining;

    Color statusColor;
    String statusText;

    if (subscription.isActive) {
      statusColor = ColorConstants.success;
      statusText = 'Active';
    } else if (subscription.isPending) {
      statusColor = ColorConstants.warning;
      statusText = 'Pending';
    } else {
      statusColor = ColorConstants.error;
      statusText = 'Expired';
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ColorConstants.primaryBlue.withOpacity(0.8),
            ColorConstants.primaryPurple.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: ColorConstants.primaryBlue.withOpacity(0.3),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Current Plan',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    statusText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              subscription.planName ?? 'Premium Plan',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subscription.amountFormatted,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Divider(color: Colors.white.withOpacity(0.3)),
            const SizedBox(height: 16),
            _buildInfoRow(Icons.calendar_today, 'Start Date', startDate),
            const SizedBox(height: 12),
            _buildInfoRow(Icons.event, 'End Date', endDate),
            const SizedBox(height: 12),
            _buildInfoRow(
              Icons.access_time,
              'Days Remaining',
              '$daysRemaining days',
            ),
            if (subscription.isActive) ...[
              const SizedBox(height: 20),
              CommonButton(
                text: 'Cancel Subscription',
                onPressed: _cancelSubscription,
                isOutlined: true,
                color: Colors.white,
                textColor: Colors.white,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: Colors.white70, size: 18),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildPlanCard(PlanModel plan, MyPlanViewModel viewModel) {
    final isExpanded = _selectedPlanId == plan.id;
    final currentSubscription = viewModel.currentSubscription;
    final isCurrentPlan = currentSubscription?.planId == plan.id;
    final hasActiveSubscription = viewModel.hasActiveSubscription;

    Color planColor = ColorConstants.planBasic;
    if (plan.isPopular) {
      planColor = ColorConstants.planPro;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: isExpanded ? 8 : 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: plan.isPopular
              ? ColorConstants.primaryBlue
              : Colors.transparent,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plan Header
          Container(
            decoration: BoxDecoration(
              gradient: plan.isPopular
                  ? LinearGradient(
                      colors: [
                        ColorConstants.primaryBlue.withOpacity(0.1),
                        ColorConstants.primaryPurple.withOpacity(0.1),
                      ],
                    )
                  : null,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                plan.name,
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: planColor,
                                ),
                              ),
                              if (plan.isPopular) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: ColorConstants.primaryGradient,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'POPULAR',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          if (plan.subtitle != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              plan.subtitle!,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (isCurrentPlan)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: ColorConstants.success,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan.priceFormatted,
                      style: const TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.textDark,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Text(
                        '/ ${plan.duration}',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ],
                ),
                if (plan.description != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    plan.description!,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Features List
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Features',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.textDark,
                  ),
                ),
                const SizedBox(height: 12),
                ...plan.features.map((feature) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: ColorConstants.success.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            size: 16,
                            color: ColorConstants.success,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            feature.label,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ],
            ),
          ),

          // Coupon Code Section (only when expanded)
          if (isExpanded && !isCurrentPlan) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Have a coupon code?',
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
                        child: TextField(
                          controller: _couponController,
                          decoration: InputDecoration(
                            hintText: 'Enter coupon code',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      CommonButton(
                        text: 'Apply',
                        onPressed: () => _applyCoupon(plan.id),
                        isLoading: _isApplyingCoupon,
                        width: 100,
                        height: 48,
                      ),
                    ],
                  ),
                  if (_appliedCoupon != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: ColorConstants.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle,
                            color: ColorConstants.success,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Coupon applied: ${_appliedCoupon!['discount'] ?? '0'}% off',
                              style: const TextStyle(
                                color: ColorConstants.success,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            onPressed: () {
                              setState(() {
                                _appliedCoupon = null;
                                _couponController.clear();
                              });
                            },
                            color: ColorConstants.success,
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],

          // Action Buttons
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                if (!isCurrentPlan && !plan.comingSoon) ...[
                  CommonButton(
                    text: hasActiveSubscription ? 'Upgrade Plan' : 'Subscribe Now',
                    onPressed: () {
                      setState(() {
                        if (isExpanded) {
                          _initiatePayment(plan);
                        } else {
                          _selectedPlanId = plan.id;
                        }
                      });
                    },
                    color: plan.isPopular
                        ? ColorConstants.primaryBlue
                        : ColorConstants.primaryPurple,
                    icon: Icon(
                      hasActiveSubscription
                          ? Icons.arrow_upward
                          : Icons.shopping_cart,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ],
                if (plan.comingSoon)
                  CommonButton(
                    text: 'Coming Soon',
                    onPressed: null,
                    isEnabled: false,
                  ),
                if (isCurrentPlan && currentSubscription!.isActive)
                  CommonButton(
                    text: 'Current Plan',
                    onPressed: null,
                    isEnabled: false,
                  ),
                if (isExpanded && !isCurrentPlan) ...[
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _selectedPlanId = null;
                        _appliedCoupon = null;
                        _couponController.clear();
                      });
                    },
                    child: const Text('Cancel'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
