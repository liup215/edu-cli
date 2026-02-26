# Project Brief: EDU-CLI

A local, command-line interface based educational management system designed to handle academic, teaching, and moral education data.

## Core Requirements

1.  **Academic Management**:
    -   Manage Student information.
    -   Manage Class information.

2.  **Teaching Management**:
    -   Course management.
    -   Personalized lesson planning.
    -   Homework assignment and collection/grading.
    -   Data statistics and feedback.
    -   Learning plan adjustments.

3.  **Moral Education Management**:
    -   Administrative class management.
    -   Behavior records (activities, daily behavior).
    -   Evaluations.
    -   Home-school communication records.
    -   Statistical analysis.

## Technical Stack

-   **Runtime**: Node.js
-   **Language**: TypeScript
-   **CLI Framework**: Commander.js
-   **Interaction**: Inquirer.js
-   **ORM**: Prisma
-   **Database**: SQLite (via LibSQL adapter)
-   **UI Utilities**: Chalk (styling), Ora (spinners), CLI-Table3 (tabular output), Figlet (banner).