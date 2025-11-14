import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, MusicIcon, SparklesIcon, StarIcon } from './icons/Icons.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { UserLevel } from '../App.tsx';

interface Track { id: string; name: string; artists: { name: string }[]; album: { images: { url: string }[] }; }

const TUNEFLOW_PICKS_DATA: Track[] = [
    { id: '0pqnGHJpmpxLKifKRiU6wp', name: 'Believer', artists: [{ name: 'Imagine Dragons' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b2b274291e89c670a80491a6' }] } },
    { id: '5uCax9HTN2Y_LkStUIkCR1', name: "Say You Won't Let Go", artists: [{ name: 'James Arthur' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e8691f6a17f6f2a63259838a' }] } },
    { id: '7qiZfU4dY1lWllzX7mP3AU', name: 'Shape of You', artists: [{ name: 'Ed Sheeran' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b75554128fed7447d9cda260' }] } },
    { id: '1mea3bSkSGXuIRvnydlB5b', name: 'Viva La Vida', artists: [{ name: 'Coldplay' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27344a7f3f73d65b321a50894af' }] } },
    { id: '4kflIGfjdZ5IAD5vxheA21', name: 'Someone Like You', artists: [{ name: 'Adele' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27350c31438a1f81014e7b85526' }] } },
    { id: '7BqBn9nzAq8spo5e7cZ0dJ', name: 'Just the Way You Are', artists: [{ name: 'Bruno Mars' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734d4062039226c650895311e5' }] } },
    { id: '1EzrEOXmMH3G43AXT1y7pA', name: "I'm Yours", artists: [{ name: 'Jason Mraz' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2736c43e75d5032545875249673' }] } },
    { id: '6dGnYIeXmHdcdLO0lALiCg', name: 'Here Comes The Sun', artists: [{ name: 'The Beatles' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25' }] } },
];


interface TuneFlowProps {
    onFinish: () => void;
    userLevel: UserLevel;
}

interface QuizQuestion { question: string; options: string[]; correct: number; }

const TuneFlow: React.FC<TuneFlowProps> = ({ onFinish, userLevel }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [tuneFlowPicks] = useState<Track[]>(TUNEFLOW_PICKS_DATA);

    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

    const lyricsCache = useRef(JSON.parse(localStorage.getItem('talkflow-lyrics-cache') || '{}')).current;
    const quizCache = useRef(JSON.parse(localStorage.getItem('talkflow-quiz-cache') || '{}')).current;
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true); setSearchResults([]); setError(null);
        try {
            const response = await fetch(`/api/spotify-search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search tracks.');
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'Spotify search failed');
            setSearchResults(data.tracks.items);
        } catch (err: any) { setError(err.message); } finally { setIsSearching(false); }
    };
    
    const handleGenerateQuiz = async (track: Track, lyricsText: string) => {
        if (!lyricsText || !track) return;
        setIsLoadingQuiz(true); setError(null);
        const cacheKey = `${track.name} - ${track.artists[0].name}`;
        if(quizCache[cacheKey]) {
            setQuiz(quizCache[cacheKey]);
            setIsLoadingQuiz(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
            const quizSchema = {
                type: Type.OBJECT,
                properties: { quiz: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correct: { type: Type.INTEGER } }, required: ["question", "options", "correct"] } } }, required: ["quiz"]
            };
            const prompt = `Based on the song lyrics below, create a 3-question quiz in English to test vocabulary or interpretation. The student's level is ${userLevel}. Lyrics: "${lyricsText}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: quizSchema } });
            const result = JSON.parse(response.text);
            if (!result.quiz || result.quiz.length === 0) throw new Error("AI could not generate a valid quiz.");
            setQuiz(result.quiz);
            setQuizAnswers(Array(result.quiz.length).fill(null));
            setCurrentQuizQuestionIndex(0);
            quizCache[cacheKey] = result.quiz;
            localStorage.setItem('talkflow-quiz-cache', JSON.stringify(quizCache));
        } catch (err) {
            console.error(err);
            setError("Could not generate the quiz. Please try another song.");
        } finally {
            setIsLoadingQuiz(false);
        }
    }

    const handleTrackSelect = async (track: Track) => {
        setSelectedTrack(track); setIsLoadingLyrics(true); setLyrics(null); setQuiz(null);
        setCurrentQuizQuestionIndex(0); setQuizAnswers([]); setQuizFeedback(null); setError(null);
        const cacheKey = `${track.name} - ${track.artists[0].name}`;

        if (lyricsCache[cacheKey]) {
            const cachedLyrics = lyricsCache[cacheKey];
            setLyrics(cachedLyrics); setIsLoadingLyrics(false);
            if (quizCache[cacheKey]) {
                setQuiz(quizCache[cacheKey]); setQuizAnswers(Array(quizCache[cacheKey].length).fill(null));
            } else { handleGenerateQuiz(track, cachedLyrics); }
            return;
        }

        try {
            const lyricsParams = new URLSearchParams({ track: track.name, artist: track.artists[0].name });
            const response = await fetch(`/api/lyrics?${lyricsParams}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to retrieve lyrics.");
            }
            
            const lyricsText = data.lyrics;
            setLyrics(lyricsText);
            setIsLoadingLyrics(false);
            lyricsCache[cacheKey] = lyricsText;
            localStorage.setItem('talkflow-lyrics-cache', JSON.stringify(lyricsCache));
            handleGenerateQuiz(track, lyricsText);
        } catch (err: any) { 
            const errorMessage = err.message || "Sorry, we could not find the lyrics for this song.";
            setError(errorMessage); setLyrics(errorMessage); setIsLoadingLyrics(false);
        }
    };
    
    const handleQuizAnswer = (optionIndex: number) => {
        if (quizAnswers[currentQuizQuestionIndex] !== null) return;
        const newAnswers = [...quizAnswers]; newAnswers[currentQuizQuestionIndex] = optionIndex;
        setQuizAnswers(newAnswers);
        const isCorrect = optionIndex === quiz![currentQuizQuestionIndex].correct;
        setQuizFeedback(isCorrect ? 'correct' : 'incorrect');
    }

    const handleNextQuizQuestion = () => {
        if (quiz && currentQuizQuestionIndex < quiz.length - 1) {
            setCurrentQuizQuestionIndex(prev => prev + 1); setQuizFeedback(null);
        }
    }

    const TrackList = ({ tracks, isLoading }: { tracks: Track[]; isLoading?: boolean; }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isLoading && Array.from({length: 6}).map((_, i) => <div key={i} className="bg-slate-800 rounded-lg p-3 animate-pulse"><div className="w-full aspect-square rounded-md mb-2 bg-slate-700"></div><div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div><div className="h-3 bg-slate-700 rounded w-1/2"></div></div>)}
            {!isLoading && tracks.map(track => (<button key={track.id} onClick={() => handleTrackSelect(track)} className={`bg-slate-800 rounded-lg p-3 group hover:bg-slate-700 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 ${selectedTrack?.id === track.id ? 'ring-purple-500' : 'ring-transparent'}`}><img src={track.album.images[0]?.url} alt={track.name} className="w-full aspect-square rounded-md mb-2 object-cover" /><p className="font-bold text-white truncate text-sm text-left">{track.name}</p><p className="text-slate-400 truncate text-xs text-left">{track.artists.map(a => a.name).join(', ')}</p></button>))}
        </div>
    );
    
    const hasSearchResults = searchResults.length > 0;

    return (
        <div className="max-w-7xl mx-auto bg-[#1e2639] rounded-lg p-6 sm:p-8 shadow-2xl animate-fade-in">
            <div className="text-center mb-8">
                 <div className="mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center mb-4"><MusicIcon className="h-10 w-10 text-white" /></div>
                <h2 className="text-3xl font-bold text-white">TuneFlow</h2>
                <p className="text-slate-400 mt-2">Learn English with your favorite songs and an AI-powered quiz!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Song Selection */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-grow"><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a song..." className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"/><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /></div>
                        <button type="submit" disabled={isSearching} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 rounded-lg transition-colors disabled:opacity-50">{isSearching ? '...' : 'Go'}</button>
                    </form>
                    <div className="max-h-[550px] overflow-y-auto pr-2">
                        {error && !isSearching && <p className="text-center text-red-400 p-4">{error}</p>}
                        {hasSearchResults ? (
                             <TrackList tracks={searchResults} isLoading={isSearching} />
                        ) : (
                            <>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white my-4"><StarIcon className="h-5 w-5 text-yellow-400" /> TuneFlow Picks</h3>
                                <TrackList tracks={tuneFlowPicks} isLoading={false} />
                            </>
                        )}
                    </div>
                </div>
                
                {/* Right Column: Activity Area */}
                <div className="lg:col-span-3">
                    {selectedTrack ? (
                        <div className="bg-slate-800/50 rounded-lg p-4 sticky top-4">
                             <div className="mb-4 rounded-lg overflow-hidden"><iframe title="Spotify Player" src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>
                             <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-slate-400 space-y-1">
                                <p>
                                    <strong className="font-semibold text-slate-300">Dica:</strong> Para ouvir a música completa, você precisa estar logado(a) na sua conta Spotify no navegador.
                                </p>
                                <p>Usuários gratuitos podem ouvir apenas uma prévia. Clique no play ▶️ dentro do player para começar.</p>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Lyrics</h3>
                            <div className="max-h-[200px] overflow-y-auto bg-slate-900/50 p-3 rounded-md font-mono text-sm mb-4">
                                {isLoadingLyrics ? (
                                    <div className="flex items-center justify-center h-20"><MusicIcon className="h-8 w-8 text-slate-500 animate-pulse" /></div>
                                ) : (
                                    <p className="text-slate-300 whitespace-pre-wrap">{lyrics}</p>
                                )}
                            </div>
                            {(isLoadingQuiz || quiz) && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">AI Quiz</h3>
                                    {isLoadingQuiz ? (
                                        <div className="text-center text-slate-300 p-4 bg-slate-900/50 rounded-md">
                                            <SparklesIcon className="h-8 w-8 mx-auto animate-spin text-purple-400 mb-2" />
                                            <p>Generating your quiz...</p>
                                        </div>
                                    ) : quiz && (
                                        <div className="bg-slate-900/50 p-4 rounded-lg">
                                            <p className="text-center text-slate-400 mb-4 text-sm">Question {currentQuizQuestionIndex + 1} of {quiz.length}</p>
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
                                            {quizFeedback && <p className={`mt-3 text-center font-semibold ${quizFeedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{quizFeedback === 'correct' ? "Correct!" : "Incorrect."}</p>}
                                            {currentQuizQuestionIndex < quiz.length - 1 && quizAnswers[currentQuizQuestionIndex] !== null && <button onClick={handleNextQuizQuestion} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md transition-colors">Next Question</button>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : ( <div className="bg-slate-800/50 rounded-lg p-4 sticky top-4 h-[472px] flex flex-col items-center justify-center text-center"><MusicIcon className="h-12 w-12 text-slate-500 mb-4"/><h3 className="font-semibold text-white">Select a Song</h3><p className="text-slate-400 text-sm">Your player, lyrics, and quiz will appear here.</p></div>)}
                </div>
            </div>
            
            <div className="text-center mt-10">
                 <button onClick={onFinish} className="px-8 py-3 rounded-lg text-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity">
                    Continue Your Journey
                </button>
            </div>
        </div>
    );
};

export default TuneFlow;