
//Changing the character with AJAX
function changeCharacter(slug){

    $.ajax({
        url: '/my-characters',
        method: 'POST',
        data: {"character":slug},
        success: function(){
            location.reload();
        }
    });

}
