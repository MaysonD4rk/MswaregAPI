const knex = require('../database/connection');



class Home {

    async createPub(pubContent){

        if (pubContent.title != undefined && pubContent.ideaSummary != undefined && pubContent.mainIdea != undefined && pubContent.categoryId != undefined) {
           
            try {
                var result = await knex.insert({ userId: pubContent.userId, categoryId: pubContent.categoryId, createdAt: new Date(), initialAmountRequired: pubContent.initialAmountRequired }).table('gamesideas');
                
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
                        where gameideainteraction.userId = ${userId}
                        order by liked, likedAt DESC
                        limit 8 offset ${offset}
                            ;`,

            nonLikedByYou: `
            SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, liked, createdAt FROM mswareg.gamesideascontent
            left join gameideainteraction on gameideainteraction.gameIdeaId = ideaId
            right join gamesideas on gamesideas.id = ideaId
            where liked is null OR gameideainteraction.userId <> ${userId}
            order by createdAt desc limit 8 offset ${offset}
                            ;
            `,

            lessLiked: `
            SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, createdAt, count(liked) as likes 
            FROM mswareg.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            group by gameIdeaId order by likes ASC limit 8 offset ${offset}
                            ;
            `,

            mostLiked: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gameideainteraction.userId, createdAt, count(liked) as likes 
            FROM mswareg.gameideainteraction 
            left join gamesideascontent on gamesideascontent.ideaId = gameIdeaId
            right join gamesideas on gamesideas.id = ideaId
            group by gameIdeaId order by likes DESC limit 8 offset ${offset}
                            ;`,

            older: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, createdAt FROM mswareg.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    order by createdAt ASC limit 8 offset ${offset}
                            ;`,

            mostRecent: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.initialAmountRequired , categoryId, title, ideaSummary, gamesideas.userId, createdAt FROM mswareg.gamesideas 
                    right join gamesideascontent on gamesideascontent.ideaId = id
                    left join gameideainteraction on gameideainteraction.gameIdeaId = id
                    order by createdAt DESC limit 8 offset ${offset}
                            ;`,

            desc: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            order by title desc limit 8 offset ${offset}
                            ;
                            `,
            
            asc: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, createdAt, title, ideaSummary
                            FROM mswareg.gamesideas
                            INNER JOIN mswareg.gamesideascontent
                            ON gamesideas.id = gamesideascontent.ideaId
                            order by title ASC limit 8 offset ${offset}
                            ;`,

            MostInvested: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, SUM(investments.investment) as investmentFilter FROM mswareg.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            group by ideaId order by investmentFilter DESC limit 8 offset ${offset}
                            ;`,
            
            BitInvested: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary, SUM(investments.investment) as investmentFilter FROM mswareg.gamesideascontent
                            right join gamesideas on gamesideas.id = ideaId
                            left join investments on investments.gameIdeaId = ideaId
                            group by ideaId order by investmentFilter ASC limit 8 offset ${offset}
                            ;`,
            
            lowerInvestmentRequired: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary FROM mswareg.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
                                      order by initialAmountRequired ASC limit 8 offset ${offset}
                            ;`,
            
            mostInvestmentRequired: `SELECT convert( ideaImage using utf8) as imageUrl,gamesideas.id, gamesideas.userId, gamesideas.initialAmountRequired , categoryId, gamesideas.createdAt, title, ideaSummary FROM mswareg.gamesideas
                                      right join gamesideascontent on id = gamesideascontent.ideaId
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

        console.log(filter)

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
            
            let result = await knex.select("*").where({ id }).table('gamesideas');
            let result2 = await knex.raw(`SELECT ideaId, convert(mainIdea using utf8) as mainIdea, title, ideaSummary from gamesideascontent where ideaId = ${result[0].id}; `)
            let getImages = await knex.raw(`SELECT convert(url using utf8) as url from images where ideaIdRef = ${result[0].id}; `)

            finalResult.id = result[0].id;
            finalResult.userId = result[0].userId;            
            finalResult.title = result2[0][0].title;
            finalResult.ideaSummary = result2[0][0].ideaSummary;
            finalResult.mainIdea = result2[0][0].mainIdea;
            finalResult.categoryId = result[0].categoryId;
            finalResult.raisedMoney = result[0].raisedMoney;            
            finalResult.createdAt = result[0].createdAt;
            finalResult.images = getImages[0];
            console.log(finalResult.images)


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

        console.log(userId)

        if (userId != undefined && projectId != undefined ) {
            console.log("id é: "+userId)
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
        console.log(wildcard)
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

            console.log(result[0])

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


}

module.exports = new Home();