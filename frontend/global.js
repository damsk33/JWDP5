exports.generateID = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for(let i = 0; i < length; ++i) {
        res += chars[Math.floor(Math.random() * (chars.length -1))]
    }
    return res;
}