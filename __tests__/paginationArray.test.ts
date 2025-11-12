import { paginate } from "../src/app/paginator/_methods/paginationArray";

describe('paginate', () => {
    it('should paginate correctly for different test cases', () => {
        const testCases = [
            {
                current: 1,
                max: 1,
                expected: { current: 1, prev: null, next: null, items: [1] },
            },
            {
                current: 1,
                max: 2,
                expected: { current: 1, prev: null, next: 2, items: [1, 2] },
            },
            {
                current: 2,
                max: 2,
                expected: { current: 2, prev: 1, next: null, items: [1, 2] },
            },
            {
                current: 3,
                max: 5,
                expected: {
                    current: 3,
                    prev: 2,
                    next: 4,
                    items: [1, 2, 3, 4, 5],
                },
            },
            {
                current: 5,
                max: 10,
                expected: { current: 5, prev: 4, next: 6, items: [1, '…', 4, 5, 6, '…', 10] },
            },
        ];

        testCases.forEach(({ current, max, expected }) => {
            if (max === undefined || current === undefined) {
                throw new Error('max and current must be defined');
            };
            expect(max).toBeDefined();
            const result = paginate({ current, max });
            // log the result for debugging
            console.log(`paginate({ current: ${current}, max: ${max} }) =`, result);
            // log the expected for debugging
            console.log(`Expected:`, expected);
            expect(result).toEqual(expected);
        });
    });
});