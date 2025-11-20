
const API_KEY = '3b573b5b063bdad64481ad33ff1805d4';

export async function lyricsServer(args: { track: string; artist: string }) {
    console.log("lyricsServer called with:", args);
    const { track, artist } = args;

    if (!track || !artist) {
        return { lyrics: null, error: "Missing track or artist" };
    }

    try {
        const trackEncoded = encodeURIComponent(track);
        const artistEncoded = encodeURIComponent(artist);
        
        // Using HTTP as requested to ensure compatibility
        const url = `http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${trackEncoded}&q_artist=${artistEncoded}&apikey=${API_KEY}`;

        console.log(`Fetching lyrics from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error(`lyricsServer HTTP error: ${response.status}`);
            return { lyrics: null, error: `HTTP Error: ${response.status}` };
        }

        const data = await response.json();
        console.log("Musixmatch API response:", JSON.stringify(data));

        // Check Musixmatch specific status code
        const statusCode = data.message?.header?.status_code;
        if (statusCode !== 200) {
            console.warn(`Musixmatch returned status code: ${statusCode}`);
            if (statusCode === 404) {
                return { lyrics: null };
            }
            return { lyrics: null, error: `API Status: ${statusCode}` };
        }

        const lyricsBody = data.message?.body?.lyrics?.lyrics_body;

        if (!lyricsBody) {
            console.log("No lyrics body found in response.");
            return { lyrics: null };
        }

        return { lyrics: lyricsBody };

    } catch (error: any) {
        console.error("lyricsServer internal error:", error);
        return { lyrics: null, error: error.message || "Unknown error" };
    }
}
