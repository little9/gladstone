var path = require('path');

module.exports = {
   getLastDirPath : function(dirPath) {
       var splitPath = dirPath.split(path.sep);
       var lastPath = splitPath[splitPath.length-1];
       return lastPath;
   }
}