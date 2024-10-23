'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Mimos = require('..');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Mimos', () => {

    describe('path()', () => {

        it('returns the mime type from a file path', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.path('/static/javascript/app.js')).equal({
                source: 'iana',
                charset: 'UTF-8',
                compressible: true,
                extensions: ['js', 'mjs'],
                type: 'text/javascript'
            });
        });

        it('returns empty object if a match can not be found', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.path('/static/javascript')).to.equal({});
        });

        it('can distinguish an empty return using instanceof', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.path('/static/javascript/app.js')).to.be.instanceof(Mimos.MimosEntry);
            expect(mimos.path('/static/javascript')).to.not.be.instanceof(Mimos.MimosEntry);
        });

        it('ignores extension upper case', () => {

            const lower = '/static/image/image.jpg';
            const upper = '/static/image/image.JPG';
            const mimos = new Mimos.Mimos();

            expect(mimos.path(lower).type).to.equal(mimos.path(upper).type);
        });
    });

    describe('type()', () => {

        it('returns a found type', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.type('text/plain')).to.equal({
                source: 'iana',
                compressible: true,
                extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
                type: 'text/plain'
            });
        });

        it('returns a type when option is included', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.type('text/plain;charset=UTF-8')).to.equal({
                source: 'iana',
                compressible: true,
                extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
                type: 'text/plain'
            });
        });

        it('returns a missing type', () => {

            const mimos = new Mimos.Mimos();

            expect(mimos.type('hapi/test')).to.equal({
                source: 'mimos',
                compressible: false,
                extensions: [],
                type: 'hapi/test'
            });
        });
    });

    it('accepts an override object to make adjustments to the internal mime database', () => {

        const nodeModule = {
            source: 'iana',
            compressible: false,
            extensions: ['node', 'module', 'npm'],
            type: 'node/module'
        };
        const dbOverwrite = {
            override: {
                'node/module': nodeModule
            }
        };

        const mimos = new Mimos.Mimos(dbOverwrite);
        expect(mimos.type('node/module')).to.equal(nodeModule);
        expect(mimos.path('/node_modules/node/module.npm')).to.equal(nodeModule);
    });

    it('allows built-in types to be replaced with user mime data', () => {

        const jsModule = {
            source: 'iana',
            charset: 'UTF-8',
            compressible: true,
            extensions: ['js', 'javascript'],
            type: 'text/javascript'
        };
        const dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        const mimos = new Mimos.Mimos(dbOverwrite);

        expect(mimos.type('application/javascript')).to.equal(jsModule);
        expect(mimos.path('/static/js/app.js')).to.equal(jsModule);
    });

    it('executes a predicate function if it is provided', () => {

        const jsModule = {
            predicate: function (mime) {

                return {
                    foo: 'bar',
                    type: mime.type
                };
            },
            type: 'text/javascript'
        };
        const dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        const mimos = new Mimos.Mimos(dbOverwrite);

        const typeResult = mimos.type('application/javascript');

        expect(typeResult).to.equal({
            foo: 'bar',
            type: 'text/javascript'
        });

        const pathResult = mimos.path('/static/js/app.js');

        expect(pathResult).to.equal({
            foo: 'bar',
            type: 'text/javascript'
        });
    });

    it('throws an error if created without new', () => {

        expect(() => {

            Mimos.Mimos();
        }).to.throw(/cannot be invoked without 'new'/g);
    });

    it('throws an error if override is not an object', () => {

        expect(() => {

            new Mimos.Mimos({ override: true });
        }).to.throw('overrides option must be an object');
    });

    it('throws an error if the predicate option is not a functino', () => {

        expect(() => {

            new Mimos.Mimos({
                override: {
                    'application/javascript': {
                        predicate: 'foo'
                    }
                }
            });
        }).to.throw('predicate option must be a function');
    });
});
