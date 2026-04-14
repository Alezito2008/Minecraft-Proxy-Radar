import { updateUI } from "./interface.js";
import { camera } from "./camera.js";
import { MAP_CONFIG } from "./main.js";

export const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

const PLAYER_SIZE = 24;
const playerImage = new Image();
playerImage.src = '../assets/icons/player.png';

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

function drawAxes() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.moveTo(0, -camera.pos.y);
    ctx.lineTo(0, -camera.pos.y + canvas.height);
    ctx.stroke();
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(-camera.pos.x, 0);
    ctx.lineTo(-camera.pos.x + canvas.width, 0);
    ctx.stroke();
}

function drawPlayer(x, y) {
    ctx.drawImage(playerImage, x - PLAYER_SIZE / 2, y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
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

    drawAxes();
    drawPlayer(0, 0);
    requestAnimationFrame(draw);
}

function worldToScreen(x, y) {
    return {
        x: MAP_CONFIG.CHUNK_GRID_SIZE_PX / 16 * x,
        y: MAP_CONFIG.CHUNK_GRID_SIZE_PX / 16 * y
    }
}

function screenToWorld(x, y) {
    return { x: 0, y: 0 }
}

window.addEventListener('DOMContentLoaded', setup);
window.addEventListener('resize', resize);
