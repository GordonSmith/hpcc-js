# @hpcc-js/h3-js-umd
This package is part of the mono repository "@hpcc-js" (aka Visualization Framework), for more information including quick start, demos and tutorials, please visit the main page on GitHub:  [hpcc-systems/Visualization](https://github.com/hpcc-systems/Visualization).

## Details
The **h3-js-umd** package "wraps" a subset of the [https://github.com/uber/h3-js](http://dgrid.io/) and [geojson2h3](https://github.com/uber/geojson2h3)functionality in a WebPack bundle to simplify its inclusion in modern JavaScript libraries / Web Applications.

## Consuming with WebPack
Should "just work"

## Consuming with iife
Simply include the package in your html file as normal (it has a global ID of "@hpcc-js/h3-js-umd"):
```html
<head>
    ...
    <script src="node_modules/@hpcc-js/h3-js-umd/dist/index.min.js"></script>
    <script>
        var dgridShim = window["@hpcc-js/h3-js-umd"];
    </script>
</head>
<body>
    ...
    <script>
        ...
    </script>
    ...
</body>
```

## Consuming with Rollup.js
Since Rollup.js has no native support for non es6 modules (the `rollup-plugin-commonjs` simply converts commonjs exports to es6 for example) and part of the es6 specifications dictates that modules should "use strict", which will cause issues with libraries that rely on non strict features.  
As h3-js has dependancies which uses non "strict" code, it is ultimately impossible to use Rollup.js to create bundles which include h3-js-umd (without forcing Rollup.JS to not include "use strict").  Here are two suggested **workarounds**:

### Exclude h3-js-umd from your bundle
1.  Mark h3-js-umd as external in your rollup.config.js file:
```javascript
    external: [
        "@hpcc-js/h3-js-umd"
    ],
```
2. Add the official exported global ID to your rollup.config.js:
```javascript
    output: {
        ...
        globals: {
            "@hpcc-js/h3-js-umd": "@hpcc-js/h3-js-umd"
        }
    },
```
3. Manually include h3-js-umd as an iife source file in your html page:
```html
<head>
    ...
    <script src="node_modules/@hpcc-js/h3-js-umd/dist/index.js"></script>
</head>
```

### Include h3-js-umd in your bundle
1. Disable "use strict" injection into your bundle:
```javascript
    output: {
        ...
        strict: false
    }
```
2. Add named exports for the h3-js-umd "commonjs" module:
```javascript
    plugins: [
        ...,
        commonjs({
            namedExports: {
                "node_modules/@hpcc-js/h3-js-umd/dist/index.js": ["geoToH3"]
            }
        }),
        ...
    ]
```
