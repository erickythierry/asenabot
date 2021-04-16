/* 
Heroku plugin for WhatsAsena - W4RR10R
;
you may not use this file except in compliance with the License.
WhatsAsena - Yusuf Usta
*/

const Asena = require('../events');
const Config = require('../config');
const Heroku = require('heroku-client');
const {secondsToHms} = require('./afk');
const got = require('got');
const {MessageType} = require('@adiwajshing/baileys');

const Language = require('../language');
const Lang = Language.getString('heroku');

const heroku = new Heroku({
    token: Config.HEROKU.API_KEY
});


let baseURI = '/apps/' + Config.HEROKU.APP_NAME;

Asena.addCommand({pattern: 'restart', fromMe: true, desc: Lang.RESTART_DESC}, (async (message, match) => {

    await message.client.sendMessage(message.jid,Lang.RESTART_MSG, MessageType.text);
    console.log(baseURI);
    await heroku.delete(baseURI + '/dynos').catch(async (error) => {
        await message.client.sendMessage(message.jid,error.message, MessageType.text);
    });
}));

Asena.addCommand({pattern: 'shutdown', fromMe: true, desc: Lang.SHUTDOWN_DESC}, (async(message, match) => {

    await heroku.get(baseURI + '/formation').then(async (formation) => {
        forID = formation[0].id;
        await message.client.sendMessage(message.jid,Lang.SHUTDOWN_MSG, MessageType.text);
        await heroku.patch(baseURI + '/formation/' + forID, {
            body: {
                quantity: 0
            }
        });
    }).catch(async (err) => {
        await message.client.sendMessage(message.jid,error.message, MessageType.text);
    });
}));


if (Config.WORKTYPE == 'private') {

    Asena.addCommand({pattern: 'dyno', fromMe: true, desc: Lang.DYNO_DESC}, (async (message, match) => {

        heroku.get('/account').then(async (account) => {
            // have encountered some issues while calling this API via heroku-client
            // so let's do it manually
            url = "https://api.heroku.com/accounts/" + account.id + "/actions/get-quota"
            headers = {
                "User-Agent": "Chrome/80.0.3987.149 Mobile Safari/537.36",
                "Authorization": "Bearer " + Config.HEROKU.API_KEY,
                "Accept": "application/vnd.heroku+json; version=3.account-quotas",
            }
            await got(url, {headers: headers}).then(async (res) => {
               const resp = JSON.parse(res.body);
               total_quota = Math.floor(resp.account_quota);
               quota_used = Math.floor(resp.quota_used);         
               percentage = Math.round((quota_used / total_quota) * 100);
               remaining = total_quota - quota_used;
               await message.client.sendMessage(
                    message.jid,
                    Lang.DYNO_TOTAL + ": ```{}```\n\n".format(secondsToHms(total_quota))  + 
                    Lang.DYNO_USED + ": ```{}```\n".format(secondsToHms(quota_used)) +  
                    Lang.PERCENTAGE + ": ```{}```\n\n".format(percentage) +
                    Lang.DYNO_LEFT + ": ```{}```\n".format(secondsToHms(remaining)),
                    MessageType.text
               );
            }).catch(async (err) => {
                await message.client.sendMessage(message.jid,err.message, MessageType.text);     
            });        
        });
    }));
}
else if (Config.WORKTYPE == 'public') {

    Asena.addCommand({pattern: 'dyno', fromMe: false, desc: Lang.DYNO_DESC}, (async (message, match) => {

        heroku.get('/account').then(async (account) => {
            // have encountered some issues while calling this API via heroku-client
            // so let's do it manually
            url = "https://api.heroku.com/accounts/" + account.id + "/actions/get-quota"
            headers = {
                "User-Agent": "Chrome/80.0.3987.149 Mobile Safari/537.36",
                "Authorization": "Bearer " + Config.HEROKU.API_KEY,
                "Accept": "application/vnd.heroku+json; version=3.account-quotas",
            }
            await got(url, {headers: headers}).then(async (res) => {
               const resp = JSON.parse(res.body);
               total_quota = Math.floor(resp.account_quota);
               quota_used = Math.floor(resp.quota_used);         
               percentage = Math.round((quota_used / total_quota) * 100);
               remaining = total_quota - quota_used;
               await message.client.sendMessage(
                    message.jid,
                    Lang.DYNO_TOTAL + ": ```{}```\n\n".format(secondsToHms(total_quota))  + 
                    Lang.DYNO_USED + ": ```{}```\n".format(secondsToHms(quota_used)) +  
                    Lang.PERCENTAGE + ": ```{}```\n\n".format(percentage) +
                    Lang.DYNO_LEFT + ": ```{}```\n".format(secondsToHms(remaining)),
                    MessageType.text
               );
            }).catch(async (err) => {
                await message.client.sendMessage(message.jid,err.message, MessageType.text);     
            });        
        });
    }));
}

Asena.addCommand({pattern: 'setvar ?(.*)', fromMe: true, desc: Lang.SETVAR_DESC}, (async(message, match) => {

    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.KEY_VAL_MISSING, MessageType.text);

    // ================================================== CONFIG SCANNER ==================================================
    if (match[1] == 'SEND_READ: true' || match[1] == 'SEND_READ: True' || match[1] == 'SEND_READ: TRUE' || match[1] == 'SEND_READ:True' || match[1] == 'SEND_READ:TRUE' || match[1] == 'SEND_READ:ture' || match[1] == 'SEND_READ: ture' || match[1] == 'SEND_READ:ttue' || match[1] == 'SEND_READ:trie' || match[1] == 'SEND_READ: trie' || match[1] == 'SEND_READ:Trie' || match[1] == 'SEND_READ: Trie') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar a variavel_ *SEND_READ* em *TRUE* \n _Não se preocupe, irei configurá-la para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['SEND_READ']: 'true'
            }
        });
        
    }
    if (match[1] == 'SEND_READ: false' || match[1] == 'SEND_READ: False' || match[1] == 'SEND_READ: FALSE' || match[1] == 'SEND_READ:False' || match[1] == 'SEND_READ:FALSE' || match[1] == 'SEND_READ:fakse' || match[1] == 'SEND_READ: fakse' || match[1] == 'SEND_READ:falde' || match[1] == 'SEND_READ: falde' || match[1] == 'SEND_READ:flase' || match[1] == 'SEND_READ:Flase' || match[1] == 'SEND_READ: flase') {

       
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar a variavel_ *SEND_READ* em *FALSE* \n _Não se preocupe, irei configurá-la para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['SEND_READ']: 'false'
            }
        });
        
    }
    if (match[1] == 'DEBUG: false' || match[1] == 'DEBUG: False' || match[1] == 'DEBUG: FALSE' || match[1] == 'DEBUG:False' || match[1] == 'DEBUG:FALSE' || match[1] == 'DEBUG:fakse' || match[1] == 'DEBUG: fakse' || match[1] == 'DEBUG:falde' || match[1] == 'DEBUG: falde' || match[1] == 'DEBUG:flase' || match[1] == 'DEBUG:Flase' || match[1] == 'DEBUG: flase') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar o_ *DEBUG* em *false* \n _Não se preocupe, irei configurá-lo para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['DEBUG']: 'false'
            }
        });
        
    }
    if (match[1] == 'BLOCK_CHAT: false' || match[1] == 'BLOCK_CHAT: False' || match[1] == 'BLOCK_CHAT: FALSE' || match[1] == 'BLOCK_CHAT:False' || match[1] == 'BLOCK_CHAT:FALSE' || match[1] == 'BLOCK_CHAT:fakse' || match[1] == 'BLOCK_CHAT: fakse' || match[1] == 'BLOCK_CHAT:falde' || match[1] == 'BLOCK_CHAT: falde' || match[1] == 'BLOCK_CHAT:flase' || match[1] == 'BLOCK_CHAT:Flase' || match[1] == 'BLOCK_CHAT: flase') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar o_ *BLOCK_CHAT* _em_ *falso.* \n _Não se preocupe, irei configurá-lo para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['BLOCK_CHAT']: 'false'
            }
        });
        
    }
    if (match[1] == 'DEBUG: true' || match[1] == 'DEBUG: True' || match[1] == 'DEBUG: TRUE' || match[1] == 'DEBUG:True' || match[1] == 'DEBUG:TRUE' || match[1] == 'DEBUG:ture' || match[1] == 'DEBUG: ture' || match[1] == 'DEBUG:ttue' || match[1] == 'DEBUG:trie' || match[1] == 'DEBUG: trie' || match[1] == 'DEBUG:Trie' || match[1] == 'DEBUG: Trie') {

       
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar a variavel_ *DEBUG* _em_ *True* \n _Não se preocupe, irei configurá-la para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['DEBUG']: 'true'
            }
        });
        
    }
    if (match[1] == 'NO_ONLİNE: false' || match[1] == 'NO_ONLİNE: False' || match[1] == 'NO_ONLİNE: FALSE' || match[1] == 'NO_ONLİNE:False' || match[1] == 'NO_ONLİNE:FALSE' || match[1] == 'NO_ONLİNE:fakse' || match[1] == 'NO_ONLİNE: fakse' || match[1] == 'NO_ONLİNE:falde' || match[1] == 'NO_ONLİNE: falde' || match[1] == 'NO_ONLİNE:flase' || match[1] == 'NO_ONLİNE:Flase' || match[1] == 'NO_ONLİNE: flase') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar a variavel_ *NO_ONLİNE* _em_ *falso.* \n _Não se preocupe, irei configurá-lo para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['NO_ONLİNE']: 'false'
            }
        });
        
    }
    if (match[1] == 'NO_ONLİNE: true' || match[1] == 'NO_ONLİNE: True' || match[1] == 'NO_ONLİNE: TRUE' || match[1] == 'NO_ONLİNE:True' || match[1] == 'NO_ONLİNE:TRUE' || match[1] == 'NO_ONLİNE:ture' || match[1] == 'NO_ONLİNE: ture' || match[1] == 'NO_ONLİNE:ttue' || match[1] == 'NO_ONLİNE:trie' || match[1] == 'NO_ONLİNE: trie' || match[1] == 'NO_ONLİNE:Trie' || match[1] == 'NO_ONLİNE: Trie') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando tornar a variavel_ *NO_ONLİNE* _em_ *verdadeira.* \n _Não se preocupe, irei configurá-la para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['NO_ONLİNE']: 'true'
            }
        });
        
    }
    if (match[1] == 'LANGUAGE:En' || match[1] == 'LANGUAGE: En' || match[1] == 'LANGUAGE: en' || match[1] == 'LANGUAGE:EN' || match[1] == 'LANGUAGE: EN' || match[1] == 'LANGUAGE:eN' || match[1] == 'LANGUAGE: eN' || match[1] == 'LANGUAGE:E N' || match[1] == 'LANGUAGE: English' || match[1] == 'LANGUAGE:English' || match[1] == 'LANGUAGE:english' || match[1] == 'LANGUAGE: english') {

       
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando alterar o idioma do bot para *inglês.* \n _Não se preocupe, irei configurá-lo para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['LANGUAGE']: 'en'
            }
        });
        
    }
    if (match[1] == 'LANGUAGE: es' || match[1] == 'LANGUAGE: Es' || match[1] == 'LANGUAGE:Es' || match[1] == 'LANGUAGE: ES' || match[1] == 'LANGUAGE:eS' || match[1] == 'LANGUAGE: eS' || match[1] == 'LANGUAGE:E S') {

        
        await message.client.sendMessage(
            message.jid,
            '_Parece que você está tentando alterar o idioma do bot para *espanhol.* \n _Não se preocupe, irei configurá-lo para você._',
            MessageType.text
        );
        return await heroku.patch(baseURI + '/config-vars', {
            body: {
                ['LANGUAGE']: 'ES'
            }
        });
        
    }
    // ================================================== END CONFIG SCANNER ==================================================

    if ((varKey = match[1].split(':')[0]) && (varValue = match[1].split(':')[1])) {
        await heroku.patch(baseURI + '/config-vars', {
            body: {
                [varKey]: varValue
            }
        }).then(async (app) => {
            await message.client.sendMessage(message.jid,Lang.SET_SUCCESS.format(varKey, varValue), MessageType.text);
        });
    } else {
        await message.client.sendMessage(message.jid,Lang.INVALID, MessageType.text);
    }
}));


Asena.addCommand({pattern: 'delvar ?(.*)', fromMe: true, desc: Lang.DELVAR_DESC}, (async (message, match) => {

    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.KEY_VAL_MISSING, MessageType.text);
    await heroku.get(baseURI + '/config-vars').then(async (vars) => {
        key = match[1].trim();
        for (vr in vars) {
            if (key == vr) {
                await heroku.patch(baseURI + '/config-vars', {
                    body: {
                        [key]: null
                    }
                });
                return await message.client.sendMessage(message.jid,Lang.DEL_SUCCESS.format(key), MessageType.text);
            }
        }
        await message.client.sendMessage(message.jid,Lang.NOT_FOUND, MessageType.text);
    }).catch(async (error) => {
        await message.client.sendMessage(message.jid,error.message, MessageType.text);
    });

}));

Asena.addCommand({pattern: 'getvar ?(.*)', fromMe: true, desc: Lang.GETVAR_DESC}, (async (message, match) => {

    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.KEY_VAL_MISSING, MessageType.text);
    await heroku.get(baseURI + '/config-vars').then(async (vars) => {
        for (vr in vars) {
            if (match[1].trim() == vr) return await message.sendMessage("```{} - {}```".format(vr, vars[vr]));
        }
        await message.client.sendMessage(message.jid,Lang.NOT_FOUND, MessageType.text);
    }).catch(async (error) => {
        await message.client.sendMessage(message.jid,error.message, MessageType.text);
    });
}));
