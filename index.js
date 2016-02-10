#!/usr/bin/env node

var gladstone = require('./gladstone.js');
var argv = require('yargs').argv;
var processArgs = require('./lib/processArgs');

var myArgs = processArgs(argv);

gladstone.createBagDirectory(myArgs)
