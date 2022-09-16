const language = {
    /*
    * 1. Navbar
    * 2. Frontpage
    * 3. Locations
    * 4. Login
    * 5. Registration
    * 6. Error defaults
    * 7. Pages
    *
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
        'logout': 'Kijelentkezés'

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

}
module.exports = language;

