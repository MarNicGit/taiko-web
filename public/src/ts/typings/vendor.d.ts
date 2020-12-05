interface Document extends Node, DocumentAndElementEventHandlers, DocumentOrShadowRoot, GlobalEventHandlers, NonElementParentNode, ParentNode, XPathEvaluatorBase {
    //vendor versions of exitFullscreen
    webkitExitFullscreen(): Promise<void>;
    mozCancelFullScreen(): Promise<void>;
    msExitFullscreen(): Promise<void>;


}
