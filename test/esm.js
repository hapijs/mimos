'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');


const { before, describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('import()', () => {

    let Mimos;

    before(async () => {

        Mimos = await import('../lib/index.js');
    });

    it('exposes all methods and classes as named imports', () => {

        expect(Object.keys(Mimos).filter((k) => k !== 'module.exports')).to.equal([
            'Mimos',
            'MimosEntry',
            'default'
        ]);
    });
});
