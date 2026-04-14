import { updateUI } from "./interface.js";
import { camera } from "./camera.js";
import { MAP_CONFIG } from "./main.js";

export const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

function setup() {
    resize();
    draw();
    camera.pos.x = canvas.width / 2;
    camera.pos.y = canvas.height / 2;
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.imageSmoothingEnabled = false;
}

function drawGrid(size) {
    const startX = Math.floor(-camera.pos.x / size) * size;
    const startY = Math.floor(-camera.pos.y / size) * size;
    const endX = startX + canvas.width + size;
    const endY = startY + canvas.height + size;

    ctx.beginPath();

    for (let x = startX; x <= endX; x += size) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += size) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }

    ctx.stroke();
}

export function draw() {
    updateUI();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(camera.pos.x, camera.pos.y);

    ctx.lineWidth = 1;
    
    ctx.strokeStyle = '#30303075'
    drawGrid(MAP_CONFIG.BLOCK_GRID_SIZE_PX);
    ctx.strokeStyle = '#46464662';
    drawGrid(MAP_CONFIG.CHUNK_GRID_SIZE_PX);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, -camera.pos.y);
    ctx.lineTo(0, -camera.pos.y + canvas.height);
    ctx.stroke();
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(-camera.pos.x, 0);
    ctx.lineTo(-camera.pos.x + canvas.width, 0);
    ctx.stroke();

    ctx.fillStyle = 'lime';
    ctx.fillRect(0, 10, 10, 10);

    requestAnimationFrame(draw);
}

window.addEventListener('DOMContentLoaded', setup);
window.addEventListener('resize', resize);
