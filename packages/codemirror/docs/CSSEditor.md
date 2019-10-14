# CSSEditor

<!--meta
{
    "id": 16234,
    "name": "CSSEditor",
    "kind": 128,
    "kindString": "Class",
    "flags": {
        "isExported": true
    },
    "sources": [
        {
            "fileName": "CSSEditor.ts",
            "line": 3,
            "character": 22
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

CSSEditor displays an editable snippet of CSS with syntax coloring and code folding.

```sample-code
import { CSSEditor } from "@hpcc-js/codemirror";

new CSSEditor()
    .css(`\
body {
    margin: 0;
    padding: 15px;
}    
#target {
    position: relative;
    width: 100%;
    height: calc(100vh - 32px);
    border: 1px solid #ed1c24;
}
    `)
    .target("target")
    .render()
    ;

```

## API

## Published Properties
```@hpcc-js/codemirror:CSSEditor
```
