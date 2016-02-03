var assert = require('assert'),
    Gladstone = require('./../gladstone.js');
    fs = require('fs');
  
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
    
describe('Gladstone', function () {
    describe('#processArgs', function () {
        it('should return an object with the bag name and the origin directory when given command line args', function () {

            var args = ['node', 'index.js', './testbag', './'];
            var myArgs = Gladstone.processArgs(args);
            
            assert.equal(myArgs.bagName, './testbag');
            assert.equal(myArgs.originDirectory, './');
        });
    });

 describe('#getRelativePath', function () {
        it('should return a path for the file relative to the bag', function () {
           var relPath = Gladstone.getRelativePath('/home/example/bag/data/image.tif');
           assert.equal(relPath, 'data/image.tif'); 
        });
    });
    
    describe('#getManifestFileName', function () {
        it('should return a filename for the manifest based on the bagname and the hashing method', function () {
          var manifestFileName = Gladstone.getManifestFileName('testbag', 'md5');
          assert.equal(manifestFileName, 'testbag/manifest-md5.txt');
        });
    });
  
      describe('#createBagDirectory', function () {
          
          
      Gladstone.createBagDirectory(
                    { bagName: process.cwd() + '/testbag',
                      originDirectory: process.cwd() + '/test',
                      cryptoMethod: 'md5'});
                      
        it('should create a directory for the bag', function () {
            fs.stat(process.cwd() + '/testbag', function(err, stats) {
                assert.equal(stats.isDirectory(), true);
                
            });
        });
                            
       it('should create a manifest for the bag', function () {
            fs.stat(process.cwd() + '/testbag/manifest-md5.txt', function(err, stats) {
                assert.equal(stats.isFile(), true);
                
            });
        });
        
          it('should create a bag-info for the bag', function () {
            fs.stat(process.cwd() + '/testbag/bag-info.txt', function(err, stats) {
                assert.equal(stats.isFile(), true); 
            });
        });
        
             it('should have test.gif in the bag', function () {
            fs.stat(process.cwd() + '/testbag/data/test.gif', function(err, stats) {
                assert.equal(stats.isFile(), true); 
            });
        });
        
                     it('should have the correct md5 checksum for test.gif in the bag', function () {    
                    fs.stat(process.cwd() + '/testbag/data/test.gif', function(err, stats) {
                assert.equal(stats.isFile(), true); 
            });
                     });
        
    });
});


