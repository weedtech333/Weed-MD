const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
  try {
    // Get text safely
    const text =
      message?.message?.conversation ||
      message?.message?.extendedTextMessage?.text ||
      '';

    const args = text.trim().split(/\s+/).slice(1);
    const searchQuery = args.join(' ');

    if (!searchQuery)
      return sock.sendMessage(chatId, { text: "❌ Please enter a song name!" });

    // Search YouTube
    const search = await yts(searchQuery);
    const video = search.videos?.[0];
    if (!video)
      return sock.sendMessage(chatId, { text: "❌ No songs found!" });

    // Loading message
    await sock.sendMessage(chatId, { text: "_⏳ Downloading your song, please wait..._" });

    // Call API with timeout
    const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(apiUrl, { timeout: 15000 });
    const result = response?.data?.result;

    if (!response.data?.status || !result?.downloadUrl)
      return sock.sendMessage(chatId, { text: "❌ Failed to fetch audio from API." });

    const title = result.title || video.title || 'Unknown Song';

    // Send audio
    await sock.sendMessage(
      chatId,
      {
        audio: { url: result.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `🎵 *Title:* ${title}\n🎶 *Quality:* MP3`
      },
      { quoted: message }
    );

  } catch (error) {
    console.error('Error in play command:', error);
    await sock.sendMessage(chatId, { text: "❌ Download failed. Try again later." });
  }
}

module.exports = playCommand;
