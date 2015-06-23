var mongodb = require('mongodb');

module.exports = function(connectionString){
    var mongoClient = mongodb.MongoClient;
    
    return {
        insert: function(collection, document, callback){
            mongoClient.connect(connectionString, function(err, db){
                if (err) throw err;
                db.collection(collection).insert(document, function(err, result) {
                    if (err) throw err;
                    var document = result.ops[0];
                    if (typeof callback == 'function')
                        callback(document)
                });
            });
        },
        findOne: function(collection, query, callback){
            mongoClient.connect(connectionString, function(err, db){
                if (err) throw err;
                db.collection(collection).findOne(query, function(err, document) {
                    if (err) throw err;
                    if (typeof callback == 'function')
                        callback(document)
                });
            });
        },
        find: function(collection, query, callback){
            mongoClient.connect(connectionString, function(err, db){
                if (err) throw err;
                db.collection(collection).find(query, function(err, documents) {
                    if (err) throw err;
                    if (typeof callback == 'function')
                        callback(documents)
                });
            });
        },
        all: function(collection, callback){
            mongoClient.connect(connectionString, function(err, db){
                if (err) throw err;
                var cursor = db.collection(collection).find({});
                var documents = [];
                cursor.each(function(err, document){
                    if (err) throw err;
                    if (document == null) {
                        if (typeof callback == 'function')
                            callback(documents);
                    } else {
                        documents.push(document);
                    }
                });
            });
        },
        distinct: function(collection, key, callback){
            mongoClient.connect(connectionString, function(err, db){
                if (err) throw err;
                db.collection(collection).distinct(key, function(err, documents) {
                    if (err) throw err;
                    if (typeof callback == 'function')
                        callback(documents)
                });
            });
        }
    }
}