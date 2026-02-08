const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

const sanitize = str => str.replace(/[\\/:"*?<>|]+/g, ''); // Pou non fichye WhatsApp-safe

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await sock.sendMessage(chatId, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let videoUrl, videoTitle, thumbnail;

        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            // Si se URL YouTube
            videoUrl = text;
            const info = await ytdl.getInfo(videoUrl);
            videoTitle = info.videoDetails.title;
            thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        } else {
            // Rechèch pa mo kle
            const search = await yts(text);
            if (!search?.videos?.length) {
                await sock.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            const video = search.videos[0];
            videoUrl = video.url;
            videoTitle = video.title;
            thumbnail = video.thumbnail;
        }

        // Avi itilizatè a
        await sock.sendMessage(chatId, {
            image: { url: thumbnail },
            caption: `🎵 Downloading: *${videoTitle}*\n⏱ Duration: ${videoUrl.timestamp || 'unknown'}`
        }, { quoted: message });

        // Telechaje mizik lokalman
        const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });

        // Kreye fichye tanporè
        const fileName = sanitize(videoTitle) + '.mp3';
        const filePath = path.join(__dirname, fileName);
        const writeStream = fs.createWriteStream(filePath);

        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            // Voye fichye a WhatsApp
            await sock.sendMessage(chatId, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                fileName: fileName,
                ptt: false
            }, { quoted: message });

            // Efase fichye lokal la apre voye
            fs.unlinkSync(filePath);
        });

        stream.on('error', async (err) => {
            console.error('ytdl stream error:', err);
            await sock.sendMessage(chatId, { text: '❌ Failed to download song.' }, { quoted: message });
        });

    } catch (err) {
        console.error('Song command error:', err);
        await sock.sendMessage(chatId, { text: '❌ Failed to download song.' }, { quoted: message });
    }
}

module.exports = songCommand;
