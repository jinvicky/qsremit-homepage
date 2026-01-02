function escapeSpecialCharacters(string) {
    if (!string) return ''; // null 또는 undefined 처리

    const map = {
        '&': '&amp;',   // 반드시 먼저 처리
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#47;',
        '\\': '&#92;',
        '`': '&#96;',
        '=': '&#61;'
    };

    return string.replace(/[&<>"'/\\`=]/g, function(match) {
        return map[match];
    });
}

function unescapeSpecialCharacters(string) {
    if (!string) return ''; // null 또는 undefined 처리

    // JSON 객체인 경우 문자열로 변환 후 재귀적으로 처리
    if (typeof string === 'object') {
        return JSON.parse(JSON.stringify(string), (key, value) => {
            if (typeof value === 'string') {
                return unescapeSpecialCharacters(value);
            }
            return value;
        });
    }

    // 문자열이 아닌 경우 그대로 반환
    if (typeof string !== 'string') {
        return string;
    }

    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#37;': '%',
        '&#44;': ',',
        '&#47;': '/',
        '&#92;': '\\',
        '&#96;': '`',
        '&#61;': '=',
        '&#43;': '+'
    };

    // 정규식 생성 (대소문자 모두 매칭하도록 수정)
    const unescapeRegex = new RegExp(
        Object.keys(map).map(key => key.replace(/&/g, '&(?:#x?)?')).join('|'),
        'gi' // 'g'는 전체 매칭, 'i'는 대소문자 무시
    );

    return string.replace(unescapeRegex, function(match) {
        // 원본 map 키가 모두 소문자이므로 소문자로 변환 후 매핑
        return map[match.toLowerCase()] || match;
    });
}

