// Mail template for sending activation link

function activationEmail(activationKey) {
   return '<h1>Üdvözletem!</h1><h2>Kérlek aktiváld a regisztrációdat!</h2><p>Az alábbi linkre kattintva teheted meg:<br><a href="http://localhost:3000/activation?key='+ activationKey +'">Regisztráció aktiválása</a><br>Köszönöm, hogy Te is nálunk játszol!<br><br>Üdvözlettel,<br>Halápi Dávid<br> <span style="font-size: smaller;">Powered by.: Sith Magick</span>';

}

module.exports= activationEmail;


