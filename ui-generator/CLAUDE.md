# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator that allows users to describe components in natural language and see them generated and previewed in real-time.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Development server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run lint           # Run ESLint
npm run test           # Run Vitest tests
npm run db:reset       # Reset database (destructive)
```

**Single test file:**
```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

**Database operations:**
```bash
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma migrate dev     # Create and run new migration
```

## Architecture

### Virtual File System
All generated components exist in memory only (no disk writes). The `VirtualFileSystem` class in `/src/lib/file-system.ts` manages create/read/update/delete operations. This is the core data structure that holds all user-generated code.

### AI Tool Calling
Claude generates components via two tools defined in `/src/lib/tools/`:
- `str_replace_editor`: File operations (view, create, str_replace, insert)
- `file_manager`: Rename/delete operations

The chat endpoint at `/src/app/api/chat/route.ts` streams responses using Vercel AI SDK with up to 40 tool-calling steps.

### State Management
Two React Contexts manage application state:
- `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`): Virtual file system state
- `ChatContext` (`/src/lib/contexts/chat-context.tsx`): Wraps Vercel AI SDK's useChat

### Authentication
JWT-based sessions stored in httpOnly cookies (7-day expiration). Anonymous users can generate components (tracked in localStorage) but projects aren't persisted to database.

### Component Generation Flow
1. User message → `/api/chat` endpoint
2. Claude uses tools to create/modify files in virtual filesystem
3. FileSystemContext updates trigger re-renders
4. PreviewFrame (`/src/components/preview/PreviewFrame.tsx`) executes generated React code
5. For authenticated users: project saved to database via `onFinish` callback

## Key Directories

- `/src/app/api/chat/` - Chat endpoint for AI communication
- `/src/components/ui/` - Shadcn UI primitives
- `/src/lib/tools/` - AI tool definitions
- `/src/lib/prompts/` - System prompts for Claude
- `/src/lib/transform/` - JSX transformation for preview execution
- `/src/actions/` - Server Actions for auth and project management

## Database

SQLite with Prisma. Schema defined in `/prisma/schema.prisma` - reference this file anytime you need to understand the structure of data stored in the database.

## Code Style

- Use comments sparingly. Only comment complex code.

## Environment

- `ANTHROPIC_API_KEY`: Optional. Without it, a mock provider returns static code.
- `JWT_SECRET`: Optional. For session encryption.
