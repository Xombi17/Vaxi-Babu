import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/dio_provider.dart';
import '../../../core/network/api_endpoints.dart';
import '../data/models/pregnancy_profile.dart';

final pregnancyRepositoryProvider = Provider<PregnancyRepository>(
  (ref) => PregnancyRepository(ref.watch(apiClientProvider)),
);

class PregnancyRepository {
  const PregnancyRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<PregnancyProfile> createPregnancyProfile({
    required String householdId,
    required DateTime lmpDate,
  }) async {
    return _apiClient.post<PregnancyProfile>(
      ApiEndpoints.pregnancy,
      data: <String, dynamic>{
        'household_id': householdId,
        'lmp_date': lmpDate.toIso8601String(),
      },
      decoder: (data) => PregnancyProfile.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<PregnancyProfile?> getPregnancyProfile(String householdId) async {
    try {
      return _apiClient.get<PregnancyProfile>(
      '${ApiEndpoints.pregnancy}/$householdId',
        decoder: (data) => PregnancyProfile.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      // If not found, return null
      return null;
    }
  }

  Future<PregnancyProfile> updatePregnancyProfile({
    required String householdId,
    bool? completed,
    String? highRiskFlags,
  }) async {
    return _apiClient.patch<PregnancyProfile>(
      '${ApiEndpoints.pregnancy}/$householdId',
      data: <String, dynamic>{
        if (completed != null) 'completed': completed,
        if (highRiskFlags != null) 'high_risk_flags': highRiskFlags,
      },
      decoder: (data) => PregnancyProfile.fromJson(data as Map<String, dynamic>),
    );
  }
}