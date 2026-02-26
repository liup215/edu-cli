import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import prisma from '../../lib/prisma';
import ora from 'ora';

export const academicCommand = new Command('academic');

academicCommand
  .description('Manage students and classes');

// --- Class Management ---

academicCommand.command('class:list')
  .description('List all classes')
  .action(async () => {
    const spinner = ora('Fetching classes...').start();
    try {
      const classes = await prisma.class.findMany({
        include: { _count: { select: { students: true } } }
      });
      spinner.stop();

      if (classes.length === 0) {
        console.log(chalk.yellow('No classes found.'));
        return;
      }

      const table = new Table({
        head: ['ID', 'Name', 'Student Count'],
        style: { head: ['cyan'] }
      });

      classes.forEach(c => {
        table.push([c.id, c.name, c._count.students]);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail('Failed to fetch classes.');
      console.error(error);
    }
  });

academicCommand.command('class:add')
  .description('Add a new class')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter class name (e.g. "Grade 10 Class 1"):'
      }
    ]);

    const spinner = ora('Creating class...').start();
    try {
      const newClass = await prisma.class.create({
        data: { name: answers.name }
      });
      spinner.succeed(`Class "${newClass.name}" created successfully (ID: ${newClass.id}).`);
    } catch (error) {
      spinner.fail('Failed to create class.');
      console.error(error);
    }
  });

// --- Student Management ---

academicCommand.command('student:list')
  .description('List all students')
  .action(async () => {
    const spinner = ora('Fetching students...').start();
    try {
      const students = await prisma.student.findMany({
        include: { class: true }
      });
      spinner.stop();

      if (students.length === 0) {
        console.log(chalk.yellow('No students found.'));
        return;
      }

      const table = new Table({
        head: ['ID', 'Student ID', 'Name', 'Class'],
        style: { head: ['cyan'] }
      });

      students.forEach(s => {
        table.push([s.id, s.studentId, s.name, s.class.name]);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail('Failed to fetch students.');
      console.error(error);
    }
  });

academicCommand.command('student:add')
  .description('Add a new student')
  .action(async () => {
    // First fetch classes to select from
    const classes = await prisma.class.findMany();
    if (classes.length === 0) {
      console.log(chalk.red('No classes found. Please create a class first using "academic class:add".'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter student name:'
      },
      {
        type: 'input',
        name: 'studentId',
        message: 'Enter student ID (School ID):'
      },
      {
        type: 'list',
        name: 'classId',
        message: 'Select class:',
        choices: classes.map(c => ({ name: c.name, value: c.id }))
      }
    ]);

    const spinner = ora('Creating student...').start();
    try {
      const newStudent = await prisma.student.create({
        data: {
          name: answers.name,
          studentId: answers.studentId,
          classId: answers.classId
        }
      });
      spinner.succeed(`Student "${newStudent.name}" created successfully.`);
    } catch (error) {
      spinner.fail('Failed to create student.');
      console.error(error);
    }
  });

academicCommand.command('student:delete <id>')
  .description('Delete a student by ID')
  .action(async (id) => {
    const spinner = ora('Deleting student...').start();
    try {
      await prisma.student.delete({
        where: { id: parseInt(id) }
      });
      spinner.succeed(`Student ID ${id} deleted.`);
    } catch (error) {
      spinner.fail('Failed to delete student.');
      console.error(error);
    }
  });

export default academicCommand;