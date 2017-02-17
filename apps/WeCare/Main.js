"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "src/common/Utility", "src/other/Comms", "src/form/Form", "src/common/WidgetArray", "src/form/Input", "src/form/Slider", "src/chart/Column", "src/chart/Line", "src/chart/Scatter", "src/other/Table", "src/map/GMapGraph", "src/common/Shape", "src/graph/Edge"], factory);
    }
}(this, function (d3, Utility, Comms, Form, WidgetArray, Input, Slider, Column, Line, Scatter, Table, GMapGraph, Shape, Edge) {
    Form = Form.Form;
    WidgetArray = WidgetArray.WidgetArray;
    Input = Input.Input;
    Slider = Slider.Slider;
    Column = Column.Column;
    Line = Line.Line;
    Scatter = Scatter.Scatter;
    Table = Table.Table;
    GMapGraph = GMapGraph.GMapGraph;
    Shape = Shape.Shape;
    Edge = Edge.Edge;
    var params = Utility.urlParams();
    var demomode = params.demomode !== undefined ? params.demomode : true;

    function Main() {
        var baseUrl = "http://10.239.190.101:8002/WsEcl/forms/default/query/myroxie_dataland";
        this.connWeCare = new HPCCPlatformComms.JSONConnection("http://10.173.235.23:8002/WsEcl/submit/query/roxie_130/wecares.serialoffenderfinderservice/json");
        //this.connPersonAddresses = Comms.createESPConnection(baseUrl + "/personaddresses");
        //this.connPersonToLocations = Comms.createESPConnection(baseUrl + "/personstolocations")
        this.geoDecode = new HPCCPlatformComms.JSONConnection("http://maps.googleapis.com/maps/api/geocode/json");
        this.dateFormatter = d3.time.format("%Y%m");
        this.dateFormatter2 = d3.time.format("%Y%m%d");
        this.dateFormatter3 = d3.time.format("%Y-%m-%d");

        this.addressMarkers = [];
    }

    Main.prototype.clear = function () {
        d3.select("#mapPage q strong").text("Address History");
        d3.select("#addressPage q strong").text("Address History");
        this.peopleTable.data([]).render();
        this.addressChart.regions([]).data([]).render();
        this.addressTable.data([]).render();
        this.syncSelection(null, []);
        this.addressMap.data([]).zoomToFit();
        this.loadDebugTable([]);
        return this;
    };

    Main.prototype.cleanAddress = function (address, callback) {
        this.geoDecode.get({
            address: address
        }).then(function (response) {
            if (response.results.length) {
                callback({
                    address: response.results[0].formatted_address,
                    zip: response.results[0].address_components.filter(function (item, idx) {
                        if (item.types.indexOf("postal_code") >= 0) {
                            return true;
                        }
                        return false;
                    }).map(function (item, idx) {
                        return item.short_name;
                    })[0],
                    lat: response.results[0].geometry.location.lat,
                    lng: response.results[0].geometry.location.lng
                });
            }
            callback({});
        });
    };

    Main.prototype.formatAddr = function (input, radius) {
        var context = this;
        if (input.__hpcc_address && input.__hpcc_address.address === input.value() && input.__hpcc_radius === radius) {
            return;
        }
        input.__hpcc_radius = radius;
        if (input.__hpcc_marker) {
            input.__hpcc_marker.setMap(null);
            input.__hpcc_marker = null;
        }
        if (input.__hpcc_circle) {
            input.__hpcc_circle.setMap(null);
            input.__hpcc_circle = null;
        }
        this.cleanAddress(input.value(), function (response) {
            if (response.address) {
                input.value(response.address).render();
                input.__hpcc_address = response;
                input.__hpcc_marker = context.addressMap.createMarker(response.lat, response.lng, { fillColor: context.addressChart._palette(input.name()), title: input.__hpcc_address.address });
                input.__hpcc_circle = context.addressMap.createCircle(response.lat, response.lng, { fillColor: context.addressChart._palette(input.name()), radius: radius });
            }
            context.refreshLocations();
        });
    };

    Main.prototype.formatDate = function (input) {
        this.refreshLocations();
    };

    Main.prototype.refreshLocations = Utility.debounce(function () {
        var request = this.form.values();
        var regions = [];
        var context = this;
        function formatZipDate(id, _zipDate, _range) {
            var range = +_range;
            if (_zipDate && range) {
                var zipX1 = context.dateFormatter3.parse(_zipDate);
                var zipX2 = context.dateFormatter3.parse(_zipDate);
                zipX1.setMonth(zipX1.getMonth() - range);
                zipX2.setMonth(zipX2.getMonth() + range);
                return {
                    colorID: id,
                    x0: context.dateFormatter2(zipX1),
                    x1: context.dateFormatter2(zipX2)
                };
            }
            return null;
        }
        if (request.zip1Date) {
            regions.push(formatZipDate("zip1", request.zip1Date, request.zip1DateRange));
        }
        if (request.zip2Date) {
            regions.push(formatZipDate("zip2", request.zip2Date, request.zip2DateRange));
        }
        if (request.zip3Date) {
            regions.push(formatZipDate("zip3", request.zip3Date, request.zip3DateRange));
        }
        this.addressChart
            .regions(regions)
            .render()
            ;
        if (request.zip1 && request.zip1DistRange) {
            this.formatAddr(this.formZip1, request.zip1DistRange);
        }
        if (request.zip2 && request.zip2DistRange) {
            this.formatAddr(this.formZip2, request.zip2DistRange);
        }
        if (request.zip3 && request.zip3DistRange) {
            this.formatAddr(this.formZip3, request.zip3DistRange);
        }
    }, 250);

    Main.prototype.initSearch = function (id) {
        var context = this;
        this.formZip1 = new Input()
            .name("zip1")
            .label("Location 1")
            .type("textarea")
            .value(20007)
            .on("change", function (w) {
                context.refreshLocations();
            })
            ;
        this.formZip2 = new Input()
            .name("zip2")
            .label("Location 2")
            .type("textarea")
            .value(99501)
            .on("change", function (w) {
                context.refreshLocations();
            })
            ;
        this.formZip3 = new Input()
            .name("zip3")
            .label("Location 3")
            .type("textarea")
            .value("")
            .on("change", function (w) {
                context.refreshLocations();
            })
            ;
        this.form = new Form()
            .target(id)
            .inputs([
                new WidgetArray()
                    .content([
                        this.formZip1,
                        new Input()
                            .name("zip1Date")
                            .label("Date")
                            .type("date")
                            .value("2005-10-05")
                            .on("change", function (w) {
                                context.formatDate(w);
                            }),
                        new Input()
                            .name("zip1DateRange")
                            .label("+/- Months")
                            .type("number")
                            .value(4)
                            .on("change", function (w) {
                                context.refreshLocations(w);
                            }),
                        new Input()
                            .name("zip1DistRange")
                            .label("Radius")
                            .type("number")
                            .value(5)
                            .on("change", function (w) {
                                context.refreshLocations(w);
                            })
                    ]), new WidgetArray()
                        .content([
                            this.formZip2,
                            new Input()
                                .name("zip2Date")
                                .label("Date")
                                .type("date")
                                .value("2008-08-24")
                                .on("change", function (w) {
                                    context.formatDate(w);
                                }),
                            new Input()
                                .name("zip2DateRange")
                                .label("+/- Months")
                                .type("number")
                                .value(4)
                                .on("change", function (w) {
                                    context.refreshLocations(w);
                                }),
                            new Input()
                                .name("zip2DistRange")
                                .label("Radius")
                                .type("number")
                                .value(5)
                                .on("change", function (w) {
                                    context.refreshLocations(w);
                                })
                        ]), new WidgetArray()
                            .content([
                                this.formZip3,
                                new Input()
                                    .name("zip3Date")
                                    .label("Date")
                                    .type("date")
                                    .value("")
                                    .on("change", function (w) {
                                        context.formatDate(w);
                                    }),
                                new Input()
                                    .name("zip3DateRange")
                                    .label("+/- Months")
                                    .type("number")
                                    .value(4)
                                    .on("change", function (w) {
                                        context.refreshLocations(w);
                                    }),
                                new Input()
                                    .name("zip3DistRange")
                                    .label("Radius")
                                    .type("number")
                                    .value(5)
                                    .on("change", function (w) {
                                        context.refreshLocations(w);
                                    })
                            ]),
                new Slider()
                    .name("radius")
                    .label("Location Radius")
                    .low(1)
                    .high(20)
                    .step(1)
                    .value(3),
                new Slider()
                    .name("age")
                    .label("Age (18-100)")
                    .low(18)
                    .high(100)
                    .step(1)
                    .allowRange(true)
                    .value([35, 50])
            ])
            .showSubmit(true)
            .omitBlank(true)
            .on("clear", function (request) {
                context.clear();
            }).on("click", function (request) {
                context.clear();
                context.refreshLocations();
                var data = JSON.stringify(context.form.data());
                localStorage.setItem("formData", data);

                var newRequest = {};
                var locations = [];
                function parseDate(address, date, _range, prefix) {
                    var range = +_range;
                    if (address && address.zip && date && range) {
                        newRequest[prefix] = address.zip;
                        var zipDate = new Date(date);
                        var from = new Date(zipDate.setMonth(zipDate.getMonth() - range));
                        var to = new Date(zipDate.setMonth(zipDate.getMonth() + range));
                        newRequest[prefix + "lowyyyymm"] = context.dateFormatter(from);
                        newRequest[prefix + "highyyyymm"] = context.dateFormatter(to);
                        locations.push("" + address.lat + " " + address.lng + "," + context.dateFormatter2(zipDate));
                    }
                }
                parseDate(context.formZip1.__hpcc_address, request.zip1Date, request.zip1DateRange, "zip1");
                parseDate(context.formZip2.__hpcc_address, request.zip2Date, request.zip2DateRange, "zip2");
                parseDate(context.formZip3.__hpcc_address, request.zip3Date, request.zip3DateRange, "zip3");
                newRequest.radius = request.radius;
                var ages = request.age.split(",");
                newRequest.agelow = ages[0];
                newRequest.agehigh = ages[1];
                newRequest.demomode = demomode;

                context.connWeCare.jsonp(newRequest).then(function (response) {
                    var results = response["wecares.serialoffenderfinderserviceResponse"].Results.TroySearch.Row;
                    context.loadDebugTable(results)
                    context.individuals = [];
                    context.individualIdx = {};
                    var dedupAddresses = {};
                    context.individualAddresses = {};
                    results.forEach(function (row) {
                        if (!context.individualIdx[row.did]) {
                            context.individualIdx[row.did] = context.individuals.length;
                            context.individualAddresses[row.did] = [];
                            context.individuals.push(row);
                        }
                        var addr_id = row.rawaid + "_" + row.first_seen + "_" + row.last_seen;
                        if (!dedupAddresses[addr_id]) {
                            dedupAddresses[addr_id] = true;
                            context.individualAddresses[row.did].push(row);
                        }
                    });
                    context.loadPersonTable(context.individuals)
                });
            })
            .render(function (w) {
                var data = null;//localStorage.getItem("formData");
                if (data) {
                    w.data(JSON.parse(data));
                }
                context.refreshLocations();
            })
            ;
    };

    Main.prototype.initPeople = function (id) {
        var context = this;
        this.peopleTable = new Table()
            .target(id)
            .columns(["Name", "Score", "# Crims", "Details", "Lex ID"])
            .on("click", function (row, col, sel) {
                try {
                    context.syncSelection(context.peopleTable, [row]);
                } catch (e) {
                }
            })
            .render()
            ;
    };

    Main.prototype.loadPersonTable = function (_people) {
        var context = this;
        this.peopleTable
            .data(_people.map(function (row) {
                return [row.name, row.score, row.crim_records, context.individualAddresses[row.did].length, row.did, row];
            }))
            .render()
        ;
    }

    Main.prototype.initAddressMap = function (id) {
        this.addressMap = new GMapGraph()
            .target(id)
            .render()
            ;
    }

    Main.prototype.loadAddressMap = function (_addresses) {
        this.addressMap
            .data(_addresses.map(function (row) {
                var d = row;
                return [row.geo_lat, row.geo_long];
            }))
            .zoomToFit();
        ;
    };

    Main.prototype.initAddressTable = function (id) {
        var context = this;
        this.addressTable = new Table()
            .target(id)
            .columns(["Address", "Dist. 1", "Dist. 2", "Dist. 3", "Seen"])
            .multiSelect(false)
            .on("click", function (row) {
                context.syncSelection(context.addressTable, [row.__lparam]);
            })
            .render()
            ;
    }

    Main.prototype.formatAddressTableData = function (_addresses) {
        return _addresses.map(function (row, idx) {
            return [row.address, row.locationgeodistance_1, row.locationgeodistance_2, row.locationgeodistance_3, row.first_seen + "->" + row.last_seen, row];
        });
    };

    Main.prototype.loadAddressTable = function (_addresses) {
        this.addressTable
            .data(this.formatAddressTableData(_addresses))
            .render()
            ;
    };

    Main.prototype.initAddressChart = function (id) {
        var context = this;
        this.addressChart = new Scatter()
            .target(id)
            .paletteID("Set1")
            .interpolate("cardinal")
            .xAxisType("time")
            .xAxisTypeTimePattern("%Y%m%d")
            .xAxisDomainLow("19700101")
            .xAxisDomainHigh("20180101")
            .yAxisTitle("Miles")
            .yAxisTickCount(4)
            .yAxisType("pow")
            .yAxisTypePowExponent(1 / 3)
            .columns(["Date", "zip1", "zip2", "zip3"])
            .selectionMode(true)
            .on("selection", function (selection) {
                context.syncSelection(context.addressChart, selection);
            })
            .render()
            ;
    };

    Main.prototype.loadAddressChart = function (details) {
        this.addressChart
            .data(details.map(function (row) {
                return ["" + row.first_seen + "15", row.locationgeodistance_1, row.locationgeodistance_2, row.locationgeodistance_3, row];
            }))
            .resetSelection()
            .render()
            ;
    };

    Main.prototype.syncSelection = function (sourceWidget, selection) {
        var context = this;
        this.addressMarkers = this.addressMarkers.filter(function (marker) {
            marker.setMap(null);
            marker = null;
            return false;
        });
        switch (sourceWidget) {
            case this.peopleTable:
                if (selection.length) {
                    var row = selection[0];
                    if (row) {
                        d3.select("#mapPage q strong").text(row.Name);
                        d3.select("#addressPage q strong").text(row.Name);
                        var addresses = this.individualAddresses[row.__lparam.did].map(function (addrRow) {
                            context.addressMarkers.push(context.addressMap.createMarker(addrRow.geo_lat, addrRow.geo_long, { fillColor: "green", title: addrRow.address }, true));
                            return addrRow;
                        });
                        this.loadAddressTable(addresses);
                        this.loadAddressMap(addresses);
                        this.loadAddressChart(addresses);
                    }
                } else {
                    d3.select("#mapPage q strong").text("Address History");
                    d3.select("#addressPage q strong").text("Address History");
                    this.loadAddressTable([]);
                    this.loadAddressMap([]);
                    this.loadAddressChart([]);
                }
                break;

            case this.addressTable:
                var selectionData = selection.map(function (row) {
                    context.addressMarkers.push(context.addressMap.createMarker(row.geo_lat, row.geo_long, { fillColor: "green", title: row.address }));
                    return [row.geo_lat, row.geo_long];
                }, this);
                this.addressMap.zoomTo(selectionData);
                break;

            case this.addressChart:
                var selectionData = selection.map(function (row) {
                    var addrRow = row[row.length - 1];
                    if (addrRow.__details) {
                        context.addressMarkers.push(context.addressMap.createMarker(addrRow.geo_lat, addrRow.geo_long, { fillColor: "green", title: addrRow.__details.address }, true));
                    }
                    return addrRow;
                });
                this.loadAddressMap(selectionData);
                this.loadAddressTable(selectionData);
        }
    };

    Main.prototype.initDebugTable = function (id) {
        this.debugTable = new Table()
            .target(id)
            .columns([])
            .data([])
            .pagination(true)
            .on("click", function (row) {
            })
            //.render()
            ;
    }

    Main.prototype.loadDebugTable = function (details) {
        if (details.length === 0) {
            details = [{ "": "" }];
        }
        var columns = [];
        var data = details.map(function (row, idx) {
            var retVal = [];
            for (var key in row) {
                if (idx === 0) {
                    columns.push(key);
                }
                retVal.push(row[key]);
            }
            return retVal;
        });
        this.debugTable
            .columns(columns)
            .data(data)
            .render()
            ;
    };

    return Main;
}));