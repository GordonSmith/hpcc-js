"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Comms", "../common/Utility"], factory);
    } else {
        root.other_Comms = factory(root.other_Comms, root.common_Utility);
    }
}(this, function (Comms, Utility) {
    function nestedRowFix(row) {
        if (row.Row && row.Row instanceof Array) {
            return row.Row.map(nestedRowFix);
        } else if (row instanceof Object) {
            for (var key in row) {
                row[key] = nestedRowFix(row[key]);
            }
        }
        return row;
    }

    //  Workunit  ---
    function Workunit(baseUrl, wuid) {
        Comms.Basic.call(this);

        this.url(baseUrl + "WsWorkunits/");
        this._wuid = wuid;
    }
    Workunit.prototype = Object.create(Comms.Basic.prototype);

    Workunit.prototype.wuInfo = function (options) {
        var url = this.getUrl({
            pathname: "WsWorkunits/WUInfo.json",
        });
        var request = {
            Wuid: this._wuid,
            TruncateEclTo64k: true,
            IncludeExceptions: false,
            IncludeGraphs: false,
            IncludeSourceFiles: false,
            IncludeResults: false,
            IncludeResultsViewNames: false,
            IncludeVariables: false,
            IncludeTimers: false,
            IncludeResourceURLs: false,
            IncludeDebugValues: false,
            IncludeApplicationValues: false,
            IncludeWorkflows: false,
            IncludeXmlSchemas: false,
            SuppressResultSchemas: true
        };
        for (var key in options) {
            request[key] = options[key];
        }
        return this.jsonp(url, request);
    };

    Workunit.prototype.wuUpdate = function (options) {
        var url = this.getUrl({
            pathname: "WsWorkunits/WUUpdate.json"
        });
        var request = {
            Wuid: this._wuid
        };
        for (var key in options) {
            request[key] = options[key];
        }
        return this.post(url, request);
    };

    Workunit.prototype.appData = function (appID, key, _) {
        if (arguments.length === 2) {
            return this.wuInfo({
                IncludeApplicationValues: true
            }).then(function (response) {
                var persistString;
                if (response.WUInfoResponse && response.WUInfoResponse.Workunit && response.WUInfoResponse.Workunit.ApplicationValues && response.WUInfoResponse.Workunit.ApplicationValues.ApplicationValue) {
                    response.WUInfoResponse.Workunit.ApplicationValues.ApplicationValue.filter(function (row) {
                        return row.Application === "HPCC-VizBundle" && row.Name === "persist";
                    }).forEach(function (row) {
                        persistString = row.Value;
                    });
                }
                return persistString;
            });
        } else if (arguments.length === 3) {
            return this.wuUpdate({
                "ApplicationValues.ApplicationValue.0.Application": "HPCC-VizBundle",
                "ApplicationValues.ApplicationValue.0.Name": "persist",
                "ApplicationValues.ApplicationValue.0.Value": _,
                "ApplicationValues.ApplicationValue.itemcount": 1
            });
        }
    };

    Workunit.prototype.results = function () {
        var context = this;
        return this.wuInfo({
            IncludeResults: true
        }).then(function (response) {
            var retVal = [];
            if (Utility.exists("WUInfoResponse.Workunit.Results.ECLResult", response)) {
                retVal = response.WUInfoResponse.Workunit.Results.ECLResult.map(function (result) {
                    return new WUResult(context.getUrl({ pathname: "WsWorkunits/" }), context._wuid, result);
                });
            }
            return retVal;
        });
    };

    Workunit.prototype.result = function (dataSource, resultName) {
        //dataSource = dataSource || this.getUrl({ pathname: "WsWorkunits/WUInfo?Wuid=" + this._wuid });
        if (dataSource.indexOf("http") === 0) {
            return new RoxieQuery(dataSource, resultName);
        }
        if (dataSource.indexOf("~") === 0 || dataSource.indexOf("::") >= 0) {
            return new LogicalFile(this.getUrl({ pathname: "WsWorkunits/" }), this._wuid, { LogicalName: dataSource });
        }
        return new WUResult(this.getUrl({ pathname: "WsWorkunits/" }), this._wuid, { Name: resultName });
    };

    //  Workunit Result  ---
    function WUResult(baseUrl, wuid, espResultInfo) {
        Comms.Basic.call(this);
        this.url(baseUrl + "WUResult.json");
        this._wuid = wuid;
        this._espResultInfo = espResultInfo;
        this._xmlSchema = null;
    }
    WUResult.prototype = Object.create(Comms.Basic.prototype);

    WUResult.prototype.wuid = function (_) {
        if (!arguments.length) return this._wuid;
        this._wuid = _;
        return this;
    };

    WUResult.prototype.name = function (_) {
        if (!arguments.length) return this._espResultInfo.Name;
        this._espResultInfo.Name = _;
        return this;
    };

    WUResult.prototype.query = function (options, filter) {
        options = options || {};
        filter = filter || {};
        var request = {
            Wuid: this._wuid,
            ResultName: this._espResultInfo.Name,
            SuppressXmlSchema: this._xmlSchema !== null,
            Start: 0,
            Count: -1
        };
        for (var key in options) {
            request[key] = options[key];
        }
        var filterIdx = 0;
        for (var key in filter) {
            request["FilterBy.NamedValue." + filterIdx + ".Name"] = key;
            request["FilterBy.NamedValue." + filterIdx + ".Value"] = filter[key];
            ++filterIdx;
        }
        if (filterIdx) {
            request["FilterBy.NamedValue.itemcount"] = filterIdx;
        }
        var context = this;
        return this.jsonp(this.url(), request).then(function (response) {
            if (response.WUResultResponse &&
                response.WUResultResponse.Result &&
                response.WUResultResponse.Result[context._espResultInfo.Name]) {
                context._xmlSchema = response.WUResultResponse.Result.XmlSchema;
                return nestedRowFix(response.WUResultResponse.Result[context._espResultInfo.Name]);
            }
            return [];
        });
    };

    //  Logical File  ---
    function LogicalFile(baseUrl, wuid, espResultInfo) {
        Comms.Basic.call(this);
        this.url(baseUrl + "WUResult.json");
        this._wuid = wuid;
        this._espResultInfo = espResultInfo;
        this._xmlSchema = null;
    }
    LogicalFile.prototype = Object.create(Comms.Basic.prototype);

    LogicalFile.prototype.query = function (options, filter) {
        options = options || {};
        filter = filter || {};
        var request = {
            LogicalName: this._espResultInfo.LogicalName,
            SuppressXmlSchema: this._xmlSchema !== null,
            Start: 0,
            Count: -1
        };
        for (var key in options) {
            request[key] = options[key];
        }
        var filterIdx = 0;
        for (var key in filter) {
            request["FilterBy.NamedValue." + filterIdx + ".Name"] = key;
            request["FilterBy.NamedValue." + filterIdx + ".Value"] = filter[key];
            ++filterIdx;
        }
        if (filterIdx) {
            request["FilterBy.NamedValue.itemcount"] = filterIdx;
        }
        var context = this;
        return this.jsonp(this.url(), request).then(function (response) {
            if (response.WUResultResponse &&
                response.WUResultResponse.Result &&
                response.WUResultResponse.Result.Row) {
                context._xmlSchema = response.WUResultResponse.Result.XmlSchema;
                return nestedRowFix(response.WUResultResponse.Result.Row);
            }
            return [];
        });
    };

    //  Logical File  ---
    function RoxieQuery(baseUrl, resultName) {
        Comms.Basic.call(this);
        var urlParts = baseUrl.split("/");
        var queryName = urlParts.pop();
        if (queryName.toLowerCase() === "json") {
            queryName = urlParts.pop();
        }
        this._queryName = queryName;
        this._resultName = resultName;
        this.url(urlParts.join("/") + "/" + queryName + "/json");
    }
    RoxieQuery.prototype = Object.create(Comms.Basic.prototype);

    RoxieQuery.prototype.query = function (options, filter) {
        options = options || {};
        filter = filter || {};
        var request = {
        };
        for (var key in options) {
            request[key] = options[key];
        }
        for (var key in filter) {
            request[key] = filter[key];
        }
        var context = this;
        return this.jsonp(this.url(), request).then(function (response) {
            if (response[context._queryName + "Response"]) {
                var response = response[context._queryName + "Response"];
                if (context._resultName) {
                    if (response && response[context._resultName] && response[context._resultName].Row) {
                        return nestedRowFix(response[context._resultName].Row);
                    }
                } else {
                    for (var key in response) {
                        if (response[key].Row) {
                            return nestedRowFix(response[key].Row);
                            break;
                        }
                    }
                }
            }
            return [];
        });
    };

    return {
        Workunit: Workunit,
        WUResult: WUResult,
        createESPConnection: function (url) {
            url = url || document.URL;
            var testURL = new Comms.ESPUrl()
                .url(url)
            ;
            if (testURL.isWsWorkunits()) {
                var espConnection = Comms.createESPConnection(url);
                if (espConnection instanceof Comms.WsWorkunits && espConnection.wuid()) {
                    return new Workunit(espConnection.getUrl({ pathname: "" }), espConnection.wuid())
                        .url(url)
                    ;
                }
            }
            return null;
        },
        flattenResult: function (result) {
            var retVal = {
                columns: [],
                data: []
            };
            if (result && result.length) {
                var colIdx = {};
                result.forEach(function (row, rowIdx) {
                    var rowArr = [];
                    for (var key in row) {
                        if (rowIdx === 0) {
                            colIdx[key] = retVal.columns.length;
                            retVal.columns.push(key);
                        }
                        rowArr[colIdx[key]] = row[key];
                    }
                    retVal.data.push(rowArr);
                });
            }
            return retVal;
        }
    };
}));
