import 'package:json_annotation/json_annotation.dart';

import 'package:vaxi_babu_mobile/features/households/data/models/household.dart';

part 'household_create.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, explicitToJson: true)
class HouseholdCreate {
  const HouseholdCreate({
    required this.name,
    required this.primaryLanguage,
    required this.userType,
    required this.username,
    required this.password,
    this.villageTown,
    this.state,
    this.district,
    this.preferences,
  });

  final String name;
  final String primaryLanguage;
  final String userType;
  final String username;
  final String password;
  final String? villageTown;
  final String? state;
  final String? district;
  final HouseholdPreferences? preferences;

  factory HouseholdCreate.fromJson(Map<String, dynamic> json) =>
      _$HouseholdCreateFromJson(json);

  Map<String, dynamic> toJson() => _$HouseholdCreateToJson(this);
}
