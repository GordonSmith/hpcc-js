import { FACharMapping, Palette, SVGWidget, textSize } from "@hpcc-js/common";
import * as React from "@hpcc-js/preact-shim";

interface CircleProps {
    cx?: string;
    cy?: string;
    radius?: number;
    fill?: string;
    stroke?: string;
}

class Circle extends React.Component<CircleProps> {

    static defaultProps: CircleProps = {
        radius: 32,
        fill: "white"
    };

    render() {
        return <circle cx={this.props.cx} cy={this.props.cy} r={this.props.radius} fill={this.props.fill} stroke={this.props.stroke || this.props.fill} />;
    }
}

interface SquareProps {
    radius?: number;
    cornerRadius?: number;
    fill?: string;
    stroke?: string;
}

class Square extends React.Component<SquareProps> {

    static defaultProps: SquareProps = {
        radius: 30,
        cornerRadius: 3,
        fill: "white"
    };

    render() {
        return <rect x={-this.props.radius} y={-this.props.radius} rx={-this.props.cornerRadius} ry={this.props.cornerRadius} width={this.props.radius * 2} height={this.props.radius * 2} fill={this.props.fill} stroke={this.props.stroke || this.props.fill} />;
    }
}

interface RectangleProps {
    y?: number;
    width?: number;
    height?: number;
    cornerRadius?: number;
    fill?: string;
    stroke?: string;
}

class Rectangle extends React.Component<RectangleProps> {

    static defaultProps: RectangleProps = {
        y: 0,
        width: 30,
        height: 30,
        cornerRadius: 3,
        fill: "white",
        stroke: "black"
    };

    render() {
        return <rect x={-this.props.width / 2} y={this.props.y - this.props.height / 2} rx={-this.props.cornerRadius} ry={this.props.cornerRadius} width={this.props.width} height={this.props.height} fill={this.props.fill} stroke={this.props.stroke || this.props.fill} />;
    }
}

interface TextProps {
    x?: number;
    y?: number;
    anchor?: string;
    height?: number;
    fill?: string;
    text: string;
}

class Text extends React.Component<TextProps> {

    static defaultProps: TextProps = {
        y: 0,
        anchor: "middle",
        height: 12,
        fill: "black",
        text: ""
    };

    render() {
        return <text x={this.props.x} y={this.props.y - this.props.height * 3 / 12} fill={this.props.fill} font-size={`${this.props.height}px`} style={`text-anchor: ${this.props.anchor};`} >{this.props.text}</text>;
    }
}

interface TextBoxProps {
    x?: number;
    y?: number;
    anchor?: string;
    height?: number;
    fill?: string;
    text: string;
}

class TextBox extends React.Component<TextBoxProps> {

    static defaultProps: TextBoxProps = {
        y: 0,
        anchor: "middle",
        height: 12,
        fill: "black",
        text: ""
    };

    render() {
        const size = textSize(this.props.text, "Helvetica", 12, false);
        size.width += 4;
        size.height += 4;
        return <>
            <Rectangle y={this.props.y - size.height / 2} width={size.width} height={size.height} stroke="whitesmoke" fill="whitesmoke" />
            <Text y={this.props.y} text={this.props.text} />
        </>;
    }
}

interface FACharProps {
    x?: number;
    y?: number;
    height?: number;
    fill?: string;
    faChar?: string;
}

class FAChar extends React.Component<FACharProps> {

    static defaultProps: FACharProps = {
        y: 0,
        height: 12,
        faChar: ""
    };

    faChar() {
        return this.props.faChar.indexOf("fa-") === 0 ? String.fromCharCode(FACharMapping[this.props.faChar]) : this.props.faChar;
    }

    render() {
        return <text x={this.props.x} y={this.props.y - this.props.height * 3.5 / 12} fill={this.props.fill} font-family="FontAwesome" font-size={`${this.props.height}px`} style="text-anchor: middle;" >{this.faChar()}</text>;
    }
}

interface IconProps {
    shape?: "circle" | "square";
    height?: number;
    fill?: string;
    stroke?: string;
    faChar?: string;
    faCharFill?: string;
}

class Icon extends React.Component<IconProps> {

    static defaultProps: IconProps = {
        shape: "circle",
        height: 128,
        faChar: ""
    };

    shape() {
        if (this.props.shape === "square") {
            return <Square radius={this.props.height / 2} fill={this.props.fill} stroke={this.props.stroke}></Square>;
        }
        return <Circle radius={this.props.height / 2} fill={this.props.fill} stroke={this.props.stroke}></Circle>;
    }

    faCharColor() {
        return this.props.faCharFill || Palette.textColor(this.props.fill || this.props.shape === "square" ? Square.defaultProps.fill : Circle.defaultProps.fill);
    }

    render() {
        const padding = this.props.height / 5;
        return <>
            {this.shape()}
            <FAChar y={this.props.height / 2} height={this.props.height - padding} faChar={this.props.faChar} fill={this.faCharColor()}></FAChar>
        </>;
    }
}

export interface VertexProps {
    x?: number;
    y?: number;
    id: string;
    iconHeight?: number;
    iconFill?: string;
    iconStroke?: string;
    textHeight?: number;
    faChar?: string;
    faCharFill?: string;
    text?: string;
}

export class Vertex extends React.Component<VertexProps> {

    static defaultProps: VertexProps = {
        x: 0,
        y: 0,
        id: "",
        iconHeight: 32,
        iconFill: "transparent",
        textHeight: 12,
        faChar: "",
        text: ""
    };

    render() {
        return <>
            <Icon height={this.props.iconHeight} fill={this.props.iconFill} stroke={this.props.iconStroke} faChar={this.props.faChar} faCharFill={this.props.faCharFill} />
            <TextBox y={this.props.iconHeight / 2 + this.props.textHeight} height={this.props.textHeight} text={this.props.text} />
        </>;
    }
}

export interface EdgeProps {
    id: string;
    source: VertexProps;
    target: VertexProps;
}

export class Edge extends React.Component<EdgeProps> {

    render() {
        return <line x1={this.props.source.x} y1={this.props.source.y} x2={this.props.target.x} y2={this.props.target.y} stroke="gray" />;
    }
}

export class Test extends SVGWidget {

    snippet() {
        return <Vertex id="1" faChar="fa-user"></Vertex>;
    }

    update(domNode, element) {
        super.update(domNode, element);
        React.render(this.snippet(), domNode);
    }
}
