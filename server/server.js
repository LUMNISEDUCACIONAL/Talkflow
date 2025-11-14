
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Custom middleware to serve .tsx files as JavaScript modules
app.use((req, res, next) => {
    if (req.path.endsWith('.tsx')) {
        const filePath = path.join(__dirname, '..', req.path);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return next();
            res.set('Content-Type', 'application/javascript; charset=utf--8');
            res.send(data);
        });
    } else {
        next();
    }
});

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// API Routes for proxies

// Proxy for Murf AI
app.post('/api/speech', async (req, res) => {
    const { text, speed } = req.body;
    const MURF_API_KEY = process.env.MURF_API_KEY || 'ap2_682c555c-b5ba-4232-8e71-a25f8498afc1'; // Fallback for local dev
    try {
        const response = await fetch('https://api.murf.ai/v1/speech/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': MURF_API_KEY },
            body: JSON.stringify({
                text,
                voiceId: 'en-US-natalie',
                style: "Conversational",
                rate: speed === 0.7 ? -30 : -50,
                pitch: 0,
                sampleRate: 24000,
                format: "MP3",
                channelType: "MONO",
                modelVersion: "GEN2"
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Murf API error');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Proxy for Spotify API
let spotifyToken = { value: null, expires: 0 };
async function getSpotifyToken() {
    if (spotifyToken.value && Date.now() < spotifyToken.expires) {
        return spotifyToken.value;
    }
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'e249c41dd7764ef0ab43aabc4507beab';
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'beb69017fc8e4fbd9744eefc3d8c234f';
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET) },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    spotifyToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
    return spotifyToken.value;
}

app.get('/api/spotify-search', async (req, res) => {
    const { q } = req.query;
    try {
        const token = await getSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=12`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Proxy for Musixmatch API
app.get('/api/lyrics', async (req, res) => {
    const { track, artist } = req.query;
    const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY || '3b573b5b063bdad64481ad33ff1805d4';
    const MUSIXMATCH_BASE_URL = 'https://api.musixmatch.com/ws/1.1/';
    try {
        // Search for track
        const searchParams = new URLSearchParams({ apikey: MUSIXMATCH_API_KEY, q_track: track, q_artist: artist });
        const searchResponse = await fetch(`${MUSIXMATCH_BASE_URL}track.search?${searchParams}`);
        const searchData = await searchResponse.json();
        if (searchData.message.header.status_code !== 200 || searchData.message.body.track_list.length === 0) {
            return res.status(404).json({ error: "Lyrics not found." });
        }

        // Get lyrics
        const trackId = searchData.message.body.track_list[0].track.track_id;
        const lyricsParams = new URLSearchParams({ apikey: MUSIXMATCH_API_KEY, track_id: String(trackId) });
        const lyricsResponse = await fetch(`${MUSIXMATCH_BASE_URL}track.lyrics.get?${lyricsParams}`);
        const lyricsData = await lyricsResponse.json();
        if (lyricsData.message.header.status_code !== 200 || !lyricsData.message.body.lyrics) {
            return res.status(404).json({ error: "Could not load lyrics." });
        }
        
        const lyricsBody = lyricsData.message.body.lyrics.lyrics_body;
        if (!lyricsBody || lyricsBody.includes('This Lyrics is NOT for Commercial use')) {
            return res.status(404).json({ error: "Lyrics for this song are not available." });
        }

        res.json({ lyrics: lyricsBody.split('...')[0].trim() });
    } catch (error) {
        res.status(500).json({ error: "Could not connect to the lyrics service." });
    }
});


// The "catchall" handler for Single Page Application.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
