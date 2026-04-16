use tokio::sync::{broadcast, mpsc};
use axum::{extract::{State, WebSocketUpgrade, ws::{Message, Utf8Bytes, WebSocket}}, response::Response};
use futures_util::{SinkExt, StreamExt, stream::{SplitSink, SplitStream}};

use crate::server;

pub async fn ws_handler(State(state): State<server::AppState>, ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: server::AppState) {
    let (sender, receiver) = socket.split();
    let (tx, rx) = mpsc::channel::<Message>(100);
    let listener_rx = state.tx.subscribe();

    tokio::spawn(read(receiver, tx));
    tokio::spawn(write(sender, rx, listener_rx));
}

async fn read(mut receiver: SplitStream<WebSocket>, tx: mpsc::Sender<Message>) {
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

async fn write(mut sender: SplitSink<WebSocket, Message>, mut rx: mpsc::Receiver<Message>, mut listener_rx: broadcast::Receiver<String>) {
    loop {
        tokio::select! {
            Some(msg) = rx.recv() => {
                if let Err(e) = sender.send(msg).await {
                    eprintln!("Error sending message: {e}");
                }
            }

            Ok(msg) = listener_rx.recv() => {
                if let Err(e) = sender.send(Message::text(msg)).await {
                    eprintln!("Error sending message: {e}")
                }
            }
        }
    }
}
