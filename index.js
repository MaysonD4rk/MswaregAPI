const express = require('express');
const app = express();
const router = require('./routes/routes');
const cors = require('cors')

app.use(express.urlencoded({ limit: '50mb', extended: true}));
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use('/', router);

app.listen(3000,()=>{
    console.log('servidor rodando');
})
