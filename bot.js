const fs = require("fs");
const path = require("path");
const events = require("./events");
const chalk = require('chalk');
const config = require('./config');
const Heroku = require('heroku-client');
const {WAConnection, MessageOptions, MessageType, Mimetype, Presence} = require('@adiwajshing/baileys');
const {Message, StringSession, Image, Video} = require('./whatsasena/');
const { DataTypes } = require('sequelize');
const { GreetingsDB, getMessage } = require("./plugins/sql/greetings");
const got = require('got');
const simpleGit = require('simple-git');
const git = simpleGit();

const heroku = new Heroku({
    token: config.HEROKU.API_KEY
});

let baseURI = '/apps/' + config.HEROKU.APP_NAME;

const Language = require('./language');
const Lang = Language.getString('updater');

// Sql
const WhatsAsenaDB = config.DATABASE.define('WhatsAsenaDuplicated', {
    info: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

fs.readdirSync('./plugins/sql/').forEach(plugin => {
    if(path.extname(plugin).toLowerCase() == '.js') {
        require('./plugins/sql/' + plugin);
    }
});

const plugindb = require('./plugins/sql/plugin');


String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

// ==================== Date Scanner ====================
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}
// ==================== End Date Scanner ====================

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

async function whatsAsena () {
    await config.DATABASE.sync();
    var StrSes_Db = await WhatsAsenaDB.findAll({
        where: {
          info: 'StringSession'
        }
    });
    
    const conn = new WAConnection();
    const Session = new StringSession();

    conn.logger.level = config.DEBUG ? 'debug' : 'warn';
    var nodb;

    if (StrSes_Db.length < 1) {
        nodb = true;
        conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
    } else {
        conn.loadAuthInfo(Session.deCrypt(StrSes_Db[0].dataValues.value));
    }

    conn.on ('credentials-updated', async () => {
        console.log(
            chalk.blueBright.italic('✅ informações de login atualizadas!')
        );

        const authInfo = conn.base64EncodedAuthInfo();
        if (StrSes_Db.length < 1) {
            await WhatsAsenaDB.create({ info: "StringSession", value: Session.createStringSession(authInfo) });
        } else {
            await StrSes_Db[0].update({ value: Session.createStringSession(authInfo) });
        }
    })    

    conn.on('connecting', async () => {
        console.log(`${chalk.green.bold('Whats')}${chalk.blue.bold('Bot')}
${chalk.white.bold('Versão:')} ${chalk.red.bold(config.VERSION)}

${chalk.blue.italic('ℹ️ Connecting to WhatsApp... Please Wait.')}`);
    });
    

    conn.on('open', async () => {
        console.log(
            chalk.green.bold('✅ Login successful!')
        );

        console.log(
            chalk.blueBright.italic('⬇️ Installing External Plugins...')
        );

        // ==================== External Plugins ====================
        var plugins = await plugindb.PluginDB.findAll();
        plugins.map(async (plugin) => {
            if (!fs.existsSync('./plugins/' + plugin.dataValues.name + '.js')) {
                console.log(plugin.dataValues.name);
                var response = await got(plugin.dataValues.url);
                if (response.statusCode == 200) {
                    fs.writeFileSync('./plugins/' + plugin.dataValues.name + '.js', response.body);
                    require('./plugins/' + plugin.dataValues.name + '.js');
                }     
            }
        });
        // ==================== End External Plugins ====================

        console.log(
            chalk.blueBright.italic('⬇️  Installing Plugins...')
        );

        // ==================== Internal Plugins ====================
        fs.readdirSync('./plugins').forEach(plugin => {
            if(path.extname(plugin).toLowerCase() == '.js') {
                require('./plugins/' + plugin);
            }
        });
        // ==================== End Internal Plugins ====================

        console.log(
            chalk.green.bold('✅ Plugins Installed!')
        );
        console.log(
            chalk.green.bold('Bot Rodando...🆗')
        );
        await new Promise(r => setTimeout(r, 1100));

        if (config.WORKTYPE == 'public') {
            
            await conn.sendMessage(conn.user.jid, '*WhatsAsena Working as Public! 🐺*\n\n_Please do not try plugins here. This is your LOG number._\n_You can try commands to any chat :)_\n\n*Your bot working as public. To change it, make the “WORK_TYPE” switch “private” in config vars.*\n\n*Thanks for using WhatsAsena 💌*', MessageType.text);

            await git.fetch();
            var commits = await git.log([config.BRANCH + '..origin/' + config.BRANCH]);
            if (commits.total === 0) {
                await conn.sendMessage(
                    conn.user.jid,
                    Lang.UPDATE, MessageType.text
                );    
            } else {
                var degisiklikler = Lang.NEW_UPDATE;
                commits['all'].map(
                    (commit) => {
                        degisiklikler += '🔸 [' + commit.date.substring(0, 10) + ']: ' + commit.message + ' <' + commit.author_name + '>\n';
                    }
                );

                await conn.sendMessage(
                    conn.user.jid,
                    '```Type``` *.update now* ```For Update The Bot.```\n\n' + degisiklikler + '```', MessageType.text
                ); 
            }
        
            
        }
        else if (config.WORKTYPE == 'private') {
           

            

            await conn.sendMessage(conn.user.jid, '*WhatsAsena Working as Private! 🐺*\n\n_Please do not try plugins here. This is your LOG number._\n_You can try commands to any chat :)_\n\n*Your bot working as private. To change it, make the “WORK_TYPE” switch “public” in config vars.*\n\n*Thanks for using WhatsAsena 💌*', MessageType.text);

            await git.fetch();
            var commits = await git.log([config.BRANCH + '..origin/' + config.BRANCH]);
            if (commits.total === 0) {
                await conn.sendMessage(
                    conn.user.jid,
                    Lang.UPDATE, MessageType.text
                );    
            } else {
                var degisiklikler = Lang.NEW_UPDATE;
                commits['all'].map(
                    (commit) => {
                        degisiklikler += '🔸 [' + commit.date.substring(0, 10) + ']: ' + commit.message + ' <' + commit.author_name + '>\n';
                    }
                );

                await conn.sendMessage(
                    conn.user.jid,
                    '```Digite``` *.update now* ```Para atualizar o Bot.```\n\n' + degisiklikler + '```', MessageType.text
                ); 
            }
            
            
        }
        else if (config.WORKTYPE == ' private' || config.WORKTYPE == 'Private' || config.WORKTYPE == ' Private' || config.WORKTYPE == 'privaye' || config.WORKTYPE == ' privaye' || config.WORKTYPE == ' prigate' || config.WORKTYPE == 'prigate' || config.WORKTYPE == 'priavte' || config.WORKTYPE == ' priavte' || config.WORKTYPE == 'PRİVATE' || config.WORKTYPE == ' PRİVATE' || config.WORKTYPE == 'PRIVATE' || config.WORKTYPE == ' PRIVATE') {

           

            await conn.sendMessage(
                conn.user.jid,
                '_Parece que voce quer mudar para o modo Privado! Desculpe, a variavel_ *WORK_TYPE* _ está incorreta!_ \n_mas tudo bem! Estou tentando corrigir para você.._', MessageType.text
            );

            await heroku.patch(baseURI + '/config-vars', {
                body: {
                    ['WORK_TYPE']: 'private'
                }
            })
            
        }
        else if (config.WORKTYPE == ' public' || config.WORKTYPE == 'Public' || config.WORKTYPE == ' Public' || config.WORKTYPE == 'publoc' || config.WORKTYPE == ' Publoc' || config.WORKTYPE == 'pubcli' || config.WORKTYPE == ' pubcli' || config.WORKTYPE == 'PUBLİC' || config.WORKTYPE == ' PUBLİC' || config.WORKTYPE == 'PUBLIC' || config.WORKTYPE == ' PUBLIC' || config.WORKTYPE == 'puvlic' || config.WORKTYPE == ' puvlic' || config.WORKTYPE == 'Puvlic' || config.WORKTYPE == ' Puvlic') {

            

            await conn.sendMessage(
                conn.user.jid,
                '_It Looks Like You Want to Switch to Public Mode! Sorry, Your_ *WORK_TYPE* _Key Is Incorrect!_ \n_Dont Worry! I am Trying To Find The Right One For You.._', MessageType.text
            );

            await heroku.patch(baseURI + '/config-vars', {
                body: {
                    ['WORK_TYPE']: 'public'
                }
            })
            
        }
        else {

            

            return await conn.sendMessage(
                conn.user.jid,
                '_The_ *WORK_TYPE* _Key You Entered Was Not Found!_ \n_Please Type_ ```.setvar WORK_TYPE:private``` _Or_ ```.setvar WORK_TYPE:public```', MessageType.text
            );
            
        }
    });

    
    conn.on('message-new', async msg => {
        if (msg.key && msg.key.remoteJid == 'status@broadcast') return;

        if (config.NO_ONLINE) {
            await conn.updatePresence(msg.key.remoteJid, Presence.unavailable);
        }

        // ==================== Greetings ====================
        if (msg.messageStubType === 32 || msg.messageStubType === 28) {
            // Görüşürüz Mesajı
            var gb = await getMessage(msg.key.remoteJid, 'goodbye');
            if (gb !== false) {
                await conn.sendMessage(msg.key.remoteJid, gb.message, MessageType.text);
            }
            return;
        } else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
            // Hoşgeldin Mesajı
            var gb = await getMessage(msg.key.remoteJid);
            if (gb !== false) {
                await conn.sendMessage(msg.key.remoteJid, gb.message, MessageType.text);
            }
            return;
        }
        // ==================== End Greetings ====================

        // ==================== Blocked Chats ====================
        if (config.BLOCKCHAT !== false) {     
            var abc = config.BLOCKCHAT.split(',');                            
            if(msg.key.remoteJid.includes('-') ? abc.includes(msg.key.remoteJid.split('@')[0]) : abc.includes(msg.participant ? msg.participant.split('@')[0] : msg.key.remoteJid.split('@')[0])) return ;
        }
        // ==================== End Blocked Chats ====================

        // ==================== Events ====================
        events.commands.map(
            async (command) =>  {
                if (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) {
                    var text_msg = msg.message.imageMessage.caption;
                } else if (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) {
                    var text_msg = msg.message.videoMessage.caption;
                } else if (msg.message) {
                    var text_msg = msg.message.extendedTextMessage === null ? msg.message.conversation : msg.message.extendedTextMessage.text;
                } else {
                    var text_msg = undefined;
                }

                if ((command.on !== undefined && (command.on === 'image' || command.on === 'photo')
                    && msg.message && msg.message.imageMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg)))) || 
                    (command.pattern !== undefined && command.pattern.test(text_msg)) || 
                    (command.on !== undefined && command.on === 'text' && text_msg) ||
                    // Video
                    (command.on !== undefined && (command.on === 'video')
                    && msg.message && msg.message.videoMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg))))) {

                    let sendMsg = false;
                    var chat = conn.chats.get(msg.key.remoteJid)
                        
                    if ((config.SUDO !== false && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == config.SUDO || config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == config.SUDO)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
                    // ==================== End Events ====================

                    // ==================== Message Catcher ====================
                    if (sendMsg) {
                        if (config.SEND_READ && command.on === undefined) {
                            await conn.chatRead(msg.key.remoteJid);
                        }
                        
                        var match = text_msg.match(command.pattern);
                        
                        if (command.on !== undefined && (command.on === 'image' || command.on === 'photo' )
                        && msg.message.imageMessage !== null) {
                            whats = new Image(conn, msg);
                        } else if (command.on !== undefined && (command.on === 'video' )
                        && msg.message.videoMessage !== null) {
                            whats = new Video(conn, msg);
                        } else {
                            whats = new Message(conn, msg);
                        }

                        if (command.deleteCommand && msg.key.fromMe) {
                            await whats.delete(); 
                        }
                        // ==================== End Message Catcher ====================

                        // ==================== Error Message ====================
                        try {
                            await command.function(whats, match);
                        }
                        catch (error) {
                            
                           
<<<<<<< HEAD
                            await conn.sendMessage(conn.user.jid, '*-- RELATÓRIO DE ERRO  --*' + 
                            '\n *Ocorreu um erro! ' +
                            '\n_Este registro de erros pode incluir seu número ou o número de um usuario. Tenha cuidado com isso! _ '+
                            '\n_Esta mensagem deveria ter ido para o seu número (mensagens salvas)._\n\n' +
                            '*Erro:* ```' + error + '```\n\n'
                                , MessageType.text, {detectLinks: false}
                            );
                            if (error.message.includes('URL')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Só URLs absolutas suportadas_' +
                                '\n *Motivo:* _O uso de ferramentas de mídia (xmedia, Sticker ..) no número do LOG._' +
                                '\n *Solução:* _Você pode usar comandos em qualquer chat, exceto no chat de LOG._'
=======
                            await conn.sendMessage(conn.user.jid, '*-- ERROR REPORT [WHATSASENA] --*' + 
                                '\n*WhatsAsena an error has occurred!*'+
                                '\n_This error log may include your number or the number of an opponent. Please be careful with it!_' +
                                '\n_You can write to our Telegram group for help._' +
                                '\n_Aslo you can join our support group:_ https://chat.whatsapp.com/Jnt9jrJdH2E456Zbchwx3t' +
                                '\n_This message should have gone to your number (saved messages)._\n\n' +
                                '*Error:* ```' + error + '```\n\n'
                                , MessageType.text, {detectLinks: false}
                            );
                            if (error.message.includes('URL')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Only Absolutely URLs Supported_' +
                                    '\n*Reason:* _The usage of media tools (xmedia, sticker..) in the LOG number._' +
                                    '\n*Solution:* _You can use commands in any chat, except the LOG number._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('split')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Split of Undefined_' +
                                '\n *Razão:* _Comandos que podem ser usados por administradores de grupo ocasionalmente não veem a função de divisão._' +
                                '\n *Solução:* _Reiniciar será suficiente._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Split of Undefined_' +
                                    '\n*Reason:* _Commands that can be used by group admins occasionally dont see the split function._ ' +
                                    '\n*Solution:* _Restarting will be enough._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('Ookla')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Conexão do servidor Okla_' +
                                '\n *Motivo:* _Os dados do teste de velocidade não podem ser transmitidos ao servidor._' +
                                '\n *Solução:* _Se você usá-lo mais uma vez, o problema será resolvido._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Ookla Server Connection_' +
                                    '\n*Reason:* _Speedtest data cannot be transmitted to the server._' +
                                    '\n*Solution:* _If you use it one more time the problem will be solved._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('params')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Parâmetros de áudio solicitados_' +
                                '\n *Motivo:* _Usando o comando TTS fora do alfabeto latino._' +
                                '\n *Solução:* _O problema será resolvido se você usar o comando em letras latinas._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Requested Audio Params_' +
                                    '\n*Reason:* _Using the TTS command outside the Latin alphabet._' +
                                    '\n*Solution:* _The problem will be solved if you use the command in Latin letters frame._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('unlink')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido``` ==========' +
                                '\n \n *Erro principal:* _Nenhum arquivo ou diretório_' +
                                '\n *Motivo:* _Codificação incorreta do plugin._' +
                                '\n *Solução:* _Verifique os códigos do seu plugin._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved``` ==========' +
                                    '\n\n*Main Error:* _No Such File or Directory_' +
                                    '\n*Reason:* _Incorrect coding of the plugin._' +
                                    '\n*Solution:* _Please check the your plugin codes._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('404')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Error 404 HTTPS_' +
                                '\n *Motivo:* _Falha ao se comunicar com o servidor como resultado do uso dos comandos do plugin Heroku._' +
                                '\n *Solução:* _Espere um pouco e tente novamente. Se ainda assim obtiver o erro, efetue a transação no site._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Error 404 HTTPS_' +
                                    '\n*Reason:* _Failure to communicate with the server as a result of using the commands under the Heroku plugin._' +
                                    '\n*Solution:* _Wait a while and try again. If you still get the error, perform the transaction on the website.._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('reply.delete')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Replicar função de exclusão_' +
                                '\n *Motivo:* _Usando comandos IMG ou Wiki._' +
                                '\n *Solução:* _Não há solução para este erro. Não é um erro fatal._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Reply Delete Function_' +
                                    '\n*Reason:* _Using IMG or Wiki commands._' +
                                    '\n*Solution:* _There is no solution for this error. It is not a fatal error._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('load.delete')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Replicar função de exclusão_' +
                                '\n *Motivo:* _Usando comandos IMG ou Wiki._' +
                                '\n *Solução:* _Não há solução para este erro. Não é um erro fatal._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Reply Delete Function_' +
                                    '\n*Reason:* _Using IMG or Wiki commands._' +
                                    '\n*Solution:* _There is no solution for this error. It is not a fatal error._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('400')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Bailyes Action Error_' +
                                '\ n *Razão:* _A razão exata é desconhecida. Mais de uma opção pode ter acionado este erro._ '+
                                '\ n *Solução:* _Se você usar novamente, pode melhorar. Se o erro persistir, você pode tentar reiniciar._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Bailyes Action Error_ ' +
                                    '\n*Reason:* _The exact reason is unknown. More than one option may have triggered this error._' +
                                    '\n*Solution:* _If you use it again, it may improve. If the error continues, you can try to restart._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('decode')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Não é possível decodificar texto ou mídia_' +
                                '\ n *Motivo:* _uso incorreto do plugin._' +
                                '\ n *Solução:* _Por favor, use os comandos conforme escritos na descrição do plug-in._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Cannot Decode Text or Media_' +
                                    '\n*Reason:* _Incorrect use of the plug._' +
                                    '\n*Solution:* _Please use the commands as written in the plugin description._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('unescaped')) {
<<<<<<< HEAD
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Uso de caracteres da palavra_' +
                                '\ n *Motivo:* _Usando comandos como TTP, ATTP fora do alfabeto latino._' +
                                '\ n *Solução:* _O problema será resolvido se você usar o comando em alfabeto latino.._'
=======
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [WHATSASENA] ⚕️*' + 
                                    '\n========== ```Error Resolved!``` ==========' +
                                    '\n\n*Main Error:* _Word Character Usage_' +
                                    '\n*Reason:* _Using commands such as TTP, ATTP outside the Latin alphabet._' +
                                    '\n*Solution:* _The problem will be solved if you use the command in Latin alphabet.._'
>>>>>>> parent of 6b409c0 (tradução de alguns comandos)
                                    , MessageType.text
                                );
                            }
                            else {
                                return await conn.sendMessage(conn.user.jid, '*🙇🏻 Sorry, I Couldnt Read This Error! 🙇🏻*' +
                                    '\n_You can write to our support group for more help._'
                                    , MessageType.text
                                );
                            }    
                                                  
                        }
                    }
                }
            }
        )
    });
    // ==================== End Error Message ====================

    try {
        await conn.connect();
    } catch {
        if (!nodb) {
            console.log(chalk.red.bold('A string da sua versão antiga está sendo renovada...'))
            conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
            try {
                await conn.connect();
            } catch {
                return;
            }
        }
    }
}

whatsAsena();
