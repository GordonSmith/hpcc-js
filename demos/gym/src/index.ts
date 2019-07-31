import { Bar, Column, Radar } from "@hpcc-js/chart";
import { Table } from "@hpcc-js/dgrid";
import { CalendarHeatMap } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { AllData, DB, map2arr } from "./db";
import { Exercise, Exercise_Log } from "./db-defs";

export class Main extends DockPanel {

    private allData: AllData;

    private currDateRange: { low: undefined, high: undefined } = { low: undefined, high: undefined };
    private dateRange = new Column()
        .columns(["Date", "Count"])
        .xAxisType("time")
        .yAxisHidden(true)
        .selectionMode(true)
        .xAxisTypeTimePattern("%Y-%m")
        .on("click", (rows: any[]) => {
            this.currDateRange = rows.reduce((prev, row) => {
                if (prev.low === undefined || prev.low > row.Date) {
                    prev.low = row.Date;
                }
                if (prev.high === undefined || prev.high < row.Date) {
                    prev.high = row.Date;
                }
                return prev;
            }, { low: undefined, high: undefined });
            delete this.currEmployee;
            const selData = this.db.calcData(this.employeeID, this.currDateRange.low, this.currDateRange.high, this.employeeID || this.currEmployee);
            this.updateEmployees(selData);
            this.updateData(selData);
        }, true);

    private currEmployee: undefined | number;
    private employees = new Table()
        .columns(["Employee ID", "Attendance"])
        .pagination(false)
        .on("click", (row: any, col: string, sel: boolean) => {
            if (sel && this.db) {
                this.currEmployee = sel ? +row.__lparam[0] : undefined;
                const selData = this.db.calcData(this.employeeID, this.currDateRange.low, this.currDateRange.high, this.currEmployee);
                this.updateData(selData);
            }
        });

    private attendance = new CalendarHeatMap()
        .columns(["Date", "Weight"])
        .dateColumn("Date")
        .aggrType("mean")
        .aggrColumn("Weight");

    private bodyPart = new Radar()
        .columns(["Part", "Count"]);

    private exerciseBar = new Bar()
        .columns(["Label", "Count"])
        ;

    private db: DB;

    private employeeID: number;

    constructor(id?: number) {
        super();
        this.employeeID = id;

        this
            .addWidget(this.dateRange, "Date Range")
            .addWidget(this.exerciseBar, "Exercise", "split-right", this.dateRange)
            .addWidget(this.attendance, "Attendance", "split-bottom", this.dateRange)
            .addWidget(this.bodyPart, "Body Part", "split-bottom", this.attendance)
            ;
        if (!this.employeeID) {
            this
                .addWidget(this.employees, "Employee", "split-right", this.dateRange)
                ;
        }
        const layout: any = this.layout();
        layout.main.sizes = [0.60, 0.40];
        layout.main.children[0].sizes = [0.20, 0.40, 0.40];
        layout.main.children[0].children[0].sizes = [0.60, 0.40];
        this.layout(layout);
    }

    initData(exercise: Exercise, exercise_log: Exercise_Log): this {
        this.db = new DB(exercise, exercise_log);
        this.allData = this.db.calcData(this.employeeID);
        this.updateAllData();
        this.updateData(this.allData);
        return this;
    }

    private updateAllData() {
        this.dateRange.data(map2arr(this.allData.dates)).lazyRender();
    }

    private updateEmployees(data: AllData) {
        this.employees.data(map2arr(data.employee).map(row => ["****", row[1], row])).lazyRender();
    }

    private updateData(data: AllData) {
        this.attendance.data(map2arr(data.attendance)).lazyRender();
        this.bodyPart.data(map2arr(data.exType, this.allData.exType)).lazyRender();
        this.exerciseBar.data(map2arr(data.exName, this.allData.exName)).lazyRender();
    }
}
