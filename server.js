/* --------- DEPENDENCIES --------- */
var express = require('express');
var bodyParser = require('body-parser');

var knex = require('knex')({
    client: 'pg',
    connection: {
        database: 'fsGame'
    },
});

/* --------- GLOBAL VARIABLES --------- */
var jsonParser = bodyParser.json();
var app = express();

/* ----------- USER ENDPOINTS ---------- */
app.post('/users', jsonParser, function(request, response) {
    var username = request.body.username.trim();

    if (!username || username === '') {
        return response.status(422).json({
            message: 'Missing field: username'
        });
    }
    if (typeof username !== 'string') {
        return response.status(422).json({
            message: 'Incorrect field type: username'
        });
    }

    knex.insert({username: username})
        .into('users')
        .then(function(username) {
            console.log(response);
            return response.status(201).json({
                // TODO: return entire user object
                username,
                message: 'Registration successful'
            });
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


app.post('/games/:userId', jsonParser, function(request, response) {
    var user_id = parseInt(request.params.userId);
    var score = parseInt(request.body.score);

    knex.insert({user_id: user_id, score: score})
        .into('games')
        .then(function() {
            return response.status(201).json({
                user_id,
                score, 
                message: 'Score saved successfully'
            });
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


// TODO: DELETE THIS ENDPOINT AFTER TESTING
app.get('/users', jsonParser, function(request, response) {

    knex.select()
        .from('users')
        .then(function(users) {
            return response.json(users);
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


app.get('/games/:username', jsonParser, function(request, response) {
    var username = request.params.username;

    knex.select('score')
        .from('games')
        .rightJoin('users', 'games.user_id', 'users.id')
        .where({username: username})
        .then(function(scores) {
            // if (response.length == 0) {
            //     return response.status(404).json({
            //         message: 'Username not found'
            //     });
            // }
            // if (!response[0].score) {
            //     return response.status(404).json({
            //         message: 'Game history not found'
            //     });
            // }
            return response.json(scores);
        })
        .catch(function(error) {
            response.sendStatus(500);
        });
});


app.get('/games/:username/highscore', jsonParser, function(request, response) {
    var username = request.params.username;

    knex.select('score')
        .from('games')
        .rightJoin('users', 'games.user_id', 'users.id')
        .where({username: username})
        .orderBy('score', 'desc')
        .then(function(scores) {
            var highscore = scores[0].score;
            // if (response.length === 0) {
            //     return scores.status(404).json({
            //         message: 'Username not found'
            //     });
            // }
            // if (typeOf(highscore) === null) {
            //     return response.status(404).json({
            //         message: 'Game history not found'
            //     });
            // }
            return response.json(highscore);
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


app.delete('/users/:userId', jsonParser, function(request, response) {
    var id = request.params.userId;

    knex('users')
        .where('id', id)
        .del()
        .then(function(user_id) {
            return response.status(200).json({
                user_id, 
                message: 'User deleted successfully'
            });
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


app.delete('/games/:userId', jsonParser, function(request, response) {
    var user_id = request.params.userId;

    knex('games')
        .where('user_id', user_id)
        .del()
        .then(function(user_id) {
            return response.status(200).json({
                user_id, 
                message: 'Game history deleted successfully'
            });
        })
        .catch(function(error) {
            return response.sendStatus(500);
        });
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Listening on port:' + port);
});


// POST /USERS EXAMPLE:
    // ENDPOINT: localhost:8080/users
    // REQUEST BODY:
        //   {
        //     "username": "ben"
        //   }

// POST /GAMES/:USERID EXAMPLE:
     // ENDPOINT: localhost:8080/games/2
     // REQUEST BODY:
        // {
        // "score": "20"
        // }

// GET '/GAMES/:USERNAME' EXAMPLE:
    // ENDPOINT: localhost:8080/games/ben
    // RESPONSE:
        // [
        //   {
        //     "score": 15
        //   },
        // 
        //   {
        //     "score": 20
        //   }
        // ]

// GET /GAMES/:USERNAME/HIGHSCORE EXAMPLE:
    // ENDPOINT: localhost:8080/games/ben/highscore
        //   {
        //     "score": 20
        //   }