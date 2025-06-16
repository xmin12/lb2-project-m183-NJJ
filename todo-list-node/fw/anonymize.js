const db = require('./db');

async function anonymizeUser(userId) {
    const conn = await db.connectDB();
    const timestamp = new Date().toISOString();

    // Username und Passwort anonymisieren
    const newUsername = `anonymized_user_${userId}`;
    const newPassword = 'anonymized_password'; // z.B. statischer Wert oder zufälliger Hash

    await conn.query(
        `UPDATE users SET username = ?, password = ? WHERE ID = ?`,
        [newUsername, newPassword, userId]
    );

    // Tasks anonymisieren (Titel ersetzen, Status auf done)
    await conn.query(
        `UPDATE tasks SET title = ?, state = 'done' WHERE UserID = ?`,
        [`Aufgrund Löschbegehren anonymisiert am ${timestamp}`, userId]
    );

    console.log(`User ${userId} und zugehörige Tasks anonymisiert.`);
}

module.exports = { anonymizeUser };
