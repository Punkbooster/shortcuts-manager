# Shortcuts Manager

## Description
A web application for discovering, learning, and organizing keyboard shortcuts across various operating systems and applications. Users can browse a curated database of shortcuts, search by application name, and manage custom shortcut groups and items with user authentication.

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Scope](#project-scope)
5. [Project Status](#project-status)
6. [License](#license)

## Tech Stack
- Frontend: Astro 5, React 19, TypeScript 5, Tailwind 4, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth)
- AI Integration: openrouter.ai (OpenAI, Anthropic, Google models)
- CI/CD: GitHub Actions
- Hosting: VPS (Docker)

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Supabase account and project
- openrouter.ai API key

### Installation
```bash
# Clone the repo
git clone git@github.com:Punkbooster/shortcuts-manager.git
cd shortcuts-manager

# Install dependencies
npm install
# or
# yarn install
```

### Environment Variables
Create a `.env` file in the project root with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Run Locally
```bash
npm run dev
# or
yarn dev
```
Open http://localhost:3000 in your browser.

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Astro CLI commands

## Project Scope
### Included (MVP)
- Browse shortcuts by OS & application
- Search shortcuts by application name
- CRUD operations for user-defined shortcut groups
- CRUD operations for shortcut items within groups
- User sign-up & sign-in (authentication)

### Excluded (MVP)
- Advanced filtering beyond OS & application
- External shortcut data API integration
- Detailed UI/UX design enhancements
- Mobile applications (iOS/Android)
- Advanced user personalization beyond saved groups

## Project Status
- MVP features implemented
- Basic unit and integration tests added
- Deployed via CI/CD on VPS
- Ready for initial user feedback

## License
This project is licensed under the [MIT License](LICENSE) (placeholder).
