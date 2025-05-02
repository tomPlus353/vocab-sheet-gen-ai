import { paginate } from "./paginationArray";

// Test cases for the paginate function
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
            items: [1, "…", 2, 3, 4, "…", 5],
        },
    },
    {
        current: 4,
        max: 5,
        expected: { current: 4, prev: 3, next: null, items: [1, "…", 3, 4, 5] },
    },
    {
        current: 5,
        max: 5,
        expected: { current: 5, prev: null, next: null, items: [1] },
    },
];
const expectedResultTypeErrorMessage = "current and max should be numbers";

const expectedResultTypeError = {
    current: null,
    prev: null,
    next: null,
    items: [],
};

// Function to run the test cases
function runTests() {
    testCases.forEach(({ current, max, expected }, index) => {
        const result = paginate({ current, max });
        if (JSON.stringify(result) === JSON.stringify(expected)) {
            console.log(`Test case ${index + 1} passed.`);
        } else {
            console.error(
                `Test case ${index + 1} failed. Expected ${JSON.stringify(
                    expected,
                )}, but got ${JSON.stringify(result)}.`,
            );
        }
    });

    // Test for type error
    const result = paginate({
        current: "a" as unknown as number,
        max: "b" as unknown as number,
    });
    if (JSON.stringify(result) === JSON.stringify(expectedResultTypeError)) {
        console.log("Type error test case passed.");
    } else {
        console.error(
            `Type error test case failed. Expected ${JSON.stringify(
                expectedResultTypeError,
            )}, but got ${JSON.stringify(result)}.`,
        );
    }
}

runTests();
