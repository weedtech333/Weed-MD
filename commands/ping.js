const os = require("os");
const { performance } = require("perf_hooks");
const settings = require("../settings.js");

async function pingCommand(sock, chatId, message) {
    try {
        // Send initial message
        const statusMsg = await sock.sendMessage(chatId, {
            text: "⚡ *Testing speed...*"
        }, { quoted: message });

        const start = performance.now();
        
        // Test ping
        await sock.sendMessage(chatId, { text: "🏓" });
        
        const latency = (performance.now() - start);
        
        // Get system info
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const ramPercent = Math.round((usedMem / totalMem) * 100);

        // Speed rating
        let speedRating = "✅ Good";
        if (latency < 100) speedRating = "⚡ Excellent";
        if (latency > 1000) speedRating = "⚠️ Slow";

        const response = `
╭───〔 🏓 PONG 〕───╮
│ ✅ Status   : *WEED-MD* is online and ready!
│ ⏱️ Latency : *${latency} ms*
│ ⚡ Uptime  : *${hours}h ${minutes}m ${seconds}s*
│ 🚀 Performance : *Ultra fast* 💫
╰───────────────────╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Ｄ𝚎𝚟 𝚆𝚎𝚎𝚍`;

        // Delete status message
        await sock.sendMessage(chatId, {
            delete: statusMsg.key
        });

        await sock.sendMessage(chatId, {
            text: response
        }, { quoted: message });

    } catch (error) {
        console.error("[PING] Error:", error);
        await sock.sendMessage(chatId, { 
            text: `❌ Ping test failed\n> ρσωєяє∂ ву chrisGaaju` 
        }, { quoted: message });
    }
}

module.exports = pingCommand;
