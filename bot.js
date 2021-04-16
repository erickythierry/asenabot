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

${chalk.blue.italic('ℹ️ conectando ao WhatsApp... aguarde.')}`);
    });
    

    conn.on('open', async () => {
        console.log(
            chalk.green.bold('✅ Login bem sucedido!')
        );

        console.log(
            chalk.blueBright.italic('⬇️ Instalando Plugins Externos...')
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
            chalk.blueBright.italic('⬇️  Instalando Plugins...')
        );

        // ==================== Internal Plugins ====================
        fs.readdirSync('./plugins').forEach(plugin => {
            if(path.extname(plugin).toLowerCase() == '.js') {
                require('./plugins/' + plugin);
            }
        });
        // ==================== End Internal Plugins ====================

        console.log(
            chalk.green.bold('✅ Plugins instalados!')
        );
        console.log(
            chalk.green.bold('Bot Rodando...🆗')
        );
        await new Promise(r => setTimeout(r, 1100));

        if (config.WORKTYPE == 'public') {
            
            await conn.sendMessage(conn.user.jid, '*Funcionando no modo Publico!*\n\n_Por favor não teste plugins aqui. este é o seu chat de LOG._\n_Você pode testar comandos em qualquer outro chat :)_\n\n*modo publico. Para mudar isso, mude o “WORK_TYPE” para “private” nas variaveis de configuração (config.env).*\n\n*Thanks 💌*', MessageType.text);

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
                    '```digite``` *.update now* ```Para atualizar o Bot.```\n\n' + degisiklikler + '```', MessageType.text
                ); 
            }
        
            
        }
        else if (config.WORKTYPE == 'private') {
           

            

            await conn.sendMessage(conn.user.jid, '*Funcionando no modo Privado!*\n\n_Por favor não teste plugins aqui. este é o seu chat de LOG._\n_Você pode testar comandos em qualquer outro chat :)_\n\n*Modo Privado. Para mudar isso, mude o “WORK_TYPE” para “public” nas variaveis de configuração (config.env).*\n\n*Thanks 💌*', MessageType.text);

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
                '_parece que você está tentando mudar para o modo publico! Desculpe, seu_ *WORK_TYPE* _Key está incorreto!_ \n_estou tentando corrigir..._', MessageType.text
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
                '*WORK_TYPE* _Key não encontrado!_ \n_por favor digite_ ```.setvar WORK_TYPE:private``` _ou_ ```.setvar WORK_TYPE:public```', MessageType.text
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
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('split')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Split of Undefined_' +
                                '\n *Razão:* _Comandos que podem ser usados por administradores de grupo ocasionalmente não veem a função de divisão._' +
                                '\n *Solução:* _Reiniciar será suficiente._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('Ookla')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Conexão do servidor Okla_' +
                                '\n *Motivo:* _Os dados do teste de velocidade não podem ser transmitidos ao servidor._' +
                                '\n *Solução:* _Se você usá-lo mais uma vez, o problema será resolvido._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('params')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Parâmetros de áudio solicitados_' +
                                '\n *Motivo:* _Usando o comando TTS fora do alfabeto latino._' +
                                '\n *Solução:* _O problema será resolvido se você usar o comando em letras latinas._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('unlink')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido``` ==========' +
                                '\n \n *Erro principal:* _Nenhum arquivo ou diretório_' +
                                '\n *Motivo:* _Codificação incorreta do plugin._' +
                                '\n *Solução:* _Verifique os códigos do seu plugin._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('404')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Error 404 HTTPS_' +
                                '\n *Motivo:* _Falha ao se comunicar com o servidor como resultado do uso dos comandos do plugin Heroku._' +
                                '\n *Solução:* _Espere um pouco e tente novamente. Se ainda assim obtiver o erro, efetue a transação no site._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('reply.delete')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Replicar função de exclusão_' +
                                '\n *Motivo:* _Usando comandos IMG ou Wiki._' +
                                '\n *Solução:* _Não há solução para este erro. Não é um erro fatal._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('load.delete')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️* '+
                                '\n ========== ```Erro resolvido!``` ==========' +
                                '\n \n *Erro principal:* _Replicar função de exclusão_' +
                                '\n *Motivo:* _Usando comandos IMG ou Wiki._' +
                                '\n *Solução:* _Não há solução para este erro. Não é um erro fatal._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('400')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Bailyes Action Error_' +
                                '\ n *Razão:* _A razão exata é desconhecida. Mais de uma opção pode ter acionado este erro._ '+
                                '\ n *Solução:* _Se você usar novamente, pode melhorar. Se o erro persistir, você pode tentar reiniciar._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('decode')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Não é possível decodificar texto ou mídia_' +
                                '\ n *Motivo:* _uso incorreto do plugin._' +
                                '\ n *Solução:* _Por favor, use os comandos conforme escritos na descrição do plug-in._'
                                    , MessageType.text
                                );
                            }
                            else if (error.message.includes('unescaped')) {
                                return await conn.sendMessage(conn.user.jid, '*⚕️ ANÁLISE DE ERRO ⚕️ * '+
                                '\ n ========== ```Erro resolvido!``` ==========' +
                                '\ n \ n *Erro principal:* _Uso de caracteres da palavra_' +
                                '\ n *Motivo:* _Usando comandos como TTP, ATTP fora do alfabeto latino._' +
                                '\ n *Solução:* _O problema será resolvido se você usar o comando em alfabeto latino.._'
                                    , MessageType.text
                                );
                            }
                            else {
                                return await conn.sendMessage(conn.user.jid, '*🙇🏻 Desculpe. não consegui identificar esse erro! 🙇🏻*', MessageType.text
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
