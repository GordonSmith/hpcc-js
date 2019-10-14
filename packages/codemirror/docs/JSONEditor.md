# JSONEditor

<!--meta
{
    "id": 18393,
    "name": "JSONEditor",
    "kind": 128,
    "kindString": "Class",
    "flags": {
        "isExported": true
    },
    "sources": [
        {
            "fileName": "JSONEditor.ts",
            "line": 3,
            "character": 23
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

JSONEditor displays an editable snippet of JSON with syntax coloring and code folding.

```sample-code
import { JSONEditor } from "@hpcc-js/codemirror";

const code = {
    "fruit": "Apple",
    "size": "Large",
    "color": "Red",
    "tags": ["witch", "snake"]
};

new JSONEditor()
    .target("target")
    .json(code)
    .render()
    ;
```

## API

## Published Properties
```@hpcc-js/codemirror:JSONEditor
```
