// Load modules

var Path = require('path');
var Hoek = require('hoek');
var MimeDb = require('mime-db');


// Declare internals

var internals = {};


internals.compressibleRx = /^text\/|\+json$|\+text$|\+xml$/;


internals.compile = function (override) {

    var result = {
        byExtension: {}
    };
    var db = Hoek.clone(MimeDb);

    Hoek.merge(db, override, true, false);

    result.byType = db;
    var keys = Object.keys(result.byType);

    for (var i = 0, il = keys.length; i < il; i++) {
        var type = keys[i];
        var mime = result.byType[type];
        mime.type = mime.type || type;
        mime.source = mime.source || 'mime-db';
        mime.extensions = mime.extensions || [];
        mime.compressible = (mime.compressible !== undefined ? mime.compressible : internals.compressibleRx.test(type));

        for (var j = 0, jl = mime.extensions.length; j < jl; j++) {
            var ext = mime.extensions[j];
            result.byExtension[ext] = mime;
        }
    }
    return result;
};

var Mimos = module.exports = function (override) {

    Hoek.assert(this.constructor === Mimos, 'Mimos must be created with new');

    this._mimeDb = internals.compile(override || {});
};


Mimos.prototype.path = function (path) {

    var extension = Path.extname(path).slice(1).toLowerCase();
    var mime = this._mimeDb.byExtension[extension] || {};

    if (typeof mime.predicate === 'function') {
         mime = mime.predicate(Hoek.cloneWithShallow(mime, ['predicate']));
    }

    return mime;
};


Mimos.prototype.type = function (type) {

    type = type.split(';', 1)[0].trim().toLowerCase();
    var mime = this._mimeDb.byType[type];
    if (!mime) {
        mime = {
            type: type,
            source: 'hapi',
            extensions: [],
            compressible: internals.compressibleRx.test(type)
        };

        this._mimeDb.byType[type] = mime;
    }
    else if (typeof mime.predicate === 'function') {
        mime = mime.predicate(Hoek.cloneWithShallow(mime, ['predicate']));
    }

    return mime;
};