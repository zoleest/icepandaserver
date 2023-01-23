let visibleWeapons = 1;
let visibleAbilities = 1;

function checkEnter(e){
    e = e || event;
    var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

function readURL(input, src) {
    if ((input.files && input.files[0])|| input === "old") {
        var reader = new FileReader();
        reader.onload = function (e) {

            $('#croppie-container').html('<img id="profile_picture_image">');

            console.log(input);
            if(input === "old"){
                $('#profile_picture_image').attr('src', src);
            }

            $('#use').removeClass('btn-success').addClass('btn-warning');
            $('#use').removeClass('d-none').addClass('d-block');

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
            $('#use').on('click', function () {
                resize.result('base64').then(function (dataImg) {
                    var data = [{image: dataImg}, {name: 'myimgage.jpg'}];
                    // use ajax to send data to php
                    $('#profile_picture').attr('value', dataImg);
                    $('#use').removeClass('btn-warning').addClass('btn-success');
                })
            })
        }
        if(input !== "old"){
            reader.readAsDataURL(input.files[0]);}


    }
}




//Unhide weapons and abilities options
function unhide(type){


    document.getElementsByName(type+'_name')[type==="weapon"?visibleWeapons: visibleAbilities].classList.remove("d-none");
    document.getElementsByName(type+'_name')[type==="weapon"?visibleWeapons: visibleAbilities].classList.add("d-block");
    document.getElementsByClassName('cke_editor_'+type+'_description_' +  (type==="weapon"?visibleWeapons: visibleAbilities))[0].classList.remove("d-none");
    document.getElementsByClassName('cke_editor_'+type+'_description_' +  (type==="weapon"?visibleWeapons: visibleAbilities))[0].classList.add("d-block");
    document.getElementsByClassName(type+'-label')[type==="weapon"?visibleWeapons: visibleAbilities].classList.remove("d-none");
    document.getElementsByClassName(type+'-label')[type==="weapon"?visibleWeapons: visibleAbilities].classList.add("block");

    if(type==='weapon'){

        if(visibleWeapons === 5){
            document.getElementById('new_weapon').classList.remove('btn-success');
            document.getElementById('new_weapon').classList.add('btn-disabled');
            document.getElementById('new_weapon').onclick = null;
        }else{
            visibleWeapons++;
        }

    }else if(type === 'ability'){
        if(visibleAbilities === 5){
            document.getElementById('new_ability').classList.remove('btn-success');
            document.getElementById('new_ability').classList.add('btn-disabled');
            document.getElementById('new_ability').onclick = null;
        }else{
            visibleAbilities++;
        }
    }

}

function updateProfileFields(displayCkeContents){
    document.getElementById('profile_name').textContent = document.getElementById('name').value;
    document.getElementById('profile_nickname').textContent = document.getElementById('nickname').value;
    document.getElementById('profile_birthday').textContent = document.getElementById('birthday').value;
    document.getElementById('profile_species').textContent = document.getElementById('species').value;
    if(document.getElementById('sexuality').value !== 'Válassz!')document.getElementById('profile_sexuality').textContent = document.getElementById('sexuality').value;
    if(document.getElementById('sex').value !== 'Válassz!') document.getElementById('profile_sex').textContent = document.getElementById('sex').value;

    if(displayCkeContents){

        let weapons = "";

        for(let weaponIteral = 0; weaponIteral < 6; weaponIteral++){

            weapons+= "<h4>"+document.getElementsByName('weapon_name')[weaponIteral].value+"</h4>";
            weapons+= "<p>"+CKEDITOR.instances['weapon_description_' + weaponIteral].getData()+"</p>"

        }

        document.getElementById('profile_weapons').innerHTML = weapons;

        let abilities = "";

        for(let abilityIteral = 0; abilityIteral < 6; abilityIteral++){

            abilities+= "<h4>"+document.getElementsByName('ability_name')[abilityIteral].value+"</h4>";
            abilities+= "<p>"+CKEDITOR.instances['ability_description_' + abilityIteral].getData()+"</p>"

        }

        document.getElementById('profile_abilities').innerHTML = abilities;

        document.getElementById('profile_story').innerHTML = CKEDITOR.instances['story'].getData();
        document.getElementById('profile_interests').innerHTML = CKEDITOR.instances['interests'].getData();

    }






}


document.addEventListener("keyup", updateProfileFields, false);
document.getElementById('sexuality').addEventListener("change", updateProfileFields, false);
document.getElementById('sex').addEventListener("change", updateProfileFields, false);







$(document).ready(function() {



    document.querySelector('form').onkeypress = checkEnter;

    $("#profile_picture_file").change(function () {
        readURL(this);
    });


    $("#submit_button").click(function(e){
        if($('#profile_picture').val() === '')
        {e.preventDefault();}
    });

    $('textarea').each(function () {
        CKEDITOR.replace(this, {
            on: {
                change: function () {
                    updateProfileFields();
                },
                instanceReady: function(){
                    if(this.id === "cke_14") updateProfileFields(true);
                }
            },
            filebrowserUploadUrl: '/image_processor',
            filebrowserUploadMethod: 'form',
            language: 'hu',
            removeButtons: 'Source'
        });
    });

});


