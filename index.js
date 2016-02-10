#!/usr/bin/env node

var gladstone = require('./gladstone.js');
var argv = require('yargs').argv;

gladstone.createBagDirectory(argv)
