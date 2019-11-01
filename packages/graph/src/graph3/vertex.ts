import { Vertex as OldVertex } from "../Vertex";

export class Vertex extends OldVertex {

    constructor() {
        super();
        this
            // .centroid(node.centroid)
            .icon_diameter(60)
            .icon_shape_colorStroke("transparent")
            .icon_shape_colorFill("transparent")
            .icon_image_colorFill("#333333")
            .iconAnchor("middle")
            .faChar("fa-user")
            .textbox_shape_colorStroke("#AAAAAA")
            .textbox_shape_colorFill("#FAFAFA")
            .textbox_text_colorFill("#333333")
            // .text(node.name)
            ;
    }

}
