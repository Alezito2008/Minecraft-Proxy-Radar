import { canvas, MAP_CONFIG } from "./main.js"
import { camera } from "./camera.js";

export const mouse = {
    isDown: false,
    anchorX: 0,
    anchorY: 0,
    screenX: 0,
    screenY: 0,
    // Minecraft Coords
    coordX: 0,
    coordY: 0,
}

canvas.addEventListener('mousedown', e => {
    mouse.anchorX = e.offsetX / camera.zoom - camera.pos.x;
    mouse.anchorY = e.offsetY / camera.zoom - camera.pos.y;

    mouse.isDown = true;
})

window.addEventListener('mouseup', e => {
    mouse.isDown = false;
})

canvas.addEventListener('mousemove', e => {
    mouse.screenX = e.offsetX;
    mouse.screenY = e.offsetY;

    mouse.coordX = (mouse.screenX / camera.zoom - camera.pos.x) / MAP_CONFIG.CHUNK_GRID_SIZE_PX * 16;
    mouse.coordY = (-mouse.screenY / camera.zoom + camera.pos.y) / MAP_CONFIG.CHUNK_GRID_SIZE_PX * 16;

    if (!mouse.isDown) return;

    camera.pos.x = e.offsetX / camera.zoom - mouse.anchorX;
    camera.pos.y = e.offsetY / camera.zoom - mouse.anchorY;
})

canvas.addEventListener('wheel', e => { (e.deltaY > 0) ? camera.zoomIn() : camera.zoomOut(); });
