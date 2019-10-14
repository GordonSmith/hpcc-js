(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./classMeta.js", "./publishedProperties.js", "./sample.js", "./sampleCarousel.js", "./source.js", "./sourceSample.js", "./sourceSampleTabbed.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var classMeta_js_1 = require("./classMeta.js");
    var publishedProperties_js_1 = require("./publishedProperties.js");
    var sample_js_1 = require("./sample.js");
    var sampleCarousel_js_1 = require("./sampleCarousel.js");
    var source_js_1 = require("./source.js");
    var sourceSample_js_1 = require("./sourceSample.js");
    var sourceSampleTabbed_js_1 = require("./sourceSampleTabbed.js");
    function markdownWidget(infostring, text) {
        var data = [[infostring, text]];
        switch (infostring) {
            case "sample":
                return new sample_js_1.Sample().data(data);
            case "sample-code-tabbed":
                return new sourceSampleTabbed_js_1.SourceSampleTabbed().data(data);
            case "sample-code-split":
            case "sample-code":
                return new sourceSample_js_1.SourceSample().data(data);
            case "sample-carousel":
                return new sampleCarousel_js_1.SampleCarousel().data(data);
            case "javascript":
                return new source_js_1.Source("text/javascript").data(data);
            case "html":
                return new source_js_1.Source("text/html").data(data);
            case "json":
                return new source_js_1.Source("text/json").data(data);
            case "shell":
                return new source_js_1.Source("text/x-sh").data(data);
        }
        if (infostring.indexOf("meta") === 0) {
            return new classMeta_js_1.ClassMeta().data(data);
        }
        else if (infostring.indexOf("@hpcc-js") === 0) {
            return new publishedProperties_js_1.PublishedProperties().data(data);
        }
        return undefined;
    }
    exports.markdownWidget = markdownWidget;
});
//# sourceMappingURL=index.js.map