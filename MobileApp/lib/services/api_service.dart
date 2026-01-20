import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'local_storage_service.dart';

/// API Service for handling all HTTP requests
class ApiService {
  late final Dio _dio;
  final LocalStorageService _storageService = LocalStorageService();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to requests
          final token = await _storageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Log request
          print('🌐 REQUEST[${options.method}] => ${options.uri}');
          print('📦 DATA: ${options.data}');

          return handler.next(options);
        },
        onResponse: (response, handler) {
          // Log response
          print('✅ RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}');
          print('📥 DATA: ${response.data}');

          return handler.next(response);
        },
        onError: (error, handler) async {
          // Log error
          print('❌ ERROR[${error.response?.statusCode}] => ${error.requestOptions.uri}');
          print('💥 MESSAGE: ${error.message}');
          print('📛 DATA: ${error.response?.data}');

          // Handle 401 Unauthorized - Token expired
          if (error.response?.statusCode == 401) {
            await _storageService.clearToken();
            // TODO: Navigate to login screen
          }

          return handler.next(error);
        },
      ),
    );
  }

  /// GET Request
  Future<Response> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// POST Request
  Future<Response> post(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// PUT Request
  Future<Response> put(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// DELETE Request
  Future<Response> delete(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Upload File
  Future<Response> uploadFile(
    String endpoint,
    String filePath,
    String fieldName, {
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?additionalData,
      });

      final response = await _dio.post(
        endpoint,
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Handle Dio Errors
  String _handleError(DioException error) {
    String errorMessage = 'An error occurred';

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Connection timeout. Please try again.';
        break;

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;

        if (statusCode != null) {
          switch (statusCode) {
            case 400:
              errorMessage = data?['error'] ?? 'Bad request';
              break;
            case 401:
              errorMessage = 'Session expired. Please login again.';
              break;
            case 403:
              errorMessage = 'Access denied';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = data?['error'] ?? 'Something went wrong';
          }
        }
        break;

      case DioExceptionType.cancel:
        errorMessage = 'Request cancelled';
        break;

      case DioExceptionType.connectionError:
        errorMessage = 'No internet connection';
        break;

      default:
        errorMessage = error.message ?? 'Unknown error occurred';
    }

    return errorMessage;
  }

  /// Close Dio instance
  void dispose() {
    _dio.close();
  }
}
