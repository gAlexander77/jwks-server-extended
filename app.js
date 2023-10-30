import express from 'express';
import forge from 'node-forge';
import jose from 'node-jose';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';

// Create database
const db = new sqlite3.Database('totally_not_my_privateKeys.db');

// Express server
const app = express();

// Stores all valid keys in JWKS format
const VALID_KEYS = [];

// Adds public RSA key and valid KID into JWKS format
async function addValidKidToValidKeys(keyid, publicKey) {
    const key = await jose.JWK.asKey(publicKey, 'pem');
    const jwk = key.toJSON();
    VALID_KEYS.push(
        {
            kid: keyid,
            alg: "RS256",
            kty: "RSA",
            use: "sig",
            n: jwk.n,
            e: jwk.e,
        }
    );
    return;
}

// Insert Keys into database
function insertKey(key, exp) {
    const stmt = db.prepare("INSERT INTO keys (key, exp) VALUES (?, ?)");
    stmt.run(key, exp);
    stmt.finalize();   
}

// Gets the next kid to be generated in the database
function getKeyID() {
    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(kid) as keyID FROM keys;", (err, row) => {
            resolve(row.keyID ? row.keyID + 1 : 1);
        });
    });
}

// Returns token
async function generateToken(isExpired) {
    const id = await getKeyID();
    const keyID = id.toString();

    // Generates RSA key pair then converts them to pem format
    const keyPair = forge.pki.rsa.generateKeyPair(2048);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);

    let token;
    if(isExpired) {
        token = jwt.sign({}, privateKey, {algorithm: 'RS256', expiresIn: '-1h', keyid: keyID});
        insertKey(privateKey, Math.floor(Date.now() / 1000) - 3600);
    } else {
        token = jwt.sign({}, privateKey, {algorithm: 'RS256', expiresIn: '24h', keyid: keyID});
        insertKey(privateKey, Math.floor(Date.now() / 1000) + 86400);
        addValidKidToValidKeys(keyID, publicKey);
    }
    return token;
}

// '/auth' POST endpoint
// Checks if token is expired or if it exist
// Valid token key IDs get stored in the global VALID_KEYS array
app.post('/auth', async (req, res) => {
        const token = await generateToken(req.query.expired === 'undefined' || req.query.expired === 'true');
        res.send(token);
});

// Don't allow any methods other than POST to '/auth'
app.all('/auth', (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).end();
    }
})

// '/.well-known/jwks.json' GET endpoint
// Returns all valid keys in JWKS format
app.get('/.well-known/jwks.json', (req, res) => {
    res.send({keys: VALID_KEYS});
})

// Don't allow any methods other than GET to '/.well-known/jwks.json'
app.all('/.well-known/jwks.json', (req, res) => {
    if(req.method !== 'GET') {
        res.status(405).end();
    }
})

// Starts the server on the localhost on port 8080 
app.listen(8080, () => {
    console.log('jwks-server is running on http://localhost:8080');
})

// Create the keys table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS keys(kid INTEGER PRIMARY KEY AUTOINCREMENT,key BLOB NOT NULL,exp INTEGER NOT NULL)");
    db.run("PRAGMA journal_mode=WAL;");
    
    // Add expired and nonexpired key to ensure POST:/auth can be tested
    (async () => {
        await generateToken(true);
        await generateToken(false);
    })();
});


export default app;