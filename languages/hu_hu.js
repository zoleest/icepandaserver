const language = {
    /*
    * 1. Navbar
    * 2. Frontpage
    * 3. Locations
    * 4. Login
    * 5. Registration
    * 6. Error defaults
    * 7. Pages
    * 8. Characters
    */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//1. Navbar
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'navbar': {
        'frontpage': 'Kezdőlap',
        'wall': 'Üzenőfal',
        'characters': 'Karakterek',
        'locations': 'Helyszínek',
        'informations': 'Információk',
        'rules': 'Szabályzat',
        'faq': 'Gyakori kérdések',
        'contact': 'Írj az adminnak!',
        'search': 'Keresés',
        'searchPlaceholder': 'Mit keresel?',
        'public': 'Nyilvános helyszínek',
        'homes': 'Otthonok',
        'private': 'Privát helyszíneim',
        'all': 'Összes',
        'login': 'Bejelentkezés',
        'logout': 'Kijelentkezés',
        'newCharacter': 'Új karakter',

        'pageCommentModeration': 'Moderálásra váró hozzászólás'

    },
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//3. Locations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'locations': {
        'locations': 'Helyszínek',

        'lastComments': 'Legutóbbi hozzászólások:',
        'selectedCharacter': 'Kiválasztott karakter:',
        'comments': 'Hozzászólások:',
        'characterSelector': 'Karakter választó'


    },


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//4. Login
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'login': {
        'title': 'Bejelentkezés',
        'usernameLabel': "Felhasználónév",
        'passwordLabel': "Jelszó",
        'lostPassButton': 'Elfelejtettem a jelszavam!',
        'registrationButton': 'Regisztrálok!',
        'lostPasswordTitle': 'Elfelejtett jelszó',
        'newPasswordTitle': 'Új jelszó',
        'newPasswordPasswordLabel': 'Új jelszó',
        'newPasswordPasswordAgainLabel': 'Új jelszó ismétlése',


        'loginUsernamePasswordError': 'A felhasználóneved vagy jelszavad hibás!',
        'newPasswordNotMatchError': 'A két megadott jelszó nem egyezik!',
        'newPasswordWrongKey': 'A megadott kulcs nem megfelelő!',

        'lostPassMail': 'Elfelejtett jelszó'
    },


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//5. Registration
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    'registration': {

        'title': 'Regisztráció',
        'usernameLabel': 'Felhasználónév',
        'passwordLabel': 'Jelszó',
        'passwordAgainLabel': 'Jelszó ismét',
        'emailLabel': 'E-mail cím',

        'wrongUsernameFormat': 'Nem megfelelő formátumú felhasználónév! Kövesd az utasításokat!',
        'wrongPasswordLength': 'A jelszó nem lehet nyolc karakternél rövidebb!',
        'passwordMismatch': 'A jelszó és megerősítése nem egyezik!',
        'wrongEmailFormat': 'Nem megfelelő formátumú e-mail cím! Kövesd az utasításokat!',
        'unknownError': 'Sikertelen regisztráció! Ismeretlen hiba :( ',
        'existingEmail': 'Az e-mail cím már foglalt. Próbálj másikat!',
        'existingUser': 'A felhasználónév már foglalt. Próbálj másikat!',

        'activationMailTitle': 'Regisztráció aktiválása'
    },

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//6. Error defaults
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'errorDefaults': {
        'error': 'Hiba'
    },

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//7. Locations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'pages': {
        'pages': 'Helyszínek',

        'lastComments': 'Legutóbbi hozzászólások:',
        'selectedCharacter': 'Kiválasztott karakter:',
        'comments': 'Hozzászólások:',
        'characterSelector': 'Karakter választó'


    },

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//8. Characters
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    'characters': {
        'locations': 'Karakterek',

        'newCharacter': "Új karakter",

        'namePlaceholder': 'Eddard Stark',
        'nicknamePlaceholder': 'Ned Stark',
        'speciesPlaceholder': 'Ember',
        'sexualityPlaceholder': 'Válassz!',
        'sexPlaceholder': 'Válassz!',

        'name': 'Név',
        'nickname': 'Becenév',
        'birthday': 'Születésnap',
        'species':  'Faj',
        'sexuality': 'Szexualitás',
        'sex': 'Nem',
        'profilePic': 'Profilkép',

        'sexualityHeterosexual': 'Heteroszexuális',
        'sexualityHomosexual': 'Homoszexuális',
        'sexualityAsexual': 'Aszexuális',
        'sexualityBisexual': 'Biszexuális',
        'sexualityOther': 'Egyéb',

        'sexMale': 'Férfi',
        'sexFemale': 'Nő',



    }

}
module.exports = language;

