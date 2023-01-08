
const express = require('express');
const app = express();
const User = require('../models/User');
var jwt = require("jsonwebtoken");


var bcrypt = require("bcrypt");
const passwordToken = require('../models/PasswordToken');

const sendEmail = require('../methods/sendEmail');

class UserController{

    async create(req, res){

        var username = req.body.username
        var email = req.body.email
        var password = req.body.password

        if (email == undefined) {
            
            return res.status(400)
            
        }
        
        var emailExist = await User.findEmail(email);
        
        var usernameExist = await User.findUsername(username);
        
        if (emailExist || usernameExist) {
            console.log('entrou aqui')
            res.status(409);
        }


        try {
            var result = await User.new(username, email, password)
            var token = jwt.sign({ email: email, role: 0, password }, process.env.SECRET);
            res.json({result, token})
            res.status(200);
            
        } catch (error) {
            console.log(error)
            return error;
        }
    }

    async findUser(req, res) {
        var id = req.params.id;
        var user = await User.findById(id);
        if (user == undefined) {
            res.status(404);
            res.json({});
        } else {
            res.status(200)
            res.json(user);
        }
    }

    async remove(req, res){
        var id = req.params.id;
        console.log(id);

        var result = await User.delete(id);
        console.log(result);
        if (result.status) {
            res.status(200);
            res.send("Tudo OK!");
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async edit(req, res){
        var id = req.body.id;
        var email = req.body.email;
        var username = req.body.username;
        var role = req.body.role;

        if (id == undefined) {
            res.status(406)
            res.send('user não existe!')
        }else{
            try {
                await User.update(id, email, username, role);
                res.send('editado com sucesso');
                res.status(200)
            } catch (error) {
                console.log(error)
                res.status(406);
            }
            
        }


    }

    async login(req, res) {
        var { email, password } = req.body;

        var user = await User.findByEmail(email);

        if (user != undefined) {
           
            const result = await bcrypt.compare(password, user.password);
            

            if (result) {
                
                var token = jwt.sign({email: user.email, role: user.role, password}, process.env.SECRET);

                res.status(200);
                res.json({token: token, id: user.id});


            }else{
                res.status(406);
                res.json({msg: 'senha incorreta!!'});
            }

        }else{
            res.status(406);
            res.json({ msg: 'email não corresponde a nenhum usuário' });
        }

    }

    async recoverPassword(req, res){
        var email = req.body.email;
        

        var result = await passwordToken.create(email, 'recoverPass');

        if (result.status) {
            const emailMsg = `Clique no link para redefinir sua senha - https://mswareg.mswareg.com/recovery/?token=${result.token}&email=${email}`
            try {
                console.log('chegou aqui');
                var response = await sendEmail(`${email}`, emailMsg, "PASSWORD RECOVERY");
                console.log(response);
                if (response.status) {
                    res.status(200);
                    res.json({msg: 'deu certo'})
                }else{
                    res.status(406);
                    res.json({msg: 'deu errado'})
                }
            } catch (error) {
                res.status(400)
                res.json({error})
            }
        }else {
            res.status(406)
            res.send(result.err);
        }

    }

    async changePassword(req, res){
        var {token, email, password} = req.body;
        console.log('chegou aqui')
        var user = User.findByEmail(email);
        
        var result = await passwordToken.validate(token, 'recoverPass');

        if (user != undefined) {

            if (result.status) {
                try {
                    var changeStatus = await User.changePass(email, password);
                    res.status(200)
                    res.send(result.msg)
                } catch (error) {
                    res.send('deu errado')
                    res.status(400);                    
                }

                if (changeStatus.status) {
                    await passwordToken.setUsed(token);
                }

            }else{
                res.send("token não existe!");
                res.status(405);
            }

        }



    }

    async getByUsername(req, res) {
        var username = req.params.username;

        try {
            var result = await User.findByUsername(username)
            res.json({result})
        } catch (error) {
            res.json({ error })
        }
    }

    async updateUserInfo(req, res){
        var userId = req.body.userId;
        var aboutMe = req.body.aboutMe;

        try {
            var update = await User.updateuserinfo(userId, aboutMe)
            
            if (update.status) {
                res.status(200)
                res.json({ msg: 'editado com sucesso' })
            }else{
                console.log(update)
            }
        } catch (error) {
            console.log(error)
        }
    }

    async updatePass(req, res){
        var email = req.body.email;
        var newPassword = req.body.password;
        try {
            await User.changePass(email, newPassword)
            res.json({msg: 'senha alterada com sucesso'})
            res.status(200)
        } catch (error) {
            res.json(error)
            console.log(error)
            res.status(406);
        }
    }

    async updatePhotoProfile(req, res){
        const userId = req.body.userId
        const url = req.body.profileUrl;
        try {
            await User.updateProfilePhoto(userId, url)
            res.json({ msg: 'Profile photo alterada com sucesso' })
            res.status(200)
        } catch (error) {
            res.json(error)
            console.log(error)
            res.status(406);
        }

    }

    async updateInfoCode(req, res) {
        const email = req.body.email;
        const userId = req.body.userId
        console.log('chegou aqui pelo menos')
        var result = await passwordToken.create(email, 'updateUserInfo');

        if (result.status) {
            const emailMsg = `O código é: ${result.hashedToken}`
            try {
                console.log('chegou aqui');
                var response = await sendEmail(`${email}`, emailMsg, "Código para alterar informações.");
                console.log(response);
                if (response.status) {
                    res.status(200);
                    res.json({ msg: 'deu certo' })
                } else {
                    res.status(406);
                    res.json({ msg: 'deu errado' })
                }
            } catch (error) {
                res.status(400)
                res.json({ error })
            }
        } else {
            res.status(406)
            res.send(result.err);
        }

    }

    async updateInfo(req, res){
        let FirstName = req.body.FirstName; 
        let LastName = req.body.LastName; 
        let userId = req.body.userId
        let pixKey = req.body.pixKey
        let token = req.body.token;

        const result = await passwordToken.validate(token, 'updateUserInfo');
        console.log(result)
        try {
            if (result.status) {
                const updatestatus = await User.updateInfo(FirstName, LastName, pixKey, userId)
                
                if (updatestatus.status) {
                    res.status(200)
                    await passwordToken.setUsed(token);
                    res.json({ msg: result.msg })
                }else{
                    res.json({msg: result.msg})
                    res.status(406);
                }
            }else{
                res.json({msg: result.msg})
                res.status(406);
            }
        } catch (error) {
            res.json(error)
            console.log(error)
            res.status(406);
        }


    }

    async updateNotifications(req, res){
        const userId = req.body.userId
        console.log(userId)
        const notifications = {
            IN1_notification: req.body.notification1,
            IN2_notification: req.body.notification2,
            IN3_notification: req.body.notification3,
            FN1_notification: req.body.notification4,
            FN2_notification: req.body.notification5,
            FN3_notification: req.body.notification6

        }
        console.log(notifications)

        try {
            const result = await User.updateNotifications(notifications, userId);
            
            if (result.status) {
                res.status(200)
                res.json({result})
            }else{
                res.status(406)
            }
            
        } catch (error) {
            res.status(406)
            res.json({error})
        }


    }


    async verifyActiveNotifications(req, res){
        const userId = req.params.userId;
        console.log(userId)
        try {
            const notificationsList = await User.getActiveNotifications(userId);
            console.log(notificationsList);
            res.status(200)
            res.json(notificationsList) 
        } catch (error) {
            res.status(406)
            console.log(error)
            res.json(error) 
        }
    }


    async getSearchListUser(req, res){
        let userQuery = req.params.userQuery;
        let offset = req.params.offset == undefined || req.params.offset < 0 ? 0 : req.params.offset;
        try {
            let results = await User.getSearchListUser(userQuery, offset);
            if (results.status) {
                res.json({results: results.results})
                res.status(200)
            }else{
                res.json({ error: 'deu erro' })
                res.status(406)
            }
        } catch (error) {
            res.json({ error })
            res.status(406)
        }
    }

    async followUser(req,res){
        let userId = req.body.userId;
        let followingId = req.body.followingId
        
        try {
            let result = await User.followUser(userId, followingId)
            if (result.status) {
                res.json({ msg: result.msg, follow: result.follow })
                res.status(200)
            }else{
                res.status(406)
                res.json({ msg: 'algo deu errado...' })
            }
        } catch (error) {
            res.json({error})
            res.status(406)
        }
    }
    async verifyFollow(req,res){
        let userId = req.params.userId;
        let followingId = req.params.followingId
        
        try {
            let result = await User.verifyFollow(userId, followingId)
            
            if (result.status) {
                if (result.result.length<1) {
                    res.json({ follow: false })
                    res.status(200)
                }else{
                    res.json({ follow: true })
                    res.status(200)
                }
            } else {
                res.json({ msg: 'algo deu errado...' })
                res.status(406)
            }
        } catch (error) {
            res.json({ error })
            res.status(406)
        }
    }

    async changeUsername(req, res){
        const username = req.body.username;
        const userId = req.body.userId;

        const usernameExist = await User.findByUsername(username);
        
        if (!usernameExist.status) {

            const userInfo = await User.findById(userId);
            console.log(parseFloat(userInfo[0].credits))
            
            if (parseFloat(userInfo[0].credits)>=10) {
                try {
                    const changeResult = await User.changeUsername(userId, username);
                    if (changeResult.status) {
                        res.status(200);
                        res.json({msg: 'alterado com sucesso'});
                    }else{
                        res.status(406);
                        res.json({ msg: 'não foi possível alterar o nome.' });
                    }
                } catch (error) {
                    res.status(406);
                    res.json(error);
                }
            }else{
                res.status(406);
                res.json({ msg: 'Não tem créditos o suficiente.' });
            }


        }else{ 
            res.status(405)
            res.json({msg: 'username já está sendo utilizado!'});
        }
    }

    async userHelpInfo(req, res){
        const userId = req.params.userId;

        try {
            const userInfo= await User.userHelpInfo(userId);
            res.status(200);
            res.json(userInfo)
        } catch (error) {
            res.status(406);
            res.json(error)
        }
    }

    async updatePersonalCode(req, res){
        const {userId, code} = req.body
        try {
            const updateCurrentCode = await User.updatePersonalCode(userId, code);
            if (updateCurrentCode.status) {
                res.status(200)
                res.send('atualizado com sucesso');
            }else{
                console.log('hmmm, acho que não')
            }
        } catch (error) {
            res.status(406);
            res.send(error);
        }
    }

}

module.exports = new UserController()