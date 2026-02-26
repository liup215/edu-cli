# Active Context

## Current Status

-   **Version**: 0.0.1 (Initial Development)
-   **Core Infrastructure**:
    -   Prisma + SQLite (LibSQL adapter) is configured and working.
    -   `prisma/schema.prisma` defined with models: `Student`, `Class`, `Course`, `Plan`, `Homework`, `Submission`, `BehaviorRecord`.
    -   `src/lib/prisma.ts` correctly instantiates `PrismaClient` with `PrismaLibSql` adapter.
    -   Initial migration (`20260226070124_init`) applied.
-   **Commands**:
    -   `academic`: Implemented (`student:add`, `student:list`, `class:add`, `class:list`).
    -   `teaching`: Implemented partially (`course:add`, `course:list`, `homework:assign`, `homework:list`).
    -   `moral`: Implemented (`record:add`, `record:list`).
    -   Commands are registered in `src/index.ts`.

## Recent Changes

-   Resolved `PrismaClientInitializationError` by switching to `@prisma/adapter-libsql` and configuring `prisma/schema.prisma` to use `provider = "sqlite"` without `url` (handling connection in code via adapter).
-   Updated version to 0.0.1 in `package.json` and `src/index.ts`.

## Next Steps

-   **Testing**: Verify all commands work as expected end-to-end (e.g., adding students, creating courses).
-   **Refinement**: Improve error handling and user feedback.
-   **Feature Completion**: Implement missing CRUD operations (edit/delete) for all entities.
-   **Documentation**: Add usage instructions to README.md.

## Notes

-   The CLI uses `ts-node` for execution during development.
-   Database file is `dev.db` in the project root.