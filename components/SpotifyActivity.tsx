
import React, { useState, useRef } from 'react';
import { SearchIcon, MusicIcon, SparklesIcon, StarIcon } from './icons/Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { UserLevel } from '../App.tsx';

// --- Type Definitions ---
interface SpotifyArtist { name: string; }
interface SpotifyImage { url: string; }
interface SpotifyAlbum { images: SpotifyImage[]; }
interface Track {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
}
interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

// --- Hardcoded Data ---
// Ensuring these are valid Spotify Track IDs
const TUNEFLOW_PICKS_DATA: Track[] = [
    { id: '0pqnGHJpmpxLKifKRiU6wp', name: 'Believer', artists: [{ name: 'Imagine Dragons' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b2b274291e89c670a80491a6' }] } },
    { id: '5uCax9HTN2Y_LkStUIkCR1', name: "Say You Won't Let Go", artists: [{ name: 'James Arthur' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e8691f6a17f6f2a63259838a' }] } },
    { id: '7qiZfU4dY1lWllzX7mP3AU', name: 'Shape of You', artists: [{ name: 'Ed Sheeran' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b75554128fed7447d9cda260' }] } },
    { id: '1mea3bSkSGXuIRvnydlB5b', name: 'Viva La Vida', artists: [{ name: 'Coldplay' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27344a7f3f73d65b321a50894af' }] } },
    { id: '4kflIGfjdZ5IAD5vxheA21', name: 'Someone Like You', artists: [{ name: 'Adele' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27350c31438a1f81014e7b85526' }] } },
    { id: '7BqBn9nzAq8spo5e7cZ0dJ', name: 'Just the Way You Are', artists: [{ name: 'Bruno Mars' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734d4062039226c650895311e5' }] } },
];

// --- Helper Functions ---
function extractJSON(text: string): any {
    // A more robust function to find and parse JSON within a string
    let potentialJson = text.trim();
    
    const markdownMatch = potentialJson.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        potentialJson = markdownMatch[1];
    }

    const firstBrace = potentialJson.indexOf('{');
    const lastBrace = potentialJson.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const jsonString = potentialJson.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse extracted JSON substring:", jsonString, e);
        }
    }
    
    throw new Error("No valid JSON found in the AI response.");
}

// --- Main Component ---
const TuneFlow: React.FC<{ onFinish: () => void; userLevel: UserLevel; }> = ({ onFinish, userLevel }) => {
    // Search State
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Activity State
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
    const [lyricsError, setLyricsError] = useState<string | null>(null);

    // Quiz State
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
    const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

    // Prevention of duplicate calls
    const isResolvingRef = useRef(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        setSearchError(null);
        try {
            const response = await fetch(`/api/spotify-search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorMsg = 'Failed to search tracks.';
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            setSearchResults(data.tracks.items);
        } catch (err: any) {
            setSearchError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePickSelect = async (track: Track) => {
        if (isResolvingRef.current) return;
        isResolvingRef.current = true;

        try {
            // Automatically resolve real Spotify ID for fixed tracks.
            // Using exactly the track name to ensure "Believer" is found correctly.
            const query = track.name.trim();
            const response = await fetch(`/api/resolve-spotify-track?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                     throw new Error("ID não encontrado na API do Spotify.");
                }
                throw new Error("Falha de comunicação com o servidor.");
            }
            
            const resolvedTrack = await response.json();
            
            if (!resolvedTrack || !resolvedTrack.id) {
                 throw new Error("ID inválido retornado.");
            }

            // Pass the resolved track with the real ID to the main handler
            handleTrackSelect(resolvedTrack);

        } catch (error: any) {
            // Display detailed alert and block user until closed
            alert(`Erro ao carregar '${track.name}': ${error.message}`);
        } finally {
            isResolvingRef.current = false;
        }
    };

    const handleTrackSelect = async (track: Track) => {
        // Strict: Use the track directly from selection (must have valid ID)
        setSelectedTrack(track);
        setLyrics(null);
        setQuiz(null);
        setIsLoadingLyrics(true);
        setIsLoadingQuiz(false);
        setLyricsError(null);
        setQuizError(null);
        setCurrentQuizQuestionIndex(0);
        setQuizAnswers([]);
        setQuizFeedback(null);

        try {
            const lyricsParams = new URLSearchParams({ track: track.name, artist: track.artists[0].name });
            const response = await fetch(`/api/lyrics?${lyricsParams}`);
            
            const contentType = response.headers.get("content-type");
            let data;

            // Strict JSON Check: Prevent HTML responses from breaking the app
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // Fallback: read text and try to parse, but don't crash
                const text = await response.text();
                if (text.trim().startsWith('{')) {
                     try {
                         data = JSON.parse(text);
                     } catch {
                         throw new Error("Invalid server response.");
                     }
                } else {
                     throw new Error("Lyrics service temporarily unavailable.");
                }
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to retrieve lyrics.");
            }
            
            if (!data.lyrics) {
                throw new Error("Lyrics not found.");
            }

            setLyrics(data.lyrics);
            // Generate quiz if lyrics are found
            handleGenerateQuiz(track, data.lyrics);

        } catch (err: any) {
            setLyricsError(err.message || "Lyrics not available for this song.");
        } finally {
            setIsLoadingLyrics(false);
        }
    };

    const handleGenerateQuiz = async (track: Track, lyricsText: string) => {
        setIsLoadingQuiz(true);
        setQuizError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
            const quizSchema = {
                type: Type.OBJECT,
                properties: {
                    quiz: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING, description: "The quiz question related to the lyrics." },
                                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 possible answers." },
                                correct: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." }
                            },
                            required: ["question", "options", "correct"]
                        }
                    }
                },
                required: ["quiz"]
            };
            const prompt = `Based on the song lyrics below, create a 3-question quiz in English to test vocabulary or interpretation. The student's English level is ${userLevel}. Provide 4 options for each question. Respond with ONLY the JSON object. Lyrics: "${lyricsText.substring(0, 3000)}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: quizSchema }
            });

            const result = extractJSON(response.text);

            if (!result.quiz || result.quiz.length === 0) {
                throw new Error("AI could not generate a valid quiz.");
            }
            setQuiz(result.quiz);
            setQuizAnswers(Array(result.quiz.length).fill(null));
        } catch (err: any) {
            console.error(err);
            setQuizError("Could not generate the quiz. Please try another song.");
        } finally {
            setIsLoadingQuiz(false);
        }
    };
    
    const handleQuizAnswer = (optionIndex: number) => {
        if (quizAnswers[currentQuizQuestionIndex] !== null || !quiz) return;
        const newAnswers = [...quizAnswers];
        newAnswers[currentQuizQuestionIndex] = optionIndex;
        setQuizAnswers(newAnswers);
        const isCorrect = optionIndex === quiz[currentQuizQuestionIndex].correct;
        setQuizFeedback(isCorrect ? 'correct' : 'incorrect');
    };

    const handleNextQuizQuestion = () => {
        if (quiz && currentQuizQuestionIndex < quiz.length - 1) {
            setCurrentQuizQuestionIndex(prev => prev + 1);
            setQuizFeedback(null);
        }
    };
    
    const TrackList = ({ tracks, isLoading, onSelect }: { tracks: Track[]; isLoading?: boolean; onSelect: (track: Track) => void; }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isLoading && Array.from({length: 6}).map((_, i) => <div key={i} className="bg-slate-800 rounded-lg p-3 animate-pulse"><div className="w-full aspect-square rounded-md mb-2 bg-slate-700"></div><div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div><div className="h-3 bg-slate-700 rounded w-1/2"></div></div>)}
            {!isLoading && tracks.map(track => (
                <button key={track.id} onClick={() => onSelect(track)} className={`bg-slate-800 rounded-lg p-3 group hover:bg-slate-700 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 ${selectedTrack?.id === track.id ? 'ring-purple-500' : 'ring-transparent'}`}>
                    <img src={track.album.images[0]?.url} alt={track.name} className="w-full aspect-square rounded-md mb-2 object-cover" />
                    <p className="font-bold text-white truncate text-sm text-left">{track.name}</p>
                    <p className="text-slate-400 truncate text-xs text-left">{track.artists.map(a => a.name).join(', ')}</p>
                </button>
            ))}
        </div>
    );
    
    return (
        <div className="max-w-7xl mx-auto bg-[#1e2639] rounded-lg p-6 sm:p-8 shadow-2xl animate-fade-in">
            <div className="text-center mb-8">
                <div className="mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center mb-4"><MusicIcon className="h-10 w-10 text-white" /></div>
                <h2 className="text-3xl font-bold text-white">TuneFlow</h2>
                <p className="text-slate-400 mt-2">Aprenda inglês com suas músicas favoritas e um quiz de IA!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* --- Left Column: Song Selection --- */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-grow">
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquise uma música..." className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"/>
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                        <button type="submit" disabled={isSearching} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 rounded-lg transition-colors disabled:opacity-50">{isSearching ? '...' : 'Ir'}</button>
                    </form>
                    <div className="max-h-[550px] overflow-y-auto pr-2">
                        {searchError && <p className="text-center text-red-400 p-4">{searchError}</p>}
                        {searchResults.length > 0 ? (
                             <TrackList tracks={searchResults} isLoading={isSearching} onSelect={handleTrackSelect} />
                        ) : (
                            <>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white my-4"><StarIcon className="h-5 w-5 text-yellow-400" /> TuneFlow Picks</h3>
                                <TrackList tracks={TUNEFLOW_PICKS_DATA} isLoading={false} onSelect={handlePickSelect} />
                            </>
                        )}
                    </div>
                </div>
                
                {/* --- Right Column: Activity Area --- */}
                <div className="lg:col-span-3">
                    {!selectedTrack ? (
                        <div className="bg-slate-800/50 rounded-lg p-4 sticky top-4 h-[472px] flex flex-col items-center justify-center text-center">
                            <MusicIcon className="h-12 w-12 text-slate-500 mb-4"/>
                            <h3 className="font-semibold text-white">Selecione uma Música</h3>
                            <p className="text-slate-400 text-sm">Seu player, letra e quiz aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-lg p-4 sticky top-4">
                             {/* Spotify Iframe Player using real track.id */}
                             {selectedTrack.id && (
                                 <div className="mb-4 w-full shadow-lg">
                                    <iframe
                                      src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                                      width="100%"
                                      height="400"
                                      frameBorder="0"
                                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                      loading="lazy"
                                      className="rounded-lg"
                                    />
                                </div>
                             )}

                            <h3 className="text-lg font-bold text-white mb-2">Lyrics</h3>
                            <div className="max-h-[200px] overflow-y-auto bg-slate-900/50 p-3 rounded-md font-mono text-sm mb-4">
                                {isLoadingLyrics && <div className="flex items-center justify-center h-20"><MusicIcon className="h-8 w-8 text-slate-500 animate-pulse" /></div>}
                                {lyricsError && <p className="text-red-400 whitespace-pre-wrap">{lyricsError}</p>}
                                {lyrics && <p className="text-slate-300 whitespace-pre-wrap">{lyrics}</p>}
                            </div>

                            {(isLoadingQuiz || quiz || quizError) && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">AI Quiz</h3>
                                    <div className="bg-slate-900/50 p-4 rounded-lg">
                                        {isLoadingQuiz && <div className="text-center text-slate-300 p-4"><SparklesIcon className="h-8 w-8 mx-auto animate-spin text-purple-400 mb-2" /><p>Gerando seu quiz...</p></div>}
                                        {quizError && <div className="text-center text-red-400 p-4">{quizError}</div>}
                                        {quiz && (
                                            <div>
                                                <p className="text-center text-slate-400 mb-4 text-sm">Pergunta {currentQuizQuestionIndex + 1} de {quiz.length}</p>
                                                <p className="text-md text-slate-200 text-center mb-4">{quiz[currentQuizQuestionIndex].question}</p>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {quiz[currentQuizQuestionIndex].options.map((opt, idx) => {
                                                        let buttonClass = 'bg-slate-700 hover:bg-slate-600';
                                                        if (quizAnswers[currentQuizQuestionIndex] !== null) {
                                                          if (idx === quiz[currentQuizQuestionIndex].correct) buttonClass = 'bg-green-600 border-green-500 ring-2 ring-green-500';
                                                          else if (idx === quizAnswers[currentQuizQuestionIndex]) buttonClass = 'bg-red-600 border-red-500';
                                                          else buttonClass = 'bg-slate-800 border-slate-700 opacity-60';
                                                        }
                                                        return <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={quizAnswers[currentQuizQuestionIndex] !== null} className={`p-3 rounded-md text-white transition-all duration-200 border-2 border-transparent ${buttonClass}`}>{opt}</button>
                                                    })}
                                                </div>
                                                {quizFeedback && <p className={`mt-3 text-center font-semibold ${quizFeedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{quizFeedback === 'correct' ? "Correto!" : "Incorreto."}</p>}
                                                {currentQuizQuestionIndex < quiz.length - 1 && quizAnswers[currentQuizQuestionIndex] !== null && <button onClick={handleNextQuizQuestion} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md transition-colors">Próxima Pergunta</button>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center mt-10">
                 <button onClick={onFinish} className="px-8 py-3 rounded-lg text-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity">
                    Continue Sua Jornada
                </button>
            </div>
        </div>
    );
};

export default TuneFlow;
