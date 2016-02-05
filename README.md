# :handbag: Gladstone :handbag: 

This is a node module for creating [BagIt archives](https://en.wikipedia.org/wiki/BagIt). 

The goal of the project is to implement the complete [BagIt 0.97](https://tools.ietf.org/html/draft-kunze-bagit-08) specification. 

To use it from the command-line you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm.

``` bash
gladstone <bag_name> <source_bag> <hashing_method>
```

```bash
gladstone ~/bagname ~/sourcebag md5 
```

It can also be used as library in other node applications:

```javascript 
var gladstone = require('gladstone');


gladstone.createBagDirectory (  { bagName: '/path/to/new/bag',
                                  originDirectory: '/path/to/dir/to/bag',
                                  cryptoMethod: 'md5'});
```

The library returns a promise:

```javascript 
  return gladstone.createBagDirectory (  { bagName: process.cwd() + '/testbag',
                      originDirectory: process.cwd() + '/test',
                      cryptoMethod: 'md5'}).then(function(result) { 
                      console.log("Done making the bag");
                      });
                    
```
