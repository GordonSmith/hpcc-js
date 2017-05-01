import { HTMLWidget } from "../common/HTMLWidget";
import { IVirtualDOM, ReactD3 } from "./reactD3";

export class Test extends HTMLWidget {
    someStr = "Hello and Welcome";
    someData = ["bb1", "bb1", "bb3"]

    test() {
        return <div>
            <h1>{this.someStr}</h1>
            <h2>Here is a list:</h2>
            <ul>
                <li>aaa</li>
                <li>bbb</li>
                <li>ccc</li>
            </ul>
        </div>;
    }
    test1() {
        return <ul>
            <li>aaa</li>
            <this.li />
            <li>ccc</li>
        </ul>;
    }
    test2() {
        return <div>
            <h1>{this.someStr}</h1>
            <h2>Here is a list:</h2>
            <ul>
                <li>aaa</li>
                <li>ddd</li>
                <li>ccc</li>
            </ul>
            <ul>
                <this.li></this.li>
            </ul>
        </div>;
    }

    li(_targetElement, _vdom: IVirtualDOM[]): void {
    }

    enter(_domNode, root) {
        function Welcome(props) {
            return <li>Hello, {props.name}</li>;
        }

        function Welcome2(props) {
            return (targetElement) => {
                const lis = targetElement.selectAll("li").data(props.data);
                lis.enter().append("li")
                    .merge(lis)
                    .text(d => d)
            }
        };

        const element = <div>
            <ul>
                <Welcome name="Sara" />
                <Welcome name="Gordon" />
                <Welcome name="Sara" />
            </ul>
            <ul>
                <Welcome2 data={["Sara", "Gordon", "Tom"]} />
            </ul>
        </div>;

        ReactD3.render(
            element,
            root
        );

        //this.test1().render(element);
        // this.test().render(element);
        // this.test2().render(element);
    }

    update(_domNode, element) {
        ReactD3.render(
            element,
            element
        );
    }

    exit(_domNode, _element) {
    }
}
