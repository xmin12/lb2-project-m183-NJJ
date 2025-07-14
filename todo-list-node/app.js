const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');
const { anonymizeUser } = require('./fw/anonymize');

const app = express();
const PORT = 3000;

// Middleware für Session-Handling
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Middleware für Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Login-Verarbeitung (POST)
app.post('/login', async (req, res) => {
    let loginResult = await login.handleLogin(req, res);

    if (loginResult.user.userid !== 0) {
        login.startUserSession(res, loginResult.user);
        res.redirect('/');
    } else {
        let html = await wrapContent(loginResult.html, req);
        res.send(html);
    }
});

// Startseite
app.post('/', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req);
        res.send(html);
    } else {
        res.redirect('login');
    }
});

// Admin-Benutzerseite
app.get('/admin/users', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await adminUser.html, req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// Edit Task
app.get('/edit', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await editTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// Login-Seite anzeigen – Nur Formular, keine Logik
app.get('/login', async (req, res) => {
    const html = await wrapContent(await login.getHtml(), req);
    res.send(html);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.cookie('username', '');
    res.cookie('userid', '');
    res.redirect('/login');
});

// Profilseite
app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

// Save Task
app.post('/savetask', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await saveTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// Search
app.post('/search', async (req, res) => {
    let html = await search.html(req);
    res.send(html);
});

// Search V2 Provider
app.get('/search/v2/', async (req, res) => {
    let result = await searchProvider.search(req);
    res.send(result);
});

// Benutzer anonymisieren
app.get('/admin/anonymize', async (req, res) => {
    if (!activeUserSession(req)) {
        return res.redirect('/login');
    }

    const userId = req.query.id;
    if (!userId) {
        return res.status(400).send('User ID fehlt');
    }

    try {
        await anonymizeUser(userId);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler bei der Anonymisierung');
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Hilfsfunktionen
async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml + content + footer;
}

function activeUserSession(req) {
    console.log('in activeUserSession');
    console.log(req.cookies);
    return req.cookies !== undefined &&
        req.cookies.username !== undefined &&
        req.cookies.username !== '';
}
