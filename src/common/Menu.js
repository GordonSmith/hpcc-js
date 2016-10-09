var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "./SVGWidget", "./IMenu", "./Icon", "./List", "css!./Menu"], function (require, exports, d3, SVGWidget_1, IMenu_1, Icon_1, List_1) {
    "use strict";
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            _super.call(this);
            IMenu_1.IMenu.call(this);
            this._icon = new Icon_1.Icon()
                .shape("square")
                .diameter(14);
            this._list = new List_1.List();
            var context = this;
            this._list.click = function (d) {
                d3.event.stopPropagation();
                context.hideMenu();
                context.click(d);
            };
            this._open = false;
        }
        return Menu;
    }(SVGWidget_1.SVGWidget));
    exports.Menu = Menu;
    Menu.prototype._class += " common_Menu";
    Menu.prototype.implements(IMenu_1.IMenu.prototype);
    Menu.prototype.publishProxy("faChar", "_icon", null, "\uf0c9");
    Menu.prototype.publishProxy("paddingPercent", "_icon", null, 10);
    Menu.prototype.toggleMenu = function () {
        if (!this._open) {
            this.showMenu();
        }
        else {
            this.hideMenu();
        }
    };
    Menu.prototype.showMenu = function () {
        this.preShowMenu();
        this._open = true;
        this._list
            .data(this.data())
            .render();
        var bbox = this._icon.getBBox(true);
        var menuBBox = this._list.getBBox(true);
        var pos = {
            x: bbox.width / 2 - menuBBox.width / 2,
            y: bbox.height / 2 + menuBBox.height / 2
        };
        this._list
            .move(pos);
        var context = this;
        d3.select("body")
            .on("click." + this._id, function () {
            console.log("click:  body - " + context._id);
            if (context._open) {
                context.hideMenu();
            }
        });
    };
    Menu.prototype.hideMenu = function () {
        d3.select("body")
            .on("click." + this._id, null);
        this._open = false;
        this._list
            .data([])
            .render();
        this.postHideMenu();
    };
    Menu.prototype.enter = function (domNode, element) {
        SVGWidget_1.SVGWidget.prototype.enter.apply(this, arguments);
        this._icon
            .target(domNode)
            .render();
        this._list
            .target(domNode)
            .render();
        var context = this;
        this._icon.element()
            .on("click", function (d) {
            d3.event.stopPropagation();
            context.toggleMenu();
        });
    };
    Menu.prototype.update = function (domNode, element) {
        SVGWidget_1.SVGWidget.prototype.update.apply(this, arguments);
        element
            .classed("disabled", this.data().length === 0);
        this._icon
            .faChar(this.faChar())
            .paddingPercent(this.paddingPercent())
            .render();
    };
    Menu.prototype.exit = function (domNode, element) {
        this._icon
            .target(null);
        this._list
            .target(null);
        SVGWidget_1.SVGWidget.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=Menu.js.map