

const knex = require('../database/connection');



class Home {

    async createPub(pubContent){        

        if (pubContent.title != undefined && pubContent.ideaSummary != undefined && pubContent.mainIdea != undefined && pubContent.categoryId != undefined) {
           
            try {
                var result = await knex.insert({userId: pubContent.userId, categoryId: pubContent.categoryId, createdAt: new Date(), initialAmountRequired: pubContent.initialAmountRequired, isActive: 1, allowFeedback: pubContent.allowFeedbacks, creationseason: 1 }).table('gamesideas');
                
                await knex.insert({ ideaId: result[0], title: pubContent.title, ideaSummary: pubContent.ideaSummary, mainIdea: pubContent.mainIdea }).table('gamesideascontent');
                pubContent.images.forEach(async (url) => {
                    try {
                        await knex.insert({ url, ideaIdRef: result[0] }).table('images');
                    } catch (error) {
                        console.log(error)
                    }
                });
                return {status: true, msg: result}
            } catch (error) {
                return {status: false, msg: error}
            }
            
            
            

        }else{
            return {status: false, msg: 'precisa preencher todos os requisitos!'};
        }

    }

    async listPub(offset, filter, userId){

        offset = offset == undefined || offset == NaN ? 0 : offset

        const sql = {
            LikedByYou: `SELECT allowFeedback, convert( ideaImage using utf8) as imageUrl, gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, liked, gamesideas.createdAt, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideascontent
                        right join gamesideas on gamesideas.id = ideaId
                        left JOIN gameideainteraction on gamesideascontent.ideaId = gameideainteraction.gameIdeaId
                        left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                        where liked = 1 AND gameideainteraction.userId = ${userId} AND gamesideas.isActive != 0
                        group by gamesideas.id
                        order by liked, likedAt DESC
                        limit 8 offset ${offset}
                            ;`,

            nonLikedByYou: `
            SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, liked, gamesideas.createdAt, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideascontent
            left join gameideainteraction on gameideainteraction.gameIdeaId = ideaId
            right join gamesideas on gamesideas.id = ideaId
            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
            where liked is null OR gameideainteraction.userId <> ${userId} AND gamesideas.isActive != 0
            group by gamesideas.id
            order by createdAt desc limit 8 offset ${offset}
                            ;
            `,

            lessLiked: `
            SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, gamesideas.createdAt, count(liked) as likes, sum(investment) as investment
            FROM ${process.env.DATABASE}.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameideainteraction.gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
            where gamesideas.isActive != 0
            group by gameideainteraction.gameIdeaId order by likes ASC limit 8 offset ${offset}
                            ;
            `,

            mostLiked: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, gamesideas.createdAt, count(liked) as likes , sum(investment) as investment
            FROM ${process.env.DATABASE}.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameideainteraction.gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
            where gamesideas.isActive != 0
            group by gameideainteraction.gameIdeaId order by likes DESC limit 8 offset ${offset}
                            ;`,

            older: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, gamesideas.createdAt, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                    where gamesideas.isActive != 0
                    group by gamesideas.id
                    order by createdAt ASC limit 8 offset ${offset}
                            ;`,

            mostRecent: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, gamesideas.createdAt, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                    where gamesideas.isActive != 0
                    group by gamesideas.id
                    order by createdAt DESC limit 8 offset ${offset}
                            ;`,

            desc: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment
                            FROM ${process.env.DATABASE}.gamesideas
                            INNER JOIN ${process.env.DATABASE}.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                            where gamesideas.isActive != 0
                            group by gamesideas.id
                            order by title desc limit 8 offset ${offset}
                            ;
                            `,
            
            asc: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment
                            FROM ${process.env.DATABASE}.gamesideas
                            INNER JOIN ${process.env.DATABASE}.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                            where gamesideas.isActive != 0
                            group by gamesideas.id
                            order by title ASC limit 8 offset ${offset}
                            ;`,

            MostInvested: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, SUM(investments.investment) as investment FROM ${process.env.DATABASE}.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            where gamesideas.isActive != 0
                            group by ideaId order by investment DESC limit 8 offset ${offset}
                            ;`,
            
            BitInvested: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            where gamesideas.isActive != 0
                            group by ideaId order by investment ASC limit 8 offset ${offset}
                            ;`,
            
            lowerInvestmentRequired: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
                                      left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                                      where gamesideas.isActive != 0
                                      group by gamesideas.id
                                      order by initialAmountRequired ASC limit 8 offset ${offset}
                            ;`,
            
            mostInvestmentRequired: `SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment FROM ${process.env.DATABASE}.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
                                      left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                                      where gamesideas.isActive != 0
                                      group by gamesideas.id
                                      order by initialAmountRequired DESC 
                                      limit 8 offset ${offset}
                            ;`
                
        }

        switch (filter) {
            case false:
            
                try {

                    var result = await knex.raw(`SELECT allowFeedback,convert( ideaImage using utf8) as imageUrl ,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, sum(investment) as investment

                            FROM ${process.env.DATABASE}.gamesideas
                            INNER JOIN ${process.env.DATABASE}.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            left JOIN investments on investments.gameideaid = gamesideascontent.ideaid
                            where gamesideas.isActive != 0
                            group by gamesideas.id
                            order by id DESC
                            limit 8 offset ${offset}
                            ;`);

                    if (result[0].length > 0) {
                        return { status: true, row: result[0] }
                    } else {
                        return { status: false, msg: "não tem posts" };
                    }
                } catch (error) {
                    console.log(error);
                    return { status: false, error }
                }

                break;
            
            case 'non-liked-by-you':
                filter = sql.nonLikedByYou;
                break;
            case 'liked-by-you':
                filter = sql.LikedByYou;
                break;
            case 'less-liked':
                filter = sql.lessLiked;
                break;
            
            case 'most-liked':
                filter = sql.mostLiked;
                break;

            case 'older':
                filter = sql.older;
                break;

            case 'most-recent':
                filter = sql.mostRecent;
                break;

            case 'DESC':
                filter = sql.desc
                break;

            case 'ASC':
                filter = sql.asc
                break;

            case 'Most-Invested':
                filter = sql.MostInvested
                break;

            case 'Bit-Invested':
                filter = sql.BitInvested
                break;

            case 'lower-investment-required':
                filter = sql.lowerInvestmentRequired
                break;

            case 'most-investment-required':
                filter = sql.mostInvestmentRequired
                break;
        }

        

        if (!!filter) {

            try {

                var result = await knex.raw(`${filter}`);

                if (result[0].length > 0) {
                    return { status: true, row: result[0] }
                } else {
                    return { status: false, msg: "não tem posts" };
                }
            } catch (error) {
                console.log(error);
                return { status: false, error }
            }


        }


    }

    async findOnePub(id){
        console.log(id);
        var finalResult = {}
        try {
            
            let result = await knex.raw(`select SUM(investment) as investment,username, gamesideas.id as id, gamesideas.userId, categories.name as category, gamesideas.createdAt as createdAt, convert(ideaImage using utf8) as mainImg from gamesideas left join categories on categories.id = gamesideas.categoryid right join users on users.id = gamesideas.userid left join investments on investments.gameIdeaId = gamesideas.id where gamesideas.id = ${id};`);
            let result2 = await knex.raw(`SELECT ideaId, convert(mainIdea using utf8) as mainIdea, title, ideaSummary from gamesideascontent where ideaId = ${result[0][0].id}; `)
            let getImages = await knex.raw(`SELECT convert(url using utf8) as url from images where ideaIdRef = ${result[0][0].id}; `)

            finalResult.id = result[0][0].id;
            finalResult.userId = result[0][0].userId;
            finalResult.createdBy = result[0][0].username;
            finalResult.totalInvestment = result[0][0].investment         
            finalResult.category = result[0][0].category;          
            finalResult.createdAt = result[0][0].createdAt;
            finalResult.mainImg = result[0][0].mainImg
            finalResult.title = result2[0][0].title;
            finalResult.ideaSummary = result2[0][0].ideaSummary;
            finalResult.mainIdea = result2[0][0].mainIdea;
            finalResult.images = getImages[0];
            


            return {status: true, finalResult};
        } catch (error) {
            return {status: false, result: 'not found'}
        }
        
    }

    async checkLikeFavorite(gameIdeaId, userId){
        try {
            var result = await knex.select('*').where({gameIdeaId, userId}).table("gameideainteraction");
            if (result.length > 0) {
                return {status: true, row: result}
            }else{
                return {status: false, msg: "não encontramos dados!"}
            }
        } catch (error) {
            return {error}
        }
    }


    async updateCredits(userId, credits){

        try {
            await knex.update({credits: `${credits}`}).where({userId}).table('userinfo');
            return {status: true, msg: "atualizado com sucesso"}
        } catch (error) {
            return { status: true, msg: error }

        }

    }

    async donateCredits(userId, projectId, credits){

        

        if (userId != undefined && projectId != undefined ) {
            
            try {
                await knex.insert({ userId: userId, investment: credits, gameIdeaId: projectId, createdAt: new Date() }).table('investments');
                return { status: true, msg: "doado com sucesso" }
            } catch (error) {
                return { status: false, msg: error }
    
            }
        }else{
            return {status: false, msg: "alguns campos estão indefinidos"}
        }
    }

    async listDonates(pubId){
        try {
            let result = await knex.raw(`SELECT convert(profilePhoto using utf8)as profilePhoto,users.username, investments.userId, investments.investment
                                        FROM ${process.env.DATABASE}.investments
                                        INNER JOIN users
                                        ON users.id = investments.userId 
                                        LEFT JOIN userinfo on userinfo.userId = investments.userid
                                        where gameIdeaId = ${pubId};`);
            return {status: true, result}
        } catch (error) {
            return error;
        }
    }


    async likeIdea(pubId, userId){
            try {
                let like = await knex.insert({userId, gameIdeaId: pubId, liked: true, likedAt: new Date()}).table('gameideainteraction')
                return {status: true, like}        
            } catch (error) {
                return error
            }
        
    }

    async updateIdeaInteraction(userId, pubId, interaction){

        if (interaction == 'likeOff') {
            await knex.update({ liked: false }).where({ userId, gameIdeaId: pubId }).table('gameideainteraction');
        } else if(interaction == 'like'){
            await knex.update({ liked: true }).where({ userId, gameIdeaId: pubId }).table('gameideainteraction');
        }else if (interaction == 'favoriteOff'){
            await knex.update({ favoritedIdea: false }).where({ userId, gameIdeaId: pubId }).table('gameideainteraction');
        }else{
            await knex.update({ favoritedIdea: true, liked: true }).where({ userId, gameIdeaId: pubId }).table('gameideainteraction');
        }

    }

    async updateIdeaPhoto(userId, pubIdeaId, url){
        
            try {
                await knex.update({ ideaImage: url }).where({ id: pubIdeaId, userId }).table('gamesideas');
                return { status: true }
            } catch (error) {
                return { status: false, error }
            }
        
        
    }

    async searchPost(wildcard, offset){
        console.log('o offset é: '+offset)
        try {

            let result = await knex.raw(`SELECT allowFeedback,count(gameideainteraction.liked) as likes ,convert( ideaImage using utf8) as imageUrl ,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM ${process.env.DATABASE}.gamesideas
                            left join gameideainteraction
							on gamesideas.id = gameideainteraction.gameIdeaId
                            INNER JOIN ${process.env.DATABASE}.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            where title like "%${wildcard}%" AND gamesideas.isActive != 0
                            group by gamesideas.id
                            order by likes DESC
                            limit 8 offset ${offset}
                            ;`);

                            

            if (result[0].length > 0) {
                return { status: true, row: result[0] }
            } else {
                return { status: false };
            }
        } catch (error) {
            console.log(error);
            return { status: false, error }
        }
    }

    async sendReport(userId, ideaId, reportMsg, categorieReport){
        console.log('chegou aqui!')

        try {
            await knex.insert({ ideaId, userId, categorieReport, reportMsg, createdAt: new Date() }).table('reports')
            return {status: true}
        } catch (error) {
            console.log(error)
            return {status: false, error}
        }
    }

    async sendFeedback(userId, ideaId, feedbackMsg){
        console.log(userId, ideaId, feedbackMsg)
        try {
            let result = await knex.insert({ ideaId, userId, feedbackMsg, createdAt: new Date() }).table('feedbacks')
            console.log(result)
            return { status: true }
        } catch (error) {
            console.log(error)
            return { status: false, error }
        }
    }


    async listReports(offset){
        try {
            let reportList = await knex.raw(`
            SELECT reports.ideaId, categorieReport, reportMsg, createdAt, gamesideascontent.title, count(reports.ideaId) as reports FROM ${process.env.DATABASE}.reports
 inner join gamesideascontent on gamesideascontent.ideaId = reports.ideaId
            group by ideaId, categorieReport
            order by reports desc
            limit 10 offset ${offset}
            ;
            `)
            return { status: true, result: reportList }
        } catch (error) {
            return {status: false, error}
        }
    }
    
    async getReportsByIdeaid(ideaId) {
        ideaId = parseInt(ideaId)
        try {
            const reports = await knex.select('*').where({ideaId}).table('reports')
            
            return {status: true, result: reports}
        } catch (error) {
            return { status: false, error }

        }
    }

    async listFeedbacks(userId, offset){
        try {
            const feedbacks = await knex.raw(`SELECT feedbacks.id, title, gamesideas.id as gameideaId, gamesideas.userId, categoryId, feedbacks.userId as userFeedback,username, feedbackMsg, feedbacks.createdAt FROM ${process.env.DATABASE}.gamesideas
                    inner join feedbacks on feedbacks.ideaId = gamesideas.id
                    inner join users on feedbacks.userId = users.id
                    inner join gamesideascontent on feedbacks.ideaId = gamesideascontent.ideaId
                    where gamesideas.userId = ${userId}
                    order by feedbacks.createdAt DESC
                    limit 10 offset ${offset}
                    ;`)
            return {status: true, result: feedbacks}
        } catch (error) {
            
        }
    }


    async getFeedbackById(id, userId){
        
        try {
            const list = await knex.raw(`
                SELECT feedbacks.id as id, title,users.username, feedbacks.ideaId, feedbackMsg, feedbacks.createdAt FROM ${process.env.DATABASE}.feedbacks
                inner join users on users.id = feedbacks.userId
                inner join gamesideascontent on gamesideascontent.ideaId = feedbacks.ideaId
                where feedbacks.id = ${id}
                ;
            `)

            return {status: true, result: list}
        } catch (error) {
            return {status: false, error}
        }

    }

    async deleteFeedkback(id) {
        
        try {
            await knex.where({ id } ).delete().table('feedbacks') 
            return { status: true }
        } catch (error) {
            return { status: false, error }
        }

    }


    async disableIdea(ideaId){
        try {
            await knex.update({ isActive: 0 }).where({ id: ideaId }).table('gamesideas');
            await knex.where({ideaId}).delete().table('reports')
            console.log('deu certo')
            return {status: true}
        } catch (error) {
            console.log(error)
            return {status: false, error}
        }
    }

    async releaseIdea(ideaId) {
        try {
            await knex.update({ isActive: 1 }).where({ id: ideaId }).table('gamesideas');
            await knex.where({ ideaId }).delete().table('reports')
            console.log('deu certo')
            return { status: true }
        } catch (error) {
            console.log(error)
            return { status: false, error }
        }
    }

    async generalSeach(wildcard){

        try {
            let ideaResult = await knex.raw(`SELECT count(ideaId) as results FROM ${process.env.DATABASE}.gamesideascontent where title LIKE "%${wildcard}%";`);
            let usersResult = await knex.raw(`select count(id) as results from users where username LIKE "%${wildcard}%";`);
            let msgsResult = await knex.raw(`select count(id) as results from sendletter where msg LIKE "%${wildcard}%";`);
            return { status: true, results: { ideaResult: ideaResult[0], usersResult: usersResult[0], msgsResult: msgsResult[0]}}
        } catch (error) {
            return {status: false}
        }

    }

    async countPosts(userId){
        try {
            let count = await knex.count('creationSeason as posts').where({ userId, creationseason: 1 }).table('gamesideas');

            return { status: true, result: { count } }

        } catch (error) {
            return { status: false, error }
        }
    }


    async profilePageContentList(userId){
        try {
            const sendLetterList = await knex.raw(`SELECT userinfo.userid as userIdSenter, convert(userinfo.profilePhoto using utf8) as profilePhoto,senter.username, recipient.username as recipientName, sendletter.msg, sendletter.createdat
FROM ${process.env.DATABASE}.sendletter 
INNER JOIN users as senter ON senter.id = sendletter.userId
INNER JOIN userinfo on userinfo.userId = sendletter.userId
INNER JOIN users as recipient ON recipient.id = sendletter.recipientId
where sendletter.recipientId = ${userId} OR sendletter.userid = ${userId}
order by sendletter.createdat
;`)
            const ideasList = await knex.raw(`SELECT gamesideas.id as id,initialAmountRequired,title, ideaSummary, convert(mainIdea using utf8) as mainIdea,allowFeedback, isActive,convert(ideaImage using utf8) as mainImg, sum(investment)as investments,gamesideas.createdAt FROM ${process.env.DATABASE}.gamesideas inner join gamesideascontent on gamesideas.id = gamesideascontent.ideaId left join investments on investments.gameideaid = gamesideas.id where gamesideas.userid=${userId} group by gamesideas.id;`)
            
            const dataContent = [...sendLetterList[0], ...ideasList[0]]
            
            return { status: true, content: dataContent }

        } catch (error) {
            console.log(error)
            return { status: false}
        }
    }

    async listWithdrawalRequests(offset){
        console.log('ta caindo aqui')
        try {
            const listWithdrawalRequests = await knex.raw(`select withdrawalRequests.id as id, users.email,userinfo.userId, credits, FirstName, Lastname, pixKey, sum(valueRequested) as valueReq from withdrawalRequests left join userinfo on userinfo.userId = withdrawalRequests.userId left join users on users.id = withdrawalRequests.userId where status IS NULL group by userId order by valueReq desc limit 30 offset ${offset};`);
            return { status: true, listWithdrawalRequests }
        } catch (error) {
            console.log(error);
            return {status: false, error}
        }
    }
    async withdrawRequest(userId, value){
        try {
            await knex.insert({ userId, valueRequested: value}).table('withdrawalRequests');
            return {status: true}
        } catch (error) {
            return { status: false, error}
        }
    }

    async findWithdrawRequestByUserId(userId){
        try {
            const withdrawRequest = await knex.raw(`select withdrawalRequests.id as id, users.email,userinfo.userId, credits, FirstName, Lastname, pixKey, sum(valueRequested) as valueReq from withdrawalRequests left join userinfo on userinfo.userId = withdrawalRequests.userId left join users on users.id = withdrawalRequests.userId where withdrawalRequests.userId = ${userId};`)
            return { status: true, withdrawRequest: withdrawRequest[0] }
        } catch (error) {
            return { status: false, error }
        }
    }


    async withdrawStatus(userId, status){
        try {
            await knex.update({ status }).where({ userId }).table('withdrawalRequests');
            if (status == 'done') {
                return {status: true, statusMsg: 'Retirada foi feita com sucesso! em caso de problema, por favor entre em contato com o suporte :)'}
            }else if(status=='deny'){
                return { status: true, statusMsg: 'Sua solicitação de retirada foi negada! Por favor solicite novamente e não se esqueça de cadastrar sua chave pix corretamente. :)' }
            }
        } catch (error) {
            return { status: false, error }
        }
    }




}

module.exports = new Home();