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
  .description('List all administrative classes')
  .action(async () => {
    const spinner = ora('Fetching classes...').start();
    try {
      const classes = await prisma.administrativeClass.findMany({
        include: { _count: { select: { students: true } } }
      });
      spinner.stop();

      if (classes.length === 0) {
        console.log(chalk.yellow('No administrative classes found.'));
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
  .description('Add a new administrative class')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter class name (e.g. "十二年级1班"):'
      }
    ]);

    const spinner = ora('Creating class...').start();
    try {
      const newClass = await prisma.administrativeClass.create({
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
  .option('-y, --year <year>', 'Filter by enrollment year (e.g. 2023)')
  .option('-n, --name <name>', 'Filter by student name')
  .option('-i, --id <studentId>', 'Filter by student ID')
  .option('-c, --class <className>', 'Filter by administrative class name')
  .option('-T, --teaching-class <className>', 'Filter by teaching class name')
  .option('-H, --head-teacher <name>', 'Filter by head teacher name')
  .option('-t, --teacher <name>', 'Filter by teaching class teacher name')
  .action(async (options) => {
    const spinner = ora('Fetching students...').start();
    try {
      const filter: any = {};
      
      if (options.year) {
        filter.enrollmentYear = parseInt(options.year);
      }
      if (options.name) {
        filter.name = { contains: options.name };
      }
      if (options.id) {
        filter.studentId = { contains: options.id };
      }
      if (options.class) {
        filter.administrativeClass = {
          name: { contains: options.class }
        };
      }
      // Prepare teaching class filter
      const teachingClassWhere: any = {};
      if (options.teachingClass) {
        teachingClassWhere.name = { contains: options.teachingClass };
      }
      if (options.teacher) {
        teachingClassWhere.teachers = {
          some: {
            name: { contains: options.teacher }
          }
        };
      }
      if (Object.keys(teachingClassWhere).length > 0) {
        filter.teachingClasses = {
          some: teachingClassWhere
        };
      }

      if (options.headTeacher) {
        if (!filter.administrativeClass) filter.administrativeClass = {};
        filter.administrativeClass.headTeachers = {
          some: {
            name: { contains: options.headTeacher }
          }
        };
      }

      const students = await prisma.student.findMany({
        where: filter,
        include: { 
          administrativeClass: {
            include: { headTeachers: true }
          },
          teachingClasses: {
            include: { teachers: true }
          }
        }
      });
      spinner.stop();

      if (students.length === 0) {
        console.log(chalk.yellow('No students found.'));
        return;
      }

      console.log(chalk.green(`Found ${students.length} students:`));

      const table = new Table({
        head: ['ID', 'Student ID', 'Name', 'Enrollment', 'Admin Class (Head Teacher)', 'Teaching Class (Teacher)'],
        style: { head: ['cyan'] }
      });

      students.forEach(s => {
        // Format Admin Class with Head Teachers
        let adminClassStr = 'Unassigned';
        if (s.administrativeClass) {
          adminClassStr = s.administrativeClass.name;
          if (s.administrativeClass.headTeachers && s.administrativeClass.headTeachers.length > 0) {
            const headTeachers = s.administrativeClass.headTeachers.map(t => t.name).join(', ');
            adminClassStr += `\n(${headTeachers})`;
          }
        }

        // Format Teaching Classes with Teachers
        const teachingClassDetails = s.teachingClasses.map(t => {
          let teacherStr = '';
          if (t.teachers && t.teachers.length > 0) {
            teacherStr = ` (${t.teachers.map(teacher => teacher.name).join(', ')})`;
          }
          return `${t.name}${teacherStr}`;
        }).join('\n');

        table.push([
          s.id, 
          s.studentId, 
          s.name, 
          s.enrollmentYear || '-', 
          adminClassStr,
          teachingClassDetails || '-'
        ]);
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
    const classes = await prisma.administrativeClass.findMany();
    if (classes.length === 0) {
      console.log(chalk.red('No admin classes found. Please create one first using "academic class:add".'));
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
        type: 'input',
        name: 'enrollmentYear',
        message: 'Enter enrollment year (e.g. 2023):',
        validate: (input) => !isNaN(parseInt(input)) || 'Please enter a number'
      },
      {
        type: 'list',
        name: 'classId',
        message: 'Select administrative class:',
        choices: classes.map(c => ({ name: c.name, value: c.id }))
      }
    ]);

    const spinner = ora('Creating student...').start();
    try {
      const newStudent = await prisma.student.create({
        data: {
          name: answers.name,
          studentId: answers.studentId,
          enrollmentYear: parseInt(answers.enrollmentYear),
          administrativeClassId: answers.classId
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