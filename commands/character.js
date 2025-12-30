const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;

    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: 'Please mention someone or reply to their message to analyze their character!', 
            ...channelInfo 
        });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image if no profile pic
        }

        // Lis chanèl ou yo
        const channels = [
            "WEED MD",
            "ANOTHER CHANNEL",
            "YET ANOTHER CHANNEL"
        ];

        const channelText = channels.map(ch => `📺 ${ch}`).join('\n');

        const traits = [
            "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
            "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
            "Generous", "Honest", "Humorous", "Imaginative", "Independent",
            "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
            "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
            "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise"
        ];

        const numTraits = Math.floor(Math.random() * 3) + 3;
        const selectedTraits = [];
        while (selectedTraits.length < numTraits) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) selectedTraits.push(randomTrait);
        }

        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60;
            return `${trait}: ${percentage}%`;
        });

        // Create character analysis message with channels at top
        const analysis = `🔮 *Character Analysis* 🔮\n\n` +
            `${channelText}\n\n` + // <- Channels shown first
            `👤 *User:* ${userToAnalyze.split('@')[0]}\n\n` +
            `✨ *Key Traits:*\n${traitPercentages.join('\n')}\n\n` +
            `🎯 *Overall Rating:* ${Math.floor(Math.random() * 21) + 80}%\n\n` +
            `Note: This is a fun analysis and should not be taken seriously!`;

        // Send the analysis with the user's profile picture
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze],
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in character command:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to analyze character! Try again later.',
            ...channelInfo 
        });
    }
}

module.exports = characterCommand;
