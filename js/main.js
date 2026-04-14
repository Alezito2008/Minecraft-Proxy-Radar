export const canvas = document.getElementById('map');

export const MAP_CONFIG = {
    BLOCK_DETAIL: 4, // Ej: 4 = Chunks con bloques 4*4
    CHUNK_GRID_SIZE_PX: 48,
    get BLOCK_GRID_SIZE_PX() {
        return this.CHUNK_GRID_SIZE_PX / this.BLOCK_DETAIL
    }
}
