import React, { useState, useEffect, useRef } from 'react';
import { SpeakerWaveIcon } from './icons/Icons.tsx';

export type QuestionType = 'multiple-choice' | 'listening-emoji';

export type Question = {
  id: string;
  type: QuestionType;
  question: string; // Text for multiple-choice, audio phrase for listening
  options: string[];
  correct: number;
  explanation: { pt: string; en: string };
  translation: string;
};

export const questionBank: { [key: string]: Question[] } = {
  A1: [
    { id: "A1_01", type: "multiple-choice", question: "___ are you from?", options: ["What", "Who", "Where", "When"], correct: 2, explanation: { pt: "'Where' é usado para perguntar sobre um lugar ou localização.", en: "'Where' is used to ask about a place or location." }, translation: "De onde você é?" },
    { id: "A1_02", type: "listening-emoji", question: "The cat is sleeping.", options: ["😴", "🐱", "🏠", "☀️"], correct: 0, explanation: { pt: "A frase significa 'O gato está dormindo'.", en: "The sentence means 'The cat is sleeping'." }, translation: "O gato está dormindo." },
    { id: "A1_03", type: "multiple-choice", question: "I have two ___.", options: ["sister", "sisters", "sister's", "sisters'"], correct: 1, explanation: { pt: "'Sisters' é a forma plural regular de 'sister'.", en: "'Sisters' is the regular plural form of 'sister'." }, translation: "Eu tenho duas irmãs." },
    { id: "A1_04", type: "listening-emoji", question: "I am happy.", options: ["😢", "😊", "😠", "🤔"], correct: 1, explanation: { pt: "A frase significa 'Eu estou feliz'.", en: "The sentence means 'I am happy'." }, translation: "Eu estou feliz." },
    { id: "A1_05", type: "multiple-choice", question: "I get up ___ 7 o'clock.", options: ["on", "in", "at", "by"], correct: 2, explanation: { pt: "Usamos 'at' para horários específicos.", en: "We use 'at' for specific times." }, translation: "Eu me levanto às 7 horas." },
    { id: "A1_06", type: "multiple-choice", question: "They ___ watching TV.", options: ["is", "am", "are", "be"], correct: 2, explanation: { pt: "'Are' é a forma correta do verbo 'to be' para o pronome 'they'.", en: "'Are' is the correct form of the verb 'to be' for the pronoun 'they'." }, translation: "Eles estão assistindo TV." },
    { id: "A1_07", type: "multiple-choice", question: "Is there ___ milk in the fridge?", options: ["some", "any", "a", "many"], correct: 1, explanation: { pt: "Usamos 'any' em perguntas e frases negativas para substantivos incontáveis como 'milk'.", en: "We use 'any' in questions and negative sentences for uncountable nouns like 'milk'." }, translation: "Tem algum leite na geladeira?" },
    { id: "A1_08", type: "listening-emoji", question: "It is raining.", options: ["☀️", "❄️", "🌬️", "🌧️"], correct: 3, explanation: { pt: "A frase significa 'Está chovendo'.", en: "The sentence means 'It is raining'." }, translation: "Está chovendo." },
    { id: "A1_09", type: "multiple-choice", question: "My brother is ___ artist.", options: ["a", "an", "the", "-"], correct: 1, explanation: { pt: "'An' é usado antes de palavras que começam com som de vogal, como 'artist'.", en: "'An' is used before words that start with a vowel sound, like 'artist'." }, translation: "Meu irmão é um artista." },
    { id: "A1_10", type: "multiple-choice", question: "Can you ___ the piano?", options: ["play", "plays", "playing", "to play"], correct: 0, explanation: { pt: "Após verbos modais como 'can', usamos a forma base do verbo (play).", en: "After modal verbs like 'can', we use the base form of the verb (play)." }, translation: "Você sabe tocar piano?" },
    { id: "A1_11", type: "listening-emoji", question: "I am drinking water.", options: ["🥤", "💧", "☕", "🍺"], correct: 1, explanation: { pt: "A frase significa 'Eu estou bebendo água'.", en: "The sentence means 'I am drinking water'." }, translation: "Eu estou bebendo água." },
    { id: "A1_12", type: "multiple-choice", question: "This is ___ apple.", options: ["a", "an", "the", " "], correct: 1, explanation: { pt: "Usamos 'an' antes de palavras com som de vogal, como 'apple'.", en: "We use 'an' before words with a vowel sound, like 'apple'." }, translation: "Isto é uma maçã." },
    { id: "A1_13", type: "multiple-choice", question: "My favorite color is ___.", options: ["reds", "red", "a red", "the red"], correct: 1, explanation: { pt: "Nomes de cores são usados sem artigos em geral.", en: "Color names are generally used without articles." }, translation: "Minha cor favorita é vermelho." },
    { id: "A1_14", type: "listening-emoji", question: "He is running.", options: ["🚶‍♂️", "🏃‍♂️", "🚴‍♂️", "🏊‍♂️"], correct: 1, explanation: { pt: "A frase significa 'Ele está correndo'.", en: "The sentence means 'He is running'." }, translation: "Ele está correndo." },
    { id: "A1_15", type: "multiple-choice", question: "___ are my keys.", options: ["This", "That", "These", "It"], correct: 2, explanation: { pt: "'These' é usado para objetos no plural que estão perto.", en: "'These' is used for plural objects that are near." }, translation: "Estas são minhas chaves." },
    { id: "A1_16", type: "multiple-choice", question: "She ___ a dog.", options: ["have", "is", "has", "are"], correct: 2, explanation: { pt: "Para 'he', 'she', e 'it', usamos 'has'.", en: "For 'he', 'she', and 'it', we use 'has'." }, translation: "Ela tem um cachorro." },
    { id: "A1_17", type: "listening-emoji", question: "It's a sunny day.", options: ["🌙", "⭐", "☀️", "☁️"], correct: 2, explanation: { pt: "A frase significa 'É um dia ensolarado'.", en: "The sentence means 'It's a sunny day'." }, translation: "É um dia ensolarado." },
    { id: "A1_18", type: "multiple-choice", question: "I can ___ fast.", options: ["run", "runs", "running", "to run"], correct: 0, explanation: { pt: "Após 'can', usamos o verbo na sua forma base.", en: "After 'can', we use the base form of the verb." }, translation: "Eu consigo correr rápido." },
    { id: "A1_19", type: "multiple-choice", question: "The books are ___ the table.", options: ["in", "at", "on", "under"], correct: 2, explanation: { pt: "Usamos 'on' para indicar que algo está sobre uma superfície.", en: "We use 'on' to indicate something is on a surface." }, translation: "Os livros estão na mesa." },
    { id: "A1_20", type: "listening-emoji", question: "I am writing a letter.", options: ["📞", "✉️", "🎤", "💻"], correct: 1, explanation: { pt: "A frase significa 'Eu estou escrevendo uma carta'.", en: "The sentence means 'I am writing a letter'." }, translation: "Eu estou escrevendo uma carta." },
  ],
  A2: [
    { id: "A2_01", type: "multiple-choice", question: "I ___ to the cinema yesterday.", options: ["go", "goes", "went", "gone"], correct: 2, explanation: { pt: "Para ações no passado, usamos o Simple Past. O passado de 'go' é 'went'.", en: "For past actions, we use the Simple Past. The past tense of 'go' is 'went'." }, translation: "Eu fui ao cinema ontem." },
    { id: "A2_02", type: "listening-emoji", question: "He is riding a bike.", options: ["🚗", "🏃‍♂️", "🚲", "✈️"], correct: 2, explanation: { pt: "A frase significa 'Ele está andando de bicicleta'.", en: "The sentence means 'He is riding a bike'." }, translation: "Ele está andando de bicicleta." },
    { id: "A2_03", type: "multiple-choice", question: "This is ___ than that.", options: ["more cheap", "cheaper", "cheap", "cheapest"], correct: 1, explanation: { pt: "'Cheaper' é a forma comparativa correta para o adjetivo 'cheap'.", en: "'Cheaper' is the correct comparative form for the adjective 'cheap'." }, translation: "Isto é mais barato que aquilo." },
    { id: "A2_04", type: "multiple-choice", question: "If it ___, we will stay home.", options: ["rain", "rains", "will rain", "rained"], correct: 1, explanation: { pt: "Na primeira condicional (First Conditional), a cláusula 'if' usa o Simple Present.", en: "In the First Conditional, the 'if' clause uses the Simple Present." }, translation: "Se chover, ficaremos em casa." },
    { id: "A2_05", type: "listening-emoji", question: "She is reading a book.", options: ["📖", "✍️", "🗣️", "👂"], correct: 0, explanation: { pt: "A frase significa 'Ela está lendo um livro'.", en: "The sentence means 'She is reading a book'." }, translation: "Ela está lendo um livro." },
    { id: "A2_06", type: "multiple-choice", question: "I've never ___ to Japan.", options: ["be", "been", "was", "being"], correct: 1, explanation: { pt: "No Present Perfect (have + verbo), usamos o particípio passado. O particípio de 'be' é 'been'.", en: "In the Present Perfect (have + verb), we use the past participle. The participle of 'be' is 'been'." }, translation: "Eu nunca estive no Japão." },
    { id: "A2_07", type: "multiple-choice", question: "She is interested ___ art.", options: ["on", "at", "in", "for"], correct: 2, explanation: { pt: "A preposição correta após 'interested' é sempre 'in'.", en: "The correct preposition after 'interested' is always 'in'." }, translation: "Ela está interessada em arte." },
    { id: "A2_08", type: "listening-emoji", question: "They are cooking.", options: ["🍽️", "🍳", "🚿", "🛒"], correct: 1, explanation: { pt: "A frase significa 'Eles estão cozinhando'.", en: "The sentence means 'They are cooking'." }, translation: "Eles/Elas estão cozinhando." },
    { id: "A2_09", type: "multiple-choice", question: "Let's meet ___ Friday.", options: ["in", "at", "on", "for"], correct: 2, explanation: { pt: "Usamos 'on' para dias da semana.", en: "We use 'on' for days of the week." }, translation: "Vamos nos encontrar na sexta-feira." },
    { id: "A2_10", type: "multiple-choice", question: "There isn't ___ sugar.", options: ["many", "much", "some", "a lot"], correct: 1, explanation: { pt: "Usamos 'much' com substantivos incontáveis (como 'sugar') em frases negativas.", en: "We use 'much' with uncountable nouns (like 'sugar') in negative sentences." }, translation: "Não há muito açúcar." },
    { id: "A2_11", type: "listening-emoji", question: "She was watching a movie.", options: ["🎵", "📺", "🎬", "🍿"], correct: 2, explanation: { pt: "A frase significa 'Ela estava assistindo a um filme'.", en: "The sentence means 'She was watching a movie'." }, translation: "Ela estava assistindo a um filme." },
    { id: "A2_12", type: "multiple-choice", question: "You ___ call him, it's important.", options: ["can", "should", "may", "would"], correct: 1, explanation: { pt: "'Should' é usado para dar conselhos.", en: "'Should' is used to give advice." }, translation: "Você deveria ligar para ele, é importante." },
    { id: "A2_13", type: "multiple-choice", question: "I haven't seen him ___ ages.", options: ["since", "in", "on", "for"], correct: 3, explanation: { pt: "Usamos 'for' com períodos de tempo.", en: "We use 'for' with periods of time." }, translation: "Eu não o vejo há séculos." },
    { id: "A2_14", "type": "listening-emoji", "question": "He is playing the guitar.", "options": ["🎹", "🎻", "🎸", "🥁"], "correct": 2, "explanation": { "pt": "A frase significa 'Ele está tocando violão/guitarra'.", "en": "The sentence means 'He is playing the guitar'." }, "translation": "Ele está tocando violão." },
    { id: "A2_15", type: "multiple-choice", question: "She is the ___ person I know.", options: ["kind", "kinder", "kindest", "more kind"], correct: 2, explanation: { pt: "Usamos o superlativo (-est) para comparar uma coisa com todas as outras de um grupo.", en: "We use the superlative (-est) to compare one thing to all others in a group." }, translation: "Ela é a pessoa mais gentil que eu conheço." },
  ],
  B1: [
    { id: "B1_01", type: "multiple-choice", question: "If I ___ you, I would study more.", options: ["am", "was", "were", "be"], correct: 2, explanation: { pt: "Na segunda condicional (Second Conditional), usamos 'were' para todos os pronomes na cláusula 'if' para situações hipotéticas.", en: "In the Second Conditional, we use 'were' for all pronouns in the 'if' clause for hypothetical situations." }, translation: "Se eu fosse você, eu estudaria mais." },
    { id: "B1_02", type: "listening-emoji", question: "The meeting has been postponed.", options: ["➡️", "✅", "❌", "🗓️"], correct: 3, explanation: { pt: "A frase significa 'A reunião foi adiada'. 'Postponed' significa movida para uma data posterior.", en: "The sentence means 'The meeting has been postponed'. 'Postponed' means moved to a later date." }, translation: "A reunião foi adiada." },
    { id: "B1_03", type: "multiple-choice", question: "He has been working here ___ 2010.", options: ["for", "since", "at", "in"], correct: 1, explanation: { pt: "'Since' é usado com um ponto específico no tempo (o início), enquanto 'for' é usado com uma duração.", en: "'Since' is used with a specific point in time (the start), while 'for' is used with a duration." }, translation: "Ele trabalha aqui desde 2010." },
    { id: "B1_04", type: "multiple-choice", question: "I'm looking forward ___ you soon.", options: ["to see", "seeing", "to seeing", "see"], correct: 2, explanation: { pt: "A expressão 'look forward to' é seguida por um verbo no gerúndio (-ing).", en: "The expression 'look forward to' is followed by a verb in the gerund (-ing) form." }, translation: "Estou ansioso para te ver em breve." },
    { id: "B1_05", type: "multiple-choice", question: "My car is ___ repaired.", options: ["being", "been", "be", "to be"], correct: 0, explanation: { pt: "Esta é a voz passiva no Present Continuous (is + being + particípio passado) para descrever uma ação em andamento.", en: "This is the passive voice in the Present Continuous (is + being + past participle) to describe an ongoing action." }, translation: "Meu carro está sendo consertado." },
    { id: "B1_06", "type": "multiple-choice", "question": "Despite the rain, we ___ for a walk.", "options": ["go", "gone", "went", "were going"], "correct": 2, "explanation": { "pt": "A frase está no passado e 'despite' introduz um contraste. A ação principal ('went') também deve estar no passado.", "en": "The sentence is in the past and 'despite' introduces a contrast. The main action ('went') must also be in the past." }, "translation": "Apesar da chuva, fomos passear." },
    { id: "B1_07", "type": "listening-emoji", "question": "The project was a success.", "options": ["📉", "📈", "🎉", "🤷‍♂️"], "correct": 2, "explanation": { "pt": "A frase significa 'O projeto foi um sucesso'.", "en": "The sentence means 'The project was a success'." }, "translation": "O projeto foi um sucesso." },
    { id: "B1_08", "type": "multiple-choice", "question": "I'm not used to ___ up so early.", "options": ["get", "getting", "got", "to get"], "correct": 1, "explanation": { "pt": "A expressão 'be used to' é seguida pelo gerúndio (-ing).", "en": "The expression 'be used to' is followed by the gerund (-ing)." }, "translation": "Não estou acostumado a me levantar tão cedo." },
  ],
  B2: [
    { id: "B2_01", type: "multiple-choice", question: "By the time we arrived, the film ___.", options: ["had already started", "already started", "has already started", "was starting"], correct: 0, explanation: { pt: "Usamos o Past Perfect ('had started') para uma ação que ocorreu antes de outra ação no passado ('we arrived').", en: "We use the Past Perfect ('had started') for an action that happened before another past action ('we arrived')." }, translation: "Quando chegamos, o filme já tinha começado." },
    { id: "B2_02", type: "listening-emoji", question: "He finally graduated.", options: ["🎓", "💼", "🏫", "📝"], correct: 0, explanation: { pt: "A frase significa 'Ele finalmente se formou'.", en: "The sentence means 'He finally graduated'." }, translation: "Ele finalmente se formou." },
    { id: "B2_03", type: "multiple-choice", question: "Hardly ___ home when the phone rang.", options: ["I had got", "had I got", "I got", "did I get"], correct: 1, explanation: { pt: "Quando uma frase começa com uma expressão negativa como 'Hardly', invertemos o sujeito e o verbo auxiliar ('had I').", en: "When a sentence starts with a negative expression like 'Hardly', we invert the subject and the auxiliary verb ('had I')." }, translation: "Mal tinha chegado em casa quando o telefone tocou." },
    { id: "B2_04", type: "multiple-choice", question: "She wishes she ___ more time.", options: ["has", "have", "had", "would have"], correct: 2, explanation: { pt: "Após 'wish', usamos o Simple Past ('had') para falar sobre um desejo presente que é irreal.", en: "After 'wish', we use the Simple Past ('had') to talk about a present wish that is unreal." }, translation: "Ela gostaria de ter mais tempo." },
    { id: "B2_05", type: "multiple-choice", question: "I'd rather you ___ that.", options: ["don't do", "didn't do", "not do", "wouldn't do"], correct: 1, explanation: { pt: "Após 'would rather' + pronome, usamos o Simple Past para expressar uma preferência sobre as ações de outra pessoa.", en: "After 'would rather' + pronoun, we use the Simple Past to express a preference about someone else's actions." }, translation: "Eu preferiria que você não fizesse isso." },
    { id: "B2_06", "type": "multiple-choice", "question": "___ of the bad weather, the match was cancelled.", "options": ["Despite", "In spite", "Because", "On account"], "correct": 3, "explanation": { "pt": "'On account of' é uma maneira formal de dizer 'because of'.", "en": "'On account of' is a formal way of saying 'because of'." }, "translation": "Por conta do mau tempo, a partida foi cancelada." },
    { id: "B2_07", "type": "listening-emoji", "question": "The company went bankrupt.", "options": ["💰", "🏛️", "📉", "🤝"], "correct": 2, "explanation": { "pt": "A frase significa 'A empresa faliu'.", "en": "The sentence means 'The company went bankrupt'." }, "translation": "A empresa faliu." },
    { id: "B2_08", "type": "multiple-choice", "question": "He is said ___ a genius.", "options": ["to be", "being", "be", "that he is"], "correct": 0, "explanation": { "pt": "Esta é uma estrutura passiva impessoal comum. A forma correta é 'to be' + infinitivo.", "en": "This is a common impersonal passive structure. The correct form is 'to be' + infinitive." }, "translation": "Dizem que ele é um gênio." },
  ],
};

interface ActivityProps {
    questions: Question[];
    onFinishActivity: (score: number, total: number) => void;
}

const Activity: React.FC<ActivityProps> = ({ questions, onFinishActivity }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showTranslation, setShowTranslation] = useState(false);
    
    const audioCache = useRef(new Map<string, string>()).current;
    const audioPlayer = useRef<HTMLAudioElement | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<{ [key: string]: boolean }>({});
    const abortControllerRef = useRef<AbortController | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    
    useEffect(() => {
        const cachedAudio = JSON.parse(localStorage.getItem('talkflow-audio-cache') || '{}');
        for (const key in cachedAudio) {
            audioCache.set(key, cachedAudio[key]);
        }
        audioPlayer.current = new Audio();
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
        }
        return () => {
            if (audioPlayer.current) audioPlayer.current.pause();
            if (abortControllerRef.current) abortControllerRef.current.abort();
            audioContextRef.current?.close();
        };
    }, []);

    const playSound = (type: 'correct' | 'incorrect') => {
        if (!audioContextRef.current) return;
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        if (type === 'correct') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5
        } else {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(220, audioContextRef.current.currentTime); // A3
        }
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.3);
    };

    const handleSelectAnswer = (optionIndex: number) => {
        if (selectedAnswer !== null) return; 
        setSelectedAnswer(optionIndex);
        const isCorrect = optionIndex === questions[currentQuestionIndex].correct;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        playSound(isCorrect ? 'correct' : 'incorrect');
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };
    
    const resetQuestionState = () => {
        setSelectedAnswer(null);
        setFeedback(null);
        setShowTranslation(false);
        if (audioPlayer.current) audioPlayer.current.pause();
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setLoadingAudio({});
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            resetQuestionState();
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            const prevAnswer = answers[currentQuestionIndex - 1];
            setSelectedAnswer(prevAnswer);
             if (prevAnswer !== null) {
                const isCorrect = prevAnswer === questions[currentQuestionIndex - 1].correct;
                setFeedback(isCorrect ? 'correct' : 'incorrect');
            } else {
                setFeedback(null);
            }
             setShowTranslation(false);
        }
    };
    
    const handleFinish = () => {
        const score = answers.reduce((acc, answer, index) => {
            if (index < questions.length && answer !== null) {
                 return answer === questions[index].correct ? acc + 1 : acc;
            }
            return acc;
        }, 0);
        onFinishActivity(score, questions.length);
    };

    const handlePlayAudio = async (text: string, speed: number) => {
        const speedKey = speed === 0.7 ? 'normal' : 'slow';
        const cacheKey = `${text}-${speedKey}`;
        
        if (abortControllerRef.current) abortControllerRef.current.abort();
        if (audioPlayer.current) { audioPlayer.current.pause(); audioPlayer.current.currentTime = 0; }

        setLoadingAudio({ [speedKey]: true });

        if (audioCache.has(cacheKey)) {
            const audioUrl = audioCache.get(cacheKey)!;
            if (audioPlayer.current) {
              audioPlayer.current.src = audioUrl;
              audioPlayer.current.play().catch(e => console.error("Audio play failed:", e));
            }
            setLoadingAudio({});
            return;
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const response = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, speed }),
                signal,
            });

            const data = await response.json();

            if (!response.ok || !data.audioFile) {
                console.error("API Error Response:", data);
                throw new Error(data?.error || "Failed to fetch audio from server.");
            }
            
            const audioUrl = data.audioFile;
            audioCache.set(cacheKey, audioUrl);
            const currentCache = JSON.parse(localStorage.getItem('talkflow-audio-cache') || '{}');
            currentCache[cacheKey] = audioUrl;
            localStorage.setItem('talkflow-audio-cache', JSON.stringify(currentCache));
            
            if (audioPlayer.current) {
                audioPlayer.current.src = audioUrl;
                audioPlayer.current.play().catch(e => console.error("Audio play failed:", e));
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') { console.error("Failed to generate audio:", error.message); }
        } finally {
            setLoadingAudio({});
        }
    };
    
    if (!questions || questions.length === 0) {
        return <div className="text-center p-8">Nenhuma atividade nova encontrada. Parece que você já completou tudo!</div>
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];
    const fullCorrectSentence = currentQuestion.type === 'multiple-choice' ? currentQuestion.question.replace('___', currentQuestion.options[currentQuestion.correct]) : currentQuestion.question;

    const renderQuestion = () => {
        switch (currentQuestion.type) {
            case 'listening-emoji':
                return (
                     <div className="mb-6 min-h-[60px] flex flex-col items-center justify-center gap-4">
                        <p className="text-lg text-slate-300">O que você ouve?</p>
                        <button onClick={() => handlePlayAudio(currentQuestion.question, 0.7)} disabled={loadingAudio['normal']} className="flex items-center gap-2 text-lg px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50">
                            <SpeakerWaveIcon className="h-6 w-6" />
                            <span>{loadingAudio['normal'] ? 'Gerando...' : 'Tocar Áudio'}</span>
                        </button>
                    </div>
                )
            case 'multiple-choice':
            default:
                return (
                    <div className="mb-6 min-h-[60px] flex items-center justify-center">
                        <p className="text-lg md:text-xl text-slate-200 text-center">{currentQuestion.question}</p>
                    </div>
                )
        }
    }

    const renderOptions = () => {
        return (
            <div className={`grid gap-4 ${currentQuestion.type === 'listening-emoji' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {currentQuestion.options.map((option, index) => {
                    let buttonClass = 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600';
                    if (selectedAnswer !== null) {
                        if (index === currentQuestion.correct) buttonClass = 'bg-green-800/50 border-green-500 ring-2 ring-green-500';
                        else if (index === selectedAnswer) buttonClass = 'bg-red-800/50 border-red-500 ring-2 ring-red-500';
                        else buttonClass = 'bg-slate-800 border-slate-700 opacity-60';
                    }
                    if (currentQuestion.type === 'listening-emoji') {
                        return (
                            <button key={index} onClick={() => handleSelectAnswer(index)} disabled={selectedAnswer !== null} className={`py-4 px-2 text-5xl flex justify-center items-center rounded-lg transition-all duration-200 border-2 ${buttonClass}`}>
                                {option}
                            </button>
                        )
                    }
                    return (
                        <button key={index} onClick={() => handleSelectAnswer(index)} disabled={selectedAnswer !== null} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${buttonClass}`}>
                            <span className="font-mono mr-3">{String.fromCharCode(65 + index)}.</span>
                            {option}
                        </button>
                    );
                })}
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto bg-[#1e2639] rounded-lg p-6 sm:p-8 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-center text-white mb-2">Atividade</h2>
            <p className="text-center text-slate-400 mb-6">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            
            {renderQuestion()}
            {renderOptions()}

            {feedback && (
                <div className={`mt-6 p-4 rounded-lg animate-fade-in ${feedback === 'correct' ? 'bg-green-900/40 border border-green-700/50' : 'bg-[#2a1a20] border border-red-700/50'}`}>
                    <h3 className={`font-bold ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                        {feedback === 'correct' ? 'Resposta correta / Correct answer' : 'Resposta incorreta / Incorrect answer'}
                    </h3>
                    {feedback === 'incorrect' && (
                        <p className="text-slate-300 mt-2 text-sm">
                            A resposta correta é: "{currentQuestion.options[currentQuestion.correct]}"
                            <br/>
                            The correct answer is: "{currentQuestion.options[currentQuestion.correct]}"
                        </p>
                    )}
                     {currentQuestion.type === 'listening-emoji' && (
                        <p className="text-slate-300 mt-2 text-sm">
                            A frase era: "{currentQuestion.question}"
                        </p>
                    )}
                    <div className="my-3 border-t border-slate-700/50"></div>
                    <p className="font-semibold text-slate-200">Explicação / Explanation:</p>
                    <p className="text-slate-300 mt-1 text-sm">
                        {currentQuestion.explanation.pt}
                        <br/>
                        {currentQuestion.explanation.en}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-4">
                            <p className="font-semibold text-slate-200 text-sm">Pronúncia:</p>
                            <div className="flex gap-2">
                                <button onClick={() => handlePlayAudio(fullCorrectSentence, 0.7)} disabled={loadingAudio['normal']} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">
                                    <SpeakerWaveIcon className="h-4 w-4" />
                                    <span>{loadingAudio['normal'] ? 'Gerando...':'Normal'}</span>
                                </button>
                                <button onClick={() => handlePlayAudio(fullCorrectSentence, 0.5)} disabled={loadingAudio['slow']} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">
                                    <SpeakerWaveIcon className="h-4 w-4" />
                                    <span>{loadingAudio['slow'] ? 'Gerando...':'Lento'}</span>
                                </button>
                            </div>
                        </div>
                         <div className="flex-grow text-right">
                             <button onClick={() => setShowTranslation(!showTranslation)} className="text-sm text-blue-400 hover:text-blue-300">
                                {showTranslation ? 'Esconder' : 'Ver'} Tradução
                            </button>
                        </div>
                    </div>
                     {showTranslation && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50 animate-fade-in">
                             <p className="text-slate-300 text-sm">{currentQuestion.translation}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 flex justify-between items-center">
                <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="px-6 py-2.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Anterior
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={handleNext} disabled={selectedAnswer === null} className="px-6 py-2.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50">
                        Próxima
                    </button>
                ) : (
                    <button onClick={handleFinish} disabled={selectedAnswer === null} className="px-6 py-2.5 rounded-lg text-sm bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        Finalizar Atividade
                    </button>
                )}
            </div>
        </div>
    );
};

export default Activity;