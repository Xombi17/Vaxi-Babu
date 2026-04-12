<div align="center">
  <img width="1200" height="475" alt="WellSync AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 📱 WellSync AI — Frontend
  
  **The Cinematic, Voice-First Health Memory Dashboard for Every Family.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Typescript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-FF0055?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
</div>

---

## 🌟 Overview

WellSync AI Frontend is a premium, high-fidelity web application designed to bridge the gap in preventive healthcare for families in low-access areas. It prioritizes **voice-first interaction**, **accessibility**, and **cinematic feedback** to ensure that caregivers—regardless of digital literacy—can easily manage their family's health.

## ✨ Key Features

- **🗣️ Voice-First Interaction**: Integrated with Vapi AI for natural, context-aware conversations about family health.
- **📸 AI Medicine Scanner**: Multi-tier OCR using GPT-4o for safety double-checks on medicine packaging.
- **🗺️ Regional Support**: Seamlessly switch between English, Hindi, Marathi, Gujarati, Bengali, Tamil, and Telugu.
- **📅 Smart Timeline**: A color-coded, deterministic health schedule based on India's National Immunization Schedule (NIS).
- **📴 Offline-First**: Built as a PWA with IndexedDB (Dexie) caching, ensuring reliability in areas with spotty connectivity.
- **✨ Premium UI**: Cinematic scroll-triggered animations and micro-interactions powered by Framer Motion.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **Database (Client)**: IndexedDB with Dexie.js
- **Persistence**: Prisma (Future-ready)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### Installation
1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure your environment variables (see below).
5. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

Create a `.env.local` file in the `Frontend/` directory:

```env
# Backend Connectivity
NEXT_PUBLIC_API_URL=http://localhost:8080

# Vapi Voice Integration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
```

## 📂 Folder Structure

- `app/`: Next.js App Router routes and layouts.
- `components/`: Reusable UI components (ShadCN + Custom).
- `hooks/`: Custom React hooks for data fetching, voice, and language.
- `lib/`: Utility functions, API clients, and constants.
- `public/`: Assets, PWA manifest, and icons.

---

Built with ❤️ by **Varad Joshi** for WellSync AI.
