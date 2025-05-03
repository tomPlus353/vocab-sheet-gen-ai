// export function paginate({ current, max }: { current: number; max: number }) {
//     if (!current || !max) return null;

//     const prev = current === 1 ? null : current - 1;
//     const next = current === max ? null : current + 1;
//     // items which can contain numbers or strings at the same time
//     const items: Array<number | string> = [1];

//     if (current === 1 && max === 1) return { current, prev, next, items };
//     if (current > 4) items.push("…");

//     const r = 1; // Adjusted range to show only 3 numbers in the middle
//     const r1 = Math.max(2, current - r);
//     const r2 = Math.min(max - 1, current + r);

//     for (let i = r1; i <= r2; i++) items.push(i);

//     if (r2 + 1 < max) items.push("…");
//     if (r2 < max) items.push(max);

//     return { current, prev, next, items };
// }

export function paginate({ current, max }: { current: number; max: number }) {
    let items: Array<number | string> = [];

    if (max <= 5) {
        items = Array.from({ length: max }, (_, i) => i + 1);
        return { items };
    }

    let lastWasEllipsis = false;
    for (let i = 1; i < max; i++) {
        if (i <= 1 || i >= max || Math.abs(current - i) <= 1) {
            console.log("number i:", i);
            // Non-ellipsis numbers
            items.push(i);
            lastWasEllipsis = false;
        } else {
            //ellipsis
            if (!lastWasEllipsis) {
                console.log("ellipsis and print i:", i);
                items.push("…");
            }
            console.log("ellipsis i:", i);
            lastWasEllipsis = true;
        }
    }
    return { items };
}
