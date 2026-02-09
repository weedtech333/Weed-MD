const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        // Step 1: Send reaction first
        await sock.sendMessage(chatId, {
            react: {
                text: '🤖', // Emoji tech
                key: message.key
            }
        });

        const aliveMessage = `
*🤖 𝗪𝗘𝗘𝗗 𝗠𝗗 🤖*

*🖥 STATUS:* ONLINE
*🌐 MODE:* PUBLIC
*📦 VERSION:* ${settings.version || '1.0.0'}
*🆔 GROUP JID:* ${chatId}

*⚡ BOT IS ACTIVE & RUNNING!*

*✨ FEATURES:*
- 💾 Group Management
- 🔗 Anti-Link Protection
- 🎮 Fun Commands
- 🧠 AI Commands
- ⬇️ Downloader
- 🔹 More Features

*💡 TYPE .menu FOR FULL COMMAND LIST*`;

        await sock.sendMessage(chatId, {
            text: aliveMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407561123100@newsletter',
                    newsletterName: 'Weed Tech',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: '🤖 BOT IS ONLINE & RUNNING! ⚡' 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;
