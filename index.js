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

        if (/\d/.test(ch)) {
            let value = '';
            while (ch && /[\d\.]/.test(ch)) {
                if (value.indexOf('.') > -1 && ch === '.')
                    throw new Error('tokenize number error');
                value += ch;
                ch = str[++at];
            }
            tokens.push({
                name: 'number',
                value
            });
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

        throw new Error('tokenize error at: ' + at);
    }
    return tokens;
}

function parseToken(tokens) {
    if (tokens.length === 0) return null;
    let at = 0,
        token = tokens[at];
    return parse();
    function parse() {
        token = tokens[at];
        if (token.name === 'number') {
            return parseNumber();
        } else if (token.name === 'quote_single' || token.name === 'quote_double') {
            return parseString();
        } else if (token.name === 'object_begin') {
            return parseObject();
        } else if (token.name === 'array_begin') {
            return parseArray();
        } else if (token.name === 'string') {
            return parseWords();
        }
        throw new Error('parse error: unknow type');
    }
    function parseNumber() {
        var value = token.value;
        token = tokens[++at];
        return parseInt(value);
    }

    function parseString() {
        let start_sign = token.name,
            value = '';
        token = tokens[++at];
        while (token) {
            if (token.name === start_sign && tokens[at - 1].name !== 'escape') {
                token = tokens[++at];
                return value;
            }
            value += token.value;
            token = tokens[++at];
        }
        throw new Error('parse string error');
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
            } else {
                key = parseString();
            }
            if (token.name !== ':') {
                throw new Error('parse object error :');
            }
            value = parse(tokens.slice(++at));
            _o[key] = value;
            if (token.name !== ',' && token.name !== 'object_end') {
                throw new Error('parse object error end');
            }
            token = tokens[++at];
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
            if (token.name !== ',' && token.name !== 'array_end') {
                throw new Error('parse array error end');
            }
            token = tokens[++at];
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
        throw new Error('parse words error');
    }
}
module.exports = function(str) {
    parseToken(tokenize(str));
};
