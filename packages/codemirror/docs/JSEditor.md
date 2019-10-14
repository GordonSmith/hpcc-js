# JSEditor

<!--meta
{
    "id": 17962,
    "name": "JSEditor",
    "kind": 128,
    "kindString": "Class",
    "flags": {
        "isExported": true
    },
    "sources": [
        {
            "fileName": "JSEditor.ts",
            "line": 3,
            "character": 21
        }
    ],
    "extendedTypes": [
        {
            "type": "reference",
            "name": "Editor",
            "id": 15805
        }
    ],
    "folder": "packages/codemirror"
}
-->

JSEditor displays an editable snippet of JavaScript with syntax coloring and code folding.

```sample-code
import { JSEditor } from "@hpcc-js/codemirror";

const code = `
function foo(a, b) {
    return a + b;
}
function bar(c, d) {
    return foo(c, d) + (c * d);
}
`;

let count = 0;
new JSEditor()
    .target("target")
    .javascript(code)
    .render()
    ;            

```

## API

## Published Properties
```@hpcc-js/codemirror:JSEditor
```
