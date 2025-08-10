const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
      if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();  // reconnect if not logged out
      } else {
        console.log('Logged out from WhatsApp');
      }
    } else if(connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });

  sock.ev.on('messages.upsert', async (msg) => {
    if(!msg.messages) return;
    const message = msg.messages[0];
    if(!message.message) return;

    const sender = message.key.remoteJid;
    const text = message.message.conversation || message.message.extendedTextMessage?.text;

    if(text === 'hi' || text === 'hello') {
      await sock.sendMessage(sender, { text: 'Hello! I am BOROLOKS BOT.' });
    }
  });
}

startBot();
