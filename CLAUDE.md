# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run all tests with Vitest
npm run test -- --watch  # Run tests in watch mode
npm run test -- path/to/test.ts  # Run a single test file
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database (destructive)
```

## Architecture

UIGen is an AI-powered React component generator that runs entirely in the browser using a virtual file system.

### Core Flow

1. User describes a component in chat → AI generates code using tools → Virtual file system updates → Live preview renders

2. **API Route** (`src/app/api/chat/route.ts`): Handles chat requests using Vercel AI SDK's `streamText`. Provides two tools to the AI:
   - `str_replace_editor`: Create files, replace strings, insert at line numbers
   - `file_manager`: Rename and delete files/folders

3. **Virtual File System** (`src/lib/file-system.ts`): In-memory file tree with CRUD operations. No disk writes. Serializes to JSON for persistence.

4. **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Uses Babel standalone to transform JSX/TSX to ES modules. Creates blob URLs and import maps for browser execution. Third-party imports resolve via esm.sh.

5. **Preview Frame** (`src/components/preview/PreviewFrame.tsx`): Sandboxed iframe that renders the transformed code. Loads Tailwind via CDN. Entry point is `/App.jsx`.

### Context Providers

- `FileSystemProvider`: Wraps the VirtualFileSystem, handles tool call side effects
- `ChatProvider`: Wraps Vercel AI SDK's `useChat`, syncs file system state with API calls

### Data Model

- Users have Projects
- Projects store `messages` (JSON array) and `data` (serialized VirtualFileSystem)
- Anonymous users can work without an account; work is tracked in localStorage

### AI Tools Schema

The AI uses a str_replace-style editing model (similar to Claude's computer use tools):
- `view`: Read file with optional line range
- `create`: Create new file with content
- `str_replace`: Replace exact string match
- `insert`: Insert text at line number

### Key Conventions

- All local imports in generated code use `@/` alias (maps to root `/`)
- Generated projects must have `/App.jsx` as entry point with default export
- Tests are colocated in `__tests__` directories
- UI components use shadcn/ui patterns (Radix + Tailwind)
