const knex = require('../database/connection');



class Home {

    async createPub(pubContent){

        if (pubContent.title != undefined && pubContent.ideaSummary != undefined && pubContent.mainIdea != undefined && pubContent.categoryId != undefined) {
           
            try {
                var result = await knex.insert({ userId: pubContent.userId, categoryId: pubContent.categoryId, createdAt: new Date(), initialAmountRequired: pubContent.initialAmountRequired, isActive: 1 }).table('gamesideas');
                
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
            LikedByYou: `SELECT convert( ideaImage using utf8) as imageUrl, gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, liked, createdAt FROM mswareg.gamesideascontent
                        right join gamesideas on gamesideas.id = ideaId
                        left JOIN gameideainteraction on gamesideascontent.ideaId = gameideainteraction.gameIdeaId
                        where gameideainteraction.userId = ${userId} AND gamesideas.isActive != 0
                        order by liked, likedAt DESC
                        limit 8 offset ${offset}
                            ;`,

            nonLikedByYou: `
            SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, liked, createdAt FROM mswareg.gamesideascontent
            left join gameideainteraction on gameideainteraction.gameIdeaId = ideaId
            right join gamesideas on gamesideas.id = ideaId
            where liked is null OR gameideainteraction.userId <> ${userId} AND gamesideas.isActive != 0
            order by createdAt desc limit 8 offset ${offset}
                            ;
            `,

            lessLiked: `
            SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, createdAt, count(liked) as likes 
            FROM mswareg.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            where gamesIdeas.isActive != 0
            group by gameIdeaId order by likes ASC limit 8 offset ${offset}
                            ;
            `,

            mostLiked: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, createdAt, count(liked) as likes 
            FROM mswareg.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            where gamesIdeas.isActive != 0
            group by gameIdeaId order by likes DESC limit 8 offset ${offset}
                            ;`,

            older: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, createdAt FROM mswareg.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    where gamesIdeas.isActive != 0
                    order by createdAt ASC limit 8 offset ${offset}
                            ;`,

            mostRecent: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, createdAt FROM mswareg.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    where gamesIdeas.isActive != 0
                    order by createdAt DESC limit 8 offset ${offset}
                            ;`,

            desc: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            where gamesIdeas.isActive != 0
                            order by title desc limit 8 offset ${offset}
                            ;
                            `,
            
            asc: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            where gamesIdeas.isActive != 0
                            order by title ASC limit 8 offset ${offset}
                            ;`,

            MostInvested: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, SUM(investments.investment) as investmentFilter FROM mswareg.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            where gamesIdeas.isActive != 0
                            group by ideaId order by investmentFilter DESC limit 8 offset ${offset}
                            ;`,
            
            BitInvested: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, SUM(investments.investment) as investmentFilter FROM mswareg.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            where gamesIdeas.isActive != 0
                            group by ideaId order by investmentFilter ASC limit 8 offset ${offset}
                            ;`,
            
            lowerInvestmentRequired: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary FROM mswareg.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
                                      where gamesIdeas.isActive != 0
                                      order by initialAmountRequired ASC limit 8 offset ${offset}
                            ;`,
            
            mostInvestmentRequired: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary FROM mswareg.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
                                      where gamesIdeas.isActive != 0
                                      order by initialAmountRequired DESC 
                                      limit 8 offset ${offset}
                            ;`
                
        }

        switch (filter) {
            case false:
            
                try {

                    var result = await knex.raw(`SELECT convert( ideaImage using utf8) as imageUrl ,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            where gamesIdeas.isActive != 0
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
        
        var finalResult = {}
        try {
            
            let result = await knex.raw(`select id, userId, categoryId, createdAt, convert(ideaImage using utf8) as mainImg from gamesideas where id = ${id}`);
            let result2 = await knex.raw(`SELECT ideaId, convert(mainIdea using utf8) as mainIdea, title, ideaSummary from gamesideascontent where ideaId = ${result[0][0].id}; `)
            let getImages = await knex.raw(`SELECT convert(url using utf8) as url from images where ideaIdRef = ${result[0][0].id}; `)

            finalResult.id = result[0][0].id;
            finalResult.userId = result[0][0].userId;            
            finalResult.categoryId = result[0][0].categoryId;          
            finalResult.createdAt = result[0][0].createdAt;
            finalResult.mainImg = result[0][0].mainImg
            finalResult.title = result2[0][0].title;
            finalResult.ideaSummary = result2[0][0].ideaSummary;
            finalResult.mainIdea = result2[0][0].mainIdea;
            finalResult.images = getImages[0];
            


            return {status: true, finalResult};
        } catch (error) {
            console.log(error)
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
            let result = await knex.raw(`SELECT users.username, investments.userId, investments.investment
                                        FROM mswareg.investments
                                        INNER JOIN users
                                        ON users.id = investments.userId where gameIdeaId = ${pubId};`);
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
        
        try {

            let result = await knex.raw(`SELECT count(gameideainteraction.liked) as likes ,convert( ideaImage using utf8) as imageUrl ,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER join gameideainteraction
							on gamesideas.id = gameideainteraction.gameIdeaId
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            where title like "%${wildcard}%"
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
            SELECT reports.ideaId, categorieReport, reportMsg, createdAt, gamesideascontent.title, count(reports.ideaId) as reports FROM mswareg.reports
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
            const feedbacks = await knex.raw(`SELECT feedbacks.id, title, gamesideas.id as gameideaId, gamesideas.userId, categoryId, feedbacks.userId as userFeedback,username, feedbackMsg, feedbacks.createdAt FROM mswareg.gamesideas
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


    async getFeedbackById(id){
        
        try {
            const list = await knex.raw(`
                SELECT feedbacks.id as id, title,users.username, feedbacks.ideaId, feedbackMsg, feedbacks.createdAt FROM mswareg.feedbacks
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




}

module.exports = new Home();