const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

const pos = {
    x: 0,
    y: 0,
}

const trans = {
    x: 0,
    y: 0,
}

const mouse = {
    isDown: false,
    anchorX: 0,
    anchorY: 0,
    screenX: 0,
    screenY: 0,
    // Minecraft Coords
    coordX: 0,
    coordY: 0,
}

const options = {
    zoom: 1
}

const BLOCK_DETAIL = 4; // Ej: 4 = Chunks con bloques 4*4
const CHUNK_GRID_SIZE_PX = 48;
const BLOCK_GRID_SIZE_PX = CHUNK_GRID_SIZE_PX / BLOCK_DETAIL;

function zoomIn() {
    options.zoom /= 1.2;
    if (options.zoom < 1) options.zoom = 1
}

function zoomOut() {
    options.zoom *= 1.2;
}

function setup() {
    resize();
    draw();
    pos.x = canvas.width / 2;
    pos.y = canvas.height / 2;
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.imageSmoothingEnabled = false;
}

function drawGrid(size) {
    const startX = Math.floor(-pos.x / size) * size;
    const startY = Math.floor(-pos.y / size) * size;
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

function updateUI() {
    const x = mouse.coordX, y = mouse.coordY;
    updateInfoCoordinates(Math.round(x), Math.round(y));
    updateInfoChunkCoordinates(Math.floor(x/16), Math.floor(y/16))
}

function draw() {
    updateUI();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(options.zoom, options.zoom);
    ctx.translate(pos.x, pos.y);

    ctx.lineWidth = 1;
    
    ctx.strokeStyle = '#30303075'
    drawGrid(BLOCK_GRID_SIZE_PX);
    ctx.strokeStyle = '#46464662';
    drawGrid(CHUNK_GRID_SIZE_PX);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, -pos.y);
    ctx.lineTo(0, -pos.y + canvas.height);
    ctx.stroke();
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(-pos.x, 0);
    ctx.lineTo(-pos.x + canvas.width, 0);
    ctx.stroke();

    ctx.fillStyle = 'lime';
    ctx.fillRect(0, 10, 10, 10);

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', e => {
    mouse.anchorX = e.offsetX / options.zoom - pos.x;
    mouse.anchorY = e.offsetY / options.zoom - pos.y;

    mouse.isDown = true;
})

window.addEventListener('mouseup', e => {
    mouse.isDown = false;
})

canvas.addEventListener('mousemove', e => {
    mouse.screenX = e.offsetX;
    mouse.screenY = e.offsetY;

    mouse.coordX = (mouse.screenX / options.zoom - pos.x) / CHUNK_GRID_SIZE_PX * 16;
    mouse.coordY = (-mouse.screenY / options.zoom + pos.y) / CHUNK_GRID_SIZE_PX * 16;

    if (!mouse.isDown) return;

    pos.x = e.offsetX / options.zoom - mouse.anchorX;
    pos.y = e.offsetY / options.zoom - mouse.anchorY;
})

canvas.addEventListener('wheel', e => { (e.deltaY > 0) ? zoomIn() : zoomOut(); });

window.addEventListener('DOMContentLoaded', setup);
window.addEventListener('resize', resize);
document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);

const infoCoords = document.getElementById('info-coordinates');
const infoChunkCoords = document.getElementById('info-chunk-coordinates');

function updateInfoCoordinates(x, y) {
    infoCoords.textContent = `Coordinates: ${x} / ${y}`;
}

function updateInfoChunkCoordinates(x, y) {
    infoChunkCoords.textContent = `Chunk: ${x} / ${y}`;
}
