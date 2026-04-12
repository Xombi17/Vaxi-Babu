# WellSync AI

**WellSync AI** is a cinematic, voice-first health memory system built to help families remember, understand, and act on essential preventive healthcare tasks such as vaccinations, routine checkups, and medicine-safety checks.

The project is designed for low-access and low-literacy contexts, where healthcare actions are often missed not because of negligence, but because of fragmented records, weak reminder systems, limited digital literacy, and lack of simple guidance.

---

## 🌟 Vision

WellSync AI acts like a high-performance family health memory assistant. 

Instead of expecting users to manually track medical schedules, it provides a **premium, interactive experience** that:

- **Generates a Deterministic Health Timeline** from basic profile data (based on India's National Immunization Schedule).
- **Uses Dynamic Voice Context** to allow families to talk to their data naturally.
- **Provides Multi-Language Support** across 7+ regional Indian languages.
- **Delivers Medicine Safety Double-Checks** via simple image uploads and structured caution logic.
- **Works Offline-First** ensuring reliability in real-world scenarios with unstable connectivity.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Next.js 16 (App Router)** — High-performance React framework.
- **TypeScript** — Type-safe frontend logic.
- **Tailwind CSS + shadcn/ui** — Modern design system with premium components.
- **Framer Motion** — Cinematic, scroll-triggered animations and micro-interactions.
- **TanStack Query** — Robust server state management.
- **PWA support** — Installable on mobile devices for ease of access.
- **IndexedDB + Dexie** — Local caching and offline-first data persistence.

### Backend (Robust & Async)
- **FastAPI** — High-performance Python 3.11+ web framework.
- **SQLModel** — Typed ORM for clean database schema ownership.
- **asyncpg** — High-speed async Postgres driver.
- **Alembic** — Automated database migrations.
- **structlog** — Structured, production-ready logging.
- **India NIS Schedule Engine** — Custom deterministic rules for vaccination timelines.

### AI & Intelligence
- **GitHub Models (GPT-4o)** — Low-latency, state-of-the-art LLM for natural language interactions.
- **GPT-4o Multimodal** — Unified OCR and analysis for medicine safety checks.
- **Vapi AI** — Enterprise-grade voice orchestration with custom tool-calling webhooks.
- **Deterministic Rule Engines** — AI never decides medical safety or schedules; it only explains them.

---

## 🚀 Core Features

### 1. Cinematic Health Timeline
- **Deterministic Generation:** Automatically builds vaccination and checkup schedules based on India's NIS.
- **Life-Stage Aware:** Supports profiles for infants, children, adults, elders, and expectant mothers.
- **Smart Status:** Identifies `Upcoming`, `Due`, `Overdue`, and `Completed` events at a glance.

### 2. Multi-Language Voice Assistant
- **7+ Languages:** Full support for English, Hindi, Marathi, Bengali, Tamil, Telugu, and Gujarati.
- **Context-Aware:** The voice assistant knows who you are and who your children are (e.g., "How is Saanvi's status?").
- **Voice-First UI:** Hands-free interaction designed for caregivers with limited digital literacy.

### 3. AI Medicine Safety Scanner
- **Multimodal OCR:** Upload a photo of any medicine strip or prescription.
- **Safety Classification:** Rule-based logic buckets results into `Common Use`, `Use with Caution`, or `Consult Doctor Urgently`.
- **Explainable Results:** AI simplifies complex medical cautions into easy-to-understand advice.

### 4. Offline-First PWA
- **Reliable in Remote Areas:** Caches critical health data locally.
- **Installable:** Works like a native mobile app without requiring App Store downloads.
- **Background Sync:** Syncs data automatically when internet connectivity is restored.

---

## 📁 Repository Structure

```text
WellSyncAI/
├── Backend/                 # FastAPI + Python 3.11+
│   ├── app/
│   │   ├── api/             # V1 REST & Voice Webhook routes
│   │   ├── core/            # Config, DB connections, Auth
│   │   ├── models/          # SQLModel Database Tables
│   │   ├── services/        # Schedule Engine, AI, Multi-Tier OCR
│   │   └── schemas/         # Pydantic request/response validation
│   ├── alembic/             # DB Migration history
│   ├── data/                # India NIS Schedule definitions
│   └── tests/               # 29/29 Pytest assertions passing
├── Frontend/                # Next.js 16 + Tailwind
│   ├── app/                 # Routes and Layouts
│   ├── components/          # Shadcn + Framer Motion UI components
│   ├── hooks/               # Custom React hooks for data/voice
│   └── public/              # PWA assets and Favicons
├── PRD.md                   # Single source of truth for requirements
└── AGENTS.md                # Agent-specific context and state
```

---

## 🚦 Getting Started

### Backend Setup
```bash
cd Backend
# Install uv for fast dependency management
pip install uv
# Install dependencies & dev tools
uv sync --extra dev
# Setup environment
cp .env.example .env
# Start the server
uvicorn app.main:app --reload --port 8080
```

### Frontend Setup
```bash
cd Frontend
# Install dependencies
pnpm install
# Start local development
pnpm dev
```

---

## 🌍 Supported Languages
WellSync AI aims to bridge the literacy and language gap by supporting:
- 🇺🇸 English
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Marathi (मराठी)
- 🇮🇳 Gujarati (ગુજરાતી)
- 🇮🇳 Bengali (বাংলা)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Telugu (తెలుగు)

---

## ⚖️ Safety & Disclaimer
WellSync AI is **not** a diagnostic medical system.
- It **never** replaces professional medical advice.
- It **never** advises stopping or starting medication on its own.
- All schedules are derived from **deterministic public health rules**, not AI hallucinations.
- **Always consult a doctor or healthcare worker for medical decisions.**

---

## 👨‍💻 Author

Built with ❤️ for health accessibility by **Varad Joshi**.

---

## ⚖️ License
This project is for hackathon and educational purposes.
