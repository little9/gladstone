# :handbag: Gladstone :handbag: 

[![Build Status](https://travis-ci.org/little9/gladstone.svg?branch=master)](https://travis-ci.org/little9/gladstone)

This is a node module for creating [BagIt archives](https://en.wikipedia.org/wiki/BagIt). 

The goal of the project is to implement the complete [BagIt 0.97](https://tools.ietf.org/html/draft-kunze-bagit-08) specification. 

## Installation

It can be downloaded and installed from npm:

```bash
npm install -g gladstone
```

## Command line usage

To use it from the command-line you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm.

```bash
gladstone --bagName ~/bagname --originDirectory ~/source --cryptoMethod md5 
```

The BagIt specification has some optional metadata fields that can be present in the bag-info.txt file. These optional fields can
be passed on the command line:

```bash
gladstone --bagName ~/bagname --originDirectory ~/source --cryptoMethod md5 --sourceOrganization "Your Org"
```

## Programmatic usage 

You can also use gladstone in other node applications by passing the createBagDirectory function a JSON object:

```javascript 
var gladstone = require('gladstone');

gladstone.createBagDirectory({ bagName: '/path/to/new/bag',
                               originDirectory: '/path/to/dir/to/bag',
                               cryptoMethod: 'sha256',
                               sourceOrganization: 'Example Organization',
                               organizationAddress: '123 Street',
                               contactName: 'Contact Name',
                               contactPhone: '555-555-5555',
                               contactEmail: 'test@example.org',
                               externalDescription: 'An example description'
                            });
```
