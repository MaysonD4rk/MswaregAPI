
const knex = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



class User{
    async new(username, email, password){
        try {
            var hash = await bcrypt.hash(password, 10);

            function selecionarLetraAleatoria() {
                const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
                const indiceAleatorio = Math.floor(Math.random() * letras.length);
                const letraAleatoria = letras.charCodeAt(indiceAleatorio);
                return String.fromCharCode(letraAleatoria);
            }

            const personalCode = selecionarLetraAleatoria() + selecionarLetraAleatoria() + selecionarLetraAleatoria() + selecionarLetraAleatoria() + "-" + selecionarLetraAleatoria() + selecionarLetraAleatoria() + selecionarLetraAleatoria() + selecionarLetraAleatoria();
            
            var newUser = await knex.insert({ username, email, password: hash, createdAt: new Date(), personalCode,role: 0, updatedAt: new Date() }).table('users');
            await knex.insert({ userId: newUser[0], credits: 0, currentcode: personalCode }).table('userinfo');
            await knex.insert({ userId: newUser[0], IN1_notification: false, IN2_notification: false, IN3_notification: false, FN1_notification: false, FN2_notification: false, FN3_notification: false, }).table('notifications');
            return {status: true, id: newUser[0]}
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async findEmail(email){

        try {
            var result = await knex.select('email').where({email}).table('users');

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
        email = `${email}`
        try {
            var result = await knex.select('*').where({ email }).table('users');
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

    async findByUsername(username) {

        var usernameRow = {
            usersTable: {} ,
            userinfo: {} ,
        }

        try {
            usernameRow.usersTable = await knex.select( 'id', 'username', 'email' ).where({ username }).table('users');
            usernameRow.userinfo = await knex.raw(`select *, convert(profilePhoto using utf8) as photoUrl from userinfo where userId = ${usernameRow.usersTable[0].id}`);
            
            
            if (usernameRow.usersTable.length > 0 && usernameRow.userinfo.length > 0) {
                return {status: true, usernameRow};
            } else {
                return {status: false};
            }
        } catch (err) {
            console.log(err);
            return { status: false };

        }
    }

    

    async findById(id) {

        try {
            var result = await knex.raw(`SELECT id, username, email,personalCode,currentcode, convert(profilePhoto using utf8) as profilePhotoUrl,FirstName, LastName, credits, pixKey,role FROM users inner join userinfo on userId = id where id = ${id}`);
            
            
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
            var result = await knex.select('*').where({userId}).table('userinfo')
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

    async getUsersRelations(offset, userId, mode){
        if (mode == 'follower') {
            try {
                let followerFollowing = await knex.raw(`
                select
                follower_id, follower.username as followerUsername, convert(profilePhoto using utf8) as profilePhoto,following_id, following.username as followingUsername
                from relations
                inner join users as follower on follower.id = follower_id
                left join users as following on following.id = following_id
                left join userinfo on userId = following_id
                where following_id = ${userId}
                limit 20 offset ${offset}
                ;
                `)
    
                console.log(followerFollowing)
    
                return { status: true, result: { followerFollowing } }
    
            } catch (error) {
                return { status: false, error }
            }
            
        }else if(mode == 'following'){
            try {
                let followerFollowing = await knex.raw(`
                select
                follower_id, follower.username as followerUsername, convert(profilePhoto using utf8) as profilePhoto,following_id, following.username as followingUsername
                from relations
                inner join users as follower on follower.id = follower_id
                left join users as following on following.id = following_id
                left join userinfo on userId = following_id
                where follower_id = ${userId}
                limit 20 offset ${offset}
                ;
                `)

                console.log(followerFollowing)

                return { status: true, result: { followerFollowing } }

            } catch (error) {
                return { status: false, error }
            }
        }
    }

    async followUser(userId, followingId){

        try {
            let verifyFollow = await knex.select('*').where({ follower_id: userId, following_id: followingId }).table('relations')
            if (verifyFollow.length<1) {
                try {
                    let follow = await knex.insert({ follower_id: userId, following_id: followingId }).table('relations')
                    return { status: true, msg: 'follow bem sucedido!', follow: true}
                } catch (error) {
                    return { status: false, error }
                }
            }else{
                await knex.delete().where({ follower_id: userId, following_id: followingId }).table('relations')
                return {status: true, msg: 'deletado com sucesso', follow: false}
            }
        } catch (error) {
            console.log(error)
        }
    }

    async verifyFollow(userId, followingId){
        console.log(userId, followingId)
        try {
            let follow = await knex.select('*').where({ follower_id: userId, following_id: followingId }).table('relations')
            console.log(follow);
            return { status: true, result: follow }
        } catch (error) {
            return { status: false, error }
        }
    }

    async updateuserinfo(id, aboutMe){
        var user = await this.findById(id);

        if (user != undefined) {

            if (aboutMe != undefined) {
                try {
                    await knex.update({AboutMe: aboutMe}).where({ userId: id }).table('userinfo');
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
                await knex.update({ profilePhoto: url}).where({ userId }).table('userinfo');
                return { status: true }
            } catch (error) {
                return { status: false, error }
            }
        }
    }
    

    async updateInfo(FirstName, LastName, pixKey, userId){
        
        try {
            const updateInfoStatus = await knex.update({ FirstName, LastName, pixKey }).where({ userId }).table('userinfo');
            
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

    async getActiveNotifications(userId){
        try {
            const notificationsList = await knex.select('*').where({ userId }).table('notifications');
            return { status: true, notificationsList }
        } catch (error) {
            return { status: false, error }
        }
    }

    async getSearchListUser(wildCard, offset){
        try {
            let results = await knex.raw(`select users.id as id, username, convert(profilePhoto using utf8) as profilePhoto from users 
                        inner join userinfo on userinfo.userId = id
                        where username LIKE "%${wildCard}%"
                        limit 20 offset ${offset}
                        ;`)
            return { status: true, results: results[0] }
        } catch (error) {
            return { status: false, error }
        }
    }


    async changeUsername(userId, username){

        const currentUser = await this.findById(userId);
        const currentCredits = parseFloat(currentUser[0].credits);
        const subCredits = `${(currentCredits - 10.00)}`;

        try {
            await knex.update({username}).where({id: userId}).table('users');
            await knex.update({ credits: subCredits }).where({userId}).table('userinfo');
            return {status: true, msg: 'username trocado com sucesso!'}
        } catch (error) {
            return { status: false, msg: 'não foi possível trocar username', error }

        }



    }

    async userHelpInfo(userId){
        const info = {}
        function returnIncrease(value) {
            var result = (2.5 / 100) * value;
            return result
        }
        try {
            const totalInvestment = await knex('investments')
                    .where({userId})
                    .sum('investment as totalInvestiment')
                    .first()
            const totalInvestmentByCharge = await knex('charge')
                    .where({ userId, chargeStatus: 'pago' })
                    .sum('chargeValue as totalChargeValue')
                    .first();

            const countIdeasHelped = await knex('investments')
                .where({userId})
                .countDistinct('gameIdeaId as countGameIdea')
                .first();
            const madeIdeas = await knex('gamesideas')
                .where({ userId })
                .count('id as countIdeas')
                .first();

            const countIdeaLikes = await knex('gameideainteraction')
                .join('gamesideas', 'gameideainteraction.gameIdeaId', 'gamesideas.id')
                .where('gamesideas.userId', userId)
                .where('liked', true)
                .count('gameideainteraction.userId as countLikes')
                .first()
            
                let totalChargeValue = !!totalInvestmentByCharge.totalChargeValue ? totalInvestmentByCharge.totalChargeValue: 0;
            totalChargeValue = returnIncrease(totalChargeValue);
            info.totalInvestiment = parseFloat(totalInvestment.totalInvestiment + totalChargeValue)
            info.ideaHelped = countIdeasHelped.countGameIdea
            info.madeIdeas = madeIdeas.countIdeas
            info.countIdeaLikes = countIdeaLikes.countLikes
            

            return { status: true, info }
            // - done - select count(gameideainteraction.userId) from gameideainteraction inner join gamesideas on gameIdeaId = gamesideas.id where gamesideas.userId = 20 AND liked = true;
            // - done - select count(id) from gamesideas where userId = 20; 
            // - done - select count(DISTINCT gameIdeaId) as count from investments where userId = 20;
            // - done - select * from charge;
            // - done - select userId, sum(investment) as totalInvestment from investments where userId = 20;
        } catch (error) {
            console.log(error)
        }
    }


    async updatePersonalCode(userId, code){
        try {
            await knex.update({currentcode: code}).where({userId}).table('userinfo');
            return {status: true}
        } catch (error) {
            console.log(error)
            return {status: false, error}
        }
    }
    

}

module.exports = new User();