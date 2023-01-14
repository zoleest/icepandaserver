$(document).ready(function () {

//Draws the characther changers  - The normal first then the minified
    function drawCharacterChanger(data) {
        data.charactersJson.forEach(function (character) {
            let characterImg = document.createElement('img');
            characterImg.className = data.activeCharacter === character.slug ? "rounded-circle mx-2 w-25 border border-danger border-4" : "rounded-circle mx-2 w-25";
            characterImg.alt = character.name;
            characterImg.title = character.name;
            characterImg.src = "/images/avatars/" + character.slug + ".webp";
            characterImg.onclick = function () {
                changeCharacter(character.slug)
            };
            document.getElementById('character-changer').appendChild(characterImg);

            let characterImgMini = document.createElement('img');
            characterImgMini.className = data.activeCharacter === character.slug ? "rounded-circle mx-2 border border-danger border-4" : "rounded-circle mx-2";
            characterImgMini.alt = character.name;
            characterImgMini.title = character.name;
            characterImgMini.src = "/images/avatars/" + character.slug + ".webp";
            characterImgMini.style = "height: 50px; width: auto";
            characterImgMini.onclick = function () {
                changeCharacter(character.slug)
            };
            document.getElementById('character-changer-mini').appendChild(characterImgMini);
        });
    }

    //draw recent comments to sidebar and topbar
    function drawRecentComments(data, type) {

        for (let locationCounter = 0; locationCounter < (type === 'locations' ? data.locations.length : data.pages.length); locationCounter++) {
            let locationAnchor = document.createElement('a');
            locationAnchor.className = "link link-danger";
            locationAnchor.href = "/" + type + "/" + data.details[locationCounter].slug;

            let locationTextNode = document.createElement('h5');
            locationTextNode.textContent = type === 'locations' ? data.locations[locationCounter]._id : data.pages[locationCounter]._id;
            locationAnchor.appendChild(locationTextNode);

            let list = document.createElement('ul');
            list.className = "list-unstyled";

            for (let listItemCounter = 0; listItemCounter < data.details[locationCounter].characters.length; listItemCounter++) {

                let listItem = document.createElement('li');
                listItem.textContent = data.details[locationCounter].characters[listItemCounter]._id;

                list.appendChild(listItem);
            }

            document.getElementById('recent-comments').appendChild(locationAnchor);
            document.getElementById('recent-comments').append(list);

        }
        ///////////////////////////////////////////////////////////////////////////////////////

        let mainUl = document.createElement('ul');
        mainUl.className = "navbar-nav me-auto mb-2 mb-lg-0 ";

        for (let locationCounter = 0; locationCounter < (type === 'locations' ? data.locations.length : data.pages.length); locationCounter++) {

            let mainLi = document.createElement('li');
            mainLi.className = "nav-item dropdown ";

            let mainAnchor = document.createElement('a');
            mainAnchor.textContent = type === 'locations' ? data.locations[locationCounter]._id : data.pages[locationCounter]._id;
            mainAnchor.className = "nav-link dropdown-toggle";
            mainAnchor.href = "#";
            mainAnchor.id = data.details[locationCounter].slug + 'dropdown';
            mainAnchor.role = "button";
            mainAnchor.setAttribute('data-bs-toggle', 'dropdown');

            let subList = document.createElement('ul');
            subList.className = "dropdown-menu text-center text-light bg-dark border border-light";

            for (let listItemCounter = 0; listItemCounter < data.details[locationCounter].characters.length; listItemCounter++) {

                let subListItem = document.createElement('li');

                subListItem.textContent = data.details[locationCounter].characters[listItemCounter]._id;
                subListItem.className = "ps-2 pt-2 ";
                ;
                subList.appendChild(subListItem);
            }

            let redirectingLinkItem = document.createElement('li');
            redirectingLinkItem.className = "p-2 text-danger";

            let redirectingLinkAnchor = document.createElement('a');
            redirectingLinkAnchor.textContent = "Tovább ide!";
            redirectingLinkAnchor.href = "/" + type + "/" + data.details[locationCounter].slug;
            redirectingLinkAnchor.className = "link link-danger";

            redirectingLinkItem.appendChild(redirectingLinkAnchor);
            subList.appendChild(redirectingLinkItem);

            mainLi.appendChild(mainAnchor);
            mainLi.appendChild(subList);
            mainUl.appendChild(mainLi);
        }


        document.getElementById('recent-comments-mini').appendChild(mainUl);
    }


    //LOADING CHARACTERS

    $.ajax({
        url: '/my-characters',
        success: function (response) {
            drawCharacterChanger(response);
        }
    });

    //LOADING RECENT LOCATION COMMENTS AND WATCH FOR UPDATE

    $.ajax({
        url: '/recent/locations',
        success: function (response) {
            drawRecentComments(response, 'locations');

            let newCommentChecker = setInterval(
                function () {

                    $.ajax({
                        url: '/recent/last-comment',
                        success: function (subresponse) {
                            if (subresponse.lastCommentDate > response.lastCommentDate) {

                                if (Notification.permission !== 'granted') {

                                    Notification.requestPermission();

                                    alert('Új hozzászólás érkezett!');

                                } else {

                                    const notification = new Notification("Új hozzászólás érkezett!", {
                                        'body': 'Nézz fel a Szerepjáték.net-re, mert új hozzászólás érkezett! :)',
                                        'icon': '/images/favicon/mstile-150x150.png'
                                    });
                                }

                                let documentOriginalTitle = document.title;
                                let titleChanger = setInterval(function () {
                                    document.title = documentOriginalTitle === document.title ? '(1) ÚJ HOZZÁSZÓLÁS!' : documentOriginalTitle;
                                }, 1000);
                                clearInterval(newCommentChecker);
                            }
                        }
                    });

                }, 5000
            );
        }
    });

    $.ajax({
        url: '/recent/pages',
        success: function (response) {
            drawRecentComments(response, 'pages');
        }
    });


    ///LOADING CKEDITOR

    CKEDITOR.addCss('.cke_editable { background-color: #333; color: white }');

    $('textarea').each(function () {
        CKEDITOR.replace(this, {
            filebrowserUploadUrl: '/image_processor',
            filebrowserUploadMethod: 'form',
            language: 'hu',
            removeButtons: 'Source'
        });
    });


})
;

