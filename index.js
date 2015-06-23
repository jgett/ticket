process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util');

var debug = {
    log: function(obj, depth) {
        console.log(util.inspect(obj, {showHidden: false, depth: depth}));
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

var da = require('./data-access.js')('mongodb://127.0.0.1:27017/ticket');
var repo = require('./repository.js')(da);

app.get('/', function (req, res) {
    repo.getCategories(function(documents){
        res.render('home', {
            title: 'Ticket',
            categories: documents
        });    
    });
}).get('/tickets', function(req, res){
    res.render('tickets', {
        title: 'Tickets'
    });
}).get('/ticket/:number', function(req, res){
    var n = parseInt(req.params.number);
    repo.getTicketByNumber(n, function(ticket){
        res.render('ticket', {
            'title': 'Ticket: #' + req.params.number,
            'number': req.params.number,
            'ticket': ticket
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
        repo.createTicket(ticket, function(result){
            console.log('inserted ticket: '+result._id);
            io.emit('ticket-created', result);
        });
    }).on('get-categories', function(){
        //io.emit('categories', [{id: 1, name: 'IT Support'}, {id: 2, name: 'Deposition'}]);
        repo.getCategories(function(categories){
            io.emit('categories', categories);
        });
    });
});

da.all('tickets', function(result){
    debug.log(result);
});

process.stdin.on('data', function(text){
	if (text.indexOf('quit') === 0){
		process.exit();
	} else if (text.indexOf('ticket') === 0) {
		var splitter = text.split(' ');
		if (splitter.length == 2){
			var number = splitter[1].replace('\r', '').replace('\n', '');
			da.findOne('tickets', {number:parseInt(number)}, function(document){
                debug.log(document);
            });
		}else{
			console.log('missing parameter: number');
		}
	} else {
        var query = JSON.parse(text);
        da.findOne('tickets', query, function(document){
            debug.log(document);
        });
    }
});