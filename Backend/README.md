# ⚙️ WellSync AI — Backend

**High-Performance FastAPI Service for Health Timelines and AI Orchestration.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![SQLModel](https://img.shields.io/badge/SQLModel-0.0.14-009485?style=for-the-badge&logo=pydantic)](https://sqlmodel.tiangolo.com/)
[![GitHub Models](https://img.shields.io/badge/AI-GitHub_Models_(GPT--4o)-black?style=for-the-badge)](https://github.com/marketplace/models)

---

## 🌟 Overview

The WellSync AI Backend is a robust, asynchronous Python service that manages family health records, generates deterministic healthcare timelines, and orchestrates AI-driven medical safety checks and voice interactions.

## ✨ Key Features

- **🛡️ Deterministic Health Engine**: Generates immunization and preventive care schedules based on India's National Immunization Schedule (NIS).
- **🧠 AI Orchestration**: Uses GitHub Models (GPT-4o) for plain-language medical explanations and voice conversation synthesis.
- **👁️ Multimodal Medicine OCR**: Integrated GPT-4o Vision for extracting data from medicine packaging and prescriptions.
- **🎙️ Vapi Webhook Integration**: Custom tool-calling backend for Vapi voice assistants, providing real-time data context.
- **🗺️ Regional Localization**: Automated translation of health guidance into 7+ Indian languages.
- **📦 Reliable Storage**: Neon Serverless Postgres with SQLModel for type-safe, asynchronous database operations.

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or 3.12
- [uv](https://astral.sh/uv) (Recommended for lightning-fast dependency management)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Setup environment and install dependencies:
   ```bash
   # Using uv
   uv sync --extra dev
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` with a `DATABASE_URL` (Neon) and `GITHUB_TOKEN`.

### Running the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## 🧪 Testing

The backend includes a comprehensive suite of 29 tests covering schedule logic, API endpoints, and safety classifiers.

```bash
pytest tests/ -v
```

## 📂 Project Structure

- `app/api/v1/`: API route handlers (Households, Dependents, Medicine, Voice).
- `app/services/`: Core logic (Health Engine, AI Service, OCR, Safety Classifier).
- `app/models/`: SQLModel database table definitions.
- `app/core/`: Application configuration and database engine setup.
- `data/`: Source-of-truth JSON files for immunization schedules.

## 🏁 Key Design Decisions

- **Deterministic Logic First**: All health schedules are computed using rules, never predicted by AI.
- **Async Throughout**: Built with `async/await` for high concurrency and low latency.
- **SQLModel Alignment**: Combined the power of SQLAlchemy and Pydantic for the database layer.

---

Built with ❤️ by **Varad Joshi** for WellSync AI.
