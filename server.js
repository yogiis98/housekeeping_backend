const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const {to} = require('./services/util.service');


// Get DB 
const db = require('./db');

const app = express();
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    next()
  })

require("dotenv").config();

(async () => {


    [err] = await to(db.initDb())
    if (err) {
        console.log("Database error -> " + err.message + "Exiting");
        return
    }

    // Api Routers
    const v1 = require('./routes/v1');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(require('helmet')());
    app.use(cors());

    app.use('/static/', express.static(path.join(__dirname, 'public')))



    // Api default page
    app.get('/api', (req, res) => {
        res.json({
            success: true,
            code: 200,
            alert: false,
            message: "Welcome to Api default page!",
            data: {}
        })
    });

    // Api version 1
    app.use('/api/v1/', v1);

    // Api 404 catcher
    app.use('/*', (req, res) => {
        res.status(404).json({
            success: false,
            code: 404,
            alert: false,
            message: "Not found",
            data: {}
        })
    });

    app.use(function (err, req, res, next) {
        // set locals, only providing error in development

        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        // render the error message
        res.status(err.code || 500);
        if (process.env.NODE_ENV == 'development' && true) {
            // console.log(res.locals.error);
            return res.json({
                success: false,
                code: err.code || 500,
                message: err.message,
                err: err.stack
            })
        } else {
            return res.json({
            success: false,
            code: err.code || 500,
            message: "Oops! Server Error occurred... We have dispatched monkeys to resolve it."
        });
    }
    });

    //server creation
    const port = process.env['PORT'] = process.env.PORT || 80;

    http.createServer(app).listen(port, function () {
        console.log("Express server listening with http on port %d in %s mode", this.address().port, app.settings.env);
    });

})();

process.on('unhandledRejection', error => {
    console.error('Uncaught Error', error);
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});