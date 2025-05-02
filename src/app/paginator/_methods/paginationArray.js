"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(_a) {
    var current = _a.current, max = _a.max;
    if (!current || !max)
        return null;
    var prev = current === 1 ? null : current - 1;
    var next = current === max ? null : current + 1;
    //items which can contain numbers or strings at the same time
    var items = [1];
    if (current === 1 && max === 1)
        return { current: current, prev: prev, next: next, items: items };
    if (current > 4)
        items.push("…");
    var r = 2;
    var r1 = current - r;
    var r2 = current + r;
    for (var i = r1 > 2 ? r1 : 2; i <= Math.min(max, r2); i++)
        items.push(i);
    if (r2 + 1 < max)
        items.push("…");
    if (r2 < max)
        items.push(max);
    return { current: current, prev: prev, next: next, items: items };
}
