import { Area, Bubble, Column, Contour, HexBin, Line, Pie, Scatter, Step, WordCloud } from "@hpcc-js/chart";
import { Database, EntityRectList, InputField, PropertyExt, publish, publishProxy, Widget } from "@hpcc-js/common";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { Table } from "@hpcc-js/dgrid";
import { FieldForm } from "@hpcc-js/form";
import { ChartPanel } from "@hpcc-js/layout";
import { ChoroplethCounties, ChoroplethStates } from "@hpcc-js/map";
import { List, Map } from "immutable";
import { HipiePipeline } from "../activities/hipiepipeline";
import { ComputedField, Mappings, MultiField } from "../activities/project";

export type VizType = "Table" | "FieldForm" | "Area" | "Bubble" | "Column" | "Contour" | "HexBin" | "Line" | "Pie" | "WordCloud" | "Scatter" | "Step" | "ChoroplethCounties" | "ChoroplethStates" | "EntityRectList";
const VizTypeMap: { [key: string]: { new(...args: any[]): {} } } = { Table, FieldForm, Area, Bubble, Column, Contour, HexBin, Line, Pie, Scatter, Step, WordCloud, ChoroplethCounties, ChoroplethStates, EntityRectList };
export const VizTypeSet = [];
for (const key in VizTypeMap) {
    VizTypeSet.push(key);
}

function typeClass(type: VizType): any {
    const retVal = VizTypeMap[type];
    return retVal || Table;
}

function typeNew(type: VizType): Widget {
    const retVal = VizTypeMap[type];
    return new (retVal || Table)() as Widget;
}

function typeInputs(type: VizType): InputField[] {
    return typeClass(type).__inputs || [];
}

export class Visualization extends PropertyExt {
    @publish("Table", "set", "Type", VizTypeSet)
    _chartType: VizType;
    chartType(): VizType;
    chartType(_: VizType, props?: { [prop: string]: any }): this;
    chartType(_?: VizType, props?: { [prop: string]: any }): VizType | this {
        if (!arguments.length) return this._chartType;
        if (VizTypeSet.indexOf(_) === -1) {
            _ = "Table";
        }
        this._chartType = _;
        this.typeChanged();
        if (props) {
            const widget = this.chartPanel().widget();
            for (const prop in props) {
                if (typeof widget[prop] === "function") {
                    widget[prop](props[prop]);
                }
            }
        }
        return this;
    }
    @publish(null, "widget", "Mappings", undefined, { render: false })
    mappings: publish<this, Mappings>;
    @publish([], "widget", "Widget")
    _chartPanel: ChartPanel;
    chartPanel(): ChartPanel;
    chartPanel(_: ChartPanel): this;
    chartPanel(_?: ChartPanel): ChartPanel | this {
        if (!arguments.length) return this._chartPanel;
        this._chartPanel = _;
        this._chartPanel
            .on("click", (row: any, col: string, sel: boolean) => this.click(row, col, sel))
            .on("vertex_click", (row: any, col: string, sel: boolean) => this.vertex_click(row, col, sel))
            ;
        return this;
    }

    @publishProxy("_chartPanel")
    title: publish<this, string>;
    @publishProxy("_chartPanel")
    description: publish<this, string>;

    protected _hipiePipeline: HipiePipeline;
    constructor(hipiePipeline: HipiePipeline) {
        super();
        this._hipiePipeline = hipiePipeline;
        this.mappings(new Mappings());
        this.chartPanel(new ChartPanel());
        this.typeChanged();
    }

    _prevChartType;
    typeChanged() {
        if (this._prevChartType !== this._chartType) {
            this._prevChartType = this._chartType;
            this.refreshMappings();
            const chart = typeNew(this._chartType);
            this.chartPanel().widget(chart);
        }
    }

    properties(): DDL2.IWidgetProperties;
    properties(_: DDL2.IWidgetProperties): this;
    properties(_?: DDL2.IWidgetProperties): DDL2.IWidgetProperties | this {
        if (!arguments.length) return this.chartPanel().widget().serialize();
        this.chartPanel().widget().deserialize(_);
        return this;
    }

    refreshMappings(): this {
        const mappings = this.mappings();
        mappings.sourceActivity(this._hipiePipeline);
        // const cfs = mappings.validComputedFields();
        const inFields = mappings.inFields();
        const taken = {};
        mappings.computedFields(typeInputs(this._chartType).map((input, idx) => {
            let retVal: MultiField | ComputedField; // = cfs[idx];
            if (retVal) {
                if (retVal instanceof MultiField) {
                } else {
                    retVal.label(input.id);
                }
            } else {
                if (input.multi) {
                    retVal = new MultiField()
                        .owner(mappings)
                        .label(input.id)
                        ;
                    const computedFields: ComputedField[] = [];
                    inFields.forEach(inField => {
                        if ((input.type === "any" || input.type === inField.type) && !taken[inField.id]) {
                            taken[inField.id] = true;
                            computedFields.push(new ComputedField()
                                .label(inField.id)
                                .type("=")
                                .column1(inField.id)
                            );
                        }
                    });
                    retVal.multiFields(computedFields);
                } else {
                    retVal = new ComputedField()
                        .owner(mappings)
                        .label(input.id)
                        .type("=")
                        ;
                    inFields.forEach(inField => {
                        if ((input.type === "any" || input.type === inField.type) && !taken[inField.id]) {
                            taken[inField.id] = true;
                            (retVal as ComputedField).column1(inField.id);
                            return false;
                        }
                    });
                }
            }
            return retVal;
        }));
        return this;
    }

    _prevFields: List<DDL2.IField> = List();
    _prevData: List<any> = List();
    refreshData(): this {
        const mappings = this.mappings();
        const newFields = mappings.outFields();
        if (!this._prevFields.equals(newFields)) {
            this._prevFields = newFields;
            const fields = this.toDBFields(newFields.toJS());
            this.chartPanel().fields(fields.filter(f => f.id() !== "__lparam"));
        } else {
            console.log(`${this.id()} Immutable Fields!`);
        }
        const data: List<Map<any, any>> = mappings.outData();
        if (!this._prevData.equals(data)) {
            this._prevData = data;
            const fields = this.chartPanel().fields();
            const mappedData = this.toDBData(fields, data.toJS());
            this.chartPanel().data(mappedData);
        } else {
            console.log(`${this.id()} Immutable Data!`);
        }
        this.chartPanel()
            .render()
            ;
        return this;
    }

    toDBFields(fields: DDL2.IField[]): Database.Field[] {
        const retVal: Database.Field[] = [];
        for (const field of fields) {
            const f = new Database.Field()
                .id(field.id)
                .label(field.id)
                ;
            if (field.children) {
                f.children(this.toDBFields(field.children));
            }
            retVal.push(f);
        }
        return retVal;
    }

    toDBData(fields: Database.Field[], data: object[]) {
        return data.map((row: any) => {
            const retVal = [];
            for (const field of fields) {
                if (field.type() === "nested") {
                    retVal.push(this.toDBData(field.children() as Database.Field[], row[field.id()].Row || row[field.id()]));
                } else {
                    retVal.push(row[field.label()]);
                }
            }
            return retVal;
        });
    }

    refresh(): Promise<void> {
        //        if (this.chartPanel().renderCount()) {
        this.chartPanel().startProgress && this.chartPanel().startProgress();
        //        }
        const mappings = this.mappings();
        mappings.sourceActivity(this._hipiePipeline);
        return mappings.refreshMeta().then(() => {
            return mappings.exec();
        }).then(() => {
            //        if (this.chartPanel().renderCount()) {
            this.refreshData();
            this.chartPanel().finishProgress && this.chartPanel().finishProgress();
            //        }
        });
    }

    //  Events  ---
    click(row: any, col: string, sel: boolean) {
    }
    vertex_click(row: any, col: string, sel: boolean) {
    }
}
Visualization.prototype._class += " Visualization";

const filter = (field, value) => (data: object[]) => data.filter((row) => row[field] === value);
const testFilter = filter("a", 20);
const project = (newField) => (data: object[]) => data.map((row) => { row[newField] = ""; return row; });
const testProject = project("b");

const data = [{ a: 10 }, { a: 20 }, { a: 30 }];
console.log([testFilter, testProject].reduce((acc, itm) => itm(acc), data));
console.log(testProject(testFilter([{ a: 10 }, { a: 20 }, { a: 30 }])));

type AggregateFn<T> = (...args: T[]) => T;

interface CurryFn<T> extends AggregateFn<T> {
    (...args: T[]): CurryFn<T>;
}

function curry<T>(f: AggregateFn<T>): CurryFn<T> {
    return (...args: any[]): CurryFn<any> | any => {
        if (args.length)
            return curry(f.bind.apply(f, [undefined].concat(args)));
        return f();
    };
}

function sum(a: number, b: number): number {
    return a + b;
}

export const curriedSum = curry(sum);
const sum10 = curriedSum(10);
const test = sum10(11);

console.log(test(22)());

function addNumbers(...args: number[]): number {
    return args.reduce((acc, itm) => acc += itm, 0);
}

export const curriedAdd = curry(addNumbers);
