const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message, pushname, config) {
    const prefix = config && config.PREFIX ? config.PREFIX : '.';
    const mode = settings.mode || 'PUBLIC';
    const version = settings.version || '3.0.0';
    
    const helpMessage = `
╔═══════════ 🔹 𝗪𝗘𝗘𝗗 𝗠𝗗 🔹 ═══════════╗
║ 👤 USER : ${pushname || 'User'}
║ 🌐 MODE : ${mode}
║ ⚡ PREFIX : ${prefix}
║ 📦 VERSION : ${version}
║ 🆔 GROUP JID : ${chatId}
╚═════════════════════════════════════╝

💬 Hello ${pushname || 'User'}! Here are the commands:

╭─✨ GENERAL COMMANDS ✨─╮
│ ▶ ${prefix}help / ${prefix}menu
│ ▶ ${prefix}ping
│ ▶ ${prefix}alive
│ ▶ ${prefix}tts <TEXT>
│ ▶ ${prefix}owner
│ ▶ ${prefix}joke
│ ▶ ${prefix}quote
│ ▶ ${prefix}fact
│ ▶ ${prefix}weather <CITY>
│ ▶ ${prefix}news
│ ▶ ${prefix}attp <TEXT>
│ ▶ ${prefix}lyrics <SONG_TITLE>
│ ▶ ${prefix}8ball <QUESTION>
│ ▶ ${prefix}groupinfo
│ ▶ ${prefix}staff / ${prefix}admins
│ ▶ ${prefix}vv
│ ▶ ${prefix}trt <TEXT> <LANG>
│ ▶ ${prefix}ss <LINK>
│ ▶ ${prefix}jid
│ ▶ ${prefix}url
╰─────────────────────╯

╭─🛡 ADMIN COMMANDS 🛡─╮
│ ▶ ${prefix}ban @USER
│ ▶ ${prefix}promote @USER
│ ▶ ${prefix}demote @USER
│ ▶ ${prefix}mute <MINUTES>
│ ▶ ${prefix}unmute
│ ▶ ${prefix}delete / ${prefix}del
│ ▶ ${prefix}kick @USER
│ ▶ ${prefix}warnings @USER
│ ▶ ${prefix}antilink
│ ▶ ${prefix}antibadword
│ ▶ ${prefix}clear
│ ▶ ${prefix}tag <MESSAGE>
│ ▶ ${prefix}tagall
│ ▶ ${prefix}tagnotadmin
│ ▶ ${prefix}hidetag <MESSAGE>
│ ▶ ${prefix}chatbot
│ ▶ ${prefix}resetlink
│ ▶ ${prefix}antitag <ON/OFF>
│ ▶ ${prefix}welcome <ON/OFF>
│ ▶ ${prefix}goodbye <ON/OFF>
│ ▶ ${prefix}setgdesc <DESCRIPTION>
│ ▶ ${prefix}setgname <NEW NAME>
│ ▶ ${prefix}setgpp (reply to image)
╰─────────────────────╯

╭─🎨 IMAGE / STICKER COMMANDS 🎨─╮
│ ▶ ${prefix}blur <IMAGE>
│ ▶ ${prefix}simage <REPLY TO STICKER>
│ ▶ ${prefix}sticker <REPLY TO IMAGE>
│ ▶ ${prefix}removebg
│ ▶ ${prefix}remini
│ ▶ ${prefix}crop <REPLY TO IMAGE>
│ ▶ ${prefix}tgsticker <LINK>
│ ▶ ${prefix}meme
│ ▶ ${prefix}take <PACKNAME>
│ ▶ ${prefix}emojimix <EMJ1>+<EMJ2>
│ ▶ ${prefix}igs <INSTAGRAM LINK>
│ ▶ ${prefix}igsc <INSTAGRAM LINK>
╰─────────────────────────────╯

╭─🎮 GAME COMMANDS 🎮─╮
│ ▶ ${prefix}tictactoe @USER
│ ▶ ${prefix}hangman
│ ▶ ${prefix}guess <LETTER>
│ ▶ ${prefix}trivia
│ ▶ ${prefix}answer <ANSWER>
│ ▶ ${prefix}truth
│ ▶ ${prefix}dare
╰───────────────────╯

╭─🧠 AI COMMANDS 🧠─╮
│ ▶ ${prefix}gpt <QUESTION>
│ ▶ ${prefix}gemini <QUESTION>
│ ▶ ${prefix}imagine <PROMPT>
│ ▶ ${prefix}flux <PROMPT>
│ ▶ ${prefix}sora <PROMPT>
╰─────────────────╯

╭─😂 FUN COMMANDS 😂─╮
│ ▶ ${prefix}compliment @USER
│ ▶ ${prefix}insult @USER
│ ▶ ${prefix}flirt
│ ▶ ${prefix}shayari
│ ▶ ${prefix}goodnight
│ ▶ ${prefix}roseday
│ ▶ ${prefix}character @USER
│ ▶ ${prefix}wasted @USER
│ ▶ ${prefix}ship @USER
│ ▶ ${prefix}simp @USER
│ ▶ ${prefix}stupid @USER [TEXT]
╰───────────────────╯

╭─✍️ TEXTMAKER ✍️─╮
│ ▶ ${prefix}metallic <TEXT>
│ ▶ ${prefix}ice <TEXT>
│ ▶ ${prefix}snow <TEXT>
│ ▶ ${prefix}impressive <TEXT>
│ ▶ ${prefix}matrix <TEXT>
│ ▶ ${prefix}light <TEXT>
│ ▶ ${prefix}neon <TEXT>
│ ▶ ${prefix}devil <TEXT>
│ ▶ ${prefix}purple <TEXT>
│ ▶ ${prefix}thunder <TEXT>
│ ▶ ${prefix}leaves <TEXT>
│ ▶ ${prefix}1919 <TEXT>
│ ▶ ${prefix}arena <TEXT>
│ ▶ ${prefix}hacker <TEXT>
│ ▶ ${prefix}sand <TEXT>
│ ▶ ${prefix}blackpink <TEXT>
│ ▶ ${prefix}glitch <TEXT>
│ ▶ ${prefix}fire <TEXT>
╰─────────────────────╯

╭─⬇️ DOWNLOADER ⬇️─╮
│ ▶ ${prefix}play <SONG_NAME>
│ ▶ ${prefix}song <SONG_NAME>
│ ▶ ${prefix}spotify <QUERY>
│ ▶ ${prefix}instagram <LINK>
│ ▶ ${prefix}facebook <LINK>
│ ▶ ${prefix}tiktok <LINK>
│ ▶ ${prefix}video <SONG_NAME>
│ ▶ ${prefix}ytmp4 <LINK>
╰─────────────────╯

╭─⚡ MISC ⚡─╮
│ ▶ ${prefix}heart
│ ▶ ${prefix}horny
│ ▶ ${prefix}circle
│ ▶ ${prefix}lgbt
│ ▶ ${prefix}lolice
│ ▶ ${prefix}its-so-stupid
│ ▶ ${prefix}namecard
│ ▶ ${prefix}oogway
│ ▶ ${prefix}tweet
│ ▶ ${prefix}ytcomment
│ ▶ ${prefix}comrade
│ ▶ ${prefix}gay
│ ▶ ${prefix}glass
│ ▶ ${prefix}jail
│ ▶ ${prefix}passed
│ ▶ ${prefix}triggered
╰─────────────────╯

╭─🌟 ANIME 🌟─╮
│ ▶ ${prefix}neko
│ ▶ ${prefix}waifu
│ ▶ ${prefix}loli
│ ▶ ${prefix}nom
│ ▶ ${prefix}poke
│ ▶ ${prefix}cry
│ ▶ ${prefix}kiss
│ ▶ ${prefix}pat
│ ▶ ${prefix}hug
│ ▶ ${prefix}wink
│ ▶ ${prefix}facepalm
╰───────────────╯

╭─💻 GITHUB 💻─╮
│ ▶ ${prefix}git
│ ▶ ${prefix}github
│ ▶ ${prefix}sc
│ ▶ ${prefix}script
│ ▶ ${prefix}repo
╰───────────────╯

*Powered by Dev Weed*`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363407561123100@newsletter',
                        newsletterName: 'WEED MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363407561123100@newsletter',
                        newsletterName: 'WEED TECH',
                        serverMessageId: -1
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
