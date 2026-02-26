# Technical Context

## Dependencies

-   **Runtime**: Node.js (v20+ context recommended).
-   **Language**: TypeScript (v5.9.3).
-   **Package Manager**: npm/pnpm/yarn.
-   **Core Libraries**:
    -   `commander`: CLI framework (`^14.0.3`).
    -   `inquirer`: Interactive prompts (`^8.2.7`).
    -   `chalk`: Terminal styling (`^4.1.2`).
    -   `dotenv`: Environment variable management (`^17.3.1`).
    -   `figlet`: ASCII banner (`^1.10.0`).
    -   `ora`: Spinners (`^5.4.1`).
    -   `cli-table3`: Tabular output (`^0.6.5`).
-   **Database**:
    -   `@prisma/client`: Database client (`^7.4.1`).
    -   `@prisma/adapter-libsql`: Driver adapter for SQLite (`^7.4.1`).
    -   `@libsql/client`: SQLite driver (`^0.17.0`, implicitly used).
    -   `prisma`: CLI for migrations/generation (`^7.4.1`).

## Configuration

-   **Database Connection**:
    -   Handled in `src/lib/prisma.ts`.
    -   Database URL from `DATABASE_URL` env var or defaults to `file:./dev.db`.
    -   Note: `prisma/schema.prisma` intentionally omits `url` in `datasource` block because adapter is used.
-   **TypeScript**:
    -   `tsconfig.json`: `target: es2020`, `module: commonjs`, `rootDir: src`, `outDir: dist`.
    -   `ts-node`: Used for development execution.

## Build & Run

-   **Generate Client**: `npx prisma generate`
-   **Migrate DB**: `npx prisma migrate dev`
-   **Run CLI (Dev)**: `npx ts-node src/index.ts [command]`