const jwt = require('jsonwebtoken');
var secret = "adsuasgdhjasgdhjdgahjsg12hj3eg12hj3g12hj3g12hj3g123";


module.exports = function(req, res, next){
    const authToken = req.headers['Autorization'];

    if (authToken != undefined) {
        var bearer  = authToken.split(' ');
        var token = bearer[1];

        try {
            var decoded = jwt.verify(token, secret);
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