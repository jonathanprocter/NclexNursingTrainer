# NCLEX Prep Application

## Project Structure
```
├── config/               # Configuration files
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # CSS/SCSS files
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── constants/      # Constants and enums
├── server/             # Backend source code
│   ├── config/         # Server configuration
│   ├── middleware/     # Express middleware
│   ├── utils/          # Server utilities
│   └── types/          # Server TypeScript types
├── scripts/            # Build and development scripts
│   ├── dev/           # Development scripts
│   ├── build/         # Build scripts
│   └── maintenance/   # Maintenance scripts
└── public/            # Static files
```

## Getting Started

1. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Lint code
- `npm run format` - Format code
