const knex = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



class User{
    async new(username, email, password){
        try {
            var hash = await bcrypt.hash(password, 10);
            console.log(hash);
            var newUser = await knex.insert({ username, email, password: hash, createdAt: new Date(), role: 0, updatedAt: new Date() }).table('users');
            await knex.insert({ userId: newUser[0], credits: 0 }).table('userinfo');
            await knex.insert({ userId: newUser[0], IN1_notification: false, IN2_notification: false, IN3_notification: false, FN1_notification: false, FN2_notification: false, FN3_notification: false, }).table('notifications');
            return {status: true, id: newUser[0]}
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async findEmail(email){

        try {
            var result = await knex.select('*').where({email}).table('users');

            if (result.length > 0) {
                return true;
            }else{
                return false;
            }
        } catch (err) {
            console.log(err);
            return undefined;

        }
    }

    async findUsername(username) {

        try {
            var result = await knex.select('*').where({ username }).table('users');

            if (result.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return undefined;

        }
    }

    async findByEmail(email) {

        try {
            var result = await knex.select('*').where({ email }).table('users');

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }
        } catch (err) {
            console.log(err);
            return undefined;

        }
    }

    async findByUsername(username) {

        var usernameRow = {
            usersTable: {} ,
            userInfo: {} ,
        }

        try {
            usernameRow.usersTable = await knex.select( 'id', 'username', 'email' ).where({ username }).table('users');
            usernameRow.userInfo = await knex.select('*').where({userId: usernameRow.usersTable[0].id}).table('userInfo');
            console.log(usernameRow);
            if (usernameRow.usersTable.length > 0 && usernameRow.userInfo.length > 0) {
                return {status: true, usernameRow};
            } else {
                return {status: false};
            }
        } catch (err) {
            console.log(err);
            return undefined;

        }
    }

    

    async findById(id) {

        try {
            var result = await knex.raw(`SELECT *, convert(profilePhoto using utf8) as profilePhotoUrl FROM users inner join userinfo on userId = id where id = ${id}`);
            console.log(result)
            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }
        } catch (err) {
            console.log(err);
            return undefined;

        }
    }

    async update(id, email, name, role){
        var user = await this.findById(id);

        if (user != undefined) {
            var editUser = {}

            if (email != undefined) {
                if (email != user.email) {
                    var result = await this.findEmail(email);
                    if (result == false) {
                        editUser.email = email;
                    }else{
                        return {status: 'EMAIL JÁ CADASTRADO!!!'}
                    }
                }
            }

            if (name != undefined) {
                editUser.name = name;
            }

            if (role != undefined) {
                editUser.role = role;
            }

            try {
                await knex.update(editUser).where({id: id}).table('users');
                return {status: true}
            } catch (error) {
                return {status:false, error}
            }




        }else{
            return {status: false, err: 'usuario não existe!!'}
        }
    }

    async delete(id){
        var user = await this.findById(id);

        console.log(user);  
        if (user != undefined) {
            try {
                await knex.delete().where({ id: id }).table('users');
                return { status: true }

            } catch (error) {
                return { status: false, error }
            }
            
        }else{
            return {status: false, err: 'usuário não existe!'}
            
        }


    }

    async changePass(email, newPassword){
        
        var emailExist = await this.findEmail(email);

        if (emailExist) {
            var hash = await bcrypt.hash(newPassword, 10);

            await knex.update({password: hash}).where({email}).table("users");

            return {status: true}
        }else{
            return {status: "email não existe!"}
        }


    }

    async getCredits(userId) {

        try {
            var result = await knex.select('*').where({userId}).table('userInfo')
            return {status: true, result}
        } catch (error) {
            return { status: false, error }

        }

    }

    async getFollows(userId){
        try {
            var followers = await knex.count('follower_id as followers').where({following_id: userId}).table('relations');
            var following = await knex.count('following_id as following').where({ follower_id: userId }).table('relations');
            
            return {status: true, result: {followers, following}}

        } catch (error) {
            return { status: false, error }
        }
    }

    async updateUserInfo(id, aboutMe){
        var user = await this.findById(id);

        if (user != undefined) {

            if (aboutMe != undefined) {
                try {
                    await knex.update({AboutMe: aboutMe}).where({ userId: id }).table('userInfo');
                    return { status: true }
                } catch (error) {
                    return { status: false, error }
                }
            }

        } else {
            return { status: false, err: 'usuario não existe!!' }
        }
    }

    async updateProfilePhoto(userId, url){
        const user = await this.findById(userId);

        if (user != undefined) {
            try {
                await knex.update({ profilePhoto: url}).where({ userId }).table('userInfo');
                return { status: true }
            } catch (error) {
                return { status: false, error }
            }
        }
    }
    

    async updateInfo(FirstName, LastName, userId){

        try {
            await knex.update({ FirstName, LastName }).where({ userId }).table('userInfo');
            return { status: true }
        } catch (error) {
            return { status: false, error }
        }

    }

    async updateNotifications(notifications, userId){
        let { IN1_notification, IN2_notification, IN3_notification, FN1_notification, FN2_notification, FN3_notification } = notifications

        try {
            await knex.update({ IN1_notification, IN2_notification, IN3_notification, FN1_notification, FN2_notification, FN3_notification }).where({ userId }).table('notifications');
            return { status: true }
        } catch (error) {
            return { status: false, error }
        }

    }

}

module.exports = new User();