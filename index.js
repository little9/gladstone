#!/usr/bin/env node

var gladstone = require('./gladstone.js');
var argv = require('yargs').argv;

var myArgs = gladstone.processArgs(argv);

gladstone.createBagDirectory(myArgs).then (function (result) {
    process.exit(0);
});
