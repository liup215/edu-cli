# EDU-CLI

A comprehensive local command-line interface for educational management, designed to streamline academic, teaching, and moral education tasks.

## 🌟 Overview

EDU-CLI is a powerful tool built for educators and administrators to manage various aspects of the educational process directly from the terminal. It provides a unified interface for handling student data, course management, lesson planning, and behavioral records.

## 🚀 Features

### 📚 Academic Management
- **Student Information**: Manage student profiles and records.
- **Class Management**: Organize and track class details.

### 👩‍🏫 Teaching Management
- **Course Management**: Handle course curriculums and schedules.
- **Lesson Planning**: Create and manage personalized lesson plans.
- **Homework**: Assign, collect, and grade homework tasks.
- **Statistics & Feedback**: Generate data-driven insights and feedback.
- **Plan Adjustments**: Adapt learning plans based on performance data.

### 🧘 Moral Education Management
- **Administrative Classes**: Manage homeroom/administrative class duties.
- **Behavior Records**: Track student activities and daily behavior.
- **Evaluations**: Conduct and record student evaluations.
- **Home-School Communication**: Log interactions with parents/guardians.
- **Analysis**: Statistical analysis of moral education data.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Database**: SQLite (via Prisma ORM)
- **UI/UX**: Inquirer.js, Chalk, Ora, CLI-Table3, Figlet

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Initialize the database
npx prisma migrate dev
```

## 💻 Usage

To start the application:

```bash
npm start
```

Or for development:

```bash
npm run dev
```

## 🗂️ Project Structure

- `src/commands/`: Command modules (academic, teaching, moral)
- `src/lib/`: Shared libraries and utilities (Prisma client, etc.)
- `prisma/`: Database schema and migrations
- `memory-bank/`: Project documentation and context