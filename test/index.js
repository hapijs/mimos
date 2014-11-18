// Load modules

var Code = require('code');
var Hoek = require('hoek');
var Lab = require('lab');
var Mimos = require('..');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('Mimos', function() {

    describe('path()', function () {

        it('returns the mime type from a file path', function (done) {

            var m = new Mimos();

            expect(m.path('/static/javascript/app.js')).deep.equal({
                source: 'iana',
                charset: 'UTF-8',
                compressible: true,
                extensions: ['js'],
                type: 'application/javascript'
            });
            done();
        });

        it('returns empty object if a match can not be found', function (done) {

            var m = new Mimos();

            expect(m.path('/static/javascript')).to.deep.equal({});
            done();
        });

        it('ignores extension upper case', function (done) {

            var lower = '/static/image/image.jpg';
            var upper = '/static/image/image.JPG';
            var m = new Mimos();

            expect(m.path(lower).type).to.equal(m.path(upper).type);

            done();
        });
    });

    describe('type()', function () {

        it('returns a found type', function (done) {

            var m = new Mimos();

            expect(m.type('text/plain')).to.deep.equal({
                source: 'iana',
                compressible: true,
                extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
                type: 'text/plain'
            });
            done();
        });

        it('returns a missing type', function (done) {

            var m = new Mimos();

            expect(m.type('hapi/test')).to.deep.equal({
                source: 'hapi',
                compressible: false,
                extensions: [],
                type: 'hapi/test'
            });
            done();
        });
    });

    it('accepts an override object to make adjustments to the internal mime database', function (done) {

        var nodeModule = {
            source: 'iana',
            compressible: false,
            extensions: ['node', 'module', 'npm'],
            type: 'node/module'
        };
        var dbOverwrite = {
            override: {
                'node/module': nodeModule
            }
        };

        var m = new Mimos(dbOverwrite);
        expect(m.type('node/module')).to.deep.equal(nodeModule);
        expect(m.path('/node_modules/node/module.npm')).to.deep.equal(nodeModule);

        done();
    });

    it('allows built-in types to be replaced with user mime data', function (done) {

        var jsModule = {
            source: 'iana',
            charset: 'UTF-8',
            compressible: true,
            extensions: [ 'js', 'javascript' ],
            type: 'text/javascript'
        };
        var dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        var m = new Mimos(dbOverwrite);

        expect(m.type('application/javascript')).to.deep.equal(jsModule);
        expect(m.path('/static/js/app.js')).to.deep.equal(jsModule);

        done();
    });

    it('executes a predicate function if it is provided', function (done) {

        var jsModule = {
            predicate: function (mime) {

                return {
                    foo: 'bar',
                    type: mime.type
                }
            },
            type: 'text/javascript'
        };
        var dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        var m = new Mimos(dbOverwrite);

        var typeResult = m.type('application/javascript');

        expect(typeResult).to.deep.equal({
            foo: 'bar',
            type: 'text/javascript'
        });

        var pathResult = m.path('/static/js/app.js');

        expect(pathResult).to.deep.equal({
            foo: 'bar',
            type: 'text/javascript'
        });

        done();
    });

    it('throws an error if created without new', function (done) {

        expect(function () {

            var m = Mimos();
        }).to.throw('Mimos must be created with new');
        done();

    });

    it('throws an error if the predicate option is not a functino', function (done) {

        expect(function () {

            var m = new Mimos({
                override: {
                    'application/javascript': {
                        predicate: 'foo'
                    }
                }
            });
        }).to.throw('predicate option must be a function');
        done();
    });
});
