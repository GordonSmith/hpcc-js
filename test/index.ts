import { Test } from "../src/html/test";

const test = new Test()
    .target("placeholder")
    .columns(["label", "weight"])
    .data([
        ["Test", 200],
        ["Test2", 100]
    ])
    .render()
    ;

let idx = 0;
setInterval(() => {
    test.title = "Hello instance:  " + ++idx;
    test
        .data([
            ["Test", 200 * Math.random()],
            ["Test2", 100 * Math.random()],
            ["Test3", 100 * Math.random()]
        ])
        .render();
}, 3000);
