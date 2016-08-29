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
                    return new WUResult(context.url(), context._wuid, result.Name);
                });
            }
            return retVal;
        });
    };

    //  Workunit Result  ---
    function WUResult(baseUrl, wuid, name) {
        Comms.Basic.call(this);
        this.url(baseUrl + "WUResult.json");
        this._wuid = wuid;
        this._name = name;
        this._xmlSchema = null;
    }
    WUResult.prototype = Object.create(Comms.Basic.prototype);

    WUResult.prototype.wuid = function (_) {
        if (!arguments.length) return this._wuid;
        this._wuid = _;
        return this;
    };

    WUResult.prototype.name = function (_) {
        if (!arguments.length) return this._name;
        this._name = _;
        return this;
    };

    WUResult.prototype.query = function (options, filter) {
        options = options || {};
        filter = filter || {};
        var request = {
            Wuid: this._wuid,
            ResultName: this._name,
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
                response.WUResultResponse.Result[context._name]) {
                context._xmlSchema = response.WUResultResponse.Result.XmlSchema;
                return nestedRowFix(response.WUResultResponse.Result[context._name]);
            }
            return [];
        });
    };

    WUResult.prototype.flattenResult = function (result) {
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
    };

    return {
        Workunit: Workunit,
        WUResult: WUResult
    };
}));
