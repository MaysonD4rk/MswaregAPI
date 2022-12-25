const User = require('./User');
const bcrypt = require('bcrypt');
const knex = require('../database/connection');


class PasswordToken{
    async create(email, method){
        var user = await User.findByEmail(email);

        
        
        if (user != undefined) {
            try {
                console.log('entrou na parte de delete')
                await knex.delete().where({ user_id: user.id, method }).table('passwordtokens');
            } catch (error) {
                console.log(error)
            }
            //random numbers
            var rn1 = Math.floor((Math.random() * 1000) + 1);
            var rn2 = Math.floor((Math.random() * 1000) + rn1);
            const rn = `${rn1+user+rn2}`;
            const rnMthd2 = `${rn1}${rn2}`
            
            try {
                var token = await bcrypt.hash(rn, 10);
            } catch (err) {
                console.log(err);
                return;
            }
            
            if (method != 'updateUserInfo'){
                try {
                    await knex.insert({
                        user_id: user.id,
                        used: 0,
                        token,
                        method: 'recoverPass',
                        createdAt: new Date()
                    }).table('passwordtokens')
                    return {status: true, token}
                } catch (err) {
                    console.log(err);
                    return {status: false}
                }
            }else{
                try {
                    await knex.insert({
                        user_id: user.id,
                        used: 0,
                        token: rnMthd2,
                        method: 'updateUserInfo',
                        createdAt: new Date()
                    }).table('passwordTokens')
                    return { status: true, token, hashedToken: rnMthd2 }
                } catch (err) {
                    console.log(err);
                    return { status: false }
                }
            }
                
                


        }else{
            return { status: false, err: "O e-mail passado não existe no banco de dados!" }
        }

    }

    async validate(token, method) {
        try {
            
            var result = await knex.select().where({ token, method }).table("passwordTokens");

            const resultDate = new Date(result[0].createdAt);
            console.log(result[0].createdAt)
            const currentDate = Date.now();
            
            if (((currentDate - resultDate)/1000/60)>3) {
                await knex.delete().where({token, method}).table('passwordtokens');
                return { status: false, msg: 'Esse código expirou, peça por um novo código :)' };
            }else{
                if (result.length > 0) {
                    var tk = result[0];
    
                    if (!!tk.used) {
                        return { status: false, msg: 'Código já foi usado' }
                    } else {
                        return { status: true, msg: 'Alteração concluída!', token: tk }
                    }
                } else {
                    return { status: false, msg: 'Código não existe' }
                }
            }


        } catch (err) {
            console.log(err);
            return { status: false };
        }
    }

    async setUsed(token) {
        await knex.update({ used: 1 }).where({ token }).table('passwordtokens');
    }
}

module.exports = new PasswordToken();