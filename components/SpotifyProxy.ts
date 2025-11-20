
const CLIENT_ID = '2a2f1596d026452ab90c667f7523356a';
const CLIENT_SECRET = 'e741a264821f4fb5919480796da040b9';

interface SpotifyToken {
    access_token: string;
    expires_at: number;
}

let memoryToken: SpotifyToken | null = null;

// Helper to get token with caching strategy
async function getSpotifyToken(): Promise<string> {
    const now = Date.now();

    // Check memory cache first
    if (memoryToken && now < memoryToken.expires_at) {
        return memoryToken.access_token;
    }

    // Check localStorage cache
    const stored = localStorage.getItem('spotify_client_token');
    if (stored) {
        const parsed: SpotifyToken = JSON.parse(stored);
        if (now < parsed.expires_at) {
            memoryToken = parsed;
            return parsed.access_token;
        }
    }

    // Fetch new token
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Spotify Auth Failed: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const expiresAt = now + (data.expires_in * 1000) - 60000; // Expire 1 minute early
    
    const tokenData: SpotifyToken = {
        access_token: data.access_token,
        expires_at: expiresAt
    };

    // Save to cache
    memoryToken = tokenData;
    localStorage.setItem('spotify_client_token', JSON.stringify(tokenData));

    return data.access_token;
}

async function searchTracks(query: string) {
    const token = await getSpotifyToken();
    
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=30&market=US`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Spotify Search Failed: ${response.status}`);
    }

    const data = await response.json();
    
    return data.tracks?.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        image: track.album.images[0]?.url || null,
        duration_ms: track.duration_ms,
        spotify_url: track.external_urls.spotify
    })) || [];
}

// The Internal Function Implementation
export async function spotifyProxy(args: { action: string; query?: string }) {
    if (args.action === 'token') {
        const token = await getSpotifyToken();
        return { access_token: token };
    }
    
    if (args.action === 'search' && args.query) {
        const tracks = await searchTracks(args.query);
        return { tracks };
    }

    throw new Error(`Unknown action or missing parameters: ${args.action}`);
}
