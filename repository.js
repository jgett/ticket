module.exports = function(da){
    var getUniqueTicketNumber = function(callback){
        var low = 100000;
        var high = 1000000;
        
        var result = Math.floor(Math.random() * (high - low) + low);
        
        da.findOne('tickets', {number:result}, function(document){
            if (document) {
                getUniqueTicketNumber(callback);
            } else {
                if (typeof callback == 'function')
                    callback(result);
            }
        });
    }
    
    return {
        getCategories: function(callback){
            da.distinct('tickets', 'category', function(documents){
                if (typeof callback == 'function')
                    callback(documents);
            });
        },
        getTicketByNumber: function(number, callback){
            da.findOne('tickets', {number:number}, function(document){
                if (typeof callback == 'function')
                    callback(document);
            });
        },
        createTicket: function(ticket, callback){
            getUniqueTicketNumber(function(n){
                ticket.number = n;
                ticket.created = new Date();
                ticket.open = true;
                da.insert('tickets', ticket, function(document){
                    if (typeof callback == 'function')
                        callback(document);
                });
            });
        }
    }
}