const knex = require('../database/connection');


class SendAMsg{
    
    async writeMsg(id, msg, recipientId){

        if (id != undefined && msg != undefined && recipientId != undefined) {
            
            try {
                await knex.insert({userId: id, recipientId, msg, createdAt: new Date()}).table('sendletter');
                return {status: true, msg:'mensagem escrita com sucesso'}
            } catch (err) {
                console.log(err)
                return {status: false, msg: err}
            }

        }

    }


    async listMsgs(offset){
        try {

            var result = await knex.raw(`SELECT userinfo.userid as userIdSenter, convert(userinfo.profilePhoto using utf8) as profilePhoto,senter.username, recipient.username as recipientName, sendletter.msg
FROM mswareg_dev.sendletter 
INNER JOIN users as senter ON senter.id = sendletter.userId
INNER JOIN userinfo on userinfo.userId = sendletter.userId
INNER JOIN users as recipient ON recipient.id = sendletter.recipientId limit 15 offset ${offset};`);

            if (result[0].length > 0) {
                return { status: true, row: result[0] }
            } else {
                return { status: false, msg: "não tem mensagens" };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error }
        }
    }

    async searchForMsgUsername(offset, wildcardChar) {
        try {

            let result = await knex.raw(`SELECT userinfo.userid as userIdSenter, convert(userinfo.profilePhoto using utf8) as profilePhoto,senter.username, recipient.username as recipientName, sendletter.msg, sendletter.createdAt
FROM mswareg_dev.sendletter 
INNER JOIN users as senter ON senter.id = sendletter.userId
INNER JOIN userinfo on userinfo.userId = sendletter.userId
INNER JOIN users as recipient ON recipient.id = sendletter.recipientId
where senter.username LIKE "%${wildcardChar}%" OR recipient.username LIKE "%${wildcardChar}%"
order by createdAt DESC
limit 15 offset ${offset};`);

            if (result[0].length > 0) {
                return { status: true, row: result[0] }
            } else {
                return { status: false, msg: "não tem mensagens" };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error }
        }
    }

    async searchUser(wildcardChar){
        try {

            var result = await knex.raw(`SELECT username from users where username LIKE "%${wildcardChar}%";`);

            if (result[0].length > 0) {
                return { status: true, row: result[0] }
            } else {
                return { status: false, msg: "não encontrei usuários" };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error }
        }
    }

    async searchForMsg(offset, wildCard){
        try {

            let result = await knex.raw(`
            SELECT userinfo.userid as userIdSenter, convert(userinfo.profilePhoto using utf8) as profilePhoto,senter.username, recipient.username as recipientName, sendletter.msg, sendletter.createdAt
FROM mswareg_dev.sendletter 
INNER JOIN users as senter ON senter.id = sendletter.userId
INNER JOIN userinfo on userinfo.userId = sendletter.userId
INNER JOIN users as recipient ON recipient.id = sendletter.recipientId
where msg LIKE "%${wildCard}%"
order by createdAt DESC
limit 15 offset ${offset};
`);

            if (result[0].length > 0) {
                return { status: true, row: result[0] }
            } else {
                return { status: false, msg: "não tem mensagens" };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error }
        }
    }



}

module.exports = new SendAMsg();