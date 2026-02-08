const os = require('os');
const settings = require('../settings.js');

const pingEmojis = ['🏓', '🎾', '🏸', '🥏', '⚾', '🏐'];

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days) time += `${days}d `;
    if (hours) time += `${hours}h `;
    if (minutes) time += `${minutes}m `;
    if (seconds || time === '') time += `${seconds}s`;

    return time.trim();
}

function getRandomEmoji() {
    return pingEmojis[Math.floor(Math.random() * pingEmojis.length)];
}

async function pingCommand(sock, chatId, message) {
    try {
        const emoji = getRandomEmoji();

        const start = Date.now();
        await sock.sendMessage(chatId, { text: `${emoji} Calculating...` }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeFormatted = formatTime(process.uptime());

        // Nou fè ankadreman pi “stylish” ak liy ak emoji
        const botInfo = `
╔══════════════════╗
║   ✨ 𝚆𝚎𝚎𝚍 𝙼𝙳 𝙱𝙾𝚃 ✨
╠══════════════════╣
║ ${emoji} Ping     : ${ping} ms
║ ⏱️ Uptime   : ${uptimeFormatted}
║ 🔖 Version  : v${settings.version}
╚══════════════════╝`.trim();

        await sock.sendMessage(chatId, { text: botInfo }, { quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;
