var gladstone = exports;

var crypto = require('crypto');
var path = require('path');
var recursive = require('recursive-readdir');
var ncp = require('ncp').ncp;
var fs = require('fs');

var strings = require('./lib/strings');
var bagInfo = require('./lib/bag-info');
var settings = require('./lib/settings');
var lastdirpath = require('./lib/lastdirpath');
var processArgs = require('./lib/process-args');
var async = require("async");

const mkdirp = require("mkdirp");
var rimraf = require("rimraf");

const recreateDir = function(directory, callback)
{
    rimraf(directory, function (err) {
        mkdirp(directory, function (err) {
            callback(err);
        });
    });
}

module.exports = {
    createBagDirectory: function (args) {
        var procArgs = processArgs(args);
        return new Promise(function (resolve, reject) {

            recreateDir(args.bagName, function (err) {

                if (err)
                {
                    console.error(strings.errorBagCreation);
                    reject(false);
                }
                else
                {
                    console.log(strings.createdBag + procArgs.bagName);

                    recreateDir(procArgs.bagName + '/data', function (err) {
                        if (err)
                        {
                            throw err;
                        }
                        console.log(strings.createdData + '/data');

                        async.series([
                            function (callback) {
                                module.exports.writeBagInfo(args, procArgs, callback);
                            },
                            function (callback) {
                                module.exports.copyOriginToData(args, callback);
                            }
                        ], function (err, results) {
                            if (!err)
                            {
                                resolve(true);
                            }
                            else
                            {
                                reject(false);
                            }
                        });
                    });
                }
            });
        });
    },
    writeBagInfo: function (args, bagInfoMetadata, callback) {
        var lastDirPath = lastdirpath.getLastDirPath(args.originDirectory);
        async.series([
            function (callback) {
                const mkdirp = require("mkdirp");
                var rimraf = require("rimraf");
                rimraf(args.bagName + '/data/' + lastDirPath, function (err) {
                    mkdirp(args.bagName + '/data/' + lastDirPath, function (err) {
                        callback(err);
                    });
                });
            },
            function (callback) {
                fs.writeFile(args.bagName + '/' + 'bagit.txt', strings.bagIt + "\n", function (err) {
                    if (err)
                    {
                        console.error(strings.errorBagInfo);
                        return callback(err);
                    }
                    else
                    {
                        console.log(strings.createdBagInfo + args.bagName + '/' + 'bagit.txt');
                        return callback(null);
                    }
                });
            },
            function (callback) {
                fs.writeFile(args.bagName + '/' + 'bag-info.txt', "", function (err) {
                    if (err)
                    {
                        console.error(strings.errorBagInfo);
                        return callback(err);
                    }
                    else
                    {
                        console.log(strings.createdBagInfo + args.bagName + '/' + 'bag-info.txt');
                        return callback(err);
                    }
                });
            },
            function (callback) {
                async.mapSeries(Object.keys(bagInfoMetadata), function (bagInfoKey, callback) {

                    if(typeof bagInfoMetadata[bagInfoKey] === "string" && bagInfoMetadata[bagInfoKey] !== "" && bagInfoMetadata[bagInfoKey] !== " ")
                    {
                        fs.appendFile(args.bagName + '/' + 'bag-info.txt', bagInfoKey + ": " + bagInfoMetadata[bagInfoKey] + "\n", function (err) {
                            if (err)
                            {
                                console.error(strings.errorBagInfo);
                                return callback(err);
                            }
                            return callback(null);
                        });
                    }
                    else
                    {
                        return callback(null);
                    }
                }, function (err, results) {
                    return callback(err, results);
                });
            },
            function (callback) {
                // Create tag-manifest file
                var tagManifestFileName = module.exports.getManifestFileName(args.bagName, args.cryptoMethod, 'tagmanifest');
                fs.writeFile(tagManifestFileName, "", function (err) {
                    if (err)
                    {
                        console.error(strings.errorTagManifest);
                        return callback(err);
                    }

                    console.log(strings.writingTagManifest + tagManifestFileName);

                    fs.readdir(args.bagName, function (err, files) {
                        async.mapSeries(files, function (file, callback) {
                            if (file.substring(file.length, file.length - 4) === '.txt')
                            {
                                module.exports.createFileHash(args.bagName + '/' + file, args, tagManifestFileName, function (err, result) {
                                    callback(err, args.bagName + '/' + file);
                                });
                            }
                            else
                            {
                                callback(null);
                            }
                        }, function (err, results) {
                            callback(err, results);
                        });
                    });
                });
            }
        ], function (err, results) {
            callback(err, results);
        })
    },
    copyOriginToData: function (args, callback) {
        var lastDirPath = lastdirpath.getLastDirPath(args.originDirectory);

        async.series([
            function (callback) {
                ncp(args.originDirectory, args.bagName + '/data/' + lastDirPath, function (err) {
                    if (err)
                    {
                        return console.error(strings.errorCopying);
                    }
                    module.exports.createManifest(args.bagName + '/data', args, 'manifest', function (err, result) {
                        callback(err, result);
                    });
                });
            }
        ], function (err, result) {
            callback(err, result);
        });
    },
    getRelativePath: function (filePath) {
        var relPath = filePath.replace(/\\\\/g, '').replace(/\//g, '/');
        var splitName = relPath.split('/data/');
        var relName = relPath.replace(splitName[0], '');

        if (relName.substring(0, 1) == '/')
        {
            relName = relName.substring(1);
        }

        return relName;
    },
    /**
     * Functions for creating the manifest file.
     */
    createManifest: function (myPath, args, type, callback) {
        // 1 Recurse through the path provided and run the createFileHash function on all the files
        var manifestFileName = module.exports.getManifestFileName(args.bagName, args.cryptoMethod, type);
        console.log(strings.writingManifest + manifestFileName);
        if (type === 'manifest')
        {
            recursive(myPath, function (err, files) {
                if (!err)
                {
                    async.mapSeries(files, function (file, callback) {
                        module.exports.createFileHash(file, args, manifestFileName, function (err, result) {
                            callback(err, result);
                        });
                    }, function (err, results) {
                        callback(err, results);
                    });
                }
                else
                {
                    callback(err, "Error traversing path " + myPath);
                }
            });
        }
        else
        {
            callback(1, "Invalid type!");
        }

    },
    createFileHash: function (file, args, manifestFileName, callback) {
        // 2 Create a hash for the provided file path and send the results to the appendHashtoManifest function
        var hash = crypto.createHash(args.cryptoMethod);
        var stats = fs.stat(file, function (err, stat) {
            if (!stat.isDirectory())
            {
                var stream = fs.createReadStream(file);
                stream.on('data', function (data) {
                    hash.update(data, 'utf8');
                });
                stream.on('end', function () {
                    var myHash = hash.digest('hex');
                    module.exports.appendHashtoManifest(myHash, file, manifestFileName, args, function (err, result) {
                        callback(err, result);
                    })
                });
            }
        });
    },
    appendHashtoManifest: function (hash, file, manifestFileName, args, callback) {
        // 3 Append the combined hash and filename to the manifest file returned by the getManifestFileName function
        var relName = module.exports.getRelativePath(file);
        var manifestLine = hash + ' ' + relName + '\n';
        fs.appendFile(manifestFileName, manifestLine, function (err) {
            if (err)
            {
                console.error(strings.errorManifest);
                callback(err);
            }
            else
            {
                callback(null);
            }
        });
    },
    getManifestFileName: function (bagName, cryptoMethod, type) {
        // 4 Get the full path of the manifest file
        var manifestFileName = bagName + '/' + type + '-' + cryptoMethod + '.txt';
        return manifestFileName;
    }
};