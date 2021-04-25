const Asena = require('../events');
const {MessageType, Mimetype} = require('@adiwajshing/baileys');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const {execFile} = require('child_process');
const cwebp = require('cwebp-bin');
const Config = require('../config');

const Language = require('../language');
const Lang = Language.getString('sticker');


Asena.addCommand({pattern: 'sticker$', fromMe: false, desc: Lang.STICKER_DESC}, (async (message, match) => {    

    if (message.reply_message === false) return await message.client.sendMessage(message.jid,Lang.NEED_REPLY, MessageType.text);
    var downloading = await message.client.sendMessage(message.jid,Lang.DOWNLOADING,MessageType.text);
    var location = await message.client.downloadAndSaveMediaMessage({
        key: {
            remoteJid: message.reply_message.jid,
            id: message.reply_message.id
        },
        message: message.reply_message.data.quotedMessage
    }, __dirname+'/files/');

    if (message.reply_message.video === false && message.reply_message.image) {
        ffmpeg(location)
            .outputOptions(["-y", "-vcodec libwebp"])
            .videoFilters('scale=350:350:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=350:350:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1')
            .save(__dirname+'/files/'+'st.webp')
            .on('end', async () => {
                await message.sendMessage(fs.readFileSync( __dirname+'/files/'+'st.webp'), MessageType.sticker);
        });
    //return await message.client.deleteMessage(message.jid, {id: downloading.key.id, remoteJid: message.jid, fromMe: true})

    }
}));
