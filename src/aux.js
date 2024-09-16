function fits(word, pattern) {
    if (word.length - pattern.length) return false;
    for (let i = 0; i < word.length; i++) {
        if (word[i] != pattern[i] && pattern[i] != "*") return false;
    }

    return true;
}

function count(str, substr) {
    return str.split(substr).length - 1;
}

function contains(word, pattern) {
    if (word.includes(pattern)) return true;

    let length = pattern.length;
    if (length > word.length) return fits(word, pattern);
    for (let i = 0; i < word.length - length + 1; i++) {
        if (fits(word.slice(i, i + length), pattern)) return true;
    }

    return false;
}

function only(word, chars, literal) {
    let blanks = count(chars, "?");
    let used = 0;
    for (let char of word) {
        if (!chars.includes(char) || count(chars, char) < count(word, char)) {
            if (!literal) {
                if (!chars.includes(char)) used++; 
                else used += count(word, char) - count(chars, char);
            } else return false;

            if (used > blanks) return false;
        }
    }

    return true;
}

