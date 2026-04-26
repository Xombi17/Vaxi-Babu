import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../application/medicine_providers.dart';
import '../data/models/medicine_safety_response.dart';

class MedicineScreen extends ConsumerStatefulWidget {
  const MedicineScreen({super.key});

  static const String routePath = '/medicine';

  @override
  ConsumerState<MedicineScreen> createState() => _MedicineScreenState();
}

class _MedicineScreenState extends ConsumerState<MedicineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _medicineNameController = TextEditingController();
  final _concernController = TextEditingController();
  final _picker = ImagePicker();
  bool _useImageMode = false;
  XFile? _selectedImage;

  @override
  void dispose() {
    _medicineNameController.dispose();
    _concernController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final image = await _picker.pickImage(
      source: source,
      imageQuality: 88,
    );
    if (image == null) {
      return;
    }
    setState(() => _selectedImage = image);
  }

  Future<void> _submit() async {
    if (_useImageMode) {
      if (_selectedImage == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pick an image first.')),
        );
        return;
      }

      final bytes = await _selectedImage!.readAsBytes();
      await ref.read(medicineCheckProvider.notifier).checkByImage(
            bytes: bytes,
            filename: _selectedImage!.name,
            concern: _concernController.text.trim().isEmpty
                ? null
                : _concernController.text.trim(),
          );
      return;
    }

    if (!_formKey.currentState!.validate()) {
      return;
    }

    await ref.read(medicineCheckProvider.notifier).checkByName(
          medicineName: _medicineNameController.text.trim(),
          concern: _concernController.text.trim().isEmpty
              ? null
              : _concernController.text.trim(),
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(medicineCheckProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicine Safety'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Check a medicine by name or image',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    SegmentedButton<bool>(
                      segments: const [
                        ButtonSegment<bool>(
                          value: false,
                          label: Text('Type name'),
                          icon: Icon(Icons.edit_outlined),
                        ),
                        ButtonSegment<bool>(
                          value: true,
                          label: Text('Use camera'),
                          icon: Icon(Icons.photo_camera_outlined),
                        ),
                      ],
                      selected: {_useImageMode},
                      onSelectionChanged: (selection) {
                        setState(() => _useImageMode = selection.first);
                      },
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _concernController,
                      decoration: const InputDecoration(
                        labelText: 'Concern (optional)',
                        hintText: 'pregnancy, breastfeeding, child under 5',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_useImageMode) ...[
                      OutlinedButton.icon(
                        onPressed: state.isLoading
                            ? null
                            : () => _showImageSourceSheet(context),
                        icon: const Icon(Icons.add_a_photo_outlined),
                        label: const Text('Pick image'),
                      ),
                      if (_selectedImage != null) ...[
                        const SizedBox(height: 12),
                        _SelectedImageTile(fileName: _selectedImage!.name),
                      ],
                    ] else ...[
                      Form(
                        key: _formKey,
                        child: TextFormField(
                          controller: _medicineNameController,
                          decoration: const InputDecoration(
                            labelText: 'Medicine name',
                            hintText: 'Paracetamol 650, Crocin, etc.',
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Enter a medicine name.';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: state.isLoading ? null : _submit,
                      icon: state.isLoading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.health_and_safety_outlined),
                      label: Text(state.isLoading ? 'Checking...' : 'Check safety'),
                    ),
                    if (state.errorMessage != null) ...[
                      const SizedBox(height: 16),
                      _ErrorBanner(message: state.errorMessage!),
                    ],
                  ],
                ),
              ),
            ),
            if (state.result != null) ...[
              const SizedBox(height: 16),
              _ResultCard(result: state.result!),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _showImageSourceSheet(BuildContext context) async {
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Camera'),
              onTap: () {
                Navigator.of(sheetContext).pop();
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.of(sheetContext).pop();
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SelectedImageTile extends StatelessWidget {
  const _SelectedImageTile({required this.fileName});

  final String fileName;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.image_outlined),
          const SizedBox(width: 12),
          Expanded(child: Text(fileName)),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        _friendlyMessage(message),
        style: TextStyle(
          color: Theme.of(context).colorScheme.onErrorContainer,
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.result});

  final MedicineSafetyResponse result;

  @override
  Widget build(BuildContext context) {
    final badgeColor = switch (result.bucket) {
      SafetyBucket.commonUse => Colors.green,
      SafetyBucket.useWithCaution => Colors.orange,
      SafetyBucket.insufficientInfo => Colors.amber,
      SafetyBucket.consultDoctorUrgently => Colors.red,
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    result.detectedMedicine,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                Chip(
                  label: Text(_bucketLabel(result.bucket)),
                  backgroundColor: badgeColor.withValues(alpha: 0.15),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('Concern checked: ${result.concernChecked}'),
            const SizedBox(height: 8),
            Text(result.whyCaution),
            const SizedBox(height: 12),
            Text('Next step: ${result.nextStep}'),
            const SizedBox(height: 12),
            Text(
              result.disclaimer,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (result.rawOcrText != null && result.rawOcrText!.trim().isNotEmpty) ...[
              const SizedBox(height: 16),
              ExpansionTile(
                title: const Text('Raw OCR text'),
                children: [
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(result.rawOcrText!),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

String _bucketLabel(SafetyBucket bucket) {
  return switch (bucket) {
    SafetyBucket.commonUse => 'Usually okay',
    SafetyBucket.useWithCaution => 'Use with caution',
    SafetyBucket.insufficientInfo => 'Not enough info',
    SafetyBucket.consultDoctorUrgently => 'Talk to doctor',
  };
}

String _friendlyMessage(String raw) {
  if (raw.contains('404')) {
    return 'Could not reach the medicine safety service.';
  }
  if (raw.contains('413')) {
    return 'Image is too large. Pick a smaller one.';
  }
  if (raw.contains('422')) {
    return 'The image did not contain readable medicine text.';
  }
  return raw;
}
