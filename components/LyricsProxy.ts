
const API_KEY = '3b573b5b063bdad64481ad33ff1805d4';

export async function lyricsProxy(args: { action: string; track?: string; artist?: string }) {
    console.log("lyricsProxy called with:", args);

    if (args.action === 'getLyrics' && args.track && args.artist) {
        try {
            const trackEncoded = encodeURIComponent(args.track);
            const artistEncoded = encodeURIComponent(args.artist);
            // Changed to http as requested to avoid SSL issues on free tier
            const url = `http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${trackEncoded}&q_artist=${artistEncoded}&apikey=${API_KEY}`;

            console.log(`Fetching lyrics from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                console.error(`lyricsProxy HTTP error: ${response.status}`);
                return { lyrics: null, error: `HTTP Error: ${response.status}` };
            }

            const data = await response.json();
            console.log("Musixmatch API response:", data);

            // Check Musixmatch specific status code
            const statusCode = data.message?.header?.status_code;
            if (statusCode !== 200) {
                console.warn(`Musixmatch returned status code: ${statusCode}`);
                return { lyrics: null, error: `API Status: ${statusCode}` };
            }

            const lyricsBody = data.message?.body?.lyrics?.lyrics_body;

            if (!lyricsBody) {
                console.log("No lyrics body found in response.");
                return { lyrics: null };
            }

            return { lyrics: lyricsBody };

        } catch (error: any) {
            console.error("lyricsProxy internal error:", error);
            // Return a safe JSON object even on crash
            return { lyrics: null, error: error.message || "Unknown error" };
        }
    }

    console.error("lyricsProxy: Invalid action or missing parameters");
    return { lyrics: null, error: "Invalid parameters" };
}
