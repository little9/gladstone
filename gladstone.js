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
        "Internal-Sender-Identifier": "",
        "Internal-Sender-Description": ""
    },
    bagInfoTechMetadata: {
        "Bag-Size": "",
        "Payload-Oxum": "",
        "Bag-Group-Identifier": "",
        "Bag-Count": "",
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
        writingManifest: 'Creating manifest: ',
        createdBag: "Creating bag directory: ",
        createdData: "Creating data directory: ",
        createdBagInfo: "Creating bag info file: ",
        manifestArray: []
    },
    errorStrings: {
        errorCopying: "There was an error copying the origin directory into the bag.",
        errorBagCreation: "There was an error making the directory for the new bag.",
        errorBagInfo: "There an error making the bag-info.txt file.",
        errorManifest: "There was an error creating the manifest file."
    },
    processArgs: function (args) {
        /**
         * Function to process command line arguments or an object passed manually
         */
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

        if (args.sourceOrganization) {
            module.exports.bagInfoMetadata["Source-Organization"] = args.sourceOrganization
        }

        if (args.organizationAddress) {
            module.exports.bagInfoMetadata["Organization-Address"] = args.organizationAddress
        }

        if (args.contactName) {
            module.exports.bagInfoMetadata["Contact-Name"] = args.contactName
        }

        if (args.contactPhone) {
            module.exports.bagInfoMetadata["Contact-Phone"] = args.contactPhone
        }

        if (args.contactEmail) {
            module.exports.bagInfoMetadata["Contact-Email"] = args.contactEmail
        }

        if (args.externalDescription) {
            module.exports.bagInfoMetadata["External-Description"] = args.externalDescription
        }

        if (args.baggingDate) {
            module.exports.bagInfoMetadata["Bagging-Date"] = args.baggingDate
        }

        if (args.externalIdentifier) {
            module.exports.bagInfoMetadata["External-Identifier"] = args.externalIdentifier
        }

        if (args.internalSenderIdentifier) {
            module.exports.bagInfoMetadata["Internal-Sender-Identifier"] = args.internalSenderIdentifier
        }

        if (args.internalSenderDescription) {
            module.exports.bagInfoMetadata["Internal-Sender-Description"] = args.internalSenderDescription
        }

        return userArgs;
    },
    createBagDirectory: function (args) {
        return new Promise(function (resolve, reject) {
            fs.mkdir(args.bagName, function (err) {
                if (err) {
                    console.error(module.exports.errorStrings.errorBagCreation);
                }

                console.log(module.exports.strings.createdBag + args.bagName);
                fs.mkdir(args.bagName + '/data', function (err) {
                    if (err) throw err;
                    console.log(module.exports.strings.createdData + '/data');
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
        fs.writeFile(args.bagName + '/' + 'bag-info.txt', module.exports.strings.bagInfoTxt + "\n", function (err) {
            if (err) {
                return console.error(module.exports.errorStrings.errorBagInfo);
            }
            console.log(module.exports.strings.createdBagInfo + args.bagName + '/' + 'bag-info.txt');
        });

        for (var i in module.exports.bagInfoMetadata) {
            if (module.exports.bagInfoMetadata[i]) {
                fs.appendFile(args.bagName + '/' + 'bag-info.txt', i + ": " + module.exports.bagInfoMetadata[i] + "\n", function (err) {
                    if (err) {
                        return console.error(module.exports.errorStrings.errorBagInfo);
                    }
                });
            }
        }

    },
    copyOriginToData: function (args) {

        ncp(args.originDirectory, args.bagName + '/data', function (err) {
            if (err) {
                return console.error(module.exports.errorStrings.errorCopying);
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
        var manifestFileName = module.exports.getManifestFileName(args.bagName, module.exports.settings.cryptoMethod, type);
        console.log(module.exports.strings.writingManifest + manifestFileName);
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
        var hash = crypto.createHash(module.exports.settings.cryptoMethod);
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
                return console.error(module.exports.errorStrings.errorManifest);
            }
        });
    },
    getManifestFileName: function (bagName, cryptoMethod, type) {
        // 4 Get the full path of the manifest file
        
        var manifestFileName = bagName + '/' + type + '-' + module.exports.settings.cryptoMethod + '.txt';
        return manifestFileName;
    }



};

