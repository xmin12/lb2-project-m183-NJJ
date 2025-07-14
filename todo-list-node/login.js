const db = require('./fw/db');
const bcrypt = require('bcrypt');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userid': 0 };

    if (typeof req.body.username !== 'undefined' && typeof req.body.password !== 'undefined') {
        const result = await validateLogin(req.body.username, req.body.password);

        if (result.valid) {
            user.username = req.body.username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return { 'html': msg + await getHtml(), 'user': user };
}

function startUserSession(res, user) {
    console.log('Login erfolgreich – starte Benutzersitzung für userid ' + user.userid);
    res.cookie('username', user.username);
    res.cookie('userid', user.userid);
    res.redirect('/');
}

async function validateLogin(username, password) {
    let result = { valid: false, msg: '', userId: 0 };

    try {
        const dbConnection = await db.connectDB();

        const sql = `SELECT id, username, password FROM users WHERE username = ?`;
        const [results] = await dbConnection.query(sql, [username]);

        if (results.length > 0) {
            const db_id = results[0].id;
            const db_password = results[0].password;

            // Compare hashed password
            const match = await bcrypt.compare(password, db_password);
            if (match) {
                result.userId = db_id;
                result.valid = true;
                result.msg = 'Login erfolgreich';
            } else {
                result.msg = 'Benutzername oder Passwort ist falsch';
            }
        } else {
            result.msg = 'Benutzername oder Passwort ist falsch';
        }
    } catch (err) {
        console.error('Fehler beim Login:', err);
        result.msg = 'Ein interner Fehler ist aufgetreten';
    }

    return result;
}

function getHtmlSync() {
    return `
    <h2>Login</h2>

    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Benutzername</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Passwort</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

// Asynchrone Variante von getHtml, wie gewünscht
async function getHtml() {
    return getHtmlSync();
}

module.exports = {
    handleLogin,
    startUserSession,
    getHtml
};
