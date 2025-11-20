
import React, { useState } from 'react';
import { SearchIcon, MusicIcon } from './icons/Icons.tsx';

interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    image: string | null;
}

const TuneFlow: React.FC = () => {
    const [query, setQuery] = useState('');
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setTracks([]);
        setSelectedTrack(null); // Reset player on new search

        try {
            // Direct call to our Base44-style backend
            const response = await fetch(`http://localhost:3000/api/spotify/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar músicas. Verifique o servidor.');
            }

            const data = await response.json();
            setTracks(data.tracks);

        } catch (err) {
            console.error(err);
            setError('Falha ao conectar com o serviço de música.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTrack = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="mx-auto bg-green-500 rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                    <MusicIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">TuneFlow</h1>
                <p className="text-slate-400">Busque suas músicas favoritas no Spotify</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-10">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nome da música ou artista..."
                        className="w-full bg-[#1e2639] border-2 border-slate-700 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-lg"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-400 text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SearchIcon className="h-5 w-5" />
                    </button>
                </form>
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Results List */}
                <div className={`lg:col-span-2 ${selectedTrack ? '' : 'lg:col-span-3'}`}>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tracks.map((track) => (
                                <div
                                    key={track.id}
                                    onClick={() => handleSelectTrack(track)}
                                    className={`bg-[#1e2639] p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800 hover:-translate-y-1 group border-2 ${selectedTrack?.id === track.id ? 'border-green-500 bg-slate-800' : 'border-transparent'}`}
                                >
                                    <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-slate-900 shadow-md">
                                        {track.image ? (
                                            <img src={track.image} alt={track.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MusicIcon className="h-10 w-10 text-slate-600" />
                                            </div>
                                        )}
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-green-500 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform">
                                                <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white truncate" title={track.name}>{track.name}</h3>
                                    <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && tracks.length === 0 && !error && (
                        <div className="text-center text-slate-500 py-12">
                            <p>Digite algo para começar a buscar...</p>
                        </div>
                    )}
                </div>

                {/* Player (Sticky on Desktop) */}
                {selectedTrack && (
                    <div className="lg:col-span-1">
                        <div className="bg-[#1e2639] rounded-xl p-6 sticky top-6 shadow-2xl border border-slate-700/50 animate-fade-in-right">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Tocando Agora
                            </h2>
                            <div className="rounded-lg overflow-hidden bg-black shadow-lg">
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                                    width="100%"
                                    height="380"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-slate-400">
                                    Você está ouvindo <span className="text-white font-medium">{selectedTrack.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TuneFlow;
