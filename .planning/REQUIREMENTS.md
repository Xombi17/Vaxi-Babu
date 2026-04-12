# WellSync AI — Requirements

**Last updated:** 2026-04-11 after initialization

## v1 Requirements

### Household Management

- [ ] **HH-01**: User can create a household with name, preferred language, and location
- [ ] **HH-02**: User can view household details
- [ ] **HH-03**: User can update household information
- [ ] **HH-04**: User can delete a household

### Dependent Profiles

- [ ] **DEP-01**: User can add a dependent (child/adult/elder/pregnant) to a household
- [ ] **DEP-02**: User can provide dependent's date of birth and sex
- [ ] **DEP-03**: User can specify pregnancy details for pregnant dependents
- [ ] **DEP-04**: User can view all dependents in a household
- [ ] **DEP-05**: User can update dependent information
- [ ] **DEP-06**: User can remove a dependent from household
- [ ] **DEP-07**: System generates health timeline automatically from DOB

### Health Timeline

- [ ] **HL-01**: System generates vaccination schedule from child's date of birth (NIS India)
- [ ] **HL-02**: System marks events as upcoming (future)
- [ ] **HL-03**: System marks events as due (within 7 days of due date)
- [ ] **HL-04**: System marks events as overdue (past due date)
- [ ] **HL-05**: System marks events as completed when user acknowledges
- [ ] **HL-06**: User can view timeline grouped by status
- [ ] **HL-07**: User can see next priority action prominently
- [ ] **HL-08**: User can mark an event as done
- [ ] **HL-09**: User can snooze or acknowledge a reminder

### Voice Interaction

- [ ] **VC-01**: User can ask voice questions about health timeline
- [ ] **VC-02**: System listens in supported languages (English, Hindi)
- [ ] **VC-03**: System responds with voice output in simple language
- [ ] **VC-04**: Live voice session connects via Vapi webhook
- [ ] **VC-05**: Text fallback available if voice fails

### Health Explanations

- [ ] **EX-01**: Each event includes plain-language explanation of what it is
- [ ] **EX-02**: Each event explains why it matters
- [ ] **EX-03**: Each event provides recommended action
- [ ] **EX-04**: Explanations are grounded in preapproved facts (not LLM-generated)

### Medicine Safety Checker

- [ ] **MS-01**: User can upload image of medicine packaging/strip
- [ ] **MS-02**: System extracts text via OCR (3-tier fallback)
- [ ] **MS-03**: System normalizes medicine name to known record
- [ ] **MS-04**: System checks safety classification (4 buckets)
- [ ] **MS-05**: System returns simplified response in safe language
- [ ] **MS-06**: High-risk cases escalate to "consult doctor/pharmacist"

### Reminders

- [ ] **RM-01**: User can view upcoming reminders
- [ ] **RM-02**: User can mark reminder as done
- [ ] **RM-03**: User can snooze reminder
- [ ] **RM-04**: User can acknowledge reminder

### Offline Support

- [ ] **OF-01**: App shell is cached for offline access
- [ ] **OF-02**: Core household and timeline data stored locally (IndexedDB/Dexie)
- [ ] **OF-03**: Updates queued for later sync when offline
- [ ] **OF-04**: Data syncs when connectivity restored

## v2 Requirements (Deferred)

- Multi-child household dashboard
- Pregnancy schedule support
- Elder care reminders
- Medicine adherence reminders
- Community health worker mode
- WhatsApp/IVR follow-up channels

## Out of Scope

| Exclusion | Reason |
|-----------|--------|
| Medical diagnosis | Not a medical device — only memory assistance |
| Emergency treatment guidance | Beyond scope — users should call emergency services |
| Autonomous medical decisions | LLM never makes health decisions — deterministic only |
| Uncontrolled LLM scheduling | Health schedules come from fixed rules, not AI |
| Admin panel | MVP focuses on user-facing features |
| Handwritten prescription OCR | Future enhancement |
| Allergy cross-checking | Future enhancement |

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| HH-01 through HH-04 | TBD | Planned |
| DEP-01 through DEP-07 | TBD | Planned |
| HL-01 through HL-09 | TBD | Planned |
| VC-01 through VC-05 | TBD | Planned |
| EX-01 through EX-04 | TBD | Planned |
| MS-01 through MS-06 | TBD | Planned |
| RM-01 through RM-04 | TBD | Planned |
| OF-01 through OF-04 | TBD | Planned |