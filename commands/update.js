const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const settings = require('../settings');

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

async function updateViaGit() {
    try {
        const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
        await run('git fetch --all --prune');

        // Eseye main branch, sinon master
        let newRev;
        try { newRev = (await run('git rev-parse origin/main')).trim(); } 
        catch { newRev = (await run('git rev-parse origin/master')).trim(); }

        const alreadyUpToDate = oldRev === newRev;
        if (!alreadyUpToDate) {
            const commits = await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
            const files = await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
            await run(`git reset --hard ${newRev}`);
            await run('git clean -fd');
            console.log('[update][git] Updated commits:\n', commits);
            console.log('[update][git] Changed files:\n', files);
        }
        await run('npm install --no-audit --no-fund');
        return { alreadyUpToDate, newRev };
    } catch (err) {
        throw new Error(`Git update failed: ${err.message}`);
    }
}

function downloadFile(url, dest, visited = new Set(), maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (visited.has(url) || visited.size > maxRedirects) {
            return reject(new Error('Too many redirects'));
        }
        visited.add(url);

        const client = url.startsWith('https://') ? https : http;
        const req = client.get(url, { headers: { 'User-Agent': 'KnightBot-Updater/1.0', 'Accept': '*/*' } }, res => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                const location = res.headers.location;
                if (!location) return reject(new Error(`HTTP ${res.statusCode} without Location`));
                const nextUrl = new URL(location, url).toString();
                res.resume();
                return downloadFile(nextUrl, dest, visited, maxRedirects).then(resolve).catch(reject);
            }

            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', err => { try { file.close(() => {}); } catch{} fs.unlink(dest, () => reject(err)); });
        });
        req.on('error', err => { fs.unlink(dest, () => reject(err)); });
    });
}

async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    // Linux/mac: unzip, 7z, busybox
    const tryCmds = [
        [`command -v unzip`, `unzip -o '${zipPath}' -d '${outDir}'`],
        [`command -v 7z`, `7z x -y '${zipPath}' -o'${outDir}'`],
        [`busybox unzip -h`, `busybox unzip -o '${zipPath}' -d '${outDir}'`]
    ];
    for (const [check, cmd] of tryCmds) {
        try { await run(check); await run(cmd); return; } catch {}
    }
    throw new Error("No system unzip tool found (unzip/7z/busybox). Git mode is recommended.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) throw new Error('No ZIP URL configured.');

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');

    console.log('[update][zip] Downloading ZIP from', zipUrl);
    await downloadFile(zipUrl, zipPath);

    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    const ignore = ['node_modules', '.git', 'session', 'tmp', 'temp', 'data', 'baileys_store.json'];
    const copied = [];
    let preservedOwner = settings.ownerNumber || null;
    let preservedBotOwner = settings.botOwner || null;

    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);

    // Preserve settings
    try {
        const settingsPath = path.join(process.cwd(), 'settings.js');
        if (fs.existsSync(settingsPath)) {
            let text = fs.readFileSync(settingsPath, 'utf8');
            if (preservedOwner) text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${preservedOwner}'`);
            if (preservedBotOwner) text = text.replace(/botOwner:\s*'[^']*'/, `botOwner: '${preservedBotOwner}'`);
            fs.writeFileSync(settingsPath, text);
        }
    } catch(e){ console.warn('[update][zip] Failed to preserve settings', e.message); }

    fs.rmSync(extractTo, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });

    console.log('[update][zip] Files copied:', copied.length);
    return { copiedFiles: copied };
}

async function restartProcess(sock, chatId, message) {
    try { await sock.sendMessage(chatId, { text: '✅ Update complete! Restarting…' }, { quoted: message }); } catch {}
    try { await run('pm2 restart all'); return; } catch {}
    console.log('[update] Restarting process manually');
    setTimeout(() => process.exit(0), 2000); // 2s pou mesaj fin voye
}

async function updateCommand(sock, chatId, message, senderIsSudo, zipOverride) {
    if (!message.key.fromMe && !senderIsSudo) {
        await sock.sendMessage(chatId, { text: 'Only bot owner or sudo can use .update' }, { quoted: message });
        return;
    }

    try {
        await sock.sendMessage(chatId, { text: '🔄 Updating bot…' }, { quoted: message });

        if (await hasGitRepo()) {
            console.log('[update] Using Git mode');
            const { alreadyUpToDate, newRev } = await updateViaGit();
            const msg = alreadyUpToDate ? `✅ Already up to date: ${newRev}` : `✅ Updated to ${newRev}`;
            console.log('[update][git] ' + msg);
        } else {
            console.log('[update] Using ZIP mode');
            await updateViaZip(sock, chatId, message, zipOverride);
        }

        await restartProcess(sock, chatId, message);
    } catch (err) {
        console.error('[update] Failed:', err);
        await sock.sendMessage(chatId, { text: `❌ Update failed:\n${err.message}` }, { quoted: message });
    }
}

module.exports = updateCommand;

