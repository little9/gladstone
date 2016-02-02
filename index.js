#!/usr/bin/env node

var crypto = require('crypto');
var path = require('path');
var recursive = require('recursive-readdir');
var ncp = require('ncp').ncp;
var fs = require('fs');


var Gladstone = {
    settings: {
        cryptoMethod: 'md5',
        testPath: process.cwd() + '/test/',
        currentPath: process.cwd(),
        bagName: '',
        originDirectory: ''
    },
    userArgs: {

    },
    strings: {
        noBagName: 'Please specify a bag name',
        noOrigin: 'Please specify an origin directory name',
        bagInfoTxt: 'BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8',
        manifestArray: []
    },

    processArgs: function (args) {

        var userArgs = {};

        if (typeof args[2] === 'undefined') {
            console.log(Gladstone.strings.noBagName);
          //  process.exit(1);
        } else {
            userArgs.bagName = args[2];
        }

        if (typeof args[3] === 'undefined') {
            console.log(Gladstone.strings.noOrigin);
        //    process.exit(1);    
        } else {
            userArgs.originDirectory = args[3];
        }

        if (typeof args[3] === 'undefined') {
            console.log(Gladstone.strings.noCryptoMethod);
            userArgs.cryptoMethod = 'md5';
        } else {
            userArgs.cryptoMethod = args[4];
        }


        return userArgs;
    },
    createBagDirectory: function (args) {
        console.log(args);
        fs.mkdir(args.bagName, function (err) {
            if (err) throw err;
            console.log('Made ' + args.bagName);
            fs.mkdir(args.bagName + '/data', function (err) {
                if (err) throw err;
                console.log('Made data directory');
                Gladstone.writeBagInfo(args);
                Gladstone.copyOriginToData(args);

            });

        });
    },
    writeBagInfo: function (args) {
        fs.writeFile(args.bagName + '/' + 'bag-info.txt', Gladstone.bagInfoTxt, function (err) {
                if (err) throw err;
                return true;
            });
    },
    copyOriginToData: function (args) {
        ncp(args.originDirectory, args.bagName + '/data', function (err) {
            if (err) throw err;

            Gladstone.createManifest(args.bagName + '/data', args);
            return true;
            
        });
    },
    createManifest: function (myPath, args) {

        recursive(myPath, function (err, files) {

            files.forEach(function (file) {
                var hash = crypto.createHash(Gladstone.settings.cryptoMethod);
                var stats = fs.stat(file, function (err, stat) {

                    if (stat.isDirectory()) {

                    } else {

                        var manifestFileName = args.bagName + '/' + 'manifest-' + Gladstone.settings.cryptoMethod + '.txt';
                        console.log(manifestFileName);
                        var stream = fs.createReadStream(file);

                        stream.on('data', function (data) {
                            hash.update(data, 'utf8');
                        });

                        stream.on('end', function () {
                            var myHash = hash.digest('hex');
                            var fileName = file
                                .replace(/\\\\/g, '')
                                .replace(/\//g, '/');
                                
                             var splitName = fileName.split('/data/');
                             var relName = fileName.replace(splitName[0], '');
                             
                             if (relName.substring(0, 1) == '/') { 
                                relName = relName.substring(1);
                           }       
                                 
                            var manifestLine = relName + ' ' + myHash + '\n';
                            fs.appendFile(manifestFileName, manifestLine, function (err) {
                                if (err) throw err;
                            });


                        });
                    }

                });
            });
        });
    }

};

var myArgs = Gladstone.processArgs(process.argv);
Gladstone.createBagDirectory(myArgs);
module.exports.Gladstone = Gladstone;
