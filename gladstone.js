var crypto = require('crypto');
var path = require('path');
var recursive = require('recursive-readdir');
var ncp = require('ncp').ncp;
var fs = require('fs');
var gladstone = exports;

var strings = require('./lib/strings');
var bagInfo = require('./lib/bag-info');
var settings = require('./lib/settings');
var lastdirpath = require('./lib/lastdirpath');


module.exports = {
    createBagDirectory: function (args) {
        return new Promise(function (resolve, reject) {
            fs.mkdir(args.bagName, function (err) {
                if (err) {
                    console.error(strings.errorBagCreation);
                }

                console.log(strings.createdBag + args.bagName);
                fs.mkdir(args.bagName + '/data', function (err) {
                    if (err) throw err;
                    console.log(strings.createdData + '/data');
                    module.exports.writeBagInfo(args);
                    module.exports.copyOriginToData(args);

                    setTimeout(function () {
                        resolve(true);
                    }, 200);
                });

            });
        });

    },
    writeBagInfo: function (args, bagInfoMetadata) {
        fs.writeFile(args.bagName + '/' + 'bag-info.txt', strings.bagInfoTxt + "\n", function (err) {
            if (err) {
                return console.error(strings.errorBagInfo);
            }
            console.log(strings.createdBagInfo + args.bagName + '/' + 'bag-info.txt');
        });

        for (var i in bagInfo) {
            if (bagInfo[i]) {
                fs.appendFile(args.bagName + '/' + 'bag-info.txt', i + ": " + bagInfo[i] + "\n", function (err) {
                    if (err) {
                        return console.error(strings.errorBagInfo);
                    }
                });
            }
        }

    },
    copyOriginToData: function (args) {
        var lastDirPath = lastdirpath.getLastDirPath(args.originDirectory);
          fs.mkdir(args.bagName + '/data/' + lastDirPath, function (err) {
                    if (err) throw err;
          });
        
        ncp(args.originDirectory, args.bagName + '/data/' + lastDirPath, function (err) {
            if (err) {
                return console.error(strings.errorCopying);
            }
            module.exports.createManifest(args.bagName + '/data', args, 'manifest');
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
    /**
     * Functions for creating the manifest file.
     */
    createManifest: function (myPath, args, type) {
        // 1 Recurse through the path provided and run the createFileHash function on all the files
        var manifestFileName = module.exports.getManifestFileName(args.bagName, args.cryptoMethod, type);
        console.log(strings.writingManifest + manifestFileName);
        if (type === 'manifest') {
            recursive(myPath, function (err, files) {
                files.forEach(function (file) {
                      module.exports.createFileHash(file, args, manifestFileName);
                });
            });
        }

    },
    createFileHash: function (file, args, manifestFileName) {
        // 2 Create a hash for the provided file path and send the results to the appendHashtoManifest function
        var hash = crypto.createHash(args.cryptoMethod);
        var stats = fs.stat(file, function (err, stat) {
            if (!stat.isDirectory()) {
                var stream = fs.createReadStream(file);
                stream.on('data', function (data) {
                    hash.update(data, 'utf8');
                });
                stream.on('end', function () {
                    var myHash = hash.digest('hex');
                    module.exports.appendHashtoManifest(myHash, file, manifestFileName, args)
                });
            }
        });
    },
    appendHashtoManifest: function (hash, file, manifestFileName, args) {
        // 3 Append the combined hash and filename to the manifest file returned by the getManifestFileName function
        var relName = module.exports.getRelativePath(file);
        var manifestLine = hash + ' ' + relName + '\n';
        fs.appendFile(manifestFileName, manifestLine, function (err) {
            if (err) {
                return console.error(strings.errorManifest);
            }
        });
    },
    getManifestFileName: function (bagName, cryptoMethod, type) {
        // 4 Get the full path of the manifest file
        
        var manifestFileName = bagName + '/' + type + '-' + cryptoMethod + '.txt';
        return manifestFileName;
    }
};