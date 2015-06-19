(function($){
    $.fn.ticket = function(){
        return this.each(function(){
            var $this = $(this);
            
            var getTicket = function(){
                return {
                    "department": {"id": $("#dept").val(), "name": $("#dept", $this).find("option:selected").text()},
                    "email": $("#email", $this).val(),
                    "subject": $("#subj", $this).val(),
                    "issue": $("#issue", $this).val()
                };
            }
            
            var clearForm = function(){
                $("#dept", $this).prop('selectedIndex', 0);
                $("#email", $this).val('');
                $("#subj", $this).val('');
                $("#issue", $this).val('');
            }
            
            var getBootstrapAlert = function(type, message){
                return $("<div/>", {"class": "alert", "role": "alert"}).addClass("alert-" + type).html(message);
            }
            
            $this.on("click", ".create-ticket", function(e){
                var ticket = getTicket();
                clearForm();
                socket.emit('create-ticket', ticket);
            });
            
            socket.on('ticket-created', function(result){
                if (result.error) {
                    $(".home-create-ticket-message").html(getBootstrapAlert("danger", result.error.message));
                } else {
                    $(".home-create-ticket-message").html(getBootstrapAlert("success", 'Created ticket <a href="/ticket/' + result.ticket.number + '">#' + result.ticket.number + '</a> <em class="text-muted">&larr; click to view</em>'));
                    $(".console").append($("<div/>").html("["+moment().format("YYYY-MM-DD HH:mm:ss")+"] ticket #" + result.ticket.number + " created by " + result.ticket.email));
                }
            });
            
            $("#categories").select2();

            console.log('done');
        });
    }
}(jQuery));