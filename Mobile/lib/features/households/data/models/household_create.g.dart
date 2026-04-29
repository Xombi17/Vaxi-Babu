part of 'household_create.dart';

HouseholdCreate _$HouseholdCreateFromJson(Map<String, dynamic> json) =>
    HouseholdCreate(
      name: json['name'] as String,
      primaryLanguage: json['primary_language'] as String,
      userType: json['user_type'] as String,
      username: json['username'] as String,
      password: json['password'] as String,
      villageTown: json['village_town'] as String?,

      district: json['district'] as String?,
      preferences: json['preferences'] == null
          ? null
          : HouseholdPreferences.fromJson(
              json['preferences'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$HouseholdCreateToJson(HouseholdCreate instance) =>
    <String, dynamic>{
      'name': instance.name,
      'primary_language': instance.primaryLanguage,
      'user_type': instance.userType,
      'username': instance.username,
      'password': instance.password,
      'village_town': instance.villageTown,

      'district': instance.district,
      'preferences': instance.preferences?.toJson(),
    };
