"""
Medicine Safety Service
------------------------
Deterministic rule-based classifier for medicine safety.
The LLM is used ONLY to simplify the output, not to make safety decisions.

Safety buckets (from PRD):
  - common_use              → generally used without special precautions
  - use_with_caution        → notable warnings or interactions
  - insufficient_info       → not enough known, consult professional
  - consult_doctor_urgently → high risk signal detected
"""

import re

import structlog

from app.schemas.medicine import SafetyBucket

log = structlog.get_logger()


# ─────────────────────────────────────────────────────────────────────────────
# Simple drug safety knowledge base
# In production, replace/supplement with a proper drug database
# ─────────────────────────────────────────────────────────────────────────────

# Format: medicine_name_fragment (lowercase) → (bucket, concern, why_caution, next_step)
_SAFETY_RULES: list[tuple[str, SafetyBucket, str, str, str]] = [
    # Pattern,                    Bucket,                    Concern,         Why,                                         Next step
    ("paracetamol",               "common_use",               "general use",   "Paracetamol is generally safe when taken at the correct dose.", "Follow package dosage. Avoid high doses for prolonged periods."),
    ("acetaminophen",             "common_use",               "general use",   "Acetaminophen is generally safe at recommended doses.", "Follow package dosage carefully."),
    ("ibuprofen",                 "use_with_caution",         "pregnancy / stomach", "Ibuprofen should be avoided in pregnancy (especially 3rd trimester) and can irritate the stomach.", "Avoid in pregnancy. Take with food. Consult a doctor if unsure."),
    ("aspirin",                   "use_with_caution",         "pregnancy / children", "Aspirin is not safe for children under 16 and should be avoided in pregnancy.", "Do not give to children. Avoid in pregnancy. Consult a doctor."),
    ("metformin",                 "use_with_caution",         "kidney function", "Metformin requires monitoring of kidney function and may need dose adjustment.", "Take only as prescribed. Get regular kidney function tests."),
    ("amoxicillin",               "use_with_caution",         "allergy",       "Amoxicillin is a penicillin antibiotic. Allergic reactions are possible.", "Check for penicillin allergy before use. Complete the full course as prescribed."),
    ("ciprofloxacin",             "use_with_caution",         "pregnancy",     "Ciprofloxacin is generally avoided in pregnancy and growing children.", "Avoid in pregnancy and children unless prescribed. Consult a doctor."),
    ("doxycycline",               "use_with_caution",         "pregnancy / children", "Doxycycline is contraindicated in pregnancy and children under 8.", "Do not use in pregnancy or children under 8. Consult a doctor."),
    ("warfarin",                  "consult_doctor_urgently",  "bleeding risk", "Warfarin thins blood and has many drug interactions. Incorrect use can cause serious bleeding.", "Only use as prescribed. Do not change dose or stop without doctor advice."),
    ("methotrexate",              "consult_doctor_urgently",  "pregnancy / toxicity", "Methotrexate is highly toxic and causes severe birth defects. It must not be used without specialist supervision.", "Consult your specialist immediately. Do not take if pregnant or planning pregnancy."),
    ("thalidomide",               "consult_doctor_urgently",  "pregnancy",     "Thalidomide causes severe birth defects and is absolutely contraindicated in pregnancy.", "Do not use in pregnancy under any circumstances. Consult a doctor immediately."),
    ("misoprostol",               "consult_doctor_urgently",  "pregnancy",     "Misoprostol causes uterine contractions and can trigger miscarriage or preterm labour.", "Do not use in pregnancy unless under direct medical supervision."),
    ("isotretinoin",              "consult_doctor_urgently",  "pregnancy",     "Isotretinoin (Accutane/Roaccutane) causes severe birth defects. Strict pregnancy prevention is mandatory.", "Do not use during pregnancy. Requires strict contraception. Consult your dermatologist."),
    ("lithium",                   "consult_doctor_urgently",  "pregnancy / toxicity", "Lithium has a narrow therapeutic window and risks toxicity. It crosses the placenta.", "Use only as prescribed. Monitor blood levels regularly. Consult doctor in pregnancy."),
    ("diazepam",                  "use_with_caution",         "dependence / pregnancy", "Benzodiazepines like diazepam can cause dependence and affect the baby in pregnancy.", "Use only as prescribed for short periods. Avoid in pregnancy if possible. Consult doctor."),
    ("codeine",                   "use_with_caution",         "breastfeeding / children", "Codeine converts to morphine and is unsafe in breastfeeding and children under 12.", "Avoid in breastfeeding mothers and children. Consult a doctor."),
    ("tramadol",                  "use_with_caution",         "pregnancy / dependence", "Tramadol carries dependence risk and is not recommended in pregnancy.", "Use only as prescribed. Avoid in pregnancy. Consult doctor."),
    ("chloramphenicol",           "consult_doctor_urgently",  "newborns",      "Chloramphenicol can cause 'grey baby syndrome' in newborns and is avoided in pregnancy and infants.", "Do not use in newborns or during late pregnancy without specialist supervision."),
    ("tetracycline",              "use_with_caution",         "pregnancy / children", "Tetracycline stains developing teeth and bones. Avoid in children under 8 and pregnant women.", "Do not use in pregnancy or children under 8."),
    ("phenytoin",                 "consult_doctor_urgently",  "pregnancy",     "Phenytoin can cause birth defects (fetal hydantoin syndrome).", "Only use under specialist supervision in pregnancy. Regular monitoring required."),
    ("valproate",                 "consult_doctor_urgently",  "pregnancy",     "Valproate/Valproic acid causes major birth defects and developmental delay.", "Do not use in pregnancy or women of childbearing age without specialist supervision."),
    ("valproic acid",             "consult_doctor_urgently",  "pregnancy",     "Valproic acid causes major birth defects and developmental delay.", "Do not use in pregnancy or women of childbearing age without specialist supervision."),
    ("sodium valproate",          "consult_doctor_urgently",  "pregnancy",     "Sodium valproate causes major birth defects and developmental delay.", "Do not use in pregnancy or women of childbearing age without specialist supervision."),
]


# ─────────────────────────────────────────────────────────────────────────────
# Normalisation helpers
# ─────────────────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    """Lowercase and remove special characters for fuzzy matching."""
    return re.sub(r"[^a-z0-9 ]", " ", text.lower()).strip()


# ─────────────────────────────────────────────────────────────────────────────
# Main classifier
# ─────────────────────────────────────────────────────────────────────────────

def classify_medicine(
    medicine_name: str,
    concern: str | None = None,
) -> tuple[SafetyBucket, str, str, str, float]:
    """
    Classify a medicine into a safety bucket using deterministic rules.

    Returns:
        (bucket, concern_checked, why_caution, next_step, confidence)
    """
    normalized = _normalize(medicine_name)

    best_match: tuple | None = None

    for pattern, bucket, concern_key, why, next_step in _SAFETY_RULES:
        if _normalize(pattern) in normalized:
            # If caller specified a concern, prefer a matching rule
            if concern and concern_key and concern.lower() in concern_key.lower():
                best_match = (bucket, concern_key, why, next_step, 0.90)
                break
            if best_match is None:
                best_match = (bucket, concern_key, why, next_step, 0.80)

    if best_match:
        return best_match  # type: ignore

    # Unknown medicine → return conservative insufficient_info
    log.info("medicine_not_in_rules", medicine=medicine_name)
    return (
        "insufficient_info",
        concern or "general safety",
        (
            f"'{medicine_name}' is not in our current database. "
            "We cannot confirm its safety profile."
        ),
        "Please consult a pharmacist or doctor before using this medicine.",
        0.30,
    )
