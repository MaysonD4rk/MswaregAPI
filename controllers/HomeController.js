const express = require('express');
const app = express();
const Home = require('../models/Home');
const SAM = require('../models/SAMmodel');
const User = require('../models/User');

class HomeController{
    async index(req, res){
        var offset = req.params.offset == undefined ? 0 : req.params.offset
        var filter = req.params.filter == 'false' ? false : req.params.filter;
        var userId = req.params.userId;

        try {
            var pubList = await Home.listPub(offset, filter, userId)
            if (pubList.status) {
                res.status(200);
                res.json(pubList);
            }else{
                res.send(pubList.msg)
                res.status(405);
            }
        } catch (error) {
            res.status(400);
            return res.send(error);
        }
    }


    async findPubById(req, res){
        let id = req.params.id
        try {
            var result = await Home.findOnePub(id);
            
            res.status(200)
            return res.json({status: 200, pubData: result.finalResult });
            
        } catch (error) {
            res.status(400);
            return res.send(error);
        }
    }

    async listTrendPub(req, res){
        try {
            var pubList = await Home.listTrendPub()
            console.log(pubList)
            if (pubList.status) {
                res.status(200);
                res.json(pubList);
            } else {
                res.send(pubList.msg)
                res.status(405);
            }
        } catch (error) {
            res.status(400);
            return res.send(error);
        }
    }

    async createPub(req, res){

        const { title, ideaSummary, mainIdea, userId, categoryId, initialAmountRequired, images, allowFeedbacks } = req.body;

        console.log(allowFeedbacks)

        var pubContent = {
            title,
            ideaSummary,
            mainIdea,
            userId,
            categoryId,
            initialAmountRequired,
            images,
            allowFeedbacks
        }

        if (categoryId == 11) {
            try {
                const user = await User.findById(userId);
                console.log(user[0].role)
                if (user[0].role != 1) {
                    res.status(403);
                    res.json({msg: 'você não tem permissão para criar Trends'})
                    return 
                }
            } catch (error) {
                res.status(403);
                res.json({ msg: 'Algo deu errado, perdão!' })
                return 
            }
        }


        try {

            var create = await Home.createPub(pubContent);
            if (create.status) {
                res.send(create.msg);
                res.status(200);
            }else{
                res.send(create.msg);
                res.status(400);
            }
        } catch (error) {
            res.send(error);
            res.status(500)
        }
    }

    async editPub(req, res){
        let {pubId, title, ideaSummary, mainIdea, userId, categoryId, initialAmountRequired, images, allowFeedbacks } = req.body;

        if (categoryId == 11) {
            try {
                const user = await User.findById(userId);
                if (user[0].role != 1) {
                    res.status(403);
                    res.json({ msg: 'você não tem permissão para criar Trends' })
                }
            } catch (error) {
                res.status(403);
                res.json({ msg: 'Algo deu errado, perdão!' })
            }
        }
        
        let pubContent = {
            pubId,
            title,
            ideaSummary,
            mainIdea,
            userId,
            categoryId,
            initialAmountRequired,
            images,
            allowFeedbacks
        }
        
        
        try {
            var update = await Home.editPub(pubContent);
            if (update.status) {
                res.status(200);
                res.json(update.msg);
            } else {
                res.status(400);
                res.json(update.msg);
            }
        } catch (error) {
            res.status(500)
            res.send(error);
        }
    }


    async sendMsgList(req, res){
        let offset = req.params.offset == undefined || req.params.offset == NaN ? 0 : req.params.offset

        try {
            var msgsList = await SAM.listMsgs(offset)
            if (msgsList.status) {
                res.status(200);
                res.json(msgsList);
            } else {
                res.send(msgsList.msg)
                res.status(405);
            }
        } catch (error) {
            res.status(400);
            return res.send(error);
        }
    }

    async writeMsg(req, res){
        var { userId, recipientName, msg } = req.body;

        

        var recipientId;


        try {
            let recipientUser = await User.findByUsername(recipientName);
            
            if (recipientUser.status) {
                recipientId = recipientUser.usernameRow.usersTable[0].id
                try {
                    var create = await SAM.writeMsg(userId, msg, recipientId);
                    if (create.status) {
        
                        res.json({msg: create.msg});
                        res.status(200);
                    } else {
                        res.json({msg: create.msg});
                        res.status(400);
                    }
                } catch (error) {
                    res.json({msg: error});
                    res.status(500)
                }
            }else{
                res.status(405);
                return res.json({msg: 'não encontrado!'});
            }
        } catch (error) {
            console.log(error)
        }

    }


    async searchMsgList(req, res){
        let char = req.params.wildcard
        let offset = req.params.offset == undefined || req.params.offset == NaN ? 0 : req.params.offset
        
        SAM.searchForMsgUsername(offset, char)
        .then(result=>{
            
            res.json({result})
        })
        .catch(error=>{
            console.log(error)
        })

    }

    async searchForMsg(req, res){
        let wildCard = req.params.wildcard
        let offset = req.params.offset == undefined || req.params.offset == NaN ? 0 : req.params.offset

        SAM.searchForMsg(offset, wildCard)
            .then(result => {

                res.json({ result: result.row })
            })
            .catch(error => {
                console.log(error)
            })
    }

    async searchUser(req, res){
        let char = req.params.wildcard
        
        SAM.searchUser(char)
            .then(result => {
                
                res.json({ result })
            })
            .catch(error => {
                console.log(error)
            })
    }

    async donateCredits(req, res){
        var {userId, projectId, credits} = req.body;

        var newValue = 0;
        

        try {
            var result = await User.getCredits(userId)
            
            newValue = (parseFloat(result.result[0].credits)-credits)
            if (newValue <= 0) {
                res.status(406)
                res.json({ status: 406, msg: "saldo insuficiente" })
            }else{
                try {
                    await Home.updateCredits(userId, newValue)
                    var result = await Home.donateCredits(userId, projectId, credits)
                    if (result.status) {
                        res.json({msg: "contribuição feita, obrigado!"})
                        res.status(200)
                    }else{
                        res.status(400)
                        res.json({ status: 400, error: result.msg })
                    }
                } catch (error) {
                    res.json({ status: 400, error })
                    res.status(400)
                }
            }
            
        } catch (error) {
            console.log('caiu aqui')
            res.status(406)
            res.json({error});
        }

        

    }

    async listDonates(req, res){
        var pubId = req.params.pubId;
        
        try {
            let result = await Home.listDonates(pubId)
            if (result.status) {
                res.status(200)
                res.json({result})
            }else{
                console.log(result)
                res.status(406)
                res.json({ msg: 'algo está errado!' })
            }
        } catch (error) {
            res.status(406)
            res.json({error})
        }
    }

    async likePub(req, res){
        let {pubId, userId} = req.body;

        pubId = parseInt(pubId)
        userId = parseInt(userId)
        
        try {
            
            var checkLiked = await Home.checkLikeFavorite(pubId, userId);

            

            if (checkLiked.status) {
                if (checkLiked.row[0].liked) {
                    await Home.updateIdeaInteraction(userId, pubId, 'likeOff')
                    res.status(200)
                    return res.json({ msg: 'unliked' })
                }else{
                    await Home.updateIdeaInteraction(userId, pubId, 'like')
                    res.status(200)
                    return res.json({msg: "liked"})
                }
            }else{
                try {
                    let tryLike = await Home.likeIdea(pubId, userId)
                    return res.json({ tryLike })
                } catch (error) {
                    return res.json({error})
                }


            }
        } catch (error) {
         return res.json({error});   
        }

    }

    async favoritePub(req, res) {
        var { pubId, userId } = req.body;

        try {
            var checkFavorite = await Home.checkLikeFavorite(pubId, userId);
                
            
            if(checkFavorite.row[0].favoritedIdea){
                await Home.updateIdeaInteraction(userId, pubId, 'favoriteOff')
                return res.json({msg: 'unfavorited'})
            }else{
                await Home.updateIdeaInteraction(userId, pubId, 'favorite')
                return res.json({ msg: 'favorited' })

            }

            
        } catch (error) {
            console.log(error)
            return res.json({ error });
        }

    }

    async checkLikeFavorite(req, res){

        let {pubId, userId} = req.params
        
        pubId = parseInt(pubId)
        userId = parseInt(userId)

        try {
            var result = await Home.checkLikeFavorite(pubId, userId)
            return res.json({result})
        } catch (error) {
            return error
        }
    }

    async getFollows(req, res){
        var userId = req.params.userId;
        
        try {
          var data = await User.getFollows(userId);
          
            return res.json({ followers: data.result.followers[0].followers, following: data.result.following[0].following })
        } catch (error) {
            return res.json({error})
        }

    }

    async updateIdeaPhoto(req, res) {
        const userId = req.body.userId;
        const pubIdeaId = req.body.pubIdeaId;
        const url = req.body.imgUrl;
        
        let user = await User.findById(userId)
        
        if (user != undefined) {
            try {
                await Home.updateIdeaPhoto(userId, pubIdeaId, url)
                res.json({ msg: ' photo idea alterada com sucesso' })
                res.status(200)
            } catch (error) {
                res.json(error)
                console.log(error)
                res.status(406);
            }
        }


    }

    async searchPost(req, res){
        let wildCard = req.params.wildcard
        let offset = req.params.offset
        try {
            const result = await Home.searchPost(wildCard, offset)
            
            
            if (result.status) {
                res.status(200)
                res.json({result: result.row})
            }else{
                res.json({ result: result.status })
            }


        } catch (error) {
            res.send(' deu errado ')
            res.status(406)
            console.log(error)
        }


    }


    async sendReport(req,res){
        let userId = req.body.userId;

        try {
            let user = await User.findById(userId)
            if (user != undefined) {
                let reportMsg = req.body.reportMsg;
                let ideaReport = req.body.ideaReport;
                let reportCategorie = req.body.reportCategorie;
        
                if (userId != undefined && ideaReport != undefined && reportCategorie != undefined ){
                    try {
                        await Home.sendReport(userId, ideaReport, reportMsg, reportCategorie);
                        res.json({ msg: "Reportado com sucesso!" })

                    } catch (error) {
                        res.json({error})
                    }
                }else{
                    res.send('Algo está faltando!')
                }
                
            }
        } catch (error) {
            res.status(406)
            res.send(error)
        }

    }


    async listReports(req, res) {
        const offset = req.params.offset

        try {

            console.log(offset)
            const reports = await Home.listReports(offset)
            console.log(reports)
            if (reports.status) {
                res.json({ result: reports.result[0] });
                res.status(200)
            } else {
                res.json({ result: reports.error })
                res.status(406)
            }


        } catch (error) {
            res.status(406)
            res.json({ error })
        }
    }

    async getReportsByIdeaid(req, res) {
        const ideaId = req.params.ideaId

        try {
            const reports = await Home.getReportsByIdeaid(ideaId)
            if (reports.status) {
                res.json({ reports: reports.result });
                res.status(200)
            } else {
                res.json({ error: reports.error })
                res.status(406)
            }


        } catch (error) {
            res.status(406)
            res.json({ error })
        }

    }


    async sendFeedback(req, res) {
        
        let userId = req.body.userId;

        console.log(userId)

        try {
            let user = await User.findById(userId)
            if (user != undefined) {
                let feedbackMsg = req.body.feedbackMsg;
                let ideaId = req.body.ideaId;

                console.log(feedbackMsg)
                console.log(ideaId)


                if (userId != undefined && ideaId != undefined) {
                    console.log('chegou aqui')
                    try {
                        await Home.sendFeedback(userId, ideaId, feedbackMsg);
                        res.json({msg: "inserido com sucesso!"})
                    } catch (error) {
                        res.json({ error })
                    }
                } else {
                    res.send('Algo está faltando!')
                }

            }
        } catch (error) {
            res.status(406)
            res.send(error)
        }

    }


    async listFeedbacks(req, res) {
        const userId = req.params.userId
        const offset = req.params.offset

        try {
            const feedbacks = await Home.listFeedbacks(userId, offset)
            if (feedbacks.status) {
                res.json({ result: feedbacks.result[0] });
                res.status(200)
            } else {
                res.json({ feedback: feedbacks.error })
                res.status(406)
            }


        } catch (error) {
            res.status(406)
            res.json({ error })
        }
    }


    async getFeedbackById(req, res) {
        const id = req.params.id
        const userId = req.params.userId;

        try {
            const feedback = await Home.getFeedbackById(id)
            const onePub = await Home.findOnePub(feedback.result[0][0].ideaId);
            if(onePub.finalResult.userId != userId){
                res.json({ error: 'você não pode fazer isso >:('});
                res.status(403)
            }else{
                if (feedback.status) {
                    res.json({feedback: feedback.result[0]});
                    res.status(200)
                }else{
                    res.json({feedback: feedback.error})
                    res.status(406)
                }
            }

        } catch (error) {
            res.status(406)
            res.json({error})
        }

    }

    async deleteFeedkback(req,res){
        let id = req.params.feedbackId;
        let userId = req.params.userId
        try {
            let getFeedback = await Home.getFeedbackById(id);
            const onePub = await Home.findOnePub(getFeedback.result[0][0].ideaId);
            if (onePub.finalResult.userId != userId) {
                res.json({ error: 'você não pode fazer isso >:(' });
                res.status(403)
            } else {
                
                let result = await Home.deleteFeedkback(id)
                if (result.status) {
                    res.json({ msg: 'apagado com sucesso!' })
                    res.status(200)
                }
            }
        } catch (error) {
            res.json({ msg: error })
            res.status(406)
        }
    }

    async disableIdea(req, res){
        console.log('entrou aqui')
        const ideaId = req.body.ideaId;

        console.log(ideaId)
        try {
            let result = await Home.disableIdea(ideaId)
            if (result.status) {
                res.json({msg: 'desativado com sucesso!'})
                res.status(200)
            }
        } catch (error) {
            res.json({ msg: error })
            res.status(406)
        }
    }

    async releaseIdea(req, res) {
        console.log('entrou aqui')
        const ideaId = req.body.ideaId;

        console.log(ideaId)
        try {
            let result = await Home.releaseIdea(ideaId)
            if (result.status) {
                res.json({ msg: 'liberado com sucesso!' })
                res.status(200)
            }
        } catch (error) {
            res.json({ msg: error })
            res.status(406)
        }
    }


    async generalSeach(req,res){
        let search = req.params.search
        search = `${search}` 
        try {
            let results = await Home.generalSeach(search)
            if(results.status){
                res.json({ results: results.results })
                res.status(200)
            }else{
                res.status(406)
                res.json({msg: 'deu erro meno'})
            }
        } catch (error) {
            res.json({msg: 'deu erro meno'})
            res.status(406)
        }
        
    }

    async countPosts(req, res){
        let userId = req.params.userId
        try {
            let count = await Home.countPosts(userId)
            console.log(count.result)
            res.json({result: count.result.count[0].posts})
            res.status(200)
        } catch (error) {
            res.json({ error })
            res.status(406)
        }
    }

    async profilePageContentList(req, res){
        let userid = req.params.userid
        let offset = req.params.offset
        console.log(userid)
        try {
            let result = await Home.profilePageContentList(userid, offset)
            let arrayToSort = result.content
            
            let sortResult = arrayToSort.sort(function(a,b){return new Date(b.createdat) - new Date(a.createdat)}).slice((offset*20),((offset*20)+20))
            console.log(sortResult)
            res.status(200)
            res.json({ result: sortResult })
        } catch (error) {
            console.log(error)
            res.json({error})
            res.status(406)

        }
    }
    
    async listWithdrawalRequests(req, res){
        console.log('ta tentando entrar em listWithdrawalRequests')
        const offset = req.params.offset;
        try {
            const request = await Home.listWithdrawalRequests(offset);
            res.status(200)
            res.json(request.listWithdrawalRequests[0]);
        } catch (error) {
            res.status(406)
            res.json(error)
        }
    }

    async withdrawRequest(req, res){
        const userId = req.body.userId;
        const value = parseFloat(req.body.value)

        try {
            const requestById = await Home.withdrawRequestExist(userId);
            
            if (requestById.withdrawRequest.length > 0) {
                res.status(429)
                res.json({status: 429,msg: "Você já realizou um pedido. Tente novamente ou mais tarde!"})
            }else{
                try {
                    const request = await Home.withdrawRequest(userId, value);
                    res.status(200)
                    res.json({request, msg: 'Request realizado'});
                } catch (error) {
                    res.status(406)
                    res.json(error);
                }
            }
        } catch (error) {
            res.json(error)
            res.status(406)
        }
        
        
    }

    async findWithdrawRequestByUserId(req, res){
        const userId = req.params.userId;

        try {
            const requestById = await Home.findWithdrawRequestByUserId(userId);
            res.status(200)
            res.json(requestById.withdrawRequest);
        } catch (error) {
            res.status(406)
            res.json(error);
        }
    }

    async withdrawStatus(req, res){
        const userId = req.body.userId;
        const status = req.body.status;
        const email = req.body.email;
        const user = await User.findById(userId);
        const requestById = await Home.findWithdrawRequestByUserId(userId);


        const newValue = (parseFloat(user[0].credits) - parseFloat(requestById.withdrawRequest[0].valueReq));
        
        try {
            const result = await Home.withdrawStatus(userId, status, newValue);

            if (result.status) {
                try {
                    var response = await sendEmail(`${email}`, result.statusMsg, "STATUS DE RETIRADA");
                    if (response.status) {
                        res.status(200);
                        res.json({ msg: 'Email enviado com sucesso' })
                    } else {
                        res.status(406);
                        res.json({ msg: 'Algo está errado...' })
                    }
                } catch (error) {
                    res.status(406);
                    res.json({ msg: 'Algo está errado...' })
                }
            }else{
                res.status(406);
                res.json(error);
            }

        } catch (error) {
            res.status(406)
            res.json(error);
        }
    }

}

module.exports = new HomeController();