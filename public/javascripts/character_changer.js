
//Changing the character with AJAX
function changeCharacter(slug){

    $.ajax({
        url: '/characters/mine',
        method: 'POST',
        data: {"character":slug},
        success: function(){
            location.reload();
        }
    });

}
