const state = {
    pos: { x: 0, y: 0},
    zoom: 1
}

export const camera = {
    get zoom() { return state.zoom },
    get pos() { return state.pos },

    zoomIn() {
        options.zoom /= 1.2;
        if (options.zoom < 1) options.zoom = 1;
    },

    zoomOut() {
        options.zoom *= 1.2;
    },

    setPos(x, y) {
        state.pos.x = x;
        state.pos.y = y;
    }
}