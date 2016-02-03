
var crypto = require('crypto');
var path = require('path');
var recursive = require('recursive-readdir');
var ncp = require('ncp').ncp;
var fs = require('fs');

module.exports = {
    settings: {
        cryptoMethod: 'md5',
        currentPath: process.cwd(),
        bagName: '',
        originDirectory: ''
    },
    userArgs: {
        bagName: '',
        originDirectory: '',
        cryptoMethod: ''
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
            console.log(module.exports.strings.noBagName);

        } else {
            userArgs.bagName = args[2];
        }

        if (typeof args[3] === 'undefined') {
            console.log(module.exports.strings.noOrigin);
        } else {
            userArgs.originDirectory = args[3];
        }

        if (typeof args[3] === 'undefined') {
            console.log(module.exports.strings.noCryptoMethod);
            userArgs.cryptoMethod = 'md5';
        } else {
            userArgs.cryptoMethod = args[4];
        }
        
        return userArgs;
    },
    createBagDirectory: function (args) {
        
        fs.mkdir(args.bagName, function (err) {
            if (err) throw err;
            console.log('Made ' + args.bagName);
            fs.mkdir(args.bagName + '/data', function (err) {
                if (err) throw err;
                console.log('Made data directory');
                module.exports.writeBagInfo(args);
                module.exports.copyOriginToData(args);

            });

        });
    },
    writeBagInfo: function (args) {
        fs.writeFile(args.bagName + '/' + 'bag-info.txt', module.exports.strings.bagInfoTxt, function (err) {
            if (err) throw err;

        });
    },
    copyOriginToData: function (args) {
        console.log("Copying data into bag");
        ncp(args.originDirectory, args.bagName + '/data', function (err) {
            if (err) throw err;
            console.log("Creating manifest");
            module.exports.createManifest(args.bagName + '/data', args);
        

        });
    },
    getRelativePath: function (filePath) {
        var relPath = filePath.replace(/\\\\/g, '').replace(/\//g, '/');
        var splitName = relPath.split('/data/');
        var relName = relPath.replace(splitName[0], '');

        if (relName.substring(0, 1) == '/') {
            relName = relName.substring(1);
        }
        
        return relName;
    },
    getManifestFileName: function(bagName, cryptoMethod) {
       var manifestFileName = bagName + '/' + 'manifest-' + module.exports.settings.cryptoMethod + '.txt';

       return manifestFileName;
    },
    createManifest: function (myPath, args) {
        console.log('Creaing manifest');
        recursive(myPath, function (err, files) {
            files.forEach(function (file) {
                var hash = crypto.createHash(module.exports.settings.cryptoMethod);
                var stats = fs.stat(file, function (err, stat) {
                   
                    if (!stat.isDirectory()) {
                        var manifestFileName = module.exports.getManifestFileName(args.bagName, module.exports.settings.cryptoMethod);            
                        var stream = fs.createReadStream(file);

                        stream.on('data', function (data) {
                            hash.update(data, 'utf8');
                        });

                        stream.on('end', function () {
                            var myHash = hash.digest('hex');
                            var relName = module.exports.getRelativePath(file);
                            var manifestLine = myHash + ' ' + relName + '\n';
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

