use tokio::sync::mpsc::{self, Receiver, Sender};

use axum::{Router, extract::{WebSocketUpgrade, ws::{Message, Utf8Bytes, WebSocket}}, response::Response, routing};
use futures_util::{SinkExt, StreamExt, stream::{SplitSink, SplitStream}};

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

async fn handle_socket(socket: WebSocket) {
    let (sender, receiver) = socket.split();
    let (tx, rx) = mpsc::channel::<Message>(100);

    tokio::spawn(read(receiver, tx));
    tokio::spawn(write(sender, rx));
}

async fn read(mut receiver: SplitStream<WebSocket>, tx: Sender<Message>) {
    while let Some(msg) = receiver.next().await {
        if let Ok(Message::Text(msg)) = msg {
            println!("Received message: {msg}");
        } else {
            println!("Client disconnected");
            return;
        }

        if let Err(e) = tx.send(Message::Text(Utf8Bytes::from("Rust response"))).await {
            eprint!("Error sending response: {e}");
        }
    }
}

async fn write(mut sender: SplitSink<WebSocket, Message>, mut rx: Receiver<Message>) {
    while let Some(msg) = rx.recv().await {
        if let Err(e) = sender.send(msg).await {
            eprintln!("Error sending message: {e}");
        }
    }
}
