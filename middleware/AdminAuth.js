const jwt = require('jsonwebtoken');


module.exports = function(req, res, next){
    const authToken = req.headers['authorization'];

    if (authToken != undefined) {
        var bearer  = authToken.split(' ');
        var token = bearer[1];

        try {
            var decoded = jwt.verify(token, process.env.SECRET);
            console.log(decoded)
            if (decoded.role == 1 ) {
                next();
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