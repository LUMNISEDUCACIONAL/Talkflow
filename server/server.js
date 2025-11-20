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

// Spotify Configuration
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Token Cache
let spotifyAccessToken = null;
let spotifyTokenExpiry = null;

// Helper: Get Spotify Token (Client Credentials Flow)
async function getSpotifyToken() {
    // Check if token is cached and valid (with 1 minute buffer)
    if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
        return spotifyAccessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Spotify credentials missing in .env file');
    }

    console.log('Refreshing Spotify Access Token...');

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spotify Auth Failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        spotifyAccessToken = data.access_token;
        // Expire 1 minute before actual expiration
        spotifyTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

        return spotifyAccessToken;
    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        throw error;
    }
}

// Route: Get Token (Required by some frontend implementations)
app.get('/api/spotify/token', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        res.json({ access_token: token });
    } catch (error) {
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
            throw new Error(`Spotify API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Format response strictly for frontend
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
        console.error('Search endpoint error:', error);
        res.status(500).json({ error: 'Failed to search tracks' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Spotify Backend running on http://localhost:${PORT}`);
});
