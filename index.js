#!/usr/bin/env node

var fs = require('fs'),
    crypto = require('crypto');
    path = require('path');
    recursive = require('recursive-readdir');
    ncp = require('ncp').ncp;


var Handbag = {
    settings: {
        cryptoMethod: 'md5',
        testPath: process.cwd() + '/test/',
        currentPath : process.cwd(),
        bagName : '',
        originDirectory : ''
    },
    userArgs : {

    },
    strings : {
        noBagName : 'Please specify a bag name',
        noOrigin : 'Please specify an origin directory name',
        bagInfoTxt : 'BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8',
        manifestArray : []
    },
       
    processArgs : function(args) {
      //  var myArgs = process.argv;
        var userArgs = {};
        
        if (typeof args[2] === 'undefined'){ 
            console.log(Handbag.strings.noBagName);
        } else {
            userArgs.bagName = args[2];
        }

        if (typeof args[3] === 'undefined'){ 
            console.log(Handbag.strings.noOrigin);
        } else {
            userArgs.originDirectory = args[3];
        }

        if (typeof args[3] === 'undefined'){ 
            console.log(Handbag.strings.noCryptoMethod);
            userArgs.cryptoMethod = 'md5';
        } else {
            userArgs.cryptoMethod = args[4];
        }


        return userArgs;
    },
    createBagDirectory(args) {
        console.log(args);
        fs.mkdir(Handbag.settings.currentPath + '/' + args.bagName, function(err) {
            if (err) throw err;
            console.log('Made' + Handbag.settings.currentPath + '/' + args.bagName );
            fs.mkdir(Handbag.settings.currentPath + '/' + args.bagName  + '/data', function(err) {
                if (err) throw err;
                console.log('Made data directory');
                Handbag.writeBagInfo(args);
                Handbag.copyOriginToData(args);
              
            });
                
        });
    },
    writeBagInfo : function(args) {
        fs.writeFile(Handbag.settings.currentPath + 
            '/' + args.bagName  
            + '/' + 'bag_info.txt',Handbag.bagInfoTxt, function (err) {
                if (err) throw err;
                return true;
            });
    },
    copyOriginToData : function(args) {
        ncp(args.originDirectory, Handbag.settings.currentPath 
        + '/' + args.bagName  + '/data', function(err) {
            if (err) throw err;
            
            Handbag.createManifest(Handbag.settings.currentPath + '/' + args.bagName  + '/data', args);
            return true;
        });
    },
    createManifest: function (myPath, args) {
  
        recursive(myPath, function (err, files) {
           
            files.forEach(function (file) {
                var hash = crypto.createHash(Handbag.settings.cryptoMethod);
                var stats = fs.stat(file, function (err, stat) {

                    if (stat.isDirectory()) {

                    } else {
                    
                        var manifestFileName = Handbag.settings.currentPath + '/' + args.bagName + '/' + 'manifest_' + Handbag.settings.cryptoMethod +  '.txt';
                        var stream = fs.createReadStream(file);

                        stream.on('data', function (data) {
                            hash.update(data, 'utf8'); 
                        });

                        stream.on('end', function () {
                            var myHash = hash.digest('hex');
                            var fileName = file.replace(Handbag.settings.currentPath,'')
                                .replace(args.bagName, '')
                                .replace(/\\\\/g,'')
                                .replace(/\\/g,'/');
                            var manifestLine = fileName + ' ' + myHash + '\n';
                            fs.appendFile(manifestFileName,manifestLine, function(err) {
                                if (err) throw err;
                            });
                                
                      
                        });
                    }

                });
            });
        });
    }

};

var myArgs = Handbag.processArgs(process.argv);
Handbag.createBagDirectory(myArgs);
module.exports.Handbag = Handbag;
