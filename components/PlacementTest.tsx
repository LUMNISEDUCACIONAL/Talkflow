
import React, { useState } from 'react';

// Mock data for the placement test
const questions = [
  // A1 Level
  { question: "___ is your name?", options: ["What", "Who", "Where", "Why"], correct: 0 },
  { question: "I ___ a student.", options: ["is", "are", "am", "be"], correct: 2 },
  { question: "She ___ from Spain.", options: ["is", "are", "am", "be"], correct: 0 },
  { question: "They have two ___.", options: ["childs", "child", "childrens", "children"], correct: 3 },
  { question: "What time is it? It's ten ___.", options: ["o'clock", "on clock", "is clock", "a clock"], correct: 0 },
  // A2 Level
  { question: "I ___ to the cinema yesterday.", options: ["go", "goes", "went", "gone"], correct: 2 },
  { question: "___ you like some coffee?", options: ["Do", "Would", "Are", "Have"], correct: 1 },
  { question: "This is ___ than that.", options: ["more cheap", "cheaper", "cheap", "cheapest"], correct: 1 },
  { question: "She is the ___ girl in the class.", options: ["tall", "taller", "most tall", "tallest"], correct: 3 },
  { question: "I've never ___ to Japan.", options: ["be", "been", "was", "being"], correct: 1 },
  // B1 Level
  { question: "If I ___ you, I would study more.", options: ["am", "was", "were", "be"], correct: 2 },
  { question: "He has been working here ___ 2010.", options: ["for", "since", "at", "in"], correct: 1 },
  { question: "You ___ smoke in here. It's forbidden.", options: ["mustn't", "don't have to", "shouldn't", "can't"], correct: 0 },
  { question: "The book ___ was on the table is mine.", options: ["who", "which", "whose", "where"], correct: 1 },
  { question: "I'm looking forward ___ you soon.", options: ["to see", "seeing", "to seeing", "see"], correct: 2 },
  // B2 Level
  { question: "By the time we arrived, the film ___.", options: ["had already started", "already started", "has already started", "was starting"], correct: 0 },
  { question: "___ of the bad weather, the match was cancelled.", options: ["Despite", "In spite", "Because", "On account"], correct: 3 },
  { question: "She wishes she ___ more time.", options: ["has", "have", "had", "would have"], correct: 2 },
  { question: "It's no use ___ about it.", options: ["to cry", "crying", "cry", "cried"], correct: 1 },
  { question: "He is said ___ a genius.", options: ["to be", "being", "be", "that he is"], correct: 0 },
];

interface PlacementTestProps {
    onFinishTest: (score: number) => void;
}

const PlacementTest: React.FC<PlacementTestProps> = ({ onFinishTest }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));

    const handleSelectAnswer = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        const score = answers.reduce((acc, answer, index) => {
            return answer === questions[index].correct ? acc + 1 : acc;
        }, 0);
        onFinishTest(score);
    };
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto bg-[#1e2639] rounded-lg p-6 sm:p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-white mb-2">Teste de Nivelamento de Inglês</h2>
            <p className="text-center text-slate-400 mb-6">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>

            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="mb-8">
                <p className="text-lg text-slate-200 text-center">{currentQuestion.question}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${selectedAnswer === index ? 'bg-blue-500 border-blue-400 text-white font-semibold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'}`}
                    >
                        <span className="font-mono mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                    </button>
                ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Anterior
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                    >
                        Próxima
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className="px-6 py-2.5 rounded-lg text-sm bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Finalizar Teste
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlacementTest;
