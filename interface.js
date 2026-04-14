import { camera } from "./camera.js";
import { mouse } from "./input.js";

document.getElementById('zoom-in').addEventListener('click', camera.zoomIn);
document.getElementById('zoom-out').addEventListener('click', camera.zoomOut);

const infoCoords = document.getElementById('info-coordinates');
const infoChunkCoords = document.getElementById('info-chunk-coordinates');

export function updateUI() {
    const x = mouse.coordX, y = mouse.coordY;
    updateInfoCoordinates(Math.round(x), Math.round(y));
    updateInfoChunkCoordinates(Math.floor(x/16), Math.floor(y/16))
}

function updateInfoCoordinates(x, y) {
    infoCoords.textContent = `Coordinates: ${x} / ${y}`;
}

function updateInfoChunkCoordinates(x, y) {
    infoChunkCoords.textContent = `Chunk: ${x} / ${y}`;
}
