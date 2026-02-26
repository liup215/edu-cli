import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import prisma from '../../lib/prisma';
import ora from 'ora';

export const teachingCommand = new Command('teaching');

teachingCommand
  .description('Manage courses, homework, and plans');

// --- Teaching Class Management ---

teachingCommand.command('class:list')
  .description('List all teaching classes')
  .action(async () => {
    const spinner = ora('Fetching teaching classes...').start();
    try {
      const classes = await prisma.teachingClass.findMany({
        include: { 
          _count: { select: { homeworks: true, plans: true, students: true } },
          teachers: true
        }
      });
      spinner.stop();

      if (classes.length === 0) {
        console.log(chalk.yellow('No teaching classes found.'));
        return;
      }

      const table = new Table({
        head: ['ID', 'Name', 'Course', 'Teachers', 'Students'],
        style: { head: ['magenta'] }
      });

      classes.forEach(c => {
        table.push([
          c.id, 
          c.name, 
          c.course, 
          c.teachers.map(t => t.name).join(', '),
          c._count.students
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail('Failed to fetch teaching classes.');
      console.error(error);
    }
  });

teachingCommand.command('class:add')
  .description('Add a new teaching class')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter class name (e.g. "高2023级生物1班"):'
      },
      {
        type: 'input',
        name: 'course',
        message: 'Enter course name (e.g. "A-level Biology"):'
      }
    ]);

    const spinner = ora('Creating teaching class...').start();
    try {
      const newClass = await prisma.teachingClass.create({
        data: {
          name: answers.name,
          course: answers.course
        }
      });
      spinner.succeed(`Teaching Class "${newClass.name}" created successfully.`);
    } catch (error) {
      spinner.fail('Failed to create teaching class.');
      console.error(error);
    }
  });

// --- Homework Management ---

teachingCommand.command('homework:assign')
  .description('Assign homework to a teaching class')
  .action(async () => {
    const classes = await prisma.teachingClass.findMany();
    if (classes.length === 0) {
      console.log(chalk.red('No teaching classes found. Please create a class first.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'classId',
        message: 'Select teaching class:',
        choices: classes.map(c => ({ name: c.name, value: c.id }))
      },
      {
        type: 'input',
        name: 'title',
        message: 'Homework title:'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Homework description (optional):'
      },
      {
        type: 'input',
        name: 'deadline',
        message: 'Deadline (YYYY-MM-DD HH:mm, optional):'
      }
    ]);

    let deadlineDate: Date | null = null;
    if (answers.deadline) {
      deadlineDate = new Date(answers.deadline);
      if (isNaN(deadlineDate.getTime())) {
        console.log(chalk.red('Invalid date format. Proceeding without deadline.'));
        deadlineDate = null;
      }
    }

    const spinner = ora('Creating homework...').start();
    try {
      const newHomework = await prisma.homework.create({
        data: {
          title: answers.title,
          description: answers.description,
          deadline: deadlineDate,
          teachingClassId: answers.classId
        }
      });

      // Assign to students in this teaching class
      const students = await prisma.student.findMany({
        where: { teachingClasses: { some: { id: answers.classId } } }
      });
      
      if (students.length > 0) {
        await prisma.submission.createMany({
          data: students.map(s => ({
            studentId: s.id,
            homeworkId: newHomework.id,
            status: 'PENDING'
          }))
        });
      }

      spinner.succeed(`Homework "${newHomework.title}" assigned to ${students.length} students.`);
    } catch (error) {
      spinner.fail('Failed to assign homework.');
      console.error(error);
    }
  });

teachingCommand.command('homework:list <classId>')
  .description('List homework for a teaching class')
  .action(async (classId) => {
    const spinner = ora('Fetching homework...').start();
    try {
      const homeworks = await prisma.homework.findMany({
        where: { teachingClassId: parseInt(classId) },
        include: { _count: { select: { submissions: true } } }
      });
      spinner.stop();

      const table = new Table({
        head: ['ID', 'Title', 'Deadline', 'Submissions'],
        style: { head: ['magenta'] }
      });

      homeworks.forEach(h => {
        table.push([
          h.id, 
          h.title, 
          h.deadline ? h.deadline.toISOString() : 'None', 
          h._count.submissions
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail('Failed to fetch homework.');
      console.error(error);
    }
  });

export default teachingCommand;