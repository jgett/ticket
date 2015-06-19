process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util');

var debug = {
    log: function(obj) {
        console.log(util.inspect(obj, {showHidden: false, depth: null}));
    }
};

var moment = require('moment');

//web setup
var express = require('express');
var app = express().use('/static', express.static(__dirname + '/static'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

//web template engine
var exphbs  = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        format: function(date, format){
            return moment(new Date(date)).format(format);
        }
    }
}));
app.set('view engine', 'handlebars');

//database
var mongoClient = require('mongodb').MongoClient;

var insert = function(collection, document, callback){
    mongoClient.connect('mongodb://127.0.0.1:27017/ticket', function(err, db){
        if (err) throw err;
        db.collection(collection).insert(document, function(err, result) {
            if (typeof callback == 'function')
                callback(err, result)
        });
    });
}

var findOne = function(collection, query, callback){
    mongoClient.connect('mongodb://127.0.0.1:27017/ticket', function(err, db){
        if (err) throw err;
        db.collection(collection).findOne(query, function(err, document) {
            if (typeof callback == 'function')
                callback(err, document)
        });
    });
}

var getUniqueTicketNumber = function(callback){
    
    var low = 100000;
    var high = 1000000;
    
    var result = Math.floor(Math.random() * (high - low) + low);
    
    findOne('tickets', {number:result}, function(err, document){
        if (document)
            getRandomTicketNumber(callback);
        else {
            if (typeof callback == 'function')
                callback(result);
        }
    });
    
}

app.get('/', function (req, res) {
    res.render('home', {
        title: 'Ticket',
        departments: [
            {id: 1, name: 'IT Support'},
            {id: 2, name: 'Deposition'}
        ]
    });
}).get('/tickets', function(req, res){
    res.render('tickets', {
        title: 'Tickets'
    });
}).get('/ticket/:number', function(req, res){
    var n = parseInt(req.params.number);
    
    findOne('tickets', {number:n}, function(err, document){
        res.render('ticket', {
            'title': 'Ticket: #' + req.params.number,
            'number': req.params.number,
            'ticket': document
        });
    });
}).get('/console', function(req, res){
    res.render('console', {layout: false});
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
    console.log('a user connected');
    
    socket.on('create-ticket', function(ticket){
        getUniqueTicketNumber(function(n){
            ticket.number = n;
            ticket.created = new Date();
            ticket.open = true;
            insert('tickets', ticket, function(err, result){
                if (err) throw err;
                var records = result.ops;
                console.log('inserted ticket: '+records[0]._id);
                io.emit('ticket-created', {"error": null, "ticket": records[0]});
            });
        });
    });
});

process.stdin.on('data', function(text){
	if (text.indexOf('quit') === 0){
		process.exit();
	} else if (text.indexOf('ticket') === 0) {
		var splitter = text.split(' ');
		if (splitter.length == 2){
			var number = splitter[1].replace('\r', '').replace('\n', '');
			findOne('tickets', {number:parseInt(number)}, function(err, document){
                debug.log(document);
            });
		}else{
			console.log('missing parameter: number');
		}
	} else {
        var query = JSON.parse(text);
        findOne('tickets', query, function(err, document){
            debug.log(document);
        });
    }
});