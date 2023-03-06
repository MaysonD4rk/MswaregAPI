const knex = require('../database/connection');

class MusclePoints{

    async createToken(userId, tokenRole){

        function selecionarLetraAleatoria() {
            const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
            const indiceAleatorio = Math.floor(Math.random() * letras.length);
            const letraAleatoria = letras.charCodeAt(indiceAleatorio);
            return String.fromCharCode(letraAleatoria);
        }

        var token;
        var tokenPrice = 0;
        if (tokenRole == 0) {
            token = 
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+"-"+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+"-"+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria()+
            selecionarLetraAleatoria();

        }else if(tokenRole == 1){
            tokenPrice = '12.67'
            token =
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() + "-" +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() + "-" +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() + "-" +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria() +
                selecionarLetraAleatoria()
        }
        console.log(token)
        console.log(tokenRole)

        let tokenExpiresDate = new Date(Date.now()+2592000000)

        
        try {
            await knex.insert({ tokenOwnerId: userId, tokenRole: tokenRole, token, tokenPrice, frozenToken: false, tokenExpiresAt: tokenExpiresDate }).table('muscleTokens');
            return {stauts: true, token}
        } catch (error) {
            console.log(error)
        }
    }

    async updateTokenPrice(newTokenPrice, userId){

        try {
            const count = await knex('muscleTokens').where({ tokenOwnerId: userId }).andWhere({frozenToken: false}).count('* as count').first();
            let newBillingPrice;
            if (count.count == 0) {
                newBillingPrice = 12.67
            }else{
                newBillingPrice = (12.67 + parseInt(newTokenPrice));
            }

            let supplierBilling = count.count*12.67;

            const updateBillingPrice = await knex('usingmuscletoken')
                .innerJoin('muscleTokens', 'usingmuscletoken.tokenId', 'muscleTokens.tokenId')
                .where('muscleTokens.tokenOwnerId', userId)
                .update('usingmuscletoken.billingPrice', newBillingPrice.toString());
            
            const updateTokenPrice = await knex.update({tokenPrice: (newTokenPrice).toString()}).where({tokenOwnerId: userId}).table('muscleTokens');
            const tokenById = await this.getTokenByUserId(userId);
            if (parseFloat(tokenById.result[0].billingPrice) > supplierBilling){
                supplierBilling = tokenById.result[0].billingPrice

            }else{
                supplierBilling = supplierBilling;
            }
            const updateSupplierBilling = await knex.update({ billingPrice: supplierBilling }).where({ usingUserId: userId }).table('usingmuscletoken');
            console.log(updateSupplierBilling)
            return {status: true};
        } catch (error) {
            console.log(error)
            return { status: false, error };
        }
    }

    async getTokens(){
        try {
            let result = await knex.select('*').table('muscleTokens');
            return { stauts: true, result }
        } catch (error) {
            console.log(error)
        }
    }

    async getTokenById(tokenId, userId){
        try {
            let result = await knex.select('*').where('muscleTokens.tokenId', '=', tokenId)
            .innerJoin('usingmuscletoken', 'muscleTokens.tokenId', 'usingmuscletoken.tokenId')
            .table('muscleTokens').first();

            let count = await knex('muscleTokens').where({tokenOwnerId: userId}).andWhere({frozenToken: false}).count('* as count').first();
            return { stauts: true, result, count: count.count }
        } catch (error) {
            console.log(error)
        }
    }

    async getTokenByIdwithoutInner(tokenId, userId) {
        try {
            let result = await knex.select('*').where('muscleTokens.tokenId', '=', tokenId)
                .table('muscleTokens').first();

            let count = await knex('muscleTokens').where({ tokenOwnerId: userId }).andWhere({ frozenToken: false }).count('* as count').first();
            return { stauts: true, result, count: count.count }
        } catch (error) {
            console.log(error)
        }
    }

    async getTokenRelation2(userId){
        try {
            let tokenRelation = await knex
                .select(['username', 'muscleTokens.tokenId', 'token', 'tokenPrice', 'tokenOwnerId', 'tokenRole', 'frozenToken', 'tokenExpiresAt', 'usingUserId', 'billingPrice', 'payState'])
                .from('muscleTokens')
                .join('usingMuscleToken', 'usingMuscleToken.tokenId', 'muscleTokens.tokenId')
                .join('users', 'users.id', 'usingMuscleToken.usingUserId')
                .where('muscleTokens.tokenOwnerId', '=', userId);
            
            return { status: true, result: tokenRelation }

        } catch (error) {
            console.log(error)
            return { status: false, error }
        }
    }

    async getTokenRelation(userId) {
        try {
            let tokenRelation = await knex.select('username', 'muscleTokens.tokenId', 'token', 'tokenPrice', 'tokenOwnerId', 'tokenRole', 'frozenToken', 'tokenExpiresAt', 'usingUserId', 'billingPrice', 'payState')
                .from('usingmuscletoken')
                .rightJoin('muscleTokens', 'muscleTokens.tokenId', '=', 'usingmuscletoken.tokenId')
                .leftJoin('users', 'users.id', '=', 'usingMuscleToken.usingUserId')
                .where('muscleTokens.tokenOwnerId', '=', userId)

            return { status: true, result: tokenRelation }

        } catch (error) {
            console.log(error)
            return { status: false, error }
        }
    }

    async getTokenByUserId(userId){
        try {
            let result = await knex
                .select(['id','username', 'muscleTokens.tokenId', 'token', 'tokenPrice', 'tokenOwnerId', 'tokenRole', 'frozenToken', 'tokenExpiresAt', 'usingUserId', 'billingPrice', 'payState'])
                .from('users')
                .join('usingMuscleToken', 'users.id', 'usingMuscleToken.usingUserId')
                .join('muscleTokens', 'usingMuscleToken.tokenId', 'muscleTokens.tokenId')
                .where('id', '=', userId)
                

            return { stauts: true, result }
        } catch (error) {
            console.log(error)
            return { stauts: false } 
        }
    }

    async validateToken(userId,token){
        try {
            let result = await knex.select('*').where({token}).table('muscleTokens');
            console.log('validate')
            console.log(result[0].tokenPrice)
            if (result.length>0) {
                let anyoneElseUsing = await knex.select('*').where({ tokenId: result[0].tokenId }).table('usingMuscleToken');
                let areUusingToken = await knex.select('*').where({ usingUserId: userId }).table('usingMuscleToken');
                
                
                if (!anyoneElseUsing.length>0) {
                    await knex.insert({ usingUserId: userId, tokenId: result[0].tokenId, billingPrice: (parseFloat(result[0].tokenPrice)+12.67).toString(), payState: true }).table('usingMuscleToken');
                    if (areUusingToken.length >= 1) {
                        await knex('muscleTokens').delete().where({ tokenId: areUusingToken[0].tokenId })
                    }    
                    return { stauts: true }
                }else{
                    if (areUusingToken.length > 1) {
                        await knex('muscleTokens').delete().where({ tokenId: areUusingToken[0].tokenId })
                    } 
                    return { status: false }
                }
            }else{
                return {status: false}
            }
        } catch (error) {
            console.log(error)
        }
    }


    async freezyToken(tokenId, freezyStatus, userId,supplier=false){
        try {
            if (supplier) {
                console.log('pssss')
                let update = await knex.update({ frozenToken: freezyStatus }).where({ tokenOwnerId: userId }).orWhere({tokenId}).table('muscleTokens');
                console.log(update.toString());
                return { status: true, msg: 'frozen' }
            }else{
                console.log('pssss2')
                await knex.update({ frozenToken: freezyStatus }).where({ tokenId }).table('muscleTokens');
                return { status: true, msg: 'frozen' }
            }

        } catch (error) {
            console.log(error)
            return {error}
        }
    }


    async extendTokenTime(tokenId){
        
        try {
            const currentTokenTime = await knex.select('tokenExpiresAt').where({tokenId}).table('muscleTokens').first()

            if (new Date(currentTokenTime.tokenExpiresAt).getTime() > Date.now()) {
                await knex.update({ tokenExpiresAt: new Date(+(currentTokenTime.tokenExpiresAt.getTime() + 2592000000))}).where({tokenId}).table('muscleTokens')
                return {status: true}
            }else{
                await knex.update({ tokenExpiresAt: new Date(Date.now() + 2592000000) }).where({ tokenId }).table('muscleTokens')
                return { status: true }
            }

        } catch (error) {
            console.log(error)
            return {status: false, error}
        }

    }

    async deleteTokenById(tokenId){

        tokenId = parseInt(tokenId)
        try {
            await knex('muscleTokens').delete().where({tokenId})
            return {status: true}
        } catch (error) {
            console.log(error)
            return {status: false, error}
        }
    }

    async payBilling(userId){
        try {
            let getBilling = await knex.select('*').where({usingUserId: userId}).table('usingmuscletoken').first();
                getBilling.billingPrice
            let relation = await this.getTokenRelation(userId);
            let count = 0;
            relation.result.forEach(customer=>{
                if (!!customer.usingUserId && customer.frozenToken == false) {
                    ++count
                }
            })

            console.log(count*12.67)
                
            let currentBalance = await knex.select('credits').where({userId}).table('userinfo').first();
            console.log(getBilling.billingPrice)
            console.log(currentBalance.credits)
            console.log((parseFloat(currentBalance.credits) - parseFloat(getBilling.billingPrice)).toFixed(2));
            if (parseFloat(currentBalance.credits) - parseFloat(getBilling.billingPrice) < 0) {
                return { status: false, msg: 'saldo insuficiente' }
            }else{
                try {
                    await knex.update({ credits: ((parseFloat(currentBalance.credits) - parseFloat(getBilling.billingPrice)).toFixed(2)).toString() }).where({userId}).table('userinfo');
                    await knex.update({ billingPrice: ((12.67*count).toFixed(2)).toString(), payState: true}).where({usinguserid: userId}).table('usingmuscletoken');
                    await this.extendTokenTime(getBilling.tokenId)
                    await this.verifyIfIsExpiringTokenById(getBilling.tokenId)
                    return {status: true, msg: 'pagamento realizado com sucesso!'}
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }


    async updateTrainLog(userId, trainLog){

        try {
            
            let verifyIfAlreadyExistsData = await knex.select('*').where({userId}).table('trainLog');
            if (verifyIfAlreadyExistsData.length>0) {
                await knex.update({log: trainLog, updatedAt: new Date()}).where({userId}).table('trainLog');
                return {status: true, msg: 'updated'}
            }else{
                await knex.insert({userId,log: trainLog, updatedAt: new Date() }).table('trainLog');
                return { status: true, msg: 'inserted' }
            }

        } catch (error) {
            console.log(error)
            return {error}
        }


    }

    async verifyIfIsExpiringToken(){
        try {
            let verifyExpiresDate = await knex.select(['tokenId', 'tokenExpiresAt']).table('muscleTokens');
            console.log(verifyExpiresDate);

            verifyExpiresDate.forEach(async i=>{
                const futureDate = new Date(i.tokenExpiresAt);
                const currentDate = new Date();
                const differenceMs = futureDate - currentDate;
                const daysMs = 24 * 60 * 60 * 1000; // milissegundos em um dia
                const differenceDays = Math.ceil(differenceMs / daysMs); // arredonda para cima
                console.log(differenceDays)
                if(differenceDays <= 5){
                    try {
                        await knex.update({payState: false}).where({tokenId: i.tokenId}).table('usingmuscletoken');

                    } catch (error) {
                        console.log(error)
                    }
                }else if(differenceDays < 0){
                    try {
                        await knex.update({ frozenToken: true }).where({ tokenId: i.tokenId }).table('muscleTokens');
                    } catch (error) {
                        console.log(error)
                    }
                }
            })

            return {status: true}
        } catch (error) {
            console.log(error);
        }
    }

    async verifyIfIsExpiringTokenById(tokenId){
        try {
            let verifyExpiresDate = await knex.select(['tokenId', 'tokenExpiresAt']).where({tokenId}).table('muscleTokens').first();
            console.log(verifyExpiresDate);
            console.log('entrei aqui')

                const futureDate = new Date(verifyExpiresDate.tokenExpiresAt);
                const currentDate = new Date();
                const differenceMs = futureDate - currentDate;
                const daysMs = 24 * 60 * 60 * 1000; // milissegundos em um dia
                const differenceDays = Math.ceil(differenceMs / daysMs); // arredonda para cima
                if (differenceDays <= 5) {
                    try {
                        await knex.update({ payState: false }).where({ tokenId: verifyExpiresDate.tokenId }).table('usingmuscletoken');

                    } catch (error) {
                        console.log(error)
                    }
                } else if (differenceDays < 0) {
                    try {
                        await knex.update({ frozenToken: true }).where({ tokenId: verifyExpiresDate.tokenId }).table('muscleTokens');
                    } catch (error) {
                        console.log(error)
                    }
                }

            return { status: true }
        } catch (error) {
            console.log(error);
        }
    }


    async getTrainLog(userId){
        try {
            const trainLog = await knex.select('*').where({userId}).table('trainLog');
            console.log(trainLog)
            return {status: true, result: trainLog}
        } catch (error) {
            console.log(error)
            return {status: false, error}
        }
    }

}

module.exports = new MusclePoints()