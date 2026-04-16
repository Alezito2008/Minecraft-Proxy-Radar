use mc_proxy::MinecraftProxy;
use tokio::sync::broadcast;

use crate::server::create_router;

mod server;
mod proxy;

const PORT: u16 = 3000;

#[tokio::main]
async fn main() {
    let (tx, _rx) = broadcast::channel::<String>(100);

    // Start proxy
    let proxy_listener = proxy::RadarProxy::new(tx.clone());
    let proxy = MinecraftProxy::new(
        1243,
        "0.0.0.0:25565",
        proxy_listener
    );
    tokio::spawn(async move { proxy.listen().await });

    // Start web server
    let app = create_router(tx);
    let addr = format!("0.0.0.0:{PORT}");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    println!("WebSocket server listening on port {PORT}");

    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("Error starting server: {e}");
    }
}
