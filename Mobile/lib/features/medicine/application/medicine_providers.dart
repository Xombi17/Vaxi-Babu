import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/medicine_repository.dart';
import '../data/models/medicine_safety_response.dart';

class MedicineCheckState {
  const MedicineCheckState({
    this.result,
    this.isLoading = false,
    this.errorMessage,
  });

  final MedicineSafetyResponse? result;
  final bool isLoading;
  final String? errorMessage;

  MedicineCheckState copyWith({
    MedicineSafetyResponse? result,
    bool? isLoading,
    String? errorMessage,
  }) {
    return MedicineCheckState(
      result: result ?? this.result,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

final medicineCheckProvider =
    StateNotifierProvider<MedicineCheckController, MedicineCheckState>(
  (ref) => MedicineCheckController(ref.watch(medicineRepositoryProvider)),
);

class MedicineCheckController extends StateNotifier<MedicineCheckState> {
  MedicineCheckController(this._repository) : super(const MedicineCheckState());

  final MedicineRepository _repository;

  Future<void> checkByName({
    required String medicineName,
    String? concern,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.checkByName(
        medicineName: medicineName,
        concern: concern,
      );
      state = MedicineCheckState(result: result, isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> checkByImage({
    required List<int> bytes,
    required String filename,
    String? concern,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.checkByImage(
        bytes: Uint8List.fromList(bytes),
        filename: filename,
        concern: concern,
      );
      state = MedicineCheckState(result: result, isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  void clearResult() {
    state = const MedicineCheckState();
  }
}
