#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');

program
  .version('0.0.1')
  .option('-p, --producer', 'producer name to invoke')
  .option('-c, --consumer', 'consumer name to invoke')
  .option('-n, --number', 'number of consumers/producers to invoke')
  .parse(process.argv);

console.log('you invoked:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese);
