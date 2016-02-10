var assert = require('assert'),
    gladstone = require('./../gladstone.js');
    fs = require('fs');
    lastdirpath = require('../lib/lastdirpath');
    processArgs = require('../lib/process-args');
 // Required to clean up after tests  
 deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else { 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};   
    
describe('gladstone', function () {
    describe('#processArgs', function () {
        it('should return an object with the bag name and the origin directory when given command line args', function () {
           var args = {
                bagName : "./testbag",
                originDirectory : "./"
            }

            var myArgs = processArgs(args);
            
            assert.equal(myArgs.bagName, './testbag');
            assert.equal(myArgs.originDirectory, './');
        });
    });

 describe('#getRelativePath', function () {
        it('should return a path for the file relative to the bag', function () {
           var relPath = gladstone.getRelativePath('/home/example/bag/data/image.tif');
           assert.equal(relPath, 'data/image.tif'); 
        });
    });
    
    describe('#getManifestFileName', function () {
        it('should return a filename for the manifest based on the bagname and the hashing method', function () {
          var manifestFileName = gladstone.getManifestFileName('testbag', 'md5', 'manifest');
          assert.equal(manifestFileName, 'testbag/manifest-md5.txt');
        });
    });
 

      describe('#createBagDirectory', function() {
          after(function(){
              deleteFolderRecursive(process.cwd() + '/testbag');
          });
          
           it('should make a directory for the bag', function() {  
         return gladstone.createBagDirectory (  { bagName: process.cwd() + '/testbag',
                      originDirectory: process.cwd() + '/test',
                      cryptoMethod: 'md5'}).then(function(result) {
                assert.equal(fs.statSync(process.cwd() + '/testbag').isDirectory(), true);   
                assert.equal(fs.statSync(process.cwd() + '/testbag/bag-info.txt').isFile(), true);  
                assert.equal(fs.statSync(process.cwd() + '/testbag/manifest-md5.txt').isFile(), true);
                assert.equal(fs.statSync(process.cwd() + '/testbag/data/test/test.gif').isFile(),true);
                    });
           });
      });    
    
    describe('#lastDirPath' , function() {
       
       it('should return the last directory in path', function() {
           var lastpath = lastdirpath.getLastDirPath('/var/www/html/path');
           assert.equal(lastpath, 'path');
       });
        
    });
    
});
