// Load modules

var Path = require('path');
var Hoek = require('hoek');
var MimeDb = require('mime-db');


// Declare internals

var internals = {};


internals.compressibleRx = /^text\/|\+json$|\+text$|\+xml$/;


var Mimos = module.exports = function (override) {

    Hoek.assert(this.constructor === Mimos, 'Mimos must be created with new');

    var db = Hoek.clone(MimeDb);
    Hoek.merge(db, override, true, false);

    this._byType = db;
    this._byExtension = {};

    var keys = Object.keys(this._byType);

    for (var i = 0, il = keys.length; i < il; i++) {
        var type = keys[i];
        var mime = this._byType[type];
        mime.type = mime.type || type;
        mime.source = mime.source || 'mime-db';
        mime.extensions = mime.extensions || [];
        mime.compressible = (mime.compressible !== undefined ? mime.compressible : internals.compressibleRx.test(type));

        if (typeof mime.predicate !== 'undefined') {
            Hoek.assert(typeof mime.predicate === 'function', 'predicate option must be a function');
        }

        for (var j = 0, jl = mime.extensions.length; j < jl; j++) {
            var ext = mime.extensions[j];
            this._byExtension[ext] = mime;
        }
    }
};


Mimos.prototype.path = function (path) {

    var extension = Path.extname(path).slice(1).toLowerCase();
    var mime = this._byExtension[extension] || {};

    if (mime.predicate) {
         mime = mime.predicate(Hoek.clone(mime));
    }

    return mime;
};


Mimos.prototype.type = function (type) {

    type = type.split(';', 1)[0].trim().toLowerCase();
    var mime = this._byType[type];
    if (!mime) {
        mime = {
            type: type,
            source: 'hapi',
            extensions: [],
            compressible: internals.compressibleRx.test(type)
        };

        this._byType[type] = mime;
        return mime;
    }

    if (mime.predicate) {
        mime = mime.predicate(Hoek.clone(mime));
    }

    return mime;
};