(function($){
    $.fn.ticket = function(){
        return this.each(function(){
            var $this = $(this);
            
            selectedCategory = '';
            
            var getTicket = function(){
                return {
                    "category": selectedCategory,
                    "email": $("#email", $this).val(),
                    "subject": $("#subj", $this).val(),
                    "issue": $("#issue", $this).val()
                };
            }
            
            var clearForm = function(){
                $("#categories", $this).prop('selectedIndex', 0);
                $("#email", $this).val('');
                $("#subj", $this).val('');
                $("#issue", $this).val('');
            }
            
            var getBootstrapAlert = function(type, message){
                return $("<div/>", {"class": "alert", "role": "alert"}).addClass("alert-" + type).html(message);
            }
            
            $this.on("click", ".create-ticket", function(e){
                if (selectedCategory){
                    var ticket = getTicket();
                    clearForm();
                    socket.emit('create-ticket', ticket);
                }
            }).on("get-ticket", function(e, callback){
                if (typeof callback == 'function')
                    callback(getTicket());
            });
            
            socket.on('ticket-created', function(ticket){
                $(".home-create-ticket-message", $this).html(getBootstrapAlert("success", 'Created ticket <a href="/ticket/' + ticket.number + '">#' + ticket.number + '</a> <em class="text-muted">&larr; click to view</em>'));
                $(".console", $this).append($("<div/>").html("["+moment().format("YYYY-MM-DD HH:mm:ss")+"] ticket #" + ticket.number + " created by " + ticket.email));
            }).on('categories', function(categories){
                fillCategories(categories);
            });
            
            $('#categories').selectize({
                create: true,
                sortField: 'text',
                onChange: function(value){
                    selectedCategory = value;
                }
            });
           
            console.log('done');
        });
    }
}(jQuery));