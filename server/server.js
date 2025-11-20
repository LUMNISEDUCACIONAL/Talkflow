const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

// Spotify Token Cache
let spotifyAccessToken = null;
let spotifyTokenExpiry = null;

// Helper: Get Spotify Token (Client Credentials Flow)
async function getSpotifyToken() {
    // Return cached token if valid (with 1 minute buffer)
    if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
        return spotifyAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing Spotify Credentials in .env');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify Auth Failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    // Set expiry 1 minute before actual expiration to be safe
    spotifyTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

    return spotifyAccessToken;
}

// Route: Get Token
app.get('/api/spotify/token', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        res.json({ access_token: token });
    } catch (error) {
        console.error("Token Error:", error);
        res.status(500).json({ error: 'Failed to obtain access token' });
    }
});

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

        const tracks = data.tracks?.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album.name,
            image: track.album.images[0]?.url || null,
            duration_ms: track.duration_ms,
            spotify_url: track.external_urls.spotify
        })) || [];

        res.json({ tracks });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: 'Failed to search tracks' });
    }
});

app.listen(PORT, () => {
    console.log(`TuneFlow Backend running on http://localhost:${PORT}`);
});