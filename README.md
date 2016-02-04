# :handbag: Gladstone :handbag: 

This is a node.js module for creating BagIt archives. 

To use it from the command-line you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm (typically md5 or sha1).
``` bash
gladstone <bag_name> <source_bag> <hashing_method>
```

```bash
gladstone ~/bagname ~/sourcebag md5 
```

To use the library:

```javascript 
var gladstone = require('gladstone');


gladstone.createBagDirectory (  { bagName: '/path/to/new/bag',
                                  originDirectory: /path/to/dir/to/bag', 
                                  cryptoMethod: 'md5' } );
```

The library returns a promise:

```javascript 
  return gladstone.createBagDirectory (  { bagName: process.cwd() + '/testbag',
                      originDirectory: process.cwd() + '/test',
                      cryptoMethod: 'md5'}).then(function(result) { 
                      console.log("Done making the bag");
                      });
```
