use axum::{Router, extract::{WebSocketUpgrade, ws::{Message, Utf8Bytes, WebSocket}}, response::Response, routing};

const PORT: u16 = 3000;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/ws", routing::get(ws_handler));
    let addr = format!("0.0.0.0:{PORT}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    println!("WebSocket server listening on port {PORT}");

    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("Error starting server: {e}");
    }
}

async fn ws_handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        if let Ok(Message::Text(msg)) = msg {
            println!("Received message: {msg}");
        } else {
            println!("Client disconnected");
            return;
        }

        if socket.send(Message::Text(Utf8Bytes::from("Response from rust"))).await.is_err() {
            eprintln!("Failed to send message");
        };
    }
}
