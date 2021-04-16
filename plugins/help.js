

const Asena = require('../events');
const {MessageType, MessageOptions} = require('@adiwajshing/baileys');
const Config = require('../config');

// ==================== MAIN DESCRIPTION TEXT ====================
const h_DedEN = "Dá informações sobre como usar o bot no menu Ajuda."
const matchnullEN = "========== *🆘 Ajuda Geral 🆘* ========== \n \n🔹 *.alive:* Verifica se o bot está sendo executado. \n \n🔹 * .cmd: *Mostra a lista completa de comandos. \n 🔹 *.setvar:* Ele define a configuração sem inserir Heroku. \n\n🔸 Para obter mais ajuda, use o comando ```.help <o tópico para o qual deseja obter ajuda> ```\nExemplo:``` .help como posso tornar público meu bot? ```\n \n ========== *Fim da Ajuda Geral* =========="
const notfoundEN = "```A ajuda que você queria obter não foi encontrada! ```\n ```Por favor, indique o problema de uma forma mais descritiva.```"

// ==================== ALL DESCRİPTİONS ====================
const pubEN = "Tornar seu bot público tornará os comandos públicos. Depois de tornado público, o usuário só pode usar comandos pessoais e administrativos. O usuário não pode usar comandos diferentes deste. \n Para tornar seu bot público, digite *.setvar WORK_TYPE: public* "

const privEN = "Tornar seu bot privado torna os comandos privados apenas para você. Ninguém pode usar. \nPara tornar seu bot privado, digite *.setvar WORK_TYPE: privado*"
const blEN = "define o bot para um grupo, pessoa ou vários chats que você eespecificoar. \n Para usá-lo, primeiro vá para o chat e digite *.jid* Em seguida, copie o codigo. (Exceto @ g.us ou @ whatsapp.net !) \nEntão use este comando *.setvar BLOCK_CHAT: id && id1, id2 ..* "
const sudoEN = "SUDO, compartilha seu bot com o usuário que você escolher com todos os seus poderes. Se você colocar 0 no final do número, o usuário também pode usá-lo no grupo. \nPara usar, digite *.setvar SUDO : 90xxxx && 90xx, 90xxx [com código do País, (❌ +55xx || ✅ 55xx)]*"


    
Asena.addCommand({pattern: 'help ?(.*)', fromMe: true, desc: h_DedEN}, (async (message, match) => {

    if (match[1] === '') {
        return await message.client.sendMessage(
            message.jid,
            matchnullEN,
            MessageType.text
        );
    }
    else if ( (match[1].includes('public') && match[1].includes('como')) || (match[1].includes('publico') && match[1].includes('definir')) || (match[1].includes('public') && match[1].includes('configuração')) ) {
        return await message.client.sendMessage(
            message.jid,
            pubEN,
            MessageType.text
        );
    }
    else if ( (match[1].includes('private') && match[1].includes('como')) || (match[1].includes('private') && match[1].includes('definir')) || (match[1].includes('private') && match[1].includes('definirting')) ) {
        return await message.client.sendMessage(
            message.jid,
            privEN,
            MessageType.text
        );
    }
    else if ( (match[1].includes('SUDO') && match[1].includes('usage')) || (match[1].includes('SUDO') && match[1].includes('what')) || (match[1].includes('como') && match[1].includes('SUDO')) || (match[1].includes('definir') && match[1].includes('SUDO')) || (match[1].includes('compartilhar') && match[1].includes('bot')) ) {
        return await message.client.sendMessage(
            message.jid,
            sudoEN,
            MessageType.text
        );
    }
    else if ( (match[1].includes('block') && match[1].includes('chat')) || (match[1].includes('como') && match[1].includes('block')) || (match[1].includes('close') && match[1].includes('bot')) || (match[1].includes('especifico') && match[1].includes('chat')) || (match[1].includes('especifico') && match[1].includes('definir')) ) {
        return await message.client.sendMessage(
            message.jid,
            blEN,
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

