import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter/foundation.dart';

import '../data/pregnancy_repository.dart';
import '../data/models/pregnancy_profile.dart';

final pregnancyControllerProvider =
    StateNotifierProvider<PregnancyController, PregnancyState>(
        PregnancyController.new);

class PregnancyController extends StateNotifier<PregnancyState> {
  final Ref ref;

  PregnancyController(this.ref) : super(const PregnancyState.initial());

  Future<void> createPregnancyProfile({
    required String householdId,
    required DateTime lmpDate,
  }) async {
    state = state.copyWith(isLoading: true);

    try {
      final profile = await ref
          .read(pregnancyRepositoryProvider)
          .createPregnancyProfile(
            householdId: householdId,
            lmpDate: lmpDate,
          );
      state = state.copyWith(
        isLoading: false,
        profile: profile,
        error: null,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        profile: null,
      );
      rethrow;
    }
  }

  Future<void> loadPregnancyProfile(String householdId) async {
    state = state.copyWith(isLoading: true);

    try {
      final profile = await ref
          .read(pregnancyRepositoryProvider)
          .getPregnancyProfile(householdId);
      state = state.copyWith(
        isLoading: false,
        profile: profile,
        error: null,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        profile: null,
      );
    }
  }

  Future<void> updatePregnancyProfile({
    required String householdId,
    bool? completed,
    String? highRiskFlags,
  }) async {
    state = state.copyWith(isLoading: true);

    try {
      final profile = await ref
          .read(pregnancyRepositoryProvider)
          .updatePregnancyProfile(
            householdId: householdId,
            completed: completed,
            highRiskFlags: highRiskFlags,
          );
      state = state.copyWith(
        isLoading: false,
        profile: profile,
        error: null,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        profile: null,
      );
      rethrow;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

@immutable
class PregnancyState {
  final bool isLoading;
  final PregnancyProfile? profile;
  final String? error;

  const PregnancyState({
    this.isLoading = false,
    this.profile,
    this.error,
  });

  const PregnancyState.initial()
      : isLoading = false,
        profile = null,
        error = null;

  PregnancyState copyWith({
    bool? isLoading,
    PregnancyProfile? profile,
    String? error,
  }) {
    return PregnancyState(
      isLoading: isLoading ?? this.isLoading,
      profile: profile ?? this.profile,
      error: error ?? this.error,
    );
  }
}