import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import prisma from '../../lib/prisma';
import ora from 'ora';

export const moralCommand = new Command('moral');

moralCommand
  .description('Manage behavior records and evaluations');

// --- Behavior Records ---

moralCommand.command('record:add')
  .description('Add a behavior record for a student')
  .action(async () => {
    // Need to select student first. 
    // Since there could be many students, let's ask for student ID or search.
    // For MVP, list all students is too much if many.
    // Let's ask for Student ID (School ID) string.
    
    const answers1 = await inquirer.prompt([
      {
        type: 'input',
        name: 'studentId',
        message: 'Enter Student ID (School ID):'
      }
    ]);

    const student = await prisma.student.findUnique({
      where: { studentId: answers1.studentId }
    });

    if (!student) {
      console.log(chalk.red('Student not found.'));
      return;
    }

    const answers2 = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Record Type:',
        choices: ['POSITIVE', 'NEGATIVE', 'NEUTRAL']
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:'
      },
      {
        type: 'number',
        name: 'score',
        message: 'Score (e.g. 1, -1, 0):',
        default: 0
      }
    ]);

    const spinner = ora('Saving record...').start();
    try {
      await prisma.behaviorRecord.create({
        data: {
          studentId: student.id,
          type: answers2.type,
          description: answers2.description,
          score: answers2.score
        }
      });
      spinner.succeed(`Record added for student ${student.name}.`);
    } catch (error) {
      spinner.fail('Failed to add record.');
      console.error(error);
    }
  });

moralCommand.command('record:list <studentId>')
  .description('List behavior records for a student (by School ID)')
  .action(async (studentId) => {
    const spinner = ora('Fetching records...').start();
    try {
      const student = await prisma.student.findUnique({
        where: { studentId: studentId },
        include: { behaviors: true }
      });
      spinner.stop();

      if (!student) {
        console.log(chalk.red('Student not found.'));
        return;
      }

      console.log(chalk.blue(`Behavior Records for ${student.name} (${student.studentId}):`));

      if (student.behaviors.length === 0) {
        console.log(chalk.yellow('No records found.'));
        return;
      }

      const table = new Table({
        head: ['Date', 'Type', 'Description', 'Score'],
        style: { head: ['green'] }
      });

      student.behaviors.forEach(b => {
        table.push([
          b.date.toLocaleDateString(),
          b.type,
          b.description,
          b.score
        ]);
      });

      console.log(table.toString());

      // Calculate total score
      const totalScore = student.behaviors.reduce((acc, curr) => acc + curr.score, 0);
      console.log(chalk.bold(`Total Score: ${totalScore > 0 ? chalk.green('+' + totalScore) : chalk.red(totalScore)}`));

    } catch (error) {
      spinner.fail('Failed to fetch records.');
      console.error(error);
    }
  });

export default moralCommand;