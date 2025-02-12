import * as joint from 'jointjs';

export const getElementText = (element: joint.dia.Element) => {
    return element.attributes?.attrs?.label?.text || "";
}

export const getLinkText = (link: joint.dia.Link) => {
    return link.attributes.labels?.[0]?.attrs?.text?.text || "";
}