const User = require('./User');
const bcrypt = require('bcrypt');
const knex = require('../database/connection');


class PasswordToken{
    async create(email){
        var user = await User.findByEmail(email);



        if (user != undefined) {
            //random numbers
            var rn1 = ((Math.random() * 100000) + 1);
            var rn2 = ((Math.random() * 100000) + rn1);
            var rn = `${rn1+user+rn2}`;

            try {
                var token = await bcrypt.hash(rn, 10);
            } catch (err) {
                console.log(err);
                return;
            }

            try {
                await knex.insert({
                    user_id: user.id,
                    used: 0,
                    token,
                    createdAt: new Date()
                }).table('passwordTokens')
                return {status: true, token}
            } catch (err) {
                console.log(err);
                return {status: false}
            }
                
                


        }else{
            return { status: false, err: "O e-mail passado não existe no banco de dados!" }
        }

    }

    async validate(token) {
        try {
            
            var result = await knex.select().where({ token }).table("passwordTokens");


            if (result.length > 0) {
                var tk = result[0];

                if (!!tk.used) {
                    return { status: false }
                } else {
                    return { status: true, token: tk }
                }
            } else {
                return { status: false }
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