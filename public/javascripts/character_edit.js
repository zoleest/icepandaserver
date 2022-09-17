

function checkEnter(e){
    e = e || event;
    var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

function copyFormData(){

    $('#character-name').text($('#name').val());

}

$(document).ready(function(){


    document.querySelector('form').onkeypress = checkEnter;


    $('textarea').each(function() {
        CKEDITOR.replace(this, {
            filebrowserUploadUrl: '/image_processor',
            filebrowserUploadMethod: 'form',
            language: 'hu',
            removeButtons: 'Source'
        });
    });











    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#profile_picture_image').attr('src', e.target.result);
                var resize = new Croppie($('#profile_picture_image')[0], {
                    viewport: {
                        width: 250,
                        height: 250,
                        type: 'circle'
                    },
                    boundary: {
                        width: 250,
                        height: 250
                    },

                    size: 'viewport',
                    // showZoomer: false,
                    // enableResize: true,
                    enableOrientation: true
                });
                $('#use').fadeIn();
                $('#use').on('click', function() {
                    resize.result('base64').then(function(dataImg) {
                        var data = [{ image: dataImg }, { name: 'myimgage.jpg' }];
                        // use ajax to send data to php
                        $('#profile_picture').attr('value', dataImg);
                        // $('#imgInp').attr('value', dataImg);
                    })
                })
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#profile_picture_file").change(function() {
        readURL(this);
    });


    $("#submit_button").click(function(e){
        e.preventDefault();

        $('#profile_picture_file').val('');
        $('#new_character_form').submit();
    });


});

