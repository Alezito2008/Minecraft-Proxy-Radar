use crate::{server::handlers::ws_handler};
use axum::{Router, routing};
use tokio::sync::broadcast;

mod handlers;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>
}

pub fn create_router(tx: broadcast::Sender<String>) -> Router {
    let state = AppState { tx };
    Router::new()
        .route("/ws", routing::get(ws_handler))
        .with_state(state)
}