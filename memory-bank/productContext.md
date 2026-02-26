# Product Context

## Problem Statement

Teachers and administrators need a lightweight, local tool to manage educational data quickly without relying on complex web-based systems or needing constant internet connectivity. The key needs are speed, local data ownership, and focused functionality.

## Goals

1.  **Efficiency**: Commands should be fast and simple.
2.  **Organization**: Data (students, grades, behavior) should be structured relationally.
3.  **Local First**: All data stored locally in SQLite (`dev.db`).
4.  **CLI Experience**: Clear, interactive prompts and formatted output.

## User Experience

-   **Invocation**: `edu` (or `npx ts-node src/index.ts` during dev).
-   **Structure**: `edu <module> <action> [args]`.
    -   Example: `edu academic student:add`.
-   **Feedback**: Spinners for async operations, tables for lists, colored text for status.