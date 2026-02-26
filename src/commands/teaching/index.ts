import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import prisma from '../../lib/prisma';
import ora from 'ora';

export const teachingCommand = new Command('teaching');

teachingCommand
  .description('Manage courses, homework, and plans');

// --- Course Management ---

teachingCommand.command('course:list')
  .description('List all courses')
  .action(async () => {
    const spinner = ora('Fetching courses...').start();
    try {
      const courses = await prisma.course.findMany({
        include: { _count: { select: { homeworks: true, plans: true } } }
      });
      spinner.stop();

      if (courses.length === 0) {
        console.log(chalk.yellow('No courses found.'));
        return;
      }

      const table = new Table({
        head: ['ID', 'Name', 'Description', 'Homeworks', 'Plans'],
        style: { head: ['magenta'] }
      });

      courses.forEach(c => {
        table.push([c.id, c.name, c.description || '-', c._count.homeworks, c._count.plans]);
      });

      console.log(table.toString());
    } catch (error) {
      spinner.fail('Failed to fetch courses.');
      console.error(error);
    }
  });

teachingCommand.command('course:add')
  .description('Add a new course')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter course name (e.g. "Mathematics"):'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter course description (optional):'
      }
    ]);

    const spinner = ora('Creating course...').start();
    try {
      const newCourse = await prisma.course.create({
        data: {
          name: answers.name,
          description: answers.description
        }
      });
      spinner.succeed(`Course "${newCourse.name}" created successfully.`);
    } catch (error) {
      spinner.fail('Failed to create course.');
      console.error(error);
    }
  });

// --- Homework Management ---

teachingCommand.command('homework:assign')
  .description('Assign homework to a course')
  .action(async () => {
    const courses = await prisma.course.findMany();
    if (courses.length === 0) {
      console.log(chalk.red('No courses found. Please create a course first.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'courseId',
        message: 'Select course:',
        choices: courses.map(c => ({ name: c.name, value: c.id }))
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
          courseId: answers.courseId
        }
      });

      // Automatically create pending submissions for all students in associated classes?
      // Wait, courses are not directly linked to classes in my simple schema.
      // Usually a course is taught to a class. My schema: Course has no relation to Class.
      // This is a simplification. For now, let's assume all students take all courses 
      // OR I should have linked Course to Class. 
      // Let's modify schema later if needed. For now, homework exists, but assigning it to specific students...
      // My schema has `studentId` in `Submission`.
      // I should probably manually create submissions or let them submit.
      // Let's create pending submissions for ALL students for simplicity in this MVP, 
      // or just leave it empty until they submit.
      // Better: Create pending submissions for all students.
      
      const students = await prisma.student.findMany();
      if (students.length > 0) {
        await prisma.submission.createMany({
          data: students.map(s => ({
            studentId: s.id,
            homeworkId: newHomework.id,
            status: 'PENDING'
          }))
        });
      }

      spinner.succeed(`Homework "${newHomework.title}" assigned.`);
    } catch (error) {
      spinner.fail('Failed to assign homework.');
      console.error(error);
    }
  });

teachingCommand.command('homework:list <courseId>')
  .description('List homework for a course')
  .action(async (courseId) => {
    const spinner = ora('Fetching homework...').start();
    try {
      const homeworks = await prisma.homework.findMany({
        where: { courseId: parseInt(courseId) },
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