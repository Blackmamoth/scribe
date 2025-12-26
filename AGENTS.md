# AGENTS.md

## Build & Development Commands
- `pnpm dev` - Start development server for all packages
- `pnpm build` - Build all packages and apps  
- `pnpm lint` - Run Biome linter and auto-fix
- `pnpm lint:fix` - Run Biome linter with unsafe fixes
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking across monorepo

## Testing
No test framework currently configured. To add tests, set up Vitest or Jest in package.json.

## Code Style Guidelines

### Formatting & Linting
- Uses Biome for formatting and linting
- Tab indentation (configured in biome.json)
- Double quotes for strings
- Import organization: auto-organized on save

### TypeScript
- Strict mode enabled
- No unused locals/parameters allowed
- Path alias: `@/*` maps to `src/*`
- Use Zod for validation schemas

### Import Patterns
- Workspace imports: `@scribe/*` for internal packages
- External imports grouped separately
- Use absolute imports with `@/` alias for app-relative imports

### Component Structure
- Use class-variance-authority (cva) for component variants
- Forward refs with `React.forwardRef`
- Compound components with Slot pattern
- Use `cn()` utility for class merging (clsx + tailwind-merge)

### Error Handling
- Throw descriptive errors in server functions
- Validate inputs with Zod schemas
- Use authMiddleware for protected routes

### Naming Conventions
- Components: PascalCase (Button, Input, etc.)
- Functions: camelCase
- Files: kebab-case for utilities, PascalCase for components
- Database: snake_case for tables/columns
