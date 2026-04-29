import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/dio_provider.dart';
import '../../households/data/models/household_create.dart';
import '../../households/data/models/household.dart';

final onboardingRepositoryProvider = Provider<OnboardingRepository>(
  (ref) => OnboardingRepository(ref.watch(apiClientProvider)),
);

class OnboardingRepository {
  const OnboardingRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<Household> createHousehold(HouseholdCreate householdData) async {
    return _apiClient.post<Household>(
      '/households',
      data: householdData.toJson(),
      decoder: (data) => Household.fromJson(data as Map<String, dynamic>),
    );
  }
}