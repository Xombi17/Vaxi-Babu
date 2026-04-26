import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/dio_provider.dart';
import '../data/models/medicine_safety_response.dart';

final medicineRepositoryProvider = Provider<MedicineRepository>(
  (ref) => MedicineRepository(ref.watch(apiClientProvider)),
);

class MedicineRepository {
  const MedicineRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<MedicineSafetyResponse> checkByName({
    required String medicineName,
    String? concern,
    String language = 'en',
  }) {
    return _apiClient.post<MedicineSafetyResponse>(
      '/medicine/check-name',
      data: <String, dynamic>{
        'medicine_name': medicineName,
        if (concern != null && concern.trim().isNotEmpty) 'concern': concern.trim(),
      },
      queryParameters: {
        'language': language,
      },
      decoder: (data) =>
          MedicineSafetyResponse.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<MedicineSafetyResponse> checkByImage({
    required Uint8List bytes,
    required String filename,
    String? concern,
    String language = 'en',
  }) {
    final formData = FormData.fromMap(
      <String, dynamic>{
        'file': MultipartFile.fromBytes(bytes, filename: filename),
        if (concern != null && concern.trim().isNotEmpty) 'concern': concern.trim(),
      },
    );

    return _apiClient.upload<MedicineSafetyResponse>(
      '/medicine/check-image',
      data: formData,
      queryParameters: {
        'language': language,
      },
      decoder: (data) =>
          MedicineSafetyResponse.fromJson(data as Map<String, dynamic>),
    );
  }
}

