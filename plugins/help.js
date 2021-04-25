const Asena = require('../events');
const {MessageType, MessageOptions} = require('@adiwajshing/baileys');
const Config = require('../config');

// ==================== MAIN DESCRIPTION TEXT ====================
const h_DedEN = "Veja informações do bot pelo menu."
const matchnullEN = "========== *🆘 AJUDA 🆘* ==========\n\n🔹 */alive:* Checa se o bot está funcionando.\n\n🔹 */comandos:* Exibe a lista completa de comandos.\n🔹\n\n========== *FIM AJUDA* =========="

const notfoundEN = "```The help you wanted to get was not found!```\n```Please state the problem in a more descriptive way.```"

// ==================== ALL DESCRİPTİONS ====================

const sudoEN = "SUDO, Shares your bot to the user you choose with all its powers.If you put ,0 at the end of the number, the user can also use it in the group.\nTo use, type *.setvar SUDO:90xxxx && 90xx,90xxx [with county code, (❌ +90xx • ✅ 90xx)]*"


    
Asena.addCommand({pattern: 'ajuda ?(.*)', fromMe: false, desc: h_DedEN, onlyPm: true}, (async (message, match) => {

    if (match[1] === '') {
        return await message.client.sendMessage(
            message.jid,
            matchnullEN,
            MessageType.text
        );
    }
    else if ( (match[1].includes('SUDO') && match[1].includes('usage')) || (match[1].includes('SUDO') && match[1].includes('what')) || (match[1].includes('how') && match[1].includes('SUDO')) || (match[1].includes('set') && match[1].includes('SUDO')) || (match[1].includes('share') && match[1].includes('bot')) ) {
        return await message.client.sendMessage(
            message.jid,
            sudoEN,
            MessageType.text
        );
    }
    else {
        return await message.client.sendMessage(
            message.jid,
            notfoundEN,
            MessageType.text
        );
    }
}));

