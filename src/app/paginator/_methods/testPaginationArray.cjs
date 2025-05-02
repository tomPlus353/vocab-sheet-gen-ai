"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paginationArray_1 = require("./paginationArray");
// Test cases for the paginate function
var testCases = [
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
var expectedResultTypeErrorMessage = "current and max should be numbers";
var expectedResultTypeError = {
    current: null,
    prev: null,
    next: null,
    items: [],
};
// Function to run the test cases
function runTests() {
    testCases.forEach(function (_a, index) {
        var current = _a.current, max = _a.max, expected = _a.expected;
        var result = (0, paginationArray_1.paginate)({ current: current, max: max });
        if (JSON.stringify(result) === JSON.stringify(expected)) {
            console.log("Test case ".concat(index + 1, " passed."));
        }
        else {
            console.error("Test case ".concat(index + 1, " failed. Expected ").concat(JSON.stringify(expected), ", but got ").concat(JSON.stringify(result), "."));
        }
    });
    // Test for type error
    var result = (0, paginationArray_1.paginate)({
        current: "a",
        max: "b",
    });
    if (JSON.stringify(result) === JSON.stringify(expectedResultTypeError)) {
        console.log("Type error test case passed.");
    }
    else {
        console.error("Type error test case failed. Expected ".concat(JSON.stringify(expectedResultTypeError), ", but got ").concat(JSON.stringify(result), "."));
    }
}
runTests();
