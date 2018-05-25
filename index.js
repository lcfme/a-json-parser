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

        if (/\s/.test(ch)) {
            at++;
            continue;
        }
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

        if (/\d/.test(ch)) {
            let value = '';
            while (ch && /\d/.test(ch)) {
                value += ch;
                ch = str[++at];
            }
            tokens.push({
                name: 'number',
                value
            });
            continue;
        }

        if (ch === '.') {
            tokens.push({
                name: '.',
                value: ch
            });
            at++;
            continue;
        }

        if (/\w/.test(ch)) {
            let value = '';
            while (ch && /[\w\d]/.test(ch)) {
                value += ch;
                ch = str[++at];
            }
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

        if (ch === '\'') {
            tokens.push({
                name: 'quote_single',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === '"') {
            tokens.push({
                name: 'quote_double',
                value: ch
            });
            at++;
            continue;
        }

        if (ch === '\\') {
            tokens.push({
                name: 'escape',
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

        tokens.push({
            name: 'char',
            value: ch
        });
        at++;
        continue;
    }
    if (at !== len) {
        throw new Error('tokenize error');
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
        } else if (token && (token.name === 'quote_single' || token.name === 'quote_double')) {
            return parseString();
        } else if (token && token.name === 'object_begin') {
            return parseObject();
        } else if (token && token.name === 'array_begin') {
            return parseArray();
        } else if (token && token.name === 'string') {
            return parseWords();
        }
        throw new Error('parse error: unknow type at: ' + at);
    }
    function parseNumber() {
        let value = '';
        token = tokens[at];
        while (token && (token.name === 'number' || token.name === '.')) {
            if (value.indexOf('.') > -1 && token.name === '.') {
                throw new Error('parse number error at: ' + at);
            }
            value += token.value;
            token = tokens[++at];
        }
        return parseFloat(value);
    }

    function parseString() {
        let start_sign = token.name,
            value = '';
        token = tokens[++at];
        while (
            token &&
      !(token.name === start_sign && tokens[at - 1].name !== 'escape')
        ) {
            value += token.value;
            token = tokens[++at];
        }
        token = tokens[++at];
        return value;
    }

    function parseObject() {
        var _o = {};
        token = tokens[++at];
        while (token && token.name !== 'object_end') {
            var key, value;
            token = tokens[at];
            if (token.name === 'string') {
                key = token.value;
                token = tokens[++at];
            } else if (
                token.name === 'quote_single' ||
        token.name === 'quote_double'
            ) {
                key = parseString();
            } else {
                throw new Error('parse object key error at: ' + at);
            }
            if (token.name !== ':') {
                throw new Error('parse object error at:' + at);
            }
            value = parse(tokens.slice(++at));
            _o[key] = value;
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
        if (token.name === 'string') {
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
