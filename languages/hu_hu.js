const language = {
    /*
    * 1. Login
    * 2. Registration
    * 3. Characters
    */


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//1. Login
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    'login': {


        'loginUsernamePasswordError': 'A felhasználóneved vagy jelszavad hibás!'

    },


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//2. Registration
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    'registration': {

        'wrongUsernameFormat': 'Nem megfelelő formátumú felhasználónév! Kövesd az utasításokat!',
        'wrongPasswordLength': 'A jelszó nem lehet nyolc karakternél rövidebb!',
        'passwordMismatch': 'A jelszó és megerősítése nem egyezik!',
        'wrongEmailFormat': 'Nem megfelelő formátumú e-mail cím! Kövesd az utasításokat!',
        'unknownError': 'Sikertelen regisztráció! Ismeretlen hiba :( ',
        'existingEmail': 'Az e-mail cím már foglalt. Próbálj másikat!',
        'existingUser': 'A felhasználónév már foglalt. Próbálj másikat!',

        },




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//3. Characters
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    'characters': {
         'birthday_error': 'Nem megfelelő születési dátum!',
        'sex_error': "Nem megfelelő a karakter nem!e",
        'sexuality_error': "Nem megfelelő a karakter szexualitása!",
        'existingCharacter_error': "Már létezik ilyen nevű karakter!",


    }

}
module.exports = language;

