// tslint:disable
import { Pie } from "@hpcc-js/chart";
import { Table } from "@hpcc-js/dgrid";
import { FieldForm } from "@hpcc-js/form";
import { ChartPanel } from "@hpcc-js/layout";
import * as marshaller from "@hpcc-js/marshaller";

//  Dashboard Element Container (Model)  ---
const ec = new marshaller.ElementContainer();

namespace data {
    export const Ins5191838_dsOutput1_View_Pattern1 = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_Pattern1")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_Pattern2 = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_Pattern2")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "Pattern1", remoteFieldID: "cl_high_risk_pattern1_flag_", localFieldID: "cl_high_risk_pattern1_flag_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_Pattern3 = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_Pattern3")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "Pattern1", remoteFieldID: "cl_high_risk_pattern1_flag_", localFieldID: "cl_high_risk_pattern1_flag_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_Pattern4 = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_Pattern4")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "Pattern1", remoteFieldID: "cl_high_risk_pattern1_flag_", localFieldID: "cl_high_risk_pattern1_flag_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_Pattern5 = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_Pattern5")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "Pattern1", remoteFieldID: "cl_high_risk_pattern1_flag_", localFieldID: "cl_high_risk_pattern1_flag_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_TopClusters = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_TopClusters")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "entity_context_uid_", type: "string" }, { id: "label_", type: "string" }, { id: "cl_event_count_", type: "number" }, { id: "cl_identity_count_", type: "number" }, { id: "cl_impact_weight_", type: "number" }, { id: "cl_identity_count_percentile_", type: "number" }, { id: "cl_event_count_percentile_", type: "number" }])
        .requestFieldRefs([{ source: "Pattern1", remoteFieldID: "cl_high_risk_pattern1_flag_", localFieldID: "cl_high_risk_pattern1_flag_" }, { source: "Pattern2", remoteFieldID: "cl_high_risk_pattern2_flag_", localFieldID: "cl_high_risk_pattern2_flag_" }, { source: "Pattern3", remoteFieldID: "cl_high_risk_pattern3_flag_", localFieldID: "cl_high_risk_pattern3_flag_" }, { source: "Pattern4", remoteFieldID: "cl_high_risk_pattern4_flag_", localFieldID: "cl_high_risk_pattern4_flag_" }, { source: "Pattern5", remoteFieldID: "cl_high_risk_pattern5_flag_", localFieldID: "cl_high_risk_pattern5_flag_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_HighRiskIdentities = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_HighRiskIdentities")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "entity_context_uid_", type: "string" }, { id: "label_", type: "string" }, { id: "score_", type: "number" }, { id: "cluster_score_", type: "number" }, { id: "cl_impact_weight_", type: "number" }])
        .requestFieldRefs([{ source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_IdentityStats = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_IdentityStats")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "label", type: "string" }, { id: "value", type: "string" }, { id: "field", type: "string" }, { id: "indicatortype", type: "string" }, { id: "indicatordescription", type: "string" }, { id: "fieldtype", type: "string" }, { id: "risklevel", type: "number" }])
        .requestFieldRefs([{ source: "HighRiskIdentities", remoteFieldID: "entity_context_uid_", localFieldID: "entity_context_uid_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_ElementType = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_ElementType")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "entity_type_", type: "number" }, { id: "base_count", type: "number" }])
        .requestFieldRefs([{ source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const Ins5191838_dsOutput1_View_HighRiskElements = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_HighRiskElements")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "entity_context_uid_", type: "string" }, { id: "label_", type: "string" }, { id: "score_", type: "number" }, { id: "cluster_score_", type: "number" }, { id: "cl_impact_weight_", type: "number" }])
        .requestFieldRefs([{ source: "ElementType", remoteFieldID: "entity_type_", localFieldID: "entity_type_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const ClusterStatsFORM = new marshaller.Form()
        .payload({ "indicatordescription": "Cluster" })
        ;
    export const Ins5191838_dsOutput1_View_ClusterStats = new marshaller.HipieRequest(ec)
        .url("http://10.241.100.157:8002")
        .querySet("roxie")
        .queryID("carmigjx_govottocustomerdash1.Ins5191838_Service_1")
        .resultName("View_ClusterStats")
        .requestFields([{ id: "cl_high_risk_pattern1_flag_", type: "number" }, { id: "customer_id_", type: "number" }, { id: "industry_type_", type: "number" }, { id: "cl_high_risk_pattern4_flag_", type: "number" }, { id: "cl_high_risk_pattern5_flag_", type: "number" }, { id: "cl_high_risk_pattern2_flag_", type: "number" }, { id: "cl_high_risk_pattern3_flag_", type: "number" }, { id: "entity_context_uid_", type: "string" }, { id: "entity_type_", type: "number" }, { id: "indicatordescription", type: "string" }])
        .responseFields([{ id: "indicatordescription", type: "string" }, { id: "label", type: "string" }, { id: "value", type: "string" }, { id: "field", type: "string" }, { id: "indicatortype", type: "string" }, { id: "risklevel", type: "number" }, { id: "fieldtype", type: "string" }])
        .requestFieldRefs([{ source: "TopClusters", remoteFieldID: "entity_context_uid_", localFieldID: "entity_context_uid_" }, { source: "ClusterStatsFORM", remoteFieldID: "indicatordescription", localFieldID: "indicatordescription" }, { source: "govottocustomerdash1FORM", remoteFieldID: "customer_id_", localFieldID: "customer_id_" }, { source: "govottocustomerdash1FORM", remoteFieldID: "industry_type_", localFieldID: "industry_type_" }])
        ;
    export const govottocustomerdash1FORM = new marshaller.Form()
        .payload({ "customer_id_": "248283691", "industry_type_": "1292" })
        ;
}

namespace viz {
    export const Pattern1 = new ChartPanel()
        .id("Pattern1")
        .title("Pattern 1")
        .widget(new Pie())
        ;

    export const Pattern2 = new ChartPanel()
        .id("Pattern2")
        .title("Pattern 2")
        .widget(new Pie())
        ;

    export const Pattern3 = new ChartPanel()
        .id("Pattern3")
        .title("Pattern 3")
        .widget(new Pie())
        ;

    export const Pattern4 = new ChartPanel()
        .id("Pattern4")
        .title("Pattern 4")
        .widget(new Pie())
        ;

    export const Pattern5 = new ChartPanel()
        .id("Pattern5")
        .title("Pattern 5")
        .widget(new Pie())
        ;

    export const TopClusters = new ChartPanel()
        .id("TopClusters")
        .title("Top Clusters")
        .widget(new Table())
        ;

    export const HighRiskIdentities = new ChartPanel()
        .id("HighRiskIdentities")
        .title("High Risk Identities")
        .widget(new Table())
        ;

    export const IdentityStats = new ChartPanel()
        .id("IdentityStats")
        .title("Identity Stats")
        .widget(new Table())
        ;

    export const ElementType = new ChartPanel()
        .id("ElementType")
        .title("Element Type")
        .widget(new Table())
        ;

    export const HighRiskElements = new ChartPanel()
        .id("HighRiskElements")
        .title("High Risk Elements")
        .widget(new Table())
        ;

    export const ElementStats = new ChartPanel()
        .id("ElementStats")
        .title("Element Stats")
        .widget(new Table())
        ;

    export const ClusterStatsFORM = new ChartPanel()
        .id("ClusterStatsFORM")
        .title("Cluster Stats")
        .widget(new FieldForm()
            .allowEmptyRequest(true))
        ;

    export const ClusterStats = new ChartPanel()
        .id("ClusterStats")
        .title("Cluster Stats")
        .widget(new Table())
        ;

    export const govottocustomerdash1FORM = new ChartPanel()
        .id("govottocustomerdash1FORM")
        .title("Gov-Otto-CustomerDash1 Filter")
        .widget(new FieldForm()
            .allowEmptyRequest(true))
        ;
}

//  Dashboard Elements  (Controller) ---
const Pattern1 = new marshaller.Element(ec)
    .id("Pattern1")
    .pipeline([
        data.Ins5191838_dsOutput1_View_Pattern1
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "cl_high_risk_pattern1_flag_", transformations: undefined }, { fieldID: "weight", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.Pattern1)
    .on("selectionChanged", () => {
        Pattern2.refresh();
        Pattern3.refresh();
        Pattern4.refresh();
        Pattern5.refresh();
        TopClusters.refresh();
    }, true)
    ;
ec.append(Pattern1);

const Pattern2 = new marshaller.Element(ec)
    .id("Pattern2")
    .pipeline([
        data.Ins5191838_dsOutput1_View_Pattern2
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "cl_high_risk_pattern2_flag_", transformations: undefined }, { fieldID: "weight", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.Pattern2)
    .on("selectionChanged", () => {
        TopClusters.refresh();
    }, true)
    ;
ec.append(Pattern2);

const Pattern3 = new marshaller.Element(ec)
    .id("Pattern3")
    .pipeline([
        data.Ins5191838_dsOutput1_View_Pattern3
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "cl_high_risk_pattern3_flag_", transformations: undefined }, { fieldID: "weight", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.Pattern3)
    .on("selectionChanged", () => {
        TopClusters.refresh();
    }, true)
    ;
ec.append(Pattern3);

const Pattern4 = new marshaller.Element(ec)
    .id("Pattern4")
    .pipeline([
        data.Ins5191838_dsOutput1_View_Pattern4
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "cl_high_risk_pattern4_flag_", transformations: undefined }, { fieldID: "weight", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.Pattern4)
    .on("selectionChanged", () => {
        TopClusters.refresh();
    }, true)
    ;
ec.append(Pattern4);

const Pattern5 = new marshaller.Element(ec)
    .id("Pattern5")
    .pipeline([
        data.Ins5191838_dsOutput1_View_Pattern5
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "cl_high_risk_pattern5_flag_", transformations: undefined }, { fieldID: "weight", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.Pattern5)
    .on("selectionChanged", () => {
        TopClusters.refresh();
    }, true)
    ;
ec.append(Pattern5);

const TopClusters = new marshaller.Element(ec)
    .id("TopClusters")
    .pipeline([
        data.Ins5191838_dsOutput1_View_TopClusters,
        new marshaller.Sort().conditions([{ fieldID: "cl_impact_weight_", descending: true }]),
        new marshaller.Limit().rows(200)
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "entity_context_uid_", type: "=", sourceFieldID: "entity_context_uid_", transformations: undefined }, { fieldID: "label_", type: "=", sourceFieldID: "label_", transformations: undefined }, { fieldID: "cl_event_count_", type: "=", sourceFieldID: "cl_event_count_", transformations: undefined }, { fieldID: "cl_identity_count_", type: "=", sourceFieldID: "cl_identity_count_", transformations: undefined }, { fieldID: "cl_impact_weight_", type: "=", sourceFieldID: "cl_impact_weight_", transformations: undefined }, { fieldID: "cl_identity_count_percentile_", type: "=", sourceFieldID: "cl_identity_count_percentile_", transformations: undefined }, { fieldID: "cl_event_count_percentile_", type: "=", sourceFieldID: "cl_event_count_percentile_", transformations: undefined }]))
    .chartPanel(viz.TopClusters)
    .on("selectionChanged", () => {
        ClusterStats.refresh();
    }, true)
    ;
ec.append(TopClusters);

const HighRiskIdentities = new marshaller.Element(ec)
    .id("HighRiskIdentities")
    .pipeline([
        data.Ins5191838_dsOutput1_View_HighRiskIdentities,
        new marshaller.Sort().conditions([{ fieldID: "cluster_score_", descending: true }, { fieldID: "cl_impact_weight_", descending: true }]),
        new marshaller.Limit().rows(200)
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "entity_context_uid_", type: "=", sourceFieldID: "entity_context_uid_", transformations: undefined }, { fieldID: "label_", type: "=", sourceFieldID: "label_", transformations: undefined }, { fieldID: "score_", type: "=", sourceFieldID: "score_", transformations: undefined }, { fieldID: "cluster_score_", type: "=", sourceFieldID: "cluster_score_", transformations: undefined }, { fieldID: "cl_impact_weight_", type: "=", sourceFieldID: "cl_impact_weight_", transformations: undefined }]))
    .chartPanel(viz.HighRiskIdentities)
    .on("selectionChanged", () => {
        IdentityStats.refresh();
    }, true)
    ;
ec.append(HighRiskIdentities);

const IdentityStats = new marshaller.Element(ec)
    .id("IdentityStats")
    .pipeline([
        data.Ins5191838_dsOutput1_View_IdentityStats
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "label", transformations: undefined }, { fieldID: "value", type: "=", sourceFieldID: "value", transformations: undefined }, { fieldID: "field", type: "=", sourceFieldID: "field", transformations: undefined }, { fieldID: "indicatortype", type: "=", sourceFieldID: "indicatortype", transformations: undefined }, { fieldID: "indicatordescription", type: "=", sourceFieldID: "indicatordescription", transformations: undefined }, { fieldID: "fieldtype", type: "=", sourceFieldID: "fieldtype", transformations: undefined }, { fieldID: "risklevel", type: "=", sourceFieldID: "risklevel", transformations: undefined }]))
    .chartPanel(viz.IdentityStats)
    .on("selectionChanged", () => {

    }, true)
    ;
ec.append(IdentityStats);

const ElementType = new marshaller.Element(ec)
    .id("ElementType")
    .pipeline([
        data.Ins5191838_dsOutput1_View_ElementType
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "entity_type_", type: "=", sourceFieldID: "entity_type_", transformations: undefined }, { fieldID: "rowcount", type: "=", sourceFieldID: "base_count", transformations: undefined }]))
    .chartPanel(viz.ElementType)
    .on("selectionChanged", () => {
        HighRiskElements.refresh();
    }, true)
    ;
ec.append(ElementType);

const HighRiskElements = new marshaller.Element(ec)
    .id("HighRiskElements")
    .pipeline([
        data.Ins5191838_dsOutput1_View_HighRiskElements,
        new marshaller.Sort().conditions([{ fieldID: "score_", descending: true }, { fieldID: "cl_impact_weight_", descending: true }]),
        new marshaller.Limit().rows(200)
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "entity_context_uid_", type: "=", sourceFieldID: "entity_context_uid_", transformations: undefined }, { fieldID: "label_", type: "=", sourceFieldID: "label_", transformations: undefined }, { fieldID: "score_", type: "=", sourceFieldID: "score_", transformations: undefined }, { fieldID: "cluster_score_", type: "=", sourceFieldID: "cluster_score_", transformations: undefined }, { fieldID: "cl_impact_weight_", type: "=", sourceFieldID: "cl_impact_weight_", transformations: undefined }]))
    .chartPanel(viz.HighRiskElements)
    .on("selectionChanged", () => {
        ElementStats.refresh();
    }, true)
    ;
ec.append(HighRiskElements);

const ElementStats = new marshaller.Element(ec)
    .id("ElementStats")
    .pipeline([
        data.Ins5191838_dsOutput1_View_IdentityStats
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "label", transformations: undefined }, { fieldID: "field", type: "=", sourceFieldID: "field", transformations: undefined }, { fieldID: "value", type: "=", sourceFieldID: "value", transformations: undefined }, { fieldID: "indicatortype", type: "=", sourceFieldID: "indicatortype", transformations: undefined }, { fieldID: "indicatordescription", type: "=", sourceFieldID: "indicatordescription", transformations: undefined }, { fieldID: "fieldtype", type: "=", sourceFieldID: "fieldtype", transformations: undefined }, { fieldID: "risklevel", type: "=", sourceFieldID: "risklevel", transformations: undefined }]))
    .chartPanel(viz.ElementStats)
    .on("selectionChanged", () => {

    }, true)
    ;
ec.append(ElementStats);

const ClusterStatsFORM = new marshaller.Element(ec)
    .id("ClusterStatsFORM")
    .pipeline([
        data.ClusterStatsFORM
    ])
    .mappings(new marshaller.Mappings().transformations([]))
    .chartPanel(viz.ClusterStatsFORM)
    .on("selectionChanged", () => {
        ClusterStats.refresh();
    }, true)
    ;
ec.append(ClusterStatsFORM);

const ClusterStats = new marshaller.Element(ec)
    .id("ClusterStats")
    .pipeline([
        data.Ins5191838_dsOutput1_View_ClusterStats
    ])
    .mappings(new marshaller.Mappings().transformations([{ fieldID: "label", type: "=", sourceFieldID: "label", transformations: undefined }, { fieldID: "value", type: "=", sourceFieldID: "value", transformations: undefined }, { fieldID: "field", type: "=", sourceFieldID: "field", transformations: undefined }, { fieldID: "indicatortype", type: "=", sourceFieldID: "indicatortype", transformations: undefined }, { fieldID: "indicatordescription", type: "=", sourceFieldID: "indicatordescription", transformations: undefined }, { fieldID: "risklevel", type: "=", sourceFieldID: "risklevel", transformations: undefined }, { fieldID: "fieldtype", type: "=", sourceFieldID: "fieldtype", transformations: undefined }]))
    .chartPanel(viz.ClusterStats)
    .on("selectionChanged", () => {

    }, true)
    ;
ec.append(ClusterStats);

const govottocustomerdash1FORM = new marshaller.Element(ec)
    .id("govottocustomerdash1FORM")
    .pipeline([
        data.govottocustomerdash1FORM
    ])
    .mappings(new marshaller.Mappings().transformations([]))
    .chartPanel(viz.govottocustomerdash1FORM)
    .on("selectionChanged", () => {
        Pattern1.refresh();
        Pattern2.refresh();
        Pattern3.refresh();
        Pattern4.refresh();
        Pattern5.refresh();
        TopClusters.refresh();
        HighRiskIdentities.refresh();
        IdentityStats.refresh();
        ElementType.refresh();
        HighRiskElements.refresh();
        ElementStats.refresh();
        ClusterStats.refresh();
    }, true)
    ;
ec.append(govottocustomerdash1FORM);

ec.refresh();

//  Optional  ---
const errors = ec.validate();
for (const error of errors) {
    console.error(error.elementID + " (" + error.source + "):  " + error.msg);
}

export const dashboard = new marshaller.Dashboard(ec)
    .target("placeholder")
    .render(w => {
        (w as marshaller.Dashboard)
            .layout({ main: { type: "split-area", orientation: "vertical", children: [{ type: "tab-area", widgets: [{ __id: "Pattern4" }, { __id: "Pattern5" }, { __id: "Pattern3" }, { __id: "Pattern2" }, { __id: "Pattern1" }], currentIndex: 4 }, { type: "tab-area", widgets: [{ __id: "TopClusters" }, { __id: "HighRiskIdentities" }], currentIndex: 1 }, { type: "tab-area", widgets: [{ __id: "IdentityStats" }, { __id: "ElementType" }], currentIndex: 1 }, { type: "tab-area", widgets: [{ __id: "HighRiskElements" }], currentIndex: 0 }, { type: "tab-area", widgets: [{ __id: "ElementStats" }, { __id: "ClusterStats" }], currentIndex: 1 }, { type: "tab-area", widgets: [{ __id: "ClusterStatsFORM" }], currentIndex: 0 }, { type: "tab-area", widgets: [{ __id: "govottocustomerdash1FORM" }], currentIndex: 0 }], sizes: [0.14285714285714285, 0.14285714285714285, 0.14285714285714285, 0.14285714285714285, 0.14285714285714285, 0.14285714285714285, 0.14285714285714285] } })
            .hideSingleTabs(true)
            ;
    })
    ;

// @ts-ignore
const ddl = { "version": "0.0.24", "datasources": [{ "type": "hipie", "id": "Ins5191838_dsOutput1", "url": "http://10.241.100.157:8002", "querySet": "roxie", "queryID": "carmigjx_govottocustomerdash1.Ins5191838_Service_1", "inputs": [{ "id": "cl_high_risk_pattern1_flag_", "type": "number" }, { "id": "customer_id_", "type": "number" }, { "id": "industry_type_", "type": "number" }, { "id": "cl_high_risk_pattern4_flag_", "type": "number" }, { "id": "cl_high_risk_pattern5_flag_", "type": "number" }, { "id": "cl_high_risk_pattern2_flag_", "type": "number" }, { "id": "cl_high_risk_pattern3_flag_", "type": "number" }, { "id": "entity_context_uid_", "type": "string" }, { "id": "entity_type_", "type": "number" }, { "id": "indicatordescription", "type": "string" }], "outputs": { "View_Pattern1": { "fields": [{ "id": "cl_high_risk_pattern1_flag_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_Pattern2": { "fields": [{ "id": "cl_high_risk_pattern2_flag_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_Pattern3": { "fields": [{ "id": "cl_high_risk_pattern3_flag_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_Pattern4": { "fields": [{ "id": "cl_high_risk_pattern4_flag_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_Pattern5": { "fields": [{ "id": "cl_high_risk_pattern5_flag_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_TopClusters": { "fields": [{ "id": "entity_context_uid_", "type": "string" }, { "id": "label_", "type": "string" }, { "id": "cl_event_count_", "type": "number" }, { "id": "cl_identity_count_", "type": "number" }, { "id": "cl_impact_weight_", "type": "number" }, { "id": "cl_identity_count_percentile_", "type": "number" }, { "id": "cl_event_count_percentile_", "type": "number" }] }, "View_HighRiskIdentities": { "fields": [{ "id": "entity_context_uid_", "type": "string" }, { "id": "label_", "type": "string" }, { "id": "score_", "type": "number" }, { "id": "cluster_score_", "type": "number" }, { "id": "cl_impact_weight_", "type": "number" }] }, "View_IdentityStats": { "fields": [{ "id": "label", "type": "string" }, { "id": "value", "type": "string" }, { "id": "field", "type": "string" }, { "id": "indicatortype", "type": "string" }, { "id": "indicatordescription", "type": "string" }, { "id": "fieldtype", "type": "string" }, { "id": "risklevel", "type": "number" }] }, "View_ElementType": { "fields": [{ "id": "entity_type_", "type": "number" }, { "id": "base_count", "type": "number" }] }, "View_HighRiskElements": { "fields": [{ "id": "entity_context_uid_", "type": "string" }, { "id": "label_", "type": "string" }, { "id": "score_", "type": "number" }, { "id": "cluster_score_", "type": "number" }, { "id": "cl_impact_weight_", "type": "number" }] }, "View_ClusterStats": { "fields": [{ "id": "indicatordescription", "type": "string" }, { "id": "label", "type": "string" }, { "id": "value", "type": "string" }, { "id": "field", "type": "string" }, { "id": "indicatortype", "type": "string" }, { "id": "risklevel", "type": "number" }, { "id": "fieldtype", "type": "string" }] } } }, { "type": "form", "id": "ClusterStatsFORM", "fields": [{ "id": "indicatordescription", "type": "string", "default": "Cluster" }] }, { "type": "form", "id": "govottocustomerdash1FORM", "fields": [{ "id": "customer_id_", "type": "string", "default": "248283691" }, { "id": "industry_type_", "type": "string", "default": "1292" }] }], "dataviews": [{ "id": "Pattern1", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_Pattern1" }, "activities": [], "visualization": { "id": "Pattern1", "title": "Pattern 1", "description": "", "chartType": "Pie", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "cl_high_risk_pattern1_flag_" }, { "fieldID": "weight", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/chart", "className": "Pie", "properties": {} } }, { "id": "Pattern2", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "Pattern1", "remoteFieldID": "cl_high_risk_pattern1_flag_", "localFieldID": "cl_high_risk_pattern1_flag_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_Pattern2" }, "activities": [], "visualization": { "id": "Pattern2", "title": "Pattern 2", "description": "", "chartType": "Pie", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "cl_high_risk_pattern2_flag_" }, { "fieldID": "weight", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/chart", "className": "Pie", "properties": {} } }, { "id": "Pattern3", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "Pattern1", "remoteFieldID": "cl_high_risk_pattern1_flag_", "localFieldID": "cl_high_risk_pattern1_flag_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_Pattern3" }, "activities": [], "visualization": { "id": "Pattern3", "title": "Pattern 3", "description": "", "chartType": "Pie", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "cl_high_risk_pattern3_flag_" }, { "fieldID": "weight", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/chart", "className": "Pie", "properties": {} } }, { "id": "Pattern4", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "Pattern1", "remoteFieldID": "cl_high_risk_pattern1_flag_", "localFieldID": "cl_high_risk_pattern1_flag_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_Pattern4" }, "activities": [], "visualization": { "id": "Pattern4", "title": "Pattern 4", "description": "", "chartType": "Pie", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "cl_high_risk_pattern4_flag_" }, { "fieldID": "weight", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/chart", "className": "Pie", "properties": {} } }, { "id": "Pattern5", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "Pattern1", "remoteFieldID": "cl_high_risk_pattern1_flag_", "localFieldID": "cl_high_risk_pattern1_flag_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_Pattern5" }, "activities": [], "visualization": { "id": "Pattern5", "title": "Pattern 5", "description": "", "chartType": "Pie", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "cl_high_risk_pattern5_flag_" }, { "fieldID": "weight", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/chart", "className": "Pie", "properties": {} } }, { "id": "TopClusters", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "Pattern1", "remoteFieldID": "cl_high_risk_pattern1_flag_", "localFieldID": "cl_high_risk_pattern1_flag_" }, { "source": "Pattern2", "remoteFieldID": "cl_high_risk_pattern2_flag_", "localFieldID": "cl_high_risk_pattern2_flag_" }, { "source": "Pattern3", "remoteFieldID": "cl_high_risk_pattern3_flag_", "localFieldID": "cl_high_risk_pattern3_flag_" }, { "source": "Pattern4", "remoteFieldID": "cl_high_risk_pattern4_flag_", "localFieldID": "cl_high_risk_pattern4_flag_" }, { "source": "Pattern5", "remoteFieldID": "cl_high_risk_pattern5_flag_", "localFieldID": "cl_high_risk_pattern5_flag_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_TopClusters" }, "activities": [{ "type": "sort", "conditions": [{ "fieldID": "cl_impact_weight_", "descending": true }] }, { "type": "limit", "limit": 200 }], "visualization": { "id": "TopClusters", "title": "Top Clusters", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "entity_context_uid_", "type": "=", "sourceFieldID": "entity_context_uid_" }, { "fieldID": "label_", "type": "=", "sourceFieldID": "label_" }, { "fieldID": "cl_event_count_", "type": "=", "sourceFieldID": "cl_event_count_" }, { "fieldID": "cl_identity_count_", "type": "=", "sourceFieldID": "cl_identity_count_" }, { "fieldID": "cl_impact_weight_", "type": "=", "sourceFieldID": "cl_impact_weight_" }, { "fieldID": "cl_identity_count_percentile_", "type": "=", "sourceFieldID": "cl_identity_count_percentile_" }, { "fieldID": "cl_event_count_percentile_", "type": "=", "sourceFieldID": "cl_event_count_percentile_" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "HighRiskIdentities", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_HighRiskIdentities" }, "activities": [{ "type": "sort", "conditions": [{ "fieldID": "cluster_score_", "descending": true }, { "fieldID": "cl_impact_weight_", "descending": true }] }, { "type": "limit", "limit": 200 }], "visualization": { "id": "HighRiskIdentities", "title": "High Risk Identities", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "entity_context_uid_", "type": "=", "sourceFieldID": "entity_context_uid_" }, { "fieldID": "label_", "type": "=", "sourceFieldID": "label_" }, { "fieldID": "score_", "type": "=", "sourceFieldID": "score_" }, { "fieldID": "cluster_score_", "type": "=", "sourceFieldID": "cluster_score_" }, { "fieldID": "cl_impact_weight_", "type": "=", "sourceFieldID": "cl_impact_weight_" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "IdentityStats", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "HighRiskIdentities", "remoteFieldID": "entity_context_uid_", "localFieldID": "entity_context_uid_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_IdentityStats" }, "activities": [], "visualization": { "id": "IdentityStats", "title": "Identity Stats", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "label" }, { "fieldID": "value", "type": "=", "sourceFieldID": "value" }, { "fieldID": "field", "type": "=", "sourceFieldID": "field" }, { "fieldID": "indicatortype", "type": "=", "sourceFieldID": "indicatortype" }, { "fieldID": "indicatordescription", "type": "=", "sourceFieldID": "indicatordescription" }, { "fieldID": "fieldtype", "type": "=", "sourceFieldID": "fieldtype" }, { "fieldID": "risklevel", "type": "=", "sourceFieldID": "risklevel" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "ElementType", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_ElementType" }, "activities": [], "visualization": { "id": "ElementType", "title": "Element Type", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "entity_type_", "type": "=", "sourceFieldID": "entity_type_" }, { "fieldID": "rowcount", "type": "=", "sourceFieldID": "base_count" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "HighRiskElements", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "ElementType", "remoteFieldID": "entity_type_", "localFieldID": "entity_type_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_HighRiskElements" }, "activities": [{ "type": "sort", "conditions": [{ "fieldID": "score_", "descending": true }, { "fieldID": "cl_impact_weight_", "descending": true }] }, { "type": "limit", "limit": 200 }], "visualization": { "id": "HighRiskElements", "title": "High Risk Elements", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "entity_context_uid_", "type": "=", "sourceFieldID": "entity_context_uid_" }, { "fieldID": "label_", "type": "=", "sourceFieldID": "label_" }, { "fieldID": "score_", "type": "=", "sourceFieldID": "score_" }, { "fieldID": "cluster_score_", "type": "=", "sourceFieldID": "cluster_score_" }, { "fieldID": "cl_impact_weight_", "type": "=", "sourceFieldID": "cl_impact_weight_" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "ElementStats", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "HighRiskElements", "remoteFieldID": "entity_context_uid_", "localFieldID": "entity_context_uid_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_IdentityStats" }, "activities": [], "visualization": { "id": "ElementStats", "title": "Element Stats", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "label" }, { "fieldID": "field", "type": "=", "sourceFieldID": "field" }, { "fieldID": "value", "type": "=", "sourceFieldID": "value" }, { "fieldID": "indicatortype", "type": "=", "sourceFieldID": "indicatortype" }, { "fieldID": "indicatordescription", "type": "=", "sourceFieldID": "indicatordescription" }, { "fieldID": "fieldtype", "type": "=", "sourceFieldID": "fieldtype" }, { "fieldID": "risklevel", "type": "=", "sourceFieldID": "risklevel" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "ClusterStatsFORM", "datasource": { "id": "ClusterStatsFORM" }, "activities": [], "visualization": { "id": "ClusterStatsFORM", "title": "Cluster Stats", "description": "", "chartType": "FieldForm", "mappings": { "type": "mappings", "transformations": [] }, "moduleName": "@hpcc-js/form", "className": "FieldForm", "properties": { "allowEmptyRequest": true } } }, { "id": "ClusterStats", "datasource": { "id": "Ins5191838_dsOutput1", "request": [{ "source": "TopClusters", "remoteFieldID": "entity_context_uid_", "localFieldID": "entity_context_uid_" }, { "source": "ClusterStatsFORM", "remoteFieldID": "indicatordescription", "localFieldID": "indicatordescription" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "customer_id_", "localFieldID": "customer_id_" }, { "source": "govottocustomerdash1FORM", "remoteFieldID": "industry_type_", "localFieldID": "industry_type_" }], "output": "View_ClusterStats" }, "activities": [], "visualization": { "id": "ClusterStats", "title": "Cluster Stats", "description": "", "chartType": "Table", "mappings": { "type": "mappings", "transformations": [{ "fieldID": "label", "type": "=", "sourceFieldID": "label" }, { "fieldID": "value", "type": "=", "sourceFieldID": "value" }, { "fieldID": "field", "type": "=", "sourceFieldID": "field" }, { "fieldID": "indicatortype", "type": "=", "sourceFieldID": "indicatortype" }, { "fieldID": "indicatordescription", "type": "=", "sourceFieldID": "indicatordescription" }, { "fieldID": "risklevel", "type": "=", "sourceFieldID": "risklevel" }, { "fieldID": "fieldtype", "type": "=", "sourceFieldID": "fieldtype" }] }, "moduleName": "@hpcc-js/dgrid", "className": "Table", "properties": {} } }, { "id": "govottocustomerdash1FORM", "datasource": { "id": "govottocustomerdash1FORM" }, "activities": [], "visualization": { "id": "govottocustomerdash1FORM", "title": "Gov-Otto-CustomerDash1 Filter", "description": "", "chartType": "FieldForm", "mappings": { "type": "mappings", "transformations": [] }, "moduleName": "@hpcc-js/form", "className": "FieldForm", "properties": { "allowEmptyRequest": true } } }] };
