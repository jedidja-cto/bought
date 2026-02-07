# Bought Marketplace

![CI Status](https://github.com/jedidja-cto/bought/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Vite](https://img.shields.io/badge/Vite-6-purple)

Bought is a modern, community-focused marketplace PWA (Progressive Web App) that allows users to buy and sell goods locally. It features secure authentication, real-time listings, and a responsive design optimized for mobile and desktop.

## Features (MVP)

- **User Authentication**: Secure email/password login and registration via Supabase Auth.
- **Marketplace Listings**: Browse, search, and filter items by category and price.
- **Selling**: Create listings with photos (drag-and-drop), details, and condition.
- **Profiles**: Manage your listings and view other users' profiles.
- **PWA**: Installable on mobile devices with offline fallback capabilities.
- **Secure**: Row Level Security (RLS) ensures data privacy and integrity.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **State Management**: TanStack Query (React Query), Zustand
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React

## Setup & Development

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jedidja-cto/bought.git
   cd bought
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Set up the database:
   Run the SQL migrations found in `supabase/migrations/` in your Supabase Dashboard SQL Editor.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This app is ready to be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages).

1. Connect your repository to your hosting provider.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in your hosting provider's dashboard.

## License

Private repository. All rights reserved.
