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
 

      describe('#createBagDirectory', function() {
           it('should make a directory for the bag', function() {  
         return Gladstone.createBagDirectory (  { bagName: process.cwd() + '/testbag',
                      originDirectory: process.cwd() + '/test',
                      cryptoMethod: 'md5'}).then(function(result) { 
                assert.equal(fs.statSync(process.cwd() + '/testbag').isDirectory(), true);   
                assert.equal(fs.statSync(process.cwd() + '/testbag/bag-info.txt').isFile(), true);  
                assert.equal(fs.statSync(process.cwd() + '/testbag/manifest-md5.txt').isFile(), true);               
                assert.equal(fs.statSync(process.cwd() + '/testbag/data/test.gif').isFile(),true);
                    });
           });
      });    
    
});
