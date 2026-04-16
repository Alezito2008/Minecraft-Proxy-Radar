use mc_proxy::{MinecraftProxy, protocol::listener::PacketListener};
use tokio::sync::{broadcast, mpsc};

use axum::{Router, extract::{State, WebSocketUpgrade, ws::{Message, Utf8Bytes, WebSocket}}, response::Response, routing};
use futures_util::{SinkExt, StreamExt, stream::{SplitSink, SplitStream}};

const PORT: u16 = 3000;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>
}

struct RadarProxy {
    tx: broadcast::Sender<String>
}

impl RadarProxy {
    fn new(tx: broadcast::Sender<String>) -> Self {
        Self { tx }
    }
}

impl PacketListener for RadarProxy {
    fn on_handshake(&mut self,packet: &mut mc_proxy::protocol::packets::Handshake) -> mc_proxy::protocol::listener::PacketAction {
        let msg = format!("Handshake:\n Host: {}", packet.server_address);
        println!("{msg}");
        let _ = self.tx.send(msg);
        mc_proxy::protocol::listener::PacketAction::Allow
    }
}

#[tokio::main]
async fn main() {
    let (tx, _rx) = broadcast::channel::<String>(100);

    let proxy_listener = RadarProxy::new(tx.clone());
    let proxy = MinecraftProxy::new(
        1243,
        "0.0.0.0:25565",
        proxy_listener
    );
    tokio::spawn(async move { proxy.listen().await });

    let app = Router::new()
        .route("/ws", routing::get(ws_handler))
        .with_state(AppState { tx: tx.clone() });

    let addr = format!("0.0.0.0:{PORT}");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    println!("WebSocket server listening on port {PORT}");

    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("Error starting server: {e}");
    }
}

async fn ws_handler(State(state): State<AppState>, ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
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
                match sender.send(Message::text(msg.clone())).await {
                    Ok(_) => println!("Sent from listener: {msg}"),
                    Err(e) => eprintln!("Error sending message: {e}")
                }
            }
        }
    }
}
