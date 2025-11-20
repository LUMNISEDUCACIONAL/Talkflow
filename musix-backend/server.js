import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post('/lyrics', async (req, res) => {
    const { track, artist } = req.body;
    console.log(`Request for lyrics: ${track} by ${artist}`);

    if (!track || !artist) {
        return res.status(400).json({ lyrics: null, error: "Missing track or artist" });
    }

    try {
        const apiKey = process.env.MUSIXMATCH_API_KEY;
        // Using HTTP as requested to avoid potential SSL issues on some environments, 
        // though axios handles HTTPS fine. Following specific user instruction.
        const url = `http://api.musixmatch.com/ws/1.1/matcher.lyrics.get`;

        const response = await axios.get(url, {
            params: {
                q_track: track,
                q_artist: artist,
                apikey: apiKey
            }
        });

        const data = response.data;

        // Check for successful status code in the Musixmatch response body
        if (data.message && data.message.header && data.message.header.status_code === 200) {
            const lyricsBody = data.message.body.lyrics ? data.message.body.lyrics.lyrics_body : null;
            return res.json({ lyrics: lyricsBody });
        } else {
            console.warn(`Musixmatch API returned status: ${data.message?.header?.status_code}`);
            // Return null lyrics instead of error to indicate "not found" gracefully
            return res.json({ lyrics: null });
        }

    } catch (error) {
        console.error("Musixmatch request failed:", error.message);
        return res.status(500).json({ lyrics: null, error: "Musixmatch request failed." });
    }
});

app.listen(PORT, () => {
    console.log(`Musixmatch backend running on http://localhost:${PORT}`);
});