use std::path::PathBuf;

use crate::{server::handlers::ws_handler};
use axum::{Router, routing};
use tokio::sync::broadcast;
use tower_http::services::ServeDir;

mod handlers;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>
}

pub fn create_router(tx: broadcast::Sender<String>) -> Router {
    let web_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("web");

    let state = AppState { tx };
    Router::new()
        .route("/ws", routing::get(ws_handler))
        .fallback_service(ServeDir::new(web_dir))
        .with_state(state)
}