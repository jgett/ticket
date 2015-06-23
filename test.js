var util = require('util');

var debug = {
    log: function(obj, depth) {
        console.log(util.inspect(obj, {showHidden: false, depth: depth}));
    }
};

var da = require('./data-access.js')('mongodb://127.0.0.1:27017/ticket');

da.distinct('tickets', 'category', function(result){
    debug.log(result);
    da.close();
});