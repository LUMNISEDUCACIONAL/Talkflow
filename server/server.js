
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// --- Database Helpers (Preserved for Auth/Progress) ---
const DB_PATH = path.join(__dirname, 'db.json');

const readDb = () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading database file:", error);
    }
    return { users: [], progress: {} };
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to database file:", error);
    }
};

// --- Auth & Progress Routes (Preserved) ---
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    const db = readDb();
    if (db.users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    db.users.push({ name, email, password });
    db.progress[email] = { userLevel: 'A1', hasCompletedTest: false, completedNodes: [], seenQuestions: { A1: [], A2: [], B1: [], B2: [] } };
    writeDb(db);
    res.status(201).json({ name, email });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    const db = readDb();
    const user = db.users.find(u => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    res.status(200).json({ name: user.name, email: user.email });
});

app.get('/api/progress/:email', (req, res) => {
    const { email } = req.params;
    const db = readDb();
    const userProgress = db.progress[email] || { userLevel: 'A1', hasCompletedTest: false, completedNodes: [], seenQuestions: { A1: [], A2: [], B1: [], B2: [] } };
    res.status(200).json(userProgress);
});

app.post('/api/progress', (req, res) => {
    const { email, progressData } = req.body;
    if (!email || !progressData) {
        return res.status(400).json({ error: 'Missing email or progress data.' });
    }
    const db = readDb();
    db.progress[email] = progressData;
    writeDb(db);
    res.status(200).json({ message: 'Progress saved successfully.' });
});

// --- Murf AI (Preserved for Activity.tsx) ---
app.post('/api/speech', async (req, res) => {
    const { text, speed } = req.body;
    const MURF_API_KEY = process.env.MURF_API_KEY;
    if (!MURF_API_KEY) return res.status(500).json({ error: "MURF_API_KEY not configured" });
    try {
        const response = await fetch('https://api.murf.ai/v1/speech/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': MURF_API_KEY },
            body: JSON.stringify({ text, voiceId: 'en-US-natalie', style: "Conversational", rate: speed === 0.7 ? -30 : -50, sampleRate: 24000, format: "MP3" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Murf API error');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NEW SPOTIFY BASE44 IMPLEMENTATION ---

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'e249c41dd7764ef0ab43aabc4507beab';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'e4ed4267dbef44a299fe18fa521bfabe';

// In-memory Token Cache
let spotifyTokenCache = {
    accessToken: null,
    expiresAt: 0
};

// Helper: Get Token (Client Credentials Flow)
const getSpotifyToken = async () => {
    const now = Date.now();
    
    // Return cached token if valid (with 1 min buffer)
    if (spotifyTokenCache.accessToken && now < spotifyTokenCache.expiresAt) {
        return spotifyTokenCache.accessToken;
    }

    console.log("Fetching new Spotify Access Token...");

    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spotify Auth Failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        spotifyTokenCache.accessToken = data.access_token;
        // Set expiration time (expires_in is in seconds), minus 60s buffer
        spotifyTokenCache.expiresAt = now + (data.expires_in * 1000) - 60000;

        return spotifyTokenCache.accessToken;

    } catch (error) {
        console.error("Error fetching Spotify token:", error);
        throw error;
    }
};

// Route: Search Tracks
app.get('/api/spotify/search', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const token = await getSpotifyToken();
        
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=30`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify Search Failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Clean response format for frontend
        const tracks = data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image: track.album.images[0]?.url || null,
            duration_ms: track.duration_ms,
            spotify_url: track.external_urls.spotify
        }));

        res.json({ tracks });

    } catch (error) {
        console.error("Search endpoint error:", error);
        res.status(500).json({ error: 'Failed to search tracks' });
    }
});

// --- Static Files ---
app.use(express.static(path.join(__dirname, '..')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Base44-Style Server running on http://localhost:${PORT}`);
});
