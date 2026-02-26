#!/usr/bin/env node

/**
 * EDU-CLI
 * A command-line interface for educational management.
 */

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

const program = new Command();

// Display banner
console.log(
  chalk.cyan(
    figlet.textSync('EDU-CLI', { horizontalLayout: 'full' })
  )
);

program
  .version('0.0.1')
  .description('A local command-line educational management system')
  .option('-d, --debug', 'output extra debugging')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      console.log('Debug mode enabled');
    }
  });

// Register commands
import academicCommand from './commands/academic';
import teachingCommand from './commands/teaching';
import moralCommand from './commands/moral';

program.addCommand(academicCommand);
program.addCommand(teachingCommand);
program.addCommand(moralCommand);

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`error: unknown command '${operands[0]}'`);
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}