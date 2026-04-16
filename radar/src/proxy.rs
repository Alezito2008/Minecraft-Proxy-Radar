use mc_proxy::protocol::listener::PacketListener;
use tokio::sync::broadcast;

pub struct RadarProxy {
    tx: broadcast::Sender<String>
}

impl RadarProxy {
    pub fn new(tx: broadcast::Sender<String>) -> Self {
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