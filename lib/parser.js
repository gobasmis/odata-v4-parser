"use strict";
var PrimitiveLiteral = require('./primitiveLiteral');
var Expressions = require('./expressions');
var parserFactory = function (fn) {
    return function (source, options) {
        var raw = new Array(source.length);
        var pos = 0;
        var tokens = [];
        for (var i = 0; i < source.length; i++) {
            raw[i] = source.charCodeAt(i);
        }
        while (pos < raw.length) {
            //var token = primitiveLiteral(raw, pos);
            var token = fn(raw, pos);
            if (token) {
                pos = token.next;
                tokens.push(token);
            }
            else {
                /*tokens.push({
                    position: pos,
                    next: pos + 1,
                    value: String.fromCharCode(raw[pos]) + ' (' + raw[pos] + ')',
                    type: 'UnexpectedError',
                    raw: String.fromCharCode(raw[pos])
                });*/
                pos++;
            }
        }
        return tokens.length > 1 ? tokens : tokens[0];
    };
};
var Parser = (function () {
    function Parser() {
    }
    Parser.prototype.filter = function (source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); };
    Parser.prototype.keys = function (source, options) { return parserFactory(Expressions.keyPredicate)(source, options); };
    Parser.prototype.literal = function (source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map