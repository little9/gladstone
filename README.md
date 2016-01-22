# :handbag: Gladstone :handbag: 

This is a Node.js module for creating BagIt archives. 

To use it you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm (typically md5 or sha1).
``` bash
gladstone <source_directory> <bag_name> <hashing_method>
```

```bash
gladstone ~/source sourcebag md5 
```

