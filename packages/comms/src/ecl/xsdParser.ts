import { SAXStackParser, Stack, XMLNode } from "@hpcc-js/util";

export class XSDNode {
    protected e?: XMLNode;

    constructor(e: XMLNode) {
        this.e = e;
    }
    fix() {
        delete this.e;
    }
}

export class XSDXMLNode extends XSDNode {
    name: string;
    type: string;
    private _children: XSDXMLNode[] = [];

    constructor(e: XMLNode) {
        super(e);
    }

    append(child: XSDXMLNode) {
        this._children.push(child);
        if (!this.type) {
            this.type = "hpcc:childDataset";
        }
    }

    fix() {
        this.name = this.e!.$["name"];
        this.type = this.e!.$["type"];
        for (let i = this._children.length - 1; i >= 0; --i) {
            const row = this._children[i];
            if (row.name === "Row" && row.type === undefined) {
                this._children.push(...row._children);
                this._children.splice(i, 1);
            }
        }
        super.fix();
    }

    children(): XSDXMLNode[] {
        return this._children;
    }

    charWidth() {
        let retVal: number = -1;

        switch (this.type) {
            case "xs:boolean":
                retVal = 5;
                break;
            case "xs:integer":
                retVal = 8;
                break;
            case "xs:nonNegativeInteger":
                retVal = 8;
                break;
            case "xs:double":
                retVal = 8;
                break;
            case "xs:string":
                retVal = 32;
                break;
            default:
                const numStr: string = "0123456789";
                const underbarPos: number = this.type.lastIndexOf("_");
                const length: number = underbarPos > 0 ? underbarPos : this.type.length;
                let i: number = length - 1;
                for (; i >= 0; --i) {
                    if (numStr.indexOf(this.type.charAt(i)) === -1)
                        break;
                }
                if (i + 1 < length) {
                    retVal = parseInt(this.type.substring(i + 1, length), 10);
                }
                if (this.type.indexOf("data") === 0) {
                    retVal *= 2;
                }
                break;
        }
        if (retVal < this.name.length)
            retVal = this.name.length;

        return retVal;
    }
}

export class XSDSimpleType extends XSDNode {
    name: string;
    type: string;
    maxLength: number;

    protected _restricition?: XMLNode;
    protected _maxLength?: XMLNode;

    constructor(e: XMLNode) {
        super(e);
    }

    append(e: XMLNode) {
        switch (e.name) {
            case "xs:restriction":
                this._restricition = e;
                break;
            case "xs:maxLength":
                this._maxLength = e;
                break;
            default:
        }
    }

    fix() {
        this.name = this.e!.$["name"];
        this.type = this._restricition!.$["base"];
        this.maxLength = +this._maxLength!.$["value"];
        delete this._restricition;
        delete this._maxLength;
        super.fix();
    }
}

export class XSDSchema {
    root: XSDXMLNode;
    simpleTypes: { [name: string]: XSDSimpleType } = {};

    fields(): XSDXMLNode[] {
        return this.root.children();

    }
}

class XSDParser extends SAXStackParser {
    schema: XSDSchema = new XSDSchema();
    simpleType: XSDSimpleType;
    simpleTypes: { [name: string]: XSDSimpleType } = {};

    xsdStack: Stack<XSDXMLNode> = new Stack<XSDXMLNode>();

    startXMLNode(node: Node): XMLNode {
        const e = super.startXMLNode(node);
        switch (e.name) {
            case "xs:element":
                const xsdXMLNode = new XSDXMLNode(e);
                if (!this.schema.root) {
                    this.schema.root = xsdXMLNode;
                } else if (this.xsdStack.depth()) {
                    this.xsdStack.top()!.append(xsdXMLNode);
                }
                this.xsdStack.push(xsdXMLNode);
                break;
            case "xs:simpleType":
                this.simpleType = new XSDSimpleType(e);
                break;
            default:
                break;
        }
        return e;
    }

    endXMLNode(node: Node): XMLNode {
        const e = this.stack.top();
        switch (e!.name) {
            case "xs:element":
                const xsdXMLNode = this.xsdStack.pop();
                xsdXMLNode!.fix();
                break;
            case "xs:simpleType":
                this.simpleType.fix();
                this.simpleTypes[this.simpleType.name] = this.simpleType;
                delete this.simpleType;
                break;
            default:
                if (this.simpleType) {
                    this.simpleType.append(e!);
                }
        }
        return super.endXMLNode(node);
    }
}

export function parseXSD(xml: string): XSDSchema {
    const saxParser = new XSDParser();
    saxParser.parse(xml);
    return saxParser.schema;
}
