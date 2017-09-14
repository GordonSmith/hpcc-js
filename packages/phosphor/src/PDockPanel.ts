import { Persist } from "@hpcc-js/other";
import { DockLayout, DockPanel, each, TabBar, Widget } from "@hpcc-js/phosphor-shim";
import { WidgetAdapter } from "./WidgetAdapter";

export class PRenderer extends DockPanel.Renderer {
    _owner: PDockPanel;

    constructor() {
        super();
    }

    createTabBar(): TabBar<Widget> {
        const bar = super.createTabBar();
        bar.tabsMovable = this._owner.tabsMovable;
        return bar;
    }
}

export class PDockPanel extends DockPanel {
    private _tabsMovable: boolean;
    get tabsMovable(): boolean {
        return this._tabsMovable;
    }
    set tabsMovable(value: boolean) {
        this._tabsMovable = value;
        each(this.tabBars(), tabbar => tabbar.tabsMovable = value);
    }

    constructor(options: DockPanel.IOptions = {}) {
        options.renderer = options.renderer || new PRenderer();
        super(options);
        if (this["_renderer"] instanceof PRenderer) {
            this["_renderer"]._owner = this;
        }
        this._tabsMovable = true;
    }

    static createPDockPanel(options: DockPanel.IOptions = {}) {
        //  This works, but would be preferable to be able to do it in the constructor.
        const renderer = new PRenderer();
        const retVal = new PDockPanel({ renderer });
        renderer._owner = retVal;
        return retVal;
    }

    serializeWidget(widget: Widget): object {
        if (widget instanceof WidgetAdapter) {
            return Persist.serializeToObject(widget.widget);
        }
        return null;
    }

    deserializeWidget(layout: object): WidgetAdapter {
        return new WidgetAdapter(undefined, layout);
    }

    serializeITabAreaConfig(config: DockLayout.ITabAreaConfig, deserialize: boolean): DockLayout.ITabAreaConfig {
        return {
            ...config,
            widgets: config.widgets.map(widget => deserialize ? this.deserializeWidget(widget) : this.serializeWidget(widget) as any)
        };
    }

    serializeISplitAreaConfig(config: DockLayout.ISplitAreaConfig, deserialize: boolean): DockLayout.ISplitAreaConfig {
        return {
            ...config,
            children: config.children.map(child => this.serializeAreaConfig(child, deserialize))
        };
    }

    serializeAreaConfig(config: DockLayout.AreaConfig, deserialize: boolean): DockLayout.AreaConfig {
        if (config) {
            switch (config.type) {
                case "tab-area":
                    return this.serializeITabAreaConfig(config, deserialize);
                case "split-area":
                    return this.serializeISplitAreaConfig(config, deserialize);
            }
        }
        return undefined;
    }

    saveLayout(): DockLayout.ILayoutConfig {
        return {
            main: this.serializeAreaConfig(super.saveLayout().main, false)
        };
    }

    restoreLayout(config: DockLayout.ILayoutConfig) {
        return super.restoreLayout({
            main: this.serializeAreaConfig(config.main, true)
        });
    }
}
