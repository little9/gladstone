#!/usr/bin/env node

var gladstone = require('./gladstone.js');

var myArgs = gladstone.processArgs(process.argv);
gladstone.createBagDirectory(myArgs);
console.log(myArgs);
