var assert = require('assert'),
    Gladstone = require('./../index').Gladstone;
    fs = require('fs');
describe('Gladstone', function () {
    describe('#processArgs', function () {
        it('should return an object with the bag name and the origin directory', function () {

            var args = ['node', 'index.js', 'bag_name', 'origin_directory'];
            var myArgs = Gladstone.processArgs(args);

            assert.equal(myArgs.bagName, 'bag_name');
            assert.equal(myArgs.originDirectory, 'origin_directory');

        });

        describe('#createBagDirectory', function () {
            it('show create a directory for the bag', function () {

            });
        });

        describe('#writeBagInfo', function () {
            it('should write a text file for the bag', function () {

            });

        });

        describe('#createManifest', function () {
            it('should create a manifest file', function () {

            });
        });



    });
});