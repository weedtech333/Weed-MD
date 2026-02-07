const moment = require('moment-timezone');
const fetch = require('node-fetch'); // node-fetch@2
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // 1️⃣ Reaction GitHub 🐙
    await sock.sendMessage(chatId, {
      react: {
        text: '🐙',
        key: message.key
      }
    });

    // 2️⃣ Fetch GitHub Repo (avec User-Agent)
    const res = await fetch(
      'https://api.github.com/repos/weedtech333/Weed-MD',
      {
        headers: {
          'User-Agent': 'Weed-MD-Bot',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API Error: ${res.status}`);
    }

    const json = await res.json();

    // 3️⃣ Texte formaté 
