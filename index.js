if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const router = require('./routes/routes');
const cors = require('cors')

app.use(express.urlencoded({ limit: '100mb', extended: true}));
app.use(cors({ origin: '*' }))
app.use(express.json({limit: '100mb'}));
app.use('/', router);

app.listen(8000,()=>{
    console.log('servidor rodando 1');
})
