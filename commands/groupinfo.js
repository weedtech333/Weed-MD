async function groupInfoCommand(sock, chatId, msg) {
    try {
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);

        // Get group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins
            .map((v, i) => `│ ⭐ ${i + 1}. @${v.id.split('@')[0]}`)
            .join('\n');

        // Get group owner
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create boxed/fancy card text
        const text = `
╭───────────────╮
│ 🍭 WEED MD GROUP INFO 🍭 │
├───────────────┤
│ 🆔 GROUP ID: ${groupMetadata.id}
│ 🏷️ NAME: ${groupMetadata.subject}
│ 👥 MEMBERS COUNT: ${participants.length}
│ 👑 OWNER: @${owner.split('@')[0]}
│ 🛡️ ADMINS:
${listAdmin}
│ 📝 DESCRIPTION:
│ ${groupMetadata.desc?.toString() || 'No description'}
╰───────────────╯
✨ Powered by 💧 WEED MD
💌 Tip: Stay active & enjoy your group!
`;

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

    } catch (error) {
        console.error('Error in groupinfo command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get group info!' });
    }
}

module.exports = groupInfoCommand;
