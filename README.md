# 🐾 TeddyPups — Premium Puppy Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()

A modern, high-performance web platform for TeddyPups built from the ground up using **React 19**, **TypeScript**, and **Vite**. The project delivers an engaging user experience with custom canvas animations, SVG motion physics, interactive catalogue filtering, and responsive mobile-first design.

---

## 🌟 Key Features

### 🐶 Puppy Catalogue & Detailed Profiles
- **42 Comprehensive Profiles**: Includes 15 currently available puppies and 27 lovingly adopted ("Gone Home") puppies.
- **Dynamic Filtering**: Filter available puppies by breed with real-time result counts and URL query state persistence.
- **Rich Media Lightbox**: High-resolution photo galleries and video player with touch gestures, swipe navigation, keyboard controls (Escape, Arrow keys), and fullscreen lightbox support.

### 🎨 Custom Motion Physics & Interactions
- **Puppy Mascot Motion Controller**: Integrated SVG gait physics featuring lifelike paw movement, turning arcs, spring dynamics, ear/tail physics, idle blinking, and scroll-linked scene choreography.
- **Interactive Paw Trail**: Mouse cursor creates an organic paw-print trail rendered on an HTML5 canvas with high-DPI scaling, alternating pad offsets, fade lifetimes, and reduced-motion detection.
- **Flight Route Scroll Choreography**: Animated plane following the Korea-to-Dubai flight path along an SVG route responding smoothly to scroll position and velocity.
- **Interactive FAQ Accordion**: Instant search bar with note filtering, empty state handlers, and smooth accordion transitions.

### 📋 Enquiries & Booking Workflow
- Client-side validated adoption enquiry form with phone formatting and field-level validation.
- Configurable backend API integration support via Vite environment variables.
- Direct WhatsApp enquiry linking for puppy adoption queries.

---

## 📂 Project Architecture

The codebase follows a modular, clean separation of concerns:

```
TeddyPuppy_BlutecAI/
├── public/                     # Static media & deployment assets
│   ├── _redirects              # SPA routing fallback for static hosting
│   ├── brand/                  # Logo and branding assets
│   ├── cursor/                 # Custom paw SVGs
│   └── media/                  # Optimized puppy photos and videos
├── src/
│   ├── components/             # Reusable, modular React components
│   │   ├── index.ts            # Central component barrel export
│   │   ├── PawTrail.tsx        # Interactive canvas paw trail
│   │   ├── ScrollPuppy.tsx     # Homepage mascot motion mount
│   │   ├── Template.tsx        # HTML-to-React template hydration engine
│   │   └── UI.tsx              # Catalogue, Lightbox, Gallery & Form components
│   ├── hooks/                  # Custom lifecycle & animation hooks
│   │   ├── index.ts            # Hooks barrel export
│   │   ├── useFlightMotion.ts  # Scroll-driven flight path animation
│   │   ├── useLivePagePuppies.ts # Interactive eye tracking & petting physics
│   │   └── usePageAnimations.ts # Intersection observers & door showcase
│   ├── styles/                 # Application styling
│   │   ├── app.css             # Component layout and interaction styles
│   │   └── reference.css       # Core typography, keyframes & responsive utilities
│   ├── types/                  # Centralized TypeScript definitions
│   │   └── index.ts            # Media, Puppy, and Breed interface models
│   ├── data/                   # Structured data stores
│   │   ├── breeds.json         # Puppy breed catalogue
│   │   ├── families.json       # Happy families testimonial entries
│   │   ├── faq.json            # Frequently asked questions
│   │   ├── pages.json          # Route definitions and metadata
│   │   └── puppies.json        # Detailed puppy attributes & media listings
│   ├── motion/                 # Core animation mathematics & SVG drivers
│   │   ├── reference-motion.js # Physics, gait, and inverse kinematics engine
│   │   └── reference-motion.d.ts
│   ├── templates/              # HTML layout and view templates
│   ├── main.tsx                # Application root, routing, and page transitions
│   └── vite-env.d.ts           # Vite client type references
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and run scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Tech Stack

- **Framework**: React 19 (Hooks, Suspense, Concurrent Mode)
- **Language**: TypeScript 5.9 (Strict mode enabled)
- **Bundler & Dev Server**: Vite 7
- **Template Hydration**: `html-react-parser`
- **Styling**: Vanilla CSS3 Custom Properties, Responsive Media Queries & Keyframe Animations

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or later (Node 20+ recommended)
- `npm` or `pnpm`

### Installation

1. Clone your repository:
   ```bash
   git clone https://github.com/AgamPandey133/BlutecAI-Teddy_Puppy.git
   cd BlutecAI-Teddy_Puppy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The output files will be located in the `dist/` directory, optimized and ready for deployment.

---

## 🌐 Deployment Guide

This project is fully static and client-side routed. It can be deployed in minutes to any modern static hosting service:

### 1. Netlify
- Build Command: `npm run build`
- Publish Directory: `dist`
- *Note:* The included `public/_redirects` file automatically handles single-page app (SPA) routing.

### 2. Vercel
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

### 3. Cloudflare Pages / GitHub Pages
- Build Command: `npm run build`
- Output Directory: `dist`

---

## ⚙️ Environment Configuration

To connect a live enquiry submission backend:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Set your custom endpoint:
   ```env
   VITE_ENQUIRY_ENDPOINT=https://your-api.example.com/enquiry
   ```
If left unset, the form operates in local interactive demo mode without network requests.

---

## 📄 License & Attribution

Developed and maintained by **[Agam Pandey](https://github.com/AgamPandey133)**.
Licensed under the [MIT License](LICENSE).
