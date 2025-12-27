const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startNetrox() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true, // මෙය හරහා QR එක terminal එකේ පෙන්වයි
        logger: pino({ level: "silent" }),
    });

    conn.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log("සම්බන්ධතාවය බිඳ වැටුණා, නැවත උත්සාහ කරයි...");
            startNetrox();
        } else if (connection === "open") {
            console.log("Netrox Bot සාර්ථකව සම්බන්ධ වුණා! ✅");
        }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // සරල ප්ලගීනයක් (Ping command)
        if (text === ".ping") {
            await conn.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓 ඔබේ බොට් වැඩ." });
        }
    });
}

startNetrox();
