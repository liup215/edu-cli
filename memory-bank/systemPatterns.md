# System Architecture

## Overview

The system is a monolithic CLI application built with Node.js and TypeScript. It follows a modular structure where each functional area (Academic, Teaching, Moral) is encapsulated in its own command module.

## Core Components

1.  **Entry Point (`src/index.ts`)**:
    -   Initializes `commander` program.
    -   Loads environment variables (`dotenv`).
    -   Registers top-level commands (`academic`, `teaching`, `moral`).
    -   Handles global options (version, debug).

2.  **Command Modules (`src/commands/*`)**:
    -   Each directory (`academic`, `teaching`, `moral`) contains an `index.ts` file.
    -   Each module exports a `Command` object.
    -   Sub-commands (e.g., `student:add`) are defined using `command(...)` method.
    -   Logic for prompting (`inquirer`) and execution is contained within `.action()` handlers.

3.  **Data Access Layer (`src/lib/prisma.ts`)**:
    -   Exports a singleton `PrismaClient` instance.
    -   Uses `@prisma/adapter-libsql` to connect to the SQLite database (`dev.db`).
    -   Configuration handles `DATABASE_URL` or defaults to `file:./dev.db`.

4.  **Database (`prisma/schema.prisma`)**:
    -   Defines the data model using Prisma Schema Language.
    -   Provider: `sqlite`.
    -   Models:
        -   `Student`: Core entity.
        -   `Class`: Groups students.
        -   `Course`: Teaching subjects.
        -   `Plan`: Lesson plans for courses.
        -   `Homework`: Assignments.
        -   `Submission`: Student work for homework.
        -   `BehaviorRecord`: Moral education data.

## Key Design Decisions

-   **Modular Commands**: Separating commands into folders keeps `index.ts` clean and allows for easier extension.
-   **Prisma Adapter**: Using `@prisma/adapter-libsql` provides flexibility to switch to Turso (cloud SQLite) later if needed, while maintaining local SQLite (`dev.db`) for development.
-   **Interactive CLI**: Prioritizing `inquirer` prompts over purely argument-based parsing for complex data entry (e.g., adding a student) improves usability.