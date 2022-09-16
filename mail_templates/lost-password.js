// Mail template for sending password link

function lostPasswordEmail(passwordKey) {
    return '<h1>Üdvözletem!</h1><h2>Ezzel az e-maillel állíthatod vissza elfelejtett jelszavadat.</h2><p>Az alábbi linkre kattintva változtathatod meg meg:<br><a href="http://localhost:3000/lost-password/new-password?key='+ passwordKey +'">Jelszó visszaállítása</a><br>Köszönöm, hogy Te is nálunk játszol!<br><br>Üdvözlettel,<br>Halápi Dávid<br> <span style="font-size: smaller;">Powered by.: Sith Magick</span>';
}

module.exports= lostPasswordEmail;

