/**
 *
 * Liu Chaofan
 * MIT Liencese
 */

function tokenize(str) {
    let at = 0,
        len = str.length,
        tokens = [];
    while (at < len) {
        let ch = str[at];

        if (ch === '/' && str[at + 1] === '/') {
            at += 2;
            ch = str[at];
            while (ch && ch !== '\n') {
                ch = str[++at];
            }
            continue;
        }

        if (ch === '/' && str[at + 1] === '*') {
            at += 2;
            ch = str[at];
            while (ch && !(ch === '*' && str[at + 1] === '/')) {
                ch = str[++at];
            }
            at += 2;
            continue;
        }

        if (/[\d.]/.test(ch)) {
            let value = '';
            while (ch && /[\d.]/.test(ch)) {
                if (value.indexOf('.') > -1 && ch === '.') {
                    throw new Error('Invalid Number');
                }
                value += ch;
                ch = str[++at];
            }
            if (!/\d/.test(value)) {
                throw new Error('Invalid Number');
            }
            tokens.push({
                name: 'number',
                value
            });
            continue;
        }

        if (/\w/.test(ch)) {
            let value = '';
            while (ch && /\w/.test(ch)) {
                value += ch;
                ch = str[++at];
            }
            tokens.push({
                name: 'word',
                value
            });
            continue;
        }

        if (ch === '"' || ch === '\'') {
            let start_sign = ch,
                value = '';
            ch = str[++at];
            while (ch && !(ch === start_sign && ch[at - 1] !== '\\')) {
                value = value + ch;
                ch = str[++at];
            }
            at++;
            tokens.push({
                name: 'string',
                value
            });
            continue;
        }

        if (ch === '{') {
            tokens.push({
                name: 'object_begin',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === '}') {
            tokens.push({
                name: 'object_end',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === '[') {
            tokens.push({
                name: 'array_begin',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === ']') {
            tokens.push({
                name: 'array_end',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === ':') {
            tokens.push({
                name: ':',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === ',') {
            tokens.push({
                name: ',',
                value: ch
            });
            at++;
            continue;
        }

        if (/\s/.test(ch)) {
            at++;
            continue;
        }

        throw new Error('tokenize error');
    }
    if (at !== len) {
        throw new Error('tokenize length error');
    }
    return tokens;
}

function parseToken(tokens) {
    if (tokens.length === 0) return null;
    let at = 0,
        token = tokens[at],
        len = tokens.length;
    var r = parse();
    if (at !== len) {
    // eslint-disable-next-line
    console.warn(
            'It maybe contains errors in result. There are tokens remained in buffer.'
        );
    }
    return r;
    function parse() {
        token = tokens[at];
        if (token && token.name === 'number') {
            return parseNumber();
        } else if (token.name === 'string')
        {
            return parseString();
        } else if (token && token.name === 'object_begin') {
            return parseObject();
        } else if (token && token.name === 'array_begin') {
            return parseArray();
        } else if (token && token.name === 'word') {
            return parseWords();
        }
        throw new Error('parse error: unknow type at: ' + at);
    }
    function parseNumber() {
        token = tokens[at];
        let value = token.value;
        token = tokens[++at];
        return parseFloat(value);
    }

    function parseString() {
        token = tokens[at];
        let value = token.value;
        token = tokens[++at];
        return value;
    }

    function parseObject() {
        var _o = {};
        token = tokens[++at];
        while (token && token.name !== 'object_end') {
            var key, value;
            token = tokens[at];
            if (token.name === 'word') {
                key = token.value;
                token = tokens[++at];
            } else if (token.name === 'string') {
                key = parseString();
            } else {
                throw new Error('parse object key error at: ' + at);
            }

            if (!token || token.name !== ':') {
                throw new Error('parse object error : at: ' + at);
            }


            token = tokens[++at];

            if (!token) {
                throw new Error('parse object error value at: ' + at);
            }

            value = parse(tokens.slice(at));
            _o[key] = value;

            if (!token) {
                throw new Error('parse object error end at: ' + at);
            }

            if (token.name === ',') {
                token = tokens[++at];
            }
        }
        token = tokens[++at];
        return _o;
    }

    function parseArray() {
        var _a = [];
        token = tokens[++at];
        while (token && token.name !== 'array_end') {
            token = tokens[at];
            _a.push(parse(tokens.slice(at)));
            if (!token) {
                throw new Error('parse array error end at: ' + at);
            }
            if (token.name === ',') {
                token = tokens[++at];
                continue;
            }
            if (token.name !== 'array_end') {
                throw new Error('parse array error end at: ' + at);
            }
        }
        token = tokens[++at];
        return _a;
    }

    function parseWords() {
        if (token.name === 'word') {
            if (token.value === 'false') {
                token = tokens[++at];
                return false;
            }
            if (token.value === 'true') {
                token = tokens[++at];
                return true;
            }
            if (token.value === 'null') {
                token = tokens[++at];
                return null;
            }
        }
        throw new Error('parse words error at: ' + at);
    }
}
module.exports = function(str) {
    return parseToken(tokenize(str));
};
