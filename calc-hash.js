function _hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
}

const target = "JS Corp";
console.log(`Hash for "${target}":`, _hashString(target));
