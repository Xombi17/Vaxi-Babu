import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter/foundation.dart';

import '../data/growth_repository.dart';
import '../data/models/growth_record.dart';

final growthControllerProvider =
    StateNotifierProvider<GrowthController, GrowthState>(
        GrowthController.new);

class GrowthController extends StateNotifier<GrowthState> {
  final Ref ref;

  GrowthController(this.ref) : super(const GrowthState.initial());

  Future<void> createGrowthRecord({
    required String dependentId,
    required String householdId,
    required DateTime recordedDate,
    double? heightCm,
    double? weightKg,
    double? headCircumferenceCm,
    String? milestoneAchieved,
    String? notes,
  }) async {
    state = state.copyWith(isLoading: true);

    try {
      final record = await ref
          .read(growthRepositoryProvider)
          .createGrowthRecord(
            dependentId: dependentId,
            householdId: householdId,
            recordedDate: recordedDate,
            heightCm: heightCm,
            weightKg: weightKg,
            headCircumferenceCm: headCircumferenceCm,
            milestoneAchieved: milestoneAchieved,
            notes: notes,
          );
      state = state.copyWith(
        isLoading: false,
        recentRecord: record,
        error: null,
      );
      // Invalidate the growth records list to refresh
      ref.invalidate(growthRecordsProvider(dependentId));
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        recentRecord: null,
      );
      rethrow;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

@immutable
class GrowthState {
  final bool isLoading;
  final GrowthRecord? recentRecord;
  final String? error;

  const GrowthState({
    this.isLoading = false,
    this.recentRecord,
    this.error,
  });

  const GrowthState.initial()
      : isLoading = false,
        recentRecord = null,
        error = null;

  GrowthState copyWith({
    bool? isLoading,
    GrowthRecord? recentRecord,
    String? error,
  }) {
    return GrowthState(
      isLoading: isLoading ?? this.isLoading,
      recentRecord: recentRecord ?? this.recentRecord,
      error: error ?? this.error,
    );
  }
}

// Provider for fetching growth records
final growthRecordsProvider =
    StateNotifierProviderFamily<GrowthRecordsController, List<GrowthRecord>, String>(
        (ref, dependentId) => GrowthRecordsController(ref, dependentId));

class GrowthRecordsController extends StateNotifier<List<GrowthRecord>> {
  final Ref ref;
  final String dependentId;

  GrowthRecordsController(this.ref, this.dependentId) : super([]) {
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    try {
      final records = await ref
          .read(growthRepositoryProvider)
          .listGrowthRecords(dependentId);
      state = records;
    } catch (e) {
      // Keep empty state on error, could show error in UI
      state = [];
    }
  }

  void refresh() {
    _loadRecords();
  }
}