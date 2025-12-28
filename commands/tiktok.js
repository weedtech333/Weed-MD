const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);
const { AbortController } = global;

module.exports = {
  commands: ['tiktok', 'tt', 'ttdl', 'tiktokdl'],
  handler: async ({ sock, m, sender, args, contextInfo = {} }) => {
    let tempFilePath;

    try {
      // 🔍 Detect URL anywhere in message
      const url = args.join(' ').match(/https?:\/\/\S+/)?.[0];

      if (!url || !/(tiktok\.com|vt\.tiktok\.com)/.test(url)) {
        return await sock.sendMessage(
          sender,
          {
            text: '❌ *Lien TikTok invalide*\n\nEgzanp:\n.tiktok https://vt.tiktok.com/xxxx',
            contextInfo
          },
          { quoted: m }
        );
      }

      await sock.sendMessage(
        sender,
        { text: '⏳ *Telechajman an ap fèt... tann yon ti moman*', contextInfo },
        { quoted: m }
      );

      // 🔁 Resolve redirect (vt.tiktok.com)
      const resolved = await axios.get(url, { maxRedirects: 5 });
      const finalUrl = resolved.request.res.responseUrl;

      // ✅ Reliable API
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(finalUrl)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const apiRes = await axios.get(apiUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      clearTimeout(timeout);

      if (!apiRes.data?.data?.play) {
        throw new Error('API pa retounen video a');
      }

      const videoUrl = apiRes.data.data.play;
      const author = apiRes.data.data.author?.nickname || 'Unknown';

      // 📁 Temp file
      tempFilePath = path.join(os.tmpdir(), `tiktok_${Date.now()}.mp4`);

      // ⬇️ Download video
      const videoRes = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        timeout: 30000
      });

      await streamPipeline(videoRes.data, fs.createWriteStream(tempFilePath));

      if (fs.statSync(tempFilePath).size < 1024) {
        throw new Error('Video a pa konplè');
      }

      // 📤 Send video (safe)
      await sock.sendMessage(
        sender,
        {
          video: { url: tempFilePath },
          caption:
            `🎵 *TikTok Video*\n\n` +
            `👤 *Author:* ${author}\n` +
            `🔗 *Link:* ${finalUrl}\n\n` +
            `_Downloaded via WEED MD_`,
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('TikTok Error:', err.message);

      await sock.sendMessage(
        sender,
        {
          text:
            `⚠️ *Echèk telechajman*\n\n` +
            `Rezon: ${err.message}\n\n` +
            `✔️ Eseye yon lòt video\n` +
            `✔️ Video a ka prive\n` +
            `✔️ API a ka okipe`,
          contextInfo
        },
        { quoted: m }
      );

    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
};
