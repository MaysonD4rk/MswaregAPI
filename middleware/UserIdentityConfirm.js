const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt')

module.exports = async function (req, res, next) {
    const authToken = req.headers['authorization'];
    console.log('esta tentando autorizar');
    const userId = !!req.params.userId ? req.params.userId : req.body.userId

    if (authToken != undefined) {
        var bearer = authToken.split(' ');
        var token = bearer[1];
        

        
        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            
            const user = await User.findByEmail(decoded.email);
            if (user.id == userId) {
                const result = await bcrypt.compare(decoded.password, user.password)
                console.log(result)
    
                if (result) {
                    next();
                } else {
                    res.status(403);
                    res.send('você não tem permissão para entrar aqui!');
                    return;
                }
                
            }else{
                res.status(403);
                res.send('você não tem permissão para entrar aqui!');
                return;
            }
        } catch (err) {
            res.status(403);
            res.send('você não está autenticado');
            return;
        }
    } else {
        res.status(403);
        res.send("Você não está autenticado");
        return;
    }

}