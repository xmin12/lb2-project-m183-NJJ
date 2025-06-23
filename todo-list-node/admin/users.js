const db = require('../fw/db');
const escapeHtml = require('escape-html');

async function getHtml() {
    let conn;
    try {
        conn = await db.connectDB();
        if (!conn) throw new Error('Database connection failed');

        const [result] = await conn.query(`
            SELECT users.ID, users.username, roles.title 
            FROM users 
            INNER JOIN permissions ON users.ID = permissions.userID 
            INNER JOIN roles ON permissions.roleID = roles.ID 
            ORDER BY username
        `);

        let html = `
<h2>User List</h2>
<table>
    <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Role</th>
        <th>Aktion</th>
    </tr>`;

        result.forEach(record => {
            html += `
    <tr>
        <td>${escapeHtml(record.ID)}</td>
        <td>${escapeHtml(record.username)}</td>
        <td>${escapeHtml(record.title)}</td>
        <td><a href="/admin/anonymize?id=${escapeHtml(record.ID)}" 
              onclick="return confirm('User wirklich anonymisieren?')">
              Anonymisieren
          </a></td>
    </tr>`;
        });

        html += `</table>`;
        return html;
    } catch (err) {
        console.error('Database error:', err);
        return '<p>Error loading user data</p>';
    } finally {
        if (conn) await conn.end();
    }
}

module.exports = { html: getHtml() };
