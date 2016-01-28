# :handbag: Gladstone :handbag: 

This is a node.js module for creating BagIt archives. 

To use it from the command-line you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm (typically md5 or sha1).
``` bash
gladstone <source_directory> <bag_name> <hashing_method>
```

```bash
gladstone ~/source sourcebag md5 
```

To use the library:

```javascript
var myArgs = Gladstone.processArgs(['bag_name', 'origin_directory']);
Gladstone.createBagDirectory(myArgs);
```

