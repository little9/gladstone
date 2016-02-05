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
    bagInfoMetadata: {
        "Source-Organization": "",
        "Organization-Address": "",
        "Contact-Name": "",
        "Contact-Phone": "",
        "Contact-Email": "",
        "External-Description": "",
        "Bagging-Date": "",
        "External-Identifier": "",
        "Bag-Size": "",
        "Payload-Oxum": "",
        "Bag-Group-Identifier": "",
        "Bag-Count": "",
        "Internal-Sender-Identifier": "",
        "Internal-Sender-Description": ""
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

        if (args.bagName) {
            userArgs.bagName = args.bagName;
        } else {
            console.log(module.exports.strings.noBagName);
        }

        if (args.originDirectory) {
            userArgs.originDirectory = args.originDirectory;
        } else {
            console.log(module.exports.strings.noOrigin);
        }

        if (args.cryptoMethod) {
            userArgs.cryptoMethod = args.cryptoMethod;
        } else {
            userArgs.cryptoMethod = 'md5';
        }

        return userArgs;
    },
    createBagDirectory: function (args) {
        return new Promise(function (resolve, reject) {
            fs.mkdir(args.bagName, function (err) {
                if (err) throw err;
                console.log('Made ' + args.bagName);
                fs.mkdir(args.bagName + '/data', function (err) {
                    if (err) throw err;
                    console.log('Made data directory');
                    module.exports.writeBagInfo(args);
                    module.exports.copyOriginToData(args);
                    setTimeout(function () {
                        resolve(true);
                    }, 200);
                });

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
    getManifestFileName: function (bagName, cryptoMethod) {
        var manifestFileName = bagName + '/' + 'manifest-' + module.exports.settings.cryptoMethod + '.txt';

        return manifestFileName;
    },
    createFileHash: function (file, args) {
        var hash = crypto.createHash(module.exports.settings.cryptoMethod);
        var stats = fs.stat(file, function (err, stat) {
            if (!stat.isDirectory()) {
                var stream = fs.createReadStream(file);
                stream.on('data', function (data) {
                    hash.update(data, 'utf8');
                });

                stream.on('end', function () {
                    var myHash = hash.digest('hex');
                    module.exports.appendHashtoManifest(myHash, file, args)
                });
            }
        });
    },
    appendHashtoManifest: function (hash, file, args) {
        var manifestFileName = module.exports.getManifestFileName(args.bagName, module.exports.settings.cryptoMethod);
        var relName = module.exports.getRelativePath(file);
        var manifestLine = hash + ' ' + relName + '\n';
        fs.appendFile(manifestFileName, manifestLine, function (err) {
            if (err) throw err;
        });
    },
    createManifest: function (myPath, args) {
        console.log('Creaing manifest');
        recursive(myPath, function (err, files) {
            files.forEach(function (file) {
                module.exports.createFileHash(file, args);
            });
        });

    }

};

