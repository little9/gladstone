# :handbag: Gladstone :handbag: 

This is a node.js module for creating BagIt archives. 

To use it from the command-line you provide a source directory that you want want to create a BagIt archive for, a name for the bag, and a hashing algorithm (typically md5 or sha1).
``` bash
gladstone <bag_name> <source_bag> <hashing_method>
```

```bash
gladstone ~/bagname ~/sourcebag md5 
```


