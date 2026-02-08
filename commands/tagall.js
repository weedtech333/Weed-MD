const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        // React first
        await sock.sendMessage(chatId, {
            react: {
                text: '📯', // Nouvo alert emoji
                key: message.key
            }
        });

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '🚫✨ *🌟 TAGALL COMMAND 🌟*\n\n⚡ 𝗘𝗥𝗥𝗢𝗥 : Make sure I am admin first! 🔑',
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '⚠️💎 *🌟 TAGALL COMMAND 🌟*\n\n❌ 𝗘𝗥𝗥𝗢𝗥 : Only admins can run this! 🛡️',
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { 
                text: 'ℹ️✨ *🌟 TAGALL COMMAND 🌟*\n\n❌ 𝗘𝗥𝗥𝗢𝗥 : No participants found! 🔍',
            });
            return;
        }

        // Create fancy emoji-rich message
        let messageText = '🎉✨ *🌈 TAGALL ALERT 🌈* ✨🎉\n\n';
        messageText += `👥 *Total Members:* ${participants.length} 🥳\n`;
        messageText += '━━━━━━━━━━━━━━━━━━━━\n';
        messageText += '🎤 Attention everyone! Here comes the tag:\n\n';

        participants.forEach((participant, index) => {
            const number = participant.id?.split('@')[0] || 'unknown';
            const emojis = ['🌟','💫','🔥','🎮','💎','🚀','🎵','⚡','🌈','✨'];
            const emoji = emojis[index % emojis.length];
            messageText += `👤 @${number} ${emoji}\n`;
        });

        messageText += '\n━━━━━━━━━━━━━━━━━━━━\n';
        messageText += '🌟💖 Stay active, have fun & shine bright! ✨🚀🎉';

        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { 
            text: '⚠️💥 *🌟 TAGALL COMMAND 🌟*\n\n❌ 𝗘𝗥𝗥𝗢𝗥 : Failed to tag members! 🛠️🔥',
        });
    }
}

module.exports = tagAllCommand;
