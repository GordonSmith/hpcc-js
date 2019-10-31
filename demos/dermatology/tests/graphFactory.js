"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.test_graphFactory = factory();
    }
}(this, function () {
    return {
        Graph3: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/graph3"], function (DataFactory, graph3Mod) {
                    const vertices = [
                        new graph3Mod.Vertex().text("Daddy"),
                        new graph3Mod.Vertex().text("Mammy"),
                        new graph3Mod.Vertex().text("Baby")
                    ];

                    const edges = [
                        new graph3Mod.Edge().sourceVertex(vertices[0]).targetVertex(vertices[2]),
                        new graph3Mod.Edge().sourceVertex(vertices[1]).targetVertex(vertices[2])
                    ];

                    callback(new graph3Mod.Graph()
                        .data({ vertices, edges })
                    );
                });
            },
            LesMis: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/graph3"], function (DataFactory, graph3Mod) {
                    const graph = new graph3Mod.DataGraph()
                        .vertices([
                            { "id": 0, "label": "Myriel", "group": 1 },
                            { "id": 1, "label": "Napoleon", "group": 1 },
                            { "id": 2, "label": "Mlle.Baptistine", "group": 1 },
                            { "id": 3, "label": "Mme.Magloire", "group": 1 },
                            { "id": 4, "label": "CountessdeLo", "group": 1 },
                            { "id": 5, "label": "Geborand", "group": 1 },
                            { "id": 6, "label": "Champtercier", "group": 1 },
                            { "id": 7, "label": "Cravatte", "group": 1 },
                            { "id": 8, "label": "Count", "group": 1 },
                            { "id": 9, "label": "OldMan", "group": 1 },
                            { "id": 10, "label": "Labarre", "group": 2 },
                            { "id": 11, "label": "Valjean", "group": 2 },
                            { "id": 12, "label": "Marguerite", "group": 3 },
                            { "id": 13, "label": "Mme.deR", "group": 2 },
                            { "id": 14, "label": "Isabeau", "group": 2 },
                            { "id": 15, "label": "Gervais", "group": 2 },
                            { "id": 16, "label": "Tholomyes", "group": 3 },
                            { "id": 17, "label": "Listolier", "group": 3 },
                            { "id": 18, "label": "Fameuil", "group": 3 },
                            { "id": 19, "label": "Blacheville", "group": 3 },
                            { "id": 20, "label": "Favourite", "group": 3 },
                            { "id": 21, "label": "Dahlia", "group": 3 },
                            { "id": 22, "label": "Zephine", "group": 3 },
                            { "id": 23, "label": "Fantine", "group": 3 },
                            { "id": 24, "label": "Mme.Thenardier", "group": 4 },
                            { "id": 25, "label": "Thenardier", "group": 4 },
                            { "id": 26, "label": "Cosette", "group": 5 },
                            { "id": 27, "label": "Javert", "group": 4 },
                            { "id": 28, "label": "Fauchelevent", "group": 0 },
                            { "id": 29, "label": "Bamatabois", "group": 2 },
                            { "id": 30, "label": "Perpetue", "group": 3 },
                            { "id": 31, "label": "Simplice", "group": 2 },
                            { "id": 32, "label": "Scaufflaire", "group": 2 },
                            { "id": 33, "label": "Woman1", "group": 2 },
                            { "id": 34, "label": "Judge", "group": 2 },
                            { "id": 35, "label": "Champmathieu", "group": 2 },
                            { "id": 36, "label": "Brevet", "group": 2 },
                            { "id": 37, "label": "Chenildieu", "group": 2 },
                            { "id": 38, "label": "Cochepaille", "group": 2 },
                            { "id": 39, "label": "Pontmercy", "group": 4 },
                            { "id": 40, "label": "Boulatruelle", "group": 6 },
                            { "id": 41, "label": "Eponine", "group": 4 },
                            { "id": 42, "label": "Anzelma", "group": 4 },
                            { "id": 43, "label": "Woman2", "group": 5 },
                            { "id": 44, "label": "MotherInnocent", "group": 0 },
                            { "id": 45, "label": "Gribier", "group": 0 },
                            { "id": 46, "label": "Jondrette", "group": 7 },
                            { "id": 47, "label": "Mme.Burgon", "group": 7 },
                            { "id": 48, "label": "Gavroche", "group": 8 },
                            { "id": 49, "label": "Gillenormand", "group": 5 },
                            { "id": 50, "label": "Magnon", "group": 5 },
                            { "id": 51, "label": "Mlle.Gillenormand", "group": 5 },
                            { "id": 52, "label": "Mme.Pontmercy", "group": 5 },
                            { "id": 53, "label": "Mlle.Vaubois", "group": 5 },
                            { "id": 54, "label": "Lt.Gillenormand", "group": 5 },
                            { "id": 55, "label": "Marius", "group": 8 },
                            { "id": 56, "label": "BaronessT", "group": 5 },
                            { "id": 57, "label": "Mabeuf", "group": 8 },
                            { "id": 58, "label": "Enjolras", "group": 8 },
                            { "id": 59, "label": "Combeferre", "group": 8 },
                            { "id": 60, "label": "Prouvaire", "group": 8 },
                            { "id": 61, "label": "Feuilly", "group": 8 },
                            { "id": 62, "label": "Courfeyrac", "group": 8 },
                            { "id": 63, "label": "Bahorel", "group": 8 },
                            { "id": 64, "label": "Bossuet", "group": 8 },
                            { "id": 65, "label": "Joly", "group": 8 },
                            { "id": 66, "label": "Grantaire", "group": 8 },
                            { "id": 67, "label": "MotherPlutarch", "group": 9 },
                            { "id": 68, "label": "Gueulemer", "group": 4 },
                            { "id": 69, "label": "Babet", "group": 4 },
                            { "id": 70, "label": "Claquesous", "group": 4 },
                            { "id": 71, "label": "Montparnasse", "group": 4 },
                            { "id": 72, "label": "Toussaint", "group": 5 },
                            { "id": 73, "label": "Child1", "group": 10 },
                            { "id": 74, "label": "Child2", "group": 10 },
                            { "id": 75, "label": "Brujon", "group": 4 },
                            { "id": 76, "label": "Mme.Hucheloup", "group": 8 }
                        ])
                        .edges([
                            { "id": "1->0", "source": 1, "target": 0, "value": 1 },
                            { "id": "2->0", "source": 2, "target": 0, "value": 8 },
                            { "id": "3->0", "source": 3, "target": 0, "value": 10 },
                            { "id": "3->2", "source": 3, "target": 2, "value": 6 },
                            { "id": "4->0", "source": 4, "target": 0, "value": 1 },
                            { "id": "5->0", "source": 5, "target": 0, "value": 1 },
                            { "id": "6->0", "source": 6, "target": 0, "value": 1 },
                            { "id": "7->0", "source": 7, "target": 0, "value": 1 },
                            { "id": "8->0", "source": 8, "target": 0, "value": 2 },
                            { "id": "9->0", "source": 9, "target": 0, "value": 1 },
                            { "id": "11->10", "source": 11, "target": 10, "value": 1 },
                            { "id": "11->3", "source": 11, "target": 3, "value": 3 },
                            { "id": "11->2", "source": 11, "target": 2, "value": 3 },
                            { "id": "11->0", "source": 11, "target": 0, "value": 5 },
                            { "id": "12->11", "source": 12, "target": 11, "value": 1 },
                            { "id": "13->11", "source": 13, "target": 11, "value": 1 },
                            { "id": "14->11", "source": 14, "target": 11, "value": 1 },
                            { "id": "15->11", "source": 15, "target": 11, "value": 1 },
                            { "id": "17->16", "source": 17, "target": 16, "value": 4 },
                            { "id": "18->16", "source": 18, "target": 16, "value": 4 },
                            { "id": "18->17", "source": 18, "target": 17, "value": 4 },
                            { "id": "19->16", "source": 19, "target": 16, "value": 4 },
                            { "id": "19->17", "source": 19, "target": 17, "value": 4 },
                            { "id": "19->18", "source": 19, "target": 18, "value": 4 },
                            { "id": "20->16", "source": 20, "target": 16, "value": 3 },
                            { "id": "20->17", "source": 20, "target": 17, "value": 3 },
                            { "id": "20->18", "source": 20, "target": 18, "value": 3 },
                            { "id": "20->19", "source": 20, "target": 19, "value": 4 },
                            { "id": "21->16", "source": 21, "target": 16, "value": 3 },
                            { "id": "21->17", "source": 21, "target": 17, "value": 3 },
                            { "id": "21->18", "source": 21, "target": 18, "value": 3 },
                            { "id": "21->19", "source": 21, "target": 19, "value": 3 },
                            { "id": "21->20", "source": 21, "target": 20, "value": 5 },
                            { "id": "22->16", "source": 22, "target": 16, "value": 3 },
                            { "id": "22->17", "source": 22, "target": 17, "value": 3 },
                            { "id": "22->18", "source": 22, "target": 18, "value": 3 },
                            { "id": "22->19", "source": 22, "target": 19, "value": 3 },
                            { "id": "22->20", "source": 22, "target": 20, "value": 4 },
                            { "id": "22->21", "source": 22, "target": 21, "value": 4 },
                            { "id": "23->16", "source": 23, "target": 16, "value": 3 },
                            { "id": "23->17", "source": 23, "target": 17, "value": 3 },
                            { "id": "23->18", "source": 23, "target": 18, "value": 3 },
                            { "id": "23->19", "source": 23, "target": 19, "value": 3 },
                            { "id": "23->20", "source": 23, "target": 20, "value": 4 },
                            { "id": "23->21", "source": 23, "target": 21, "value": 4 },
                            { "id": "23->22", "source": 23, "target": 22, "value": 4 },
                            { "id": "23->12", "source": 23, "target": 12, "value": 2 },
                            { "id": "23->11", "source": 23, "target": 11, "value": 9 },
                            { "id": "24->23", "source": 24, "target": 23, "value": 2 },
                            { "id": "24->11", "source": 24, "target": 11, "value": 7 },
                            { "id": "25->24", "source": 25, "target": 24, "value": 13 },
                            { "id": "25->23", "source": 25, "target": 23, "value": 1 },
                            { "id": "25->11", "source": 25, "target": 11, "value": 12 },
                            { "id": "26->24", "source": 26, "target": 24, "value": 4 },
                            { "id": "26->11", "source": 26, "target": 11, "value": 31 },
                            { "id": "26->16", "source": 26, "target": 16, "value": 1 },
                            { "id": "26->25", "source": 26, "target": 25, "value": 1 },
                            { "id": "27->11", "source": 27, "target": 11, "value": 17 },
                            { "id": "27->23", "source": 27, "target": 23, "value": 5 },
                            { "id": "27->25", "source": 27, "target": 25, "value": 5 },
                            { "id": "27->24", "source": 27, "target": 24, "value": 1 },
                            { "id": "27->26", "source": 27, "target": 26, "value": 1 },
                            { "id": "28->11", "source": 28, "target": 11, "value": 8 },
                            { "id": "28->27", "source": 28, "target": 27, "value": 1 },
                            { "id": "29->23", "source": 29, "target": 23, "value": 1 },
                            { "id": "29->27", "source": 29, "target": 27, "value": 1 },
                            { "id": "29->11", "source": 29, "target": 11, "value": 2 },
                            { "id": "30->23", "source": 30, "target": 23, "value": 1 },
                            { "id": "31->30", "source": 31, "target": 30, "value": 2 },
                            { "id": "31->11", "source": 31, "target": 11, "value": 3 },
                            { "id": "31->23", "source": 31, "target": 23, "value": 2 },
                            { "id": "31->27", "source": 31, "target": 27, "value": 1 },
                            { "id": "32->11", "source": 32, "target": 11, "value": 1 },
                            { "id": "33->11", "source": 33, "target": 11, "value": 2 },
                            { "id": "33->27", "source": 33, "target": 27, "value": 1 },
                            { "id": "34->11", "source": 34, "target": 11, "value": 3 },
                            { "id": "34->29", "source": 34, "target": 29, "value": 2 },
                            { "id": "35->11", "source": 35, "target": 11, "value": 3 },
                            { "id": "35->34", "source": 35, "target": 34, "value": 3 },
                            { "id": "35->29", "source": 35, "target": 29, "value": 2 },
                            { "id": "36->34", "source": 36, "target": 34, "value": 2 },
                            { "id": "36->35", "source": 36, "target": 35, "value": 2 },
                            { "id": "36->11", "source": 36, "target": 11, "value": 2 },
                            { "id": "36->29", "source": 36, "target": 29, "value": 1 },
                            { "id": "37->34", "source": 37, "target": 34, "value": 2 },
                            { "id": "37->35", "source": 37, "target": 35, "value": 2 },
                            { "id": "37->36", "source": 37, "target": 36, "value": 2 },
                            { "id": "37->11", "source": 37, "target": 11, "value": 2 },
                            { "id": "37->29", "source": 37, "target": 29, "value": 1 },
                            { "id": "38->34", "source": 38, "target": 34, "value": 2 },
                            { "id": "38->35", "source": 38, "target": 35, "value": 2 },
                            { "id": "38->36", "source": 38, "target": 36, "value": 2 },
                            { "id": "38->37", "source": 38, "target": 37, "value": 2 },
                            { "id": "38->11", "source": 38, "target": 11, "value": 2 },
                            { "id": "38->29", "source": 38, "target": 29, "value": 1 },
                            { "id": "39->25", "source": 39, "target": 25, "value": 1 },
                            { "id": "40->25", "source": 40, "target": 25, "value": 1 },
                            { "id": "41->24", "source": 41, "target": 24, "value": 2 },
                            { "id": "41->25", "source": 41, "target": 25, "value": 3 },
                            { "id": "42->41", "source": 42, "target": 41, "value": 2 },
                            { "id": "42->25", "source": 42, "target": 25, "value": 2 },
                            { "id": "42->24", "source": 42, "target": 24, "value": 1 },
                            { "id": "43->11", "source": 43, "target": 11, "value": 3 },
                            { "id": "43->26", "source": 43, "target": 26, "value": 1 },
                            { "id": "43->27", "source": 43, "target": 27, "value": 1 },
                            { "id": "44->28", "source": 44, "target": 28, "value": 3 },
                            { "id": "44->11", "source": 44, "target": 11, "value": 1 },
                            { "id": "45->28", "source": 45, "target": 28, "value": 2 },
                            { "id": "47->46", "source": 47, "target": 46, "value": 1 },
                            { "id": "48->47", "source": 48, "target": 47, "value": 2 },
                            { "id": "48->25", "source": 48, "target": 25, "value": 1 },
                            { "id": "48->27", "source": 48, "target": 27, "value": 1 },
                            { "id": "48->11", "source": 48, "target": 11, "value": 1 },
                            { "id": "49->26", "source": 49, "target": 26, "value": 3 },
                            { "id": "49->11", "source": 49, "target": 11, "value": 2 },
                            { "id": "50->49", "source": 50, "target": 49, "value": 1 },
                            { "id": "50->24", "source": 50, "target": 24, "value": 1 },
                            { "id": "51->49", "source": 51, "target": 49, "value": 9 },
                            { "id": "51->26", "source": 51, "target": 26, "value": 2 },
                            { "id": "51->11", "source": 51, "target": 11, "value": 2 },
                            { "id": "52->51", "source": 52, "target": 51, "value": 1 },
                            { "id": "52->39", "source": 52, "target": 39, "value": 1 },
                            { "id": "53->51", "source": 53, "target": 51, "value": 1 },
                            { "id": "54->51", "source": 54, "target": 51, "value": 2 },
                            { "id": "54->49", "source": 54, "target": 49, "value": 1 },
                            { "id": "54->26", "source": 54, "target": 26, "value": 1 },
                            { "id": "55->51", "source": 55, "target": 51, "value": 6 },
                            { "id": "55->49", "source": 55, "target": 49, "value": 12 },
                            { "id": "55->39", "source": 55, "target": 39, "value": 1 },
                            { "id": "55->54", "source": 55, "target": 54, "value": 1 },
                            { "id": "55->26", "source": 55, "target": 26, "value": 21 },
                            { "id": "55->11", "source": 55, "target": 11, "value": 19 },
                            { "id": "55->16", "source": 55, "target": 16, "value": 1 },
                            { "id": "55->25", "source": 55, "target": 25, "value": 2 },
                            { "id": "55->41", "source": 55, "target": 41, "value": 5 },
                            { "id": "55->48", "source": 55, "target": 48, "value": 4 },
                            { "id": "56->49", "source": 56, "target": 49, "value": 1 },
                            { "id": "56->55", "source": 56, "target": 55, "value": 1 },
                            { "id": "57->55", "source": 57, "target": 55, "value": 1 },
                            { "id": "57->41", "source": 57, "target": 41, "value": 1 },
                            { "id": "57->48", "source": 57, "target": 48, "value": 1 },
                            { "id": "58->55", "source": 58, "target": 55, "value": 7 },
                            { "id": "58->48", "source": 58, "target": 48, "value": 7 },
                            { "id": "58->27", "source": 58, "target": 27, "value": 6 },
                            { "id": "58->57", "source": 58, "target": 57, "value": 1 },
                            { "id": "58->11", "source": 58, "target": 11, "value": 4 },
                            { "id": "59->58", "source": 59, "target": 58, "value": 15 },
                            { "id": "59->55", "source": 59, "target": 55, "value": 5 },
                            { "id": "59->48", "source": 59, "target": 48, "value": 6 },
                            { "id": "59->57", "source": 59, "target": 57, "value": 2 },
                            { "id": "60->48", "source": 60, "target": 48, "value": 1 },
                            { "id": "60->58", "source": 60, "target": 58, "value": 4 },
                            { "id": "60->59", "source": 60, "target": 59, "value": 2 },
                            { "id": "61->48", "source": 61, "target": 48, "value": 2 },
                            { "id": "61->58", "source": 61, "target": 58, "value": 6 },
                            { "id": "61->60", "source": 61, "target": 60, "value": 2 },
                            { "id": "61->59", "source": 61, "target": 59, "value": 5 },
                            { "id": "61->57", "source": 61, "target": 57, "value": 1 },
                            { "id": "61->55", "source": 61, "target": 55, "value": 1 },
                            { "id": "62->55", "source": 62, "target": 55, "value": 9 },
                            { "id": "62->58", "source": 62, "target": 58, "value": 17 },
                            { "id": "62->59", "source": 62, "target": 59, "value": 13 },
                            { "id": "62->48", "source": 62, "target": 48, "value": 7 },
                            { "id": "62->57", "source": 62, "target": 57, "value": 2 },
                            { "id": "62->41", "source": 62, "target": 41, "value": 1 },
                            { "id": "62->61", "source": 62, "target": 61, "value": 6 },
                            { "id": "62->60", "source": 62, "target": 60, "value": 3 },
                            { "id": "63->59", "source": 63, "target": 59, "value": 5 },
                            { "id": "63->48", "source": 63, "target": 48, "value": 5 },
                            { "id": "63->62", "source": 63, "target": 62, "value": 6 },
                            { "id": "63->57", "source": 63, "target": 57, "value": 2 },
                            { "id": "63->58", "source": 63, "target": 58, "value": 4 },
                            { "id": "63->61", "source": 63, "target": 61, "value": 3 },
                            { "id": "63->60", "source": 63, "target": 60, "value": 2 },
                            { "id": "63->55", "source": 63, "target": 55, "value": 1 },
                            { "id": "64->55", "source": 64, "target": 55, "value": 5 },
                            { "id": "64->62", "source": 64, "target": 62, "value": 12 },
                            { "id": "64->48", "source": 64, "target": 48, "value": 5 },
                            { "id": "64->63", "source": 64, "target": 63, "value": 4 },
                            { "id": "64->58", "source": 64, "target": 58, "value": 10 },
                            { "id": "64->61", "source": 64, "target": 61, "value": 6 },
                            { "id": "64->60", "source": 64, "target": 60, "value": 2 },
                            { "id": "64->59", "source": 64, "target": 59, "value": 9 },
                            { "id": "64->57", "source": 64, "target": 57, "value": 1 },
                            { "id": "64->11", "source": 64, "target": 11, "value": 1 },
                            { "id": "65->63", "source": 65, "target": 63, "value": 5 },
                            { "id": "65->64", "source": 65, "target": 64, "value": 7 },
                            { "id": "65->48", "source": 65, "target": 48, "value": 3 },
                            { "id": "65->62", "source": 65, "target": 62, "value": 5 },
                            { "id": "65->58", "source": 65, "target": 58, "value": 5 },
                            { "id": "65->61", "source": 65, "target": 61, "value": 5 },
                            { "id": "65->60", "source": 65, "target": 60, "value": 2 },
                            { "id": "65->59", "source": 65, "target": 59, "value": 5 },
                            { "id": "65->57", "source": 65, "target": 57, "value": 1 },
                            { "id": "65->55", "source": 65, "target": 55, "value": 2 },
                            { "id": "66->64", "source": 66, "target": 64, "value": 3 },
                            { "id": "66->58", "source": 66, "target": 58, "value": 3 },
                            { "id": "66->59", "source": 66, "target": 59, "value": 1 },
                            { "id": "66->62", "source": 66, "target": 62, "value": 2 },
                            { "id": "66->65", "source": 66, "target": 65, "value": 2 },
                            { "id": "66->48", "source": 66, "target": 48, "value": 1 },
                            { "id": "66->63", "source": 66, "target": 63, "value": 1 },
                            { "id": "66->61", "source": 66, "target": 61, "value": 1 },
                            { "id": "66->60", "source": 66, "target": 60, "value": 1 },
                            { "id": "67->57", "source": 67, "target": 57, "value": 3 },
                            { "id": "68->25", "source": 68, "target": 25, "value": 5 },
                            { "id": "68->11", "source": 68, "target": 11, "value": 1 },
                            { "id": "68->24", "source": 68, "target": 24, "value": 1 },
                            { "id": "68->27", "source": 68, "target": 27, "value": 1 },
                            { "id": "68->48", "source": 68, "target": 48, "value": 1 },
                            { "id": "68->41", "source": 68, "target": 41, "value": 1 },
                            { "id": "69->25", "source": 69, "target": 25, "value": 6 },
                            { "id": "69->68", "source": 69, "target": 68, "value": 6 },
                            { "id": "69->11", "source": 69, "target": 11, "value": 1 },
                            { "id": "69->24", "source": 69, "target": 24, "value": 1 },
                            { "id": "69->27", "source": 69, "target": 27, "value": 2 },
                            { "id": "69->48", "source": 69, "target": 48, "value": 1 },
                            { "id": "69->41", "source": 69, "target": 41, "value": 1 },
                            { "id": "70->25", "source": 70, "target": 25, "value": 4 },
                            { "id": "70->69", "source": 70, "target": 69, "value": 4 },
                            { "id": "70->68", "source": 70, "target": 68, "value": 4 },
                            { "id": "70->11", "source": 70, "target": 11, "value": 1 },
                            { "id": "70->24", "source": 70, "target": 24, "value": 1 },
                            { "id": "70->27", "source": 70, "target": 27, "value": 1 },
                            { "id": "70->41", "source": 70, "target": 41, "value": 1 },
                            { "id": "70->58", "source": 70, "target": 58, "value": 1 },
                            { "id": "71->27", "source": 71, "target": 27, "value": 1 },
                            { "id": "71->69", "source": 71, "target": 69, "value": 2 },
                            { "id": "71->68", "source": 71, "target": 68, "value": 2 },
                            { "id": "71->70", "source": 71, "target": 70, "value": 2 },
                            { "id": "71->11", "source": 71, "target": 11, "value": 1 },
                            { "id": "71->48", "source": 71, "target": 48, "value": 1 },
                            { "id": "71->41", "source": 71, "target": 41, "value": 1 },
                            { "id": "71->25", "source": 71, "target": 25, "value": 1 },
                            { "id": "72->26", "source": 72, "target": 26, "value": 2 },
                            { "id": "72->27", "source": 72, "target": 27, "value": 1 },
                            { "id": "72->11", "source": 72, "target": 11, "value": 1 },
                            { "id": "73->48", "source": 73, "target": 48, "value": 2 },
                            { "id": "74->48", "source": 74, "target": 48, "value": 2 },
                            { "id": "74->73", "source": 74, "target": 73, "value": 3 },
                            { "id": "75->69", "source": 75, "target": 69, "value": 3 },
                            { "id": "75->68", "source": 75, "target": 68, "value": 3 },
                            { "id": "75->25", "source": 75, "target": 25, "value": 3 },
                            { "id": "75->48", "source": 75, "target": 48, "value": 1 },
                            { "id": "75->41", "source": 75, "target": 41, "value": 1 },
                            { "id": "75->70", "source": 75, "target": 70, "value": 1 },
                            { "id": "75->71", "source": 75, "target": 71, "value": 1 },
                            { "id": "76->64", "source": 76, "target": 64, "value": 1 },
                            { "id": "76->65", "source": 76, "target": 65, "value": 1 },
                            { "id": "76->66", "source": 76, "target": 66, "value": 1 },
                            { "id": "76->63", "source": 76, "target": 63, "value": 1 },
                            { "id": "76->62", "source": 76, "target": 62, "value": 1 },
                            { "id": "76->48", "source": 76, "target": 48, "value": 1 },
                            { "id": "76->58", "source": 76, "target": 58, "value": 1 }
                        ]);
                    callback(graph);
                });
            }
        },
        Vertex: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Vertex"], function (DataFactory, Vertex) {
                    callback(new Vertex()
                        .faChar(DataFactory.FAChar.simple.char)
                        .text(DataFactory.Text.simple.text)
                        .annotationIcons(DataFactory.Graph.vertex.annotationIcons)
                    );
                });
            }
        },
        Edge: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        vertices.push(
                            new Vertex()
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_diameter(60)
                                .icon_shape_colorStroke("transparent")
                                .icon_shape_colorFill("transparent")
                                .icon_image_colorFill("#333333")
                                .textbox_shape_colorStroke("transparent")
                                .textbox_shape_colorFill("transparent")
                                .textbox_text_colorFill("#333333")
                                .iconAnchor("middle")
                                .faChar(node.icon)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("Hello!")
                                .strokeDasharray(idx === 0 ? "15, 10, 5, 10, 15" : null)
                                .strokeColor(idx === 0 ? "cyan" : null)
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            }
        },
        Graph: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        vertices.push(
                            new Vertex()
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_diameter(30)
                                .icon_shape_colorStroke(palette(node.group))
                                .icon_shape_colorFill(palette(node.group))
                                .faChar(node.icon)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            wu: function (callback) {
                legacyRequire(["test/DataFactory", "src/comms/Workunit", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Workunit, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph()
                        .allowDragging(false)
                        .layout("Hierarchy")
                        ;
                    var wu = Workunit.attach({ baseUrl: "http://192.168.3.22:8010/" }, "W20180302-141550");
                    wu.fetchGraphs().then(function (graphs) {
                        if (graphs.length) {
                            return graphs[0].fetchScopeGraph();
                        }
                        return undefined;
                    }).then(function (scopeGraph) {
                        if (scopeGraph) {
                            var hierarchy = [];
                            var vertices = [];
                            var verticesMap = {};
                            var edges = [];
                            scopeGraph.allSubgraphs().forEach(function (subgraph) {
                                var sg = new Graph.Subgraph()
                                    .title(subgraph.id())
                                    ;
                                vertices.push(sg);
                                verticesMap[subgraph.id()] = sg;
                                var parent = verticesMap[subgraph.parent().id()];
                                if (parent) {
                                    hierarchy.push({ parent: parent, child: sg });
                                }
                            });
                            scopeGraph.allVertices().forEach(function (vertex) {
                                var v = new Vertex()
                                    .text(vertex.label())
                                    ;
                                vertices.push(v);
                                verticesMap[vertex.id()] = v;
                                var parent = verticesMap[vertex.parent().id()];
                                if (parent) {
                                    hierarchy.push({ parent: parent, child: v });
                                }
                            });
                            scopeGraph.allEdges().forEach(function (edge) {
                                var sourceV = verticesMap[edge.sourceID()];
                                var targetV = verticesMap[edge.targetID()];
                                if (sourceV && targetV) {
                                    var e = new Edge()
                                        .sourceVertex(sourceV)
                                        .targetVertex(targetV)
                                        .sourceMarker("circle")
                                        .targetMarker("arrow")
                                        .text("")
                                        ;
                                    edges.push(e);
                                }
                            });
                            graph.data({ vertices: vertices, edges: edges, hierarchy: hierarchy });
                        }
                        callback(graph);
                    });
                });
            },
            restyle: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        vertices.push(
                            new Vertex()
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_diameter(60)
                                .icon_shape_colorStroke("transparent")
                                .icon_shape_colorFill("transparent")
                                .icon_image_colorFill("#333333")
                                .textbox_shape_colorStroke("transparent")
                                .textbox_shape_colorFill("transparent")
                                .textbox_text_colorFill("#333333")
                                .iconAnchor("middle")
                                .faChar(node.icon)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            les_miz: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.les_miz;
                    rawData.nodes.forEach(function (node, idx) {
                        vertices.push(
                            new Vertex()
                                .centroid(idx === 0)
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_shape_colorStroke(palette(node.group))
                                .icon_shape_colorFill(palette(node.group))
                                .faChar(node.name[0])
                                .scale(node.group / 4 >= 1 ? node.group / 4 : 1)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            annotations: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Graph", "src/common/Palette", "src/graph/Vertex", "src/graph/Edge"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();

                    var vertices = [];
                    var edges = [];

                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        var annotation = [];
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "A",
                                "tooltip": "Test A",
                                "shape_colorFill": "white",
                                "image_colorFill": "red"
                            });
                        }
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "B",
                                "tooltip": "Test B",
                                "shape_colorFill": "green",
                                "shape_colorStroke": "green",
                                "image_colorFill": "white"
                            });
                        }
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "C",
                                "tooltip": "Test C",
                                "shape_colorFill": "navy",
                                "shape_colorStroke": "navy",
                                "image_colorFill": "white"
                            });
                        }
                        vertices.push(new Vertex()
                            .text(node.name)
                            .textbox_shape_colorStroke(palette(node.group))
                            .textbox_shape_colorFill("whitesmoke")
                            .icon_shape_colorStroke(palette(node.group))
                            .icon_shape_colorFill(palette(node.group))
                            .annotationIcons(annotation)
                            .faChar(node.name[0])
                        );
                    }, graph);

                    function createEdge(source, target, label) {
                        return new Edge()
                            .sourceVertex(source)
                            .targetVertex(target)
                            .sourceMarker("circle")
                            .targetMarker("arrow")
                            .text(label || "")
                            ;
                    }
                    rawData.links.forEach(function (link, idx) {
                        edges.push(createEdge(vertices[link.source], vertices[link.target]).weight(link.value));
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            }
        },
        GraphC: {
            simple: function (callback) {
                require(["test/DataFactory", "src/graph/GraphC", "src/common/Palette", "src/graph/VertexC", "src/graph/EdgeC"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        vertices.push(
                            new Vertex()
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_diameter(30)
                                .icon_shape_colorStroke(palette(node.group))
                                .icon_shape_colorFill(palette(node.group))
                                .faChar(node.icon)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            restyle: function (callback) {
                require(["test/DataFactory", "src/graph/GraphC", "src/common/Palette", "src/graph/VertexC", "src/graph/EdgeC"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        vertices.push(
                            new Vertex()
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_diameter(60)
                                .icon_shape_colorStroke("transparent")
                                .icon_shape_colorFill("transparent")
                                .icon_image_colorFill("#333333")
                                .textbox_shape_colorStroke("transparent")
                                .textbox_shape_colorFill("transparent")
                                .textbox_text_colorFill("#333333")
                                .iconAnchor("middle")
                                .faChar(node.icon)
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            les_miz: function (callback) {
                require(["test/DataFactory", "src/graph/GraphC", "src/common/Palette", "src/graph/VertexC", "src/graph/EdgeC"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();
                    var vertices = [];
                    var edges = [];
                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.les_miz;
                    rawData.nodes.forEach(function (node, idx) {
                        vertices.push(
                            new Vertex()
                                .centroid(idx === 0)
                                .text(node.name)
                                .textbox_shape_colorStroke(palette(node.group))
                                .textbox_shape_colorFill("whitesmoke")
                                .icon_shape_colorStroke(palette(node.group))
                                .icon_shape_colorFill(palette(node.group))
                                .faChar(node.name[0])
                        )
                            ;
                    }, graph);

                    rawData.links.forEach(function (link, idx) {
                        edges.push(
                            new Edge()
                                .sourceVertex(vertices[link.source])
                                .targetVertex(vertices[link.target])
                                .sourceMarker("circle")
                                .targetMarker("arrow")
                                .text("")
                                .weight(link.value)
                        )
                            ;
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            },
            annotations: function (callback) {
                require(["test/DataFactory", "src/graph/GraphC", "src/common/Palette", "src/graph/VertexC", "src/graph/EdgeC"], function (DataFactory, Graph, Palette, Vertex, Edge) {
                    var graph = new Graph();

                    var vertices = [];
                    var edges = [];

                    var palette = Palette.ordinal("dark2");

                    var rawData = DataFactory.Graph.simple;
                    rawData.nodes.forEach(function (node) {
                        var annotation = [];
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "A",
                                "tooltip": "Test A",
                                "shape_colorFill": "white",
                                "image_colorFill": "red"
                            });
                        }
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "B",
                                "tooltip": "Test B",
                                "shape_colorFill": "green",
                                "shape_colorStroke": "green",
                                "image_colorFill": "white"
                            });
                        }
                        if (Math.random() < 0.10) {
                            annotation.push({
                                "faChar": "C",
                                "tooltip": "Test C",
                                "shape_colorFill": "navy",
                                "shape_colorStroke": "navy",
                                "image_colorFill": "white"
                            });
                        }
                        vertices.push(new Vertex()
                            .text(node.name)
                            .textbox_shape_colorStroke(palette(node.group))
                            .textbox_shape_colorFill("whitesmoke")
                            .icon_shape_colorStroke(palette(node.group))
                            .icon_shape_colorFill(palette(node.group))
                            .annotationIcons(annotation)
                            .faChar(node.name[0])
                        );
                    }, graph);

                    function createEdge(source, target, label) {
                        return new Edge()
                            .sourceVertex(source)
                            .targetVertex(target)
                            .sourceMarker("circle")
                            .targetMarker("arrow")
                            .text(label || "")
                            ;
                    }
                    rawData.links.forEach(function (link, idx) {
                        edges.push(createEdge(vertices[link.source], vertices[link.target]).weight(link.value));
                    }, graph);

                    graph.data({ vertices: vertices, edges: edges });
                    callback(graph);
                });
            }
        },
        Sankey: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/graph/Sankey"], function (DataFactory, Sankey) {
                    var widget = new Sankey()
                        .columns(DataFactory.Sample.DataBreach.columns)
                        .data(DataFactory.Sample.DataBreach.data)
                        .mappings([new Sankey.prototype.Column().column("Covered Entity Type"), new Sankey.prototype.Column().column("Type of Breach")])
                        ;
                    callback(widget);
                });
            }
        }
    };
}));
