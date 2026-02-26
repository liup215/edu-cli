# Progress

## Status
**Current Version**: 0.0.1 (Skeleton)

## Checklist

### Infrastructure
- [x] Initialize Node.js/TypeScript project
- [x] Configure Prisma with SQLite
- [x] Set up CLI entry point (`src/index.ts`)
- [x] Implement database adapter (`@prisma/adapter-libsql`)
- [x] Apply initial schema migration (`20260226070124_init`)

### Academic Module
- [x] Define `Student`, `Class` models
- [x] Implement `student:add` command
- [x] Implement `student:list` command
- [x] Implement `class:add` command
- [x] Implement `class:list` command
- [ ] Implement `student:edit`/`student:delete` (partial)
- [ ] Implement `class:edit`/`class:delete`

### Teaching Module
- [x] Define `Course`, `Plan`, `Homework` models
- [x] Implement `course:add` command
- [x] Implement `course:list` command
- [x] Implement `homework:assign` command
- [x] Implement `homework:list` command
- [ ] Implement Grading/Submission logic
- [ ] Implement `plan` (lesson plan) management

### Moral Module
- [x] Define `BehaviorRecord` model
- [x] Implement `record:add` command
- [x] Implement `record:list` command
- [ ] Implement `evaluation` management
- [ ] Implement statistical analysis

### Polishing
- [ ] Comprehensive error handling
- [ ] Unit tests for commands
- [ ] User documentation (README)
- [ ] Build script for distribution