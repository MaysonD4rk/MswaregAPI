const express = require('express');
const app = express();
const User = require('../models/User');
const MusclePoints = require('../models/MusclePoints')

class MusclePointsController{

    async createToken(req, res){
        const userId = req.body.userId

        try {
            const user = await User.findById(userId);
            const tokenRelation = await MusclePoints.getTokenRelation(userId);
            const token = await MusclePoints.createToken(userId, user[0].role);
            console.log(tokenRelation.result[0])
            const updateTokenPrice = await MusclePoints.updateTokenPrice(tokenRelation.result[0].tokenPrice, userId)
            res.status(200)
            res.json(token)
        } catch (error) {
            res.status(406)
            console.log(error)
            return error
        }

    }

    async getTokens(req,res){
        try {
            let tokens = await MusclePoints.getTokens();
            res.status(200)
            res.json({tokens})
        } catch (error) {
            res.status(406)
        }
    }

    async validateToken(req, res){
        const userId = req.body.userId
        const token = req.body.token
        try {
            let validate = await MusclePoints.validateToken(userId, token);
            res.status(200)
            res.json({ validate })
        } catch (error) {
            res.status(406)
        }
    }

    async getTokenRelation(req, res){
        const userId = req.params.userId
        try {
            let relation = await MusclePoints.getTokenRelation(userId)
            res.status(200)
            res.json({ relation })
        } catch (error) {
            res.status(406)
        }
    }

    async getTokenByUserId(req, res){
        const userId = req.params.userId
        try {
            let relation = await MusclePoints.getTokenByUserId(userId)
            res.status(200)
            res.json({ relation })
        } catch (error) {
            res.status(406)
        }
    }

    async validateTokenLogin(req,res){
        const userId = req.params.userId;
        const userIdSupplier = req.params.supplierId ? req.params.supplierId : false;
        console.log(userId)
        try {
            const user = await User.findById(userId);
            console.log(user)
            if (user.length>0) {
                if (user[0].role != 1) {
                    const verifyTokenRole = await MusclePoints.getTokenByUserId(userId);
                    if (verifyTokenRole.result.length>0){
                        const tokenById = await MusclePoints.getTokenById(verifyTokenRole.result[0].tokenId, userId);
                        console.log(tokenById)
                        if (verifyTokenRole.result[0].tokenRole ==  1) {
                            res.status(200)
                            res.json({ userRole: 'supplier', user, verifyTokenRole, count: tokenById.count })
                            return
                        }else{
                            res.status(200)
                            res.json({ userRole: 'customer', verifyTokenRole })
                            return 
                        }
                    }else{
                        res.status(200)
                        res.json({ userRole: 'customer', verifyTokenRole })
                        return 
                    }
                }else{
                    if (!!userIdSupplier) {
                        console.log('o userIdSupplier é: '+userIdSupplier)
                        const verifyTokenRole = await MusclePoints.getTokenByUserId(userIdSupplier);
                        console.log(verifyTokenRole)
                        if (verifyTokenRole.result.length > 0) {
                            const tokenById = await MusclePoints.getTokenById(verifyTokenRole.result[0].tokenId, userIdSupplier);
                            console.log(tokenById)
                            if (verifyTokenRole.result[0].tokenRole == 1) {
                                console.log('entrou aqui')
                                res.status(200)
                                res.json({ userRole: 'supplier', user, verifyTokenRole, count: tokenById.count })
                                return
                            }else{
                                console.log('caiu aqui meh')
                                res.status(200)
                                res.json({ userRole: 'customer', verifyTokenRole })
                                return
                            }
                        }
                    }else{
                        const verifyTokenRole = await MusclePoints.getTokenByUserId(userId);
                        res.status(200)
                        res.json({ userRole: 'master-supplier', user, verifyTokenRole})
                    }
                }
            }else{
                res.status(405)
                res.json({ msg: 'usuário não existe' })
            }
        } catch (error) {
            res.status(406)
            console.log(error)   
        }
    }

    
    async freezyToken(req, res){
        const { tokenId, userId, freezyUserId, freezyStatus } = req.body

        console.log(tokenId)

        console.log(freezyStatus)
        
        if (freezyStatus) {
            console.log('locked')
        }else{
            console.log('unlocked')
        }

        try {
            const tokenInfo = await MusclePoints.getTokenById(tokenId, userId);
            if (tokenInfo.result.tokenRole === 0) {

                if (tokenInfo.result.tokenOwnerId == userId) {
                    await MusclePoints.freezyToken(tokenId, freezyStatus, freezyUserId)
                    res.status(200)
                    res.json({ status: true })
                }else{
                    res.status(403)
                    res.json({ status: false, msg: 'você não tem permissão de fazer isso.' })
                }
                
            }else{
                if (tokenInfo.result.tokenOwnerId == userId) {
                    console.log('caiu aqui carai')
                    await MusclePoints.freezyToken(tokenId, freezyStatus, freezyUserId,true)
                    res.status(200)
                    res.json({status: true})
                }
            }
        } catch (error) {
            res.status(406)
            console.log(error)
            return  
        }
    }


    async extendTokenTime(req, res){
        const {tokenId, userId} = req.body

        console.log(tokenId)

        try {
            const tokenInfo = await MusclePoints.getTokenById(tokenId);
            console.log(tokenInfo.result.tokenRole)
            if (tokenInfo.result.tokenRole === 0) {
                console.log(tokenInfo.result)
                if (tokenInfo.result.tokenOwnerId == userId) {
                    const result = await MusclePoints.extendTokenTime(tokenId)
                    res.status(200)
                    res.json({status: result.status});
                }else{
                    res.status(403);
                    res.json({ msg: "você não tem permissão para fazer isso." })
                }
            }else{
                res.status(403);
                res.json({msg: "você não tem permissão para fazer isso."})
            }
        } catch (error) {
            res.json({error})
        }
    }

    async deleteTokenById(req,res){
        const tokenId = req.params.tokenId;
        const userId = req.params.userId;
        try {
            

            const tokenInfo = await MusclePoints.getTokenByIdwithoutInner(tokenId, userId);
            console.log(tokenInfo)
            if (tokenInfo.result.tokenOwnerId == userId) {
                
                await MusclePoints.deleteTokenById(tokenId)
                res.status(200)
                res.json({msg: 'deletado com sucesso!'});
            }else{
                res.status(403)
                res.json({msg: 'você não tem permissão para fazer isso.'})
            }
        } catch (error) {
            res.status(406)
            res.json({ error })
            console.log(error)
        }
    }

    async updateTokenPrice(req, res){
        let {userId, tokenPrice} = req.body

        try {
            await MusclePoints.updateTokenPrice(tokenPrice, userId)
            res.status(200)
            res.json({msg: 'atualizado com sucesso!'});
        } catch (error) {
            res.status(406)
            res.json({ msg: 'atualizado com sucesso!' });
        }
    }

    async getTrainLog(req, res){
        const userId = req.params.userId
        try {
            const trainLog = await MusclePoints.getTrainLog(userId)
            console.log(trainLog)
            res.status(200)
            res.json(trainLog)
            return
        } catch (error) {
            res.status(406)
            console.log(error)
            return   
        }
    }

    async payBilling(req, res){
        const {userId} = req.body;

        try {
            await MusclePoints.payBilling(userId);
            res.status(200)
            res.json({msg: 'pago com sucesso'})
        } catch (error) {
            res.status(406)
            res.json({ error })
        }
    }

    async verifyIfIsExpiringToken(req, res){
        try {
            await MusclePoints.verifyIfIsExpiringToken();
            res.status(200)
            res.json({msg: 'deu certo'})
        } catch (error) {
            res.status(406)
            res.json(error)
        }
    }


    async updateTrainLog(req, res){
        const {userId, trainLog} = req.body
        console.log(trainLog)
        console.log(userId)
        try {
            const trainLogUpdate = await MusclePoints.updateTrainLog(userId, trainLog)
            console.log(trainLogUpdate)
            res.status(200)
            res.send('atualizado com sucesso');
            return
        } catch (error) {
            res.status(406)
            res.send('Deu errado');
            console.log(error)
            return
        }
    }

}

module.exports = new MusclePointsController()