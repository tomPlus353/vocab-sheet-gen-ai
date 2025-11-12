export function paginate({ current, max }: { current: number; max: number }) {
    // Guard: require both current and max to be truthy numbers
    if (!current || !max) return null;

    // Prev/next page numbers (null when at the ends)
    const prev = current === 1 ? null : current - 1;
    const next = current === max ? null : current + 1;

    // items: will hold page numbers and ellipses; start with page 1 always shown
    const items: Array<number | string> = [1];

    // If there's only one page, return early (already have items = [1])
    if (current === 1 && max === 1) return { current, prev, next, items };

    // If current is sufficiently far from the start, show a leading ellipsis
    // We use ">= 4" so that pages like [1, 2, 3, 4] don't get collapsed to "1 …"
    if (current >= 4) items.push("…");

    // Range radius: how many pages to show on each side of `current`.
    // r = 1 => show current and one neighbor on each side => up to 3 numbers in the middle.
    const r = 1;

    // r1: start of the middle range, never below 2 so we don't duplicate the first page
    const r1 = Math.max(2, current - r);

    // r2: end of the middle range, never above max-1 so we don't duplicate the last page
    const r2 = Math.min(max - 1, current + r);

    // Push the computed middle range (may be empty if r1 > r2)
    for (let i = r1; i <= r2; i++) items.push(i);

    // If there's a gap between the middle range and the last page, show a trailing ellipsis.
    // Specifically show "…" only when r2 + 1 < max (i.e., there's at least one hidden page).
    if (r2 + 1 < max) items.push("…");

    // Always include the last page if it's not already in the middle range
    if (r2 < max) items.push(max);

    return { current, prev, next, items };
}