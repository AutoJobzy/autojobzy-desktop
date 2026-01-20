/// Subscription Model
class SubscriptionModel {
  final String id;
  final String userId;
  final String planId;
  final String? planName;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;
  final double amount;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  SubscriptionModel({
    required this.id,
    required this.userId,
    required this.planId,
    this.planName,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
    required this.amount,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['id'].toString(),
      userId: json['userId'] as String,
      planId: json['planId'].toString(),
      planName: json['planName'] as String?,
      razorpayOrderId: json['razorpayOrderId'] as String?,
      razorpayPaymentId: json['razorpayPaymentId'] as String?,
      razorpaySignature: json['razorpaySignature'] as String?,
      amount: (json['amount'] as num).toDouble(),
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      status: json['status'] ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'planId': planId,
      if (planName != null) 'planName': planName,
      if (razorpayOrderId != null) 'razorpayOrderId': razorpayOrderId,
      if (razorpayPaymentId != null) 'razorpayPaymentId': razorpayPaymentId,
      if (razorpaySignature != null) 'razorpaySignature': razorpaySignature,
      'amount': amount,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isActive => status == 'active' && endDate.isAfter(DateTime.now());
  bool get isExpired => endDate.isBefore(DateTime.now());
  bool get isPending => status == 'pending';

  int get daysRemaining {
    if (isExpired) return 0;
    return endDate.difference(DateTime.now()).inDays;
  }

  String get amountFormatted => '₹${amount.toStringAsFixed(0)}';
}
