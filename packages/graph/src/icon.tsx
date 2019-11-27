import { FACharMapping, Palette, SVGWidget, textSize } from "@hpcc-js/common";
import * as React from "@hpcc-js/preact-shim";
import { curveBasis as d3CurveBasis, curveBundle as d3CurveBundle, curveCardinal as d3CurveCardinal, curveCatmullRom as d3CurveCatmullRom, curveLinear as d3CurveLinear, line as d3Line } from "d3-shape";

const Curve = {
    basis: d3CurveBasis,
    bundle: d3CurveBundle,
    cardinal: d3CurveCardinal,
    catmullRom: d3CurveCatmullRom,
    linear: d3CurveLinear
};

interface CircleProps {
    cx?: string;
    cy?: string;
    radius?: number;
    fill?: string;
    stroke?: string;
}

const Circle: React.FunctionComponent<CircleProps> = ({
    cx,
    cy,
    radius = 32,
    fill = "navy",
    stroke = fill
}) => <circle cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} />;

interface SquareProps {
    radius?: number;
    cornerRadius?: number;
    fill?: string;
    stroke?: string;
}

const Square: React.FunctionComponent<SquareProps> = ({
    radius = 30,
    cornerRadius = 3,
    fill = "white",
    stroke
}) => <rect x={-radius} y={-radius} rx={cornerRadius} ry={cornerRadius} width={radius * 2} height={radius * 2} fill={fill} stroke={stroke || fill} />;

interface RectangleProps {
    y?: number;
    width?: number;
    height?: number;
    cornerRadius?: number;
    fill?: string;
    stroke?: string;
}

const Rectangle: React.FunctionComponent<RectangleProps> = ({
    y = 0,
    width = 30,
    height = 30,
    cornerRadius = 3,
    fill = "white",
    stroke = "black"
}) => <rect x={-width / 2} y={y - height / 2} rx={cornerRadius} ry={cornerRadius} width={width} height={height} fill={fill} stroke={stroke || fill} />;

interface TextProps {
    x?: number;
    y?: number;
    anchor?: string;
    height?: number;
    fill?: string;
    text: string;
}

const Text: React.FunctionComponent<TextProps> = ({
    x,
    y = 0,
    anchor = "middle",
    height = 12,
    fill = "black",
    text = ""
}) => <text x={x} y={y - height * 3 / 12} fill={fill} font-size={`${height}px`} style={`text-anchor: ${anchor};`} >{text}</text>;

interface TextBoxProps {
    y?: number;
    fill?: string;
    stroke?: string;
    text: string;
}

const TextBox: React.FunctionComponent<TextBoxProps> = ({
    y = 0,
    fill = "whitesmoke",
    stroke = "whitesmoke",
    text = ""
}) => {
    let { width, height } = textSize(text, "Helvetica", 12, false);
    width += 4;
    height += 4;
    return <>
        <Rectangle y={y - height / 2} width={width} height={height} stroke={stroke} fill={fill} />
        <Text y={y} text={text} />
    </>;
};

interface FACharProps {
    x?: number;
    y?: number;
    height?: number;
    fill?: string;
    faChar?: string;
}

const calcFAChar = (faChar: string) => faChar.indexOf("fa-") === 0 ? String.fromCharCode(FACharMapping[faChar]) : faChar;
const FAChar: React.FunctionComponent<FACharProps> = ({
    x,
    y = 0,
    height = 12,
    faChar = "",
    fill
}) => <text x={x} y={y - height * 3.5 / 12} fill={fill} font-family="FontAwesome" font-size={`${height}px`} style="text-anchor: middle;" >{calcFAChar(faChar)}</text>;

interface ShapeProps {
    shape?: "circle" | "square";
    height?: number;
    fill?: string;
    stroke?: string;
}

const Shape: React.FunctionComponent<ShapeProps> = ({
    shape = "circle",
    height = 128,
    fill,
    stroke
}) => {
    const Tag = shape === "square" ? Square : Circle;
    return <Tag radius={height / 2} fill={fill} stroke={stroke} />;
};

interface IconProps {
    shape?: "circle" | "square";
    height?: number;
    fill?: string;
    stroke?: string;
    faChar?: string;
    faCharFill?: string;
}

const Icon: React.FunctionComponent<IconProps> = ({
    shape = "circle",
    height = 128,
    fill,
    stroke,
    faChar = "",
    faCharFill = Palette.textColor(fill)
}) => {
    const padding = height / 5;
    return <>
        <Shape shape={shape} height={height} fill={fill} stroke={stroke} />
        <FAChar y={height / 2} height={height - padding} faChar={faChar} fill={faCharFill}></FAChar>
    </>;
};

export interface VertexProps {
    id: string;
    text: string;
    iconHeight?: number;
    iconFill?: string;
    iconStroke?: string;
    textHeight?: number;
    faChar?: string;
    faCharFill?: string;
    x?: number;
    y?: number;
}

export const Vertex: React.FunctionComponent<VertexProps> = ({
    iconHeight = 32,
    iconFill = "transparent",
    textHeight = 12,
    faChar = "",
    text = "",
    iconStroke,
    faCharFill
}) => <>
        <Icon height={iconHeight} fill={iconFill} stroke={iconStroke} faChar={faChar} faCharFill={faCharFill} />
        <TextBox y={iconHeight / 2 + textHeight} text={text} />
    </>;

export interface EdgeProps {
    id: string;
    source: VertexProps;
    target: VertexProps;
}

export const Edge: React.FunctionComponent<EdgeProps> = ({
    source,
    target
}) => <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="gray" />;

export type Point = [number, number];
function calcArc(points: Point[]): Point[] {
    const curveDepth = 16;
    if (points.length === 2 && curveDepth) {
        const dx = points[0][0] - points[1][0];
        const dy = points[0][1] - points[1][1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist) {
            const midX = (points[0][0] + points[1][0]) / 2 - dy * curveDepth / 100;
            const midY = (points[0][1] + points[1][1]) / 2 + dx * curveDepth / 100;
            return [points[0], [midX, midY], points[1]];
        }
    }
    return points;
}

export const CurvedEdge: React.FunctionComponent<EdgeProps> = ({
    source,
    target
}) => {
    const line = d3Line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(Curve.basis)
        // .tension(0.75)
        (calcArc([[source.x, source.y], [target.x, target.y]]))
        ;

    return <path d={line} stroke="gray" />;
};

export interface SubgraphProps {
    id: string;
    text: string;
}

export class Test extends SVGWidget {

    snippet() {
        return <Vertex id="1" text="XXX" faChar="fa-user"></Vertex>;
    }

    update(domNode, element) {
        super.update(domNode, element);
        React.render(this.snippet(), domNode);
    }
}
