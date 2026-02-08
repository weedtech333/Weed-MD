const { isAdmin } = require('../lib/isAdmin');

// Manual promotion command
async function promoteCommand(sock, chatId, mentionedJids, message) {
    let userToPromote = [];

    if (mentionedJids?.length) {
        userToPromote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }

    if (!userToPromote.length) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ Please mention the user or reply to their message to promote!'
        });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, 'promote');

        const usernames = userToPromote.map(jid => `@${jid.split('@')[0]}`);
        const promoterJid = sock.user.id;

        // Demi-ankadreman style
        const promotionMessage = `
╭─🎉 GROUP PROMOTION 🎉─╮
│ 👥 Promoted User${userToPromote.length > 1 ? 's' : ''}:
│ ${usernames.map(name => `• ${name}`).join('\n│ ')}
│ 👑 Promoted By: @${promoterJid.split('@')[0]}
│ 📅 ${new Date().toLocaleString()}
╰───────────────────╯
`;

        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        });
    } catch (err) {
        console.error('Error in promote command:', err);
        await sock.sendMessage(chatId, { 
            text: `❌ Failed to promote user(s)!\nError: ${err.message}` 
        });
    }
}

// Automatic promotion event handler
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        const promotedUsernames = participants.map(jid => `@${jid.split('@')[0]}`);
        let mentionList = [...participants];
        let promotedBy = author ? `@${author.split('@')[0]}` : 'System';

        if (author) mentionList.push(author);

        const promotionMessage = `
╭─🎉 GROUP PROMOTION 🎉─╮
│ 👥 Promoted User${participants.length > 1 ? 's' : ''}:
│ ${promotedUsernames.map(name => `• ${name}`).join('\n│ ')}
│ 👑 Promoted By: ${promotedBy}
│ 📅 ${new Date().toLocaleString()}
╰───────────────────╯
`;

        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (err) {
        console.error('Error handling promotion event:', err);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
