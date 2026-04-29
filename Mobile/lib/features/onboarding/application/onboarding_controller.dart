import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter/foundation.dart';

import '../data/onboarding_repository.dart';
import '../../households/data/models/household.dart';
import '../../households/data/models/household_create.dart';

final onboardingControllerProvider =
    StateNotifierProvider<OnboardingController, OnboardingState>(
        OnboardingController.new);

class OnboardingController extends StateNotifier<OnboardingState> {
  final Ref ref;

  OnboardingController(this.ref) : super(const OnboardingState.initial());

  Future<void> createHousehold({
    required String name,
    required String primaryLanguage,
    required String userType,
    required String username,
    required String password,
    String? villageTown,
    String? householdState,
    String? district,
    String? aiTone,
    String? language,
    String? voiceMode,
    String? healthFocus,
  }) async {
    state = state.copyWith(isLoading: true);

    final householdData = HouseholdCreate(
      name: name,
      primaryLanguage: primaryLanguage,
      userType: userType,
      username: username,
      password: password,
      villageTown: villageTown,
      state: householdState,
      district: district,
      preferences: HouseholdPreferences(
        aiTone: aiTone ?? 'simple',
        language: language ?? 'en',
        voiceMode: voiceMode ?? 'regional',
        healthFocus: healthFocus ?? 'general',
      ),
    );

    try {
      final household = await ref
          .read(onboardingRepositoryProvider)
          .createHousehold(householdData);
      state = state.copyWith(
        isLoading: false,
        household: household,
        error: null,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        household: null,
      );
      rethrow;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

@immutable
class OnboardingState {
  final bool isLoading;
  final Household? household;
  final String? error;

  const OnboardingState({
    this.isLoading = false,
    this.household,
    this.error,
  });

  const OnboardingState.initial()
      : isLoading = false,
        household = null,
        error = null;

  OnboardingState copyWith({
    bool? isLoading,
    Household? household,
    String? error,
  }) {
    return OnboardingState(
      isLoading: isLoading ?? this.isLoading,
      household: household ?? this.household,
      error: error ?? this.error,
    );
  }
}