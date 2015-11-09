var assert = require('assert'),
    Handbag = require('./../index').Handbag;
    fs = require('fs');
describe('Handbag', function () {

    describe('#processArgs', function () {
        it('should return an object with the bag name and the origin directory', function () {
           
           var args = ['node', 'index.js', 'bag_name', 'origin_directory'];
           var myArgs = Handbag.processArgs(args);
        
           assert.equal(myArgs.bagName, 'bag_name');
           assert.equal(myArgs.originDirectory, 'origin_directory');

        });
    });
});