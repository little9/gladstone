var bagInfo = require('./bag-info');
var strings = require('./strings');

module.exports = function (args) {
        /**
         * Function to process command line arguments or an object passed manually
         */
        var userArgs = {};

        if (args.bagName) {
            userArgs.bagName = args.bagName;
        } else {
            console.log(strings.noBagName);
        }

        if (args.originDirectory) {
            userArgs.originDirectory = args.originDirectory;
        } else {
            console.log(strings.noOrigin);
        }

        if (args.cryptoMethod) {
            userArgs.cryptoMethod = args.cryptoMethod;
        } else {
            userArgs.cryptoMethod = 'md5';
        }

        if (args.sourceOrganization) {
            bagInfo["Source-Organization"] = args.sourceOrganization
        }

        if (args.organizationAddress) {
            bagInfo["Organization-Address"] = args.organizationAddress
        }

        if (args.contactName) {
            bagInfo["Contact-Name"] = args.contactName
        }

        if (args.contactPhone) {
            bagInfo["Contact-Phone"] = args.contactPhone
        }

        if (args.contactEmail) {
            bagInfo["Contact-Email"] = args.contactEmail
        }

        if (args.externalDescription) {
            bagInfo["External-Description"] = args.externalDescription
        }

        if (args.baggingDate) {
            bagInfo["Bagging-Date"] = args.baggingDate
        }

        if (args.externalIdentifier) {
            bagInfo["External-Identifier"] = args.externalIdentifier
        }

        if (args.internalSenderIdentifier) {
            bagInfo["Internal-Sender-Identifier"] = args.internalSenderIdentifier
        }

        if (args.internalSenderDescription) {
            bagInfo["Internal-Sender-Description"] = args.internalSenderDescription
        }

        return userArgs;
    }
