import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function QuizPlayer({ lecture, onPass }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = lecture?.questions || [];

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let currentScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelectedAnswers({});
    setScore(0);
  };

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;
  const isPerfectScore = score === questions.length;

  if (questions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-center text-muted-foreground">
        <h2>No questions are available in this quiz.</h2>
        <Button onClick={onPass} className="ml-4">Skip as Complete</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">{lecture.title || "Quiz"}</h1>
        
        {submitted && (
          <div className={`p-6 mb-8 rounded-lg shadow-sm ${isPerfectScore ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
            <h2 className="text-2xl font-bold mb-2">
              {isPerfectScore ? "Pass!" : "Not Quite!"}
            </h2>
            <p className="text-lg">
              You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%).
            </p>
            {!isPerfectScore && (
              <p className="mt-2 text-red-700">You must score 100% to pass this module.</p>
            )}
          </div>
        )}

        <div className="space-y-8">
          {questions.map((q, qIndex) => {
            const isCorrect = selectedAnswers[qIndex] === q.correctAnswerIndex;
            const isAnswered = selectedAnswers[qIndex] !== undefined;

            return (
              <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">
                  {qIndex + 1}. {q.question}
                </h3>
                
                <div className="flex flex-col space-y-3">
                  {q.options.map((opt, optIndex) => {
                    let optionClasses = "p-4 rounded-md border text-left cursor-pointer transition-colors ";
                    
                    if (submitted) {
                      if (q.correctAnswerIndex === optIndex) {
                        optionClasses += "border-green-500 bg-green-50 text-green-900 font-bold";
                      } else if (selectedAnswers[qIndex] === optIndex && !isCorrect) {
                        optionClasses += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        optionClasses += "border-slate-200 opacity-50";
                      }
                    } else {
                      if (selectedAnswers[qIndex] === optIndex) {
                        optionClasses += "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
                      } else {
                        optionClasses += "border-slate-200 hover:bg-slate-50";
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        disabled={submitted}
                        onClick={() => handleSelect(qIndex, optIndex)}
                        className={optionClasses}
                      >
                        {String.fromCharCode(65 + optIndex)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex gap-4">
          {!submitted && (
            <Button size="lg" onClick={handleSubmit} disabled={!allAnswered} className="w-full text-lg h-14">
              Submit Quiz
            </Button>
          )}

          {submitted && !isPerfectScore && (
            <Button size="lg" onClick={handleRetry} className="w-full text-lg h-14 bg-red-600 hover:bg-red-700 text-white">
              Retry Quiz
            </Button>
          )}

          {submitted && isPerfectScore && (
            <Button size="lg" onClick={onPass} className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 text-white">
              Mark as Complete & Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPlayer;
