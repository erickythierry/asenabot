

const Asena = require('../events');
const {MessageType, GroupSettingChange} = require('@adiwajshing/baileys'); // Boredom 😬

const Language = require('../language');
const Lang = Language.getString('locate'); // Language supp. 😉


    Asena.addCommand({pattern: 'locate', fromMe: true, desc: Lang.L_DESC, warn: Lang.L_WARN}, (async (message, match) => {

        var r_text = new Array ();
        r_text[0] = "GrausLatitude: 24.121231, GrausLongitude: 55.1121221"; // Actually, I don't know where is this place..
        r_text[1] = "GrausLatitude: 8.838637, GrausLongitude: -13.721434"; // U too homie

        var i = Math.floor(2*Math.random()) // Random func. 🤪

        await message.sendMessage(`Minha Localização! ${r_text[i]}`, MessageType.location); // It sends ur location. Cool tho 😱

}));
