import { SVGWidget } from "./SVGWidget";
import { TextBox } from "./TextBox";
import "css!./List.css";

export class List extends SVGWidget {
    static _class = "common_List";

    protected _listWidgets = {};

    constructor() {
        super();
    }

    update(domNode, element) {
        super.update(domNode, element);
        var context = this;

        var line = element.selectAll(".line").data(this.data(), function (d) { return d; });
        line.enter().append("g")
            .attr("class", "line")
            .each(function (d) {
                var newTextBox = new TextBox()
                    .target(this)
                    .paddingTop(0)
                    .paddingBottom(0)
                    .paddingLeft(8)
                    .paddingRight(8)
                    .text(d)
                    .render()
                    ;
                newTextBox.element()
                    .on("click", function (d) {
                        context.click(d.text());
                    })
                    .on("dblclick", function (d) {
                        context.dblclick(d.text());
                    })
                    ;
                context._listWidgets[d] = newTextBox;
            })
            ;

        var listHeight = 0;
        var listWidth = 0;
        var listCount = 0;
        for (var key in this._listWidgets) {
            if (!this._listWidgets.hasOwnProperty(key)) continue;
            var bbox = this._listWidgets[key].getBBox();
            listHeight += bbox.height;
            if (listWidth < bbox.width)
                listWidth = bbox.width;
            ++listCount;
        }

        var yPos = -listHeight / 2; // + lineHeight / 2;
        line.each(function (d) {
            var widget = context._listWidgets[d];
            var bbox = widget.getBBox();
            widget
                .pos({ x: 0, y: yPos + bbox.height / 2 })
                .anchor(context.anchor())
                .fixedSize({ width: listWidth, height: bbox.height })
                .render()
                ;
            yPos += bbox.height;
        });
        line.exit()
            .remove()
            .each(function (d) {
                context._listWidgets[d].target(null);
                delete context._listWidgets[d];
            })
            ;
    };

    exit(domNode, element) {
        for (var key in this._listWidgets) {
            this._listWidgets[key].target(null);
        }
        super.exit(domNode, element);
    };

    //  Events  ---
    click(d) {
        console.log("Click:  " + d);
    };

    dblclick(d) {
        console.log("Double click:  " + d);
    };

    anchor: { (): string; (_: string): List; }
}
List.prototype.publish("anchor", "start", "set", "Anchor Position", ["", "start", "middle", "end"], { tags: ["Private"] });

