import { Mimos, MimosEntry } from '..';
import * as Lab from '@hapi/lab';

const { expect } = Lab.types;


const mimos = new Mimos();
const predicate = (entry: MimosEntry) => entry;

// constructor()

expect.type<Mimos>(mimos);
expect.type<Mimos>(new Mimos({ override: { 'test/html':  { compressible: false, predicate } }}));
expect.type<Mimos>(new Mimos<{ custom: boolean }>({ override: { 'test/html': { compressible: false, predicate, custom: true } } }));

expect.error(new Mimos({ unknown: true }));
expect.error(new Mimos({ override: new Map() }));
expect.error(new Mimos({ override: [{}] }));
expect.error(new Mimos({ override: { 'test/html': { compressible: 0 } } }));
expect.error(new Mimos({ override: { 'test/html': { predicate: () => true } } }));
expect.error(new Mimos({ override: { 'test/html': { compressible: false, predicate, custom: true } } }));


// Mimos.type()

expect.type<MimosEntry>(mimos.type('text/html'));
expect.type<MimosEntry & { custom?: boolean }>(new Mimos<{ custom: boolean }>().type('text/html'))

expect.error(mimos.type());
expect.error(mimos.type(true));

// Mimos.path()

expect.type<MimosEntry | {}>(mimos.path('/my/file.html'));
expect.type<MimosEntry & { custom?: boolean } | {}>(new Mimos<{ custom: boolean }>().path('/my/file.html'))

expect.error(mimos.path());
expect.error(mimos.path(new URL('file:///my/file.html')));

// MimosEntry

const entry = mimos.path('/my/file.html');
if (entry instanceof MimosEntry) {
    expect.type<MimosEntry>(entry);
}

//expect.error(new MimosEntry());       // Test is disabled due to Lab issue
