'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useProtectedRoute } from '@/hooks/useAuth';
import { mcqsService } from '@/services/mcqs';
import { 
  McqQuizWithQuestions, 
  QuizSessionRead, 
  McqQuestionRead 
} from '@/types/mcqs';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Flag, 
  Loader2, 
  ListChecks, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Home,
  AlertCircle
} from 'lucide-react';

export default function TakeQuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProtectedRoute();
  
  // State for quiz data
  const [quiz, setQuiz] = useState<McqQuizWithQuestions | null>(null);
  const [session, setSession] = useState<QuizSessionRead | null>(null);
  const [questions, setQuestions] = useState<McqQuestionRead[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  
  // Extract quizId from params and sessionId from search params
  const quizId = parseInt(params.quizId, 10);
  const sessionId = searchParams ? parseInt(searchParams.get('session') || '0', 10) : 0;
  
  // Load quiz and session data
  useEffect(() => {
    const fetchQuizAndSession = async () => {
      if (isNaN(quizId) || isNaN(sessionId) || sessionId === 0) {
        setError(new Error("Invalid quiz ID or session ID"));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Get the quiz data first
        const quizData = await mcqsService.getQuizById(quizId);
        if (!quizData) throw new Error('Quiz not found');
        
        // Then get the session
        const sessionData = await mcqsService.getSession(sessionId);
        if (!sessionData) throw new Error('Session not found');
        
        // If session is already completed, show results
        if (sessionData.completed_at) {
          setShowingResults(true);
        }
        
        // Finally get the questions (they should come with the quiz, but in case they don't)
        const questionsData = Array.isArray((quizData as any).questions) 
          ? (quizData as any).questions 
          : [];
        
        setQuiz(quizData as McqQuizWithQuestions);
        setSession(sessionData);
        setQuestions(questionsData);
        
        // If we have answers in the session, populate them
        if (sessionData.answers_json) {
          const answers: { [key: number]: string } = {};
          sessionData.answers_json.forEach((answer: any) => {
            answers[answer.question_id] = answer.selected_option;
          });
          setUserAnswers(answers);
        }
      } catch (err) {
        console.error('Failed to fetch quiz and session:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizAndSession();
  }, [quizId, sessionId]);
  
  // Timer for elapsed time
  useEffect(() => {
    if (showingResults) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setElapsedTime(`${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, showingResults]);
  
  // Navigation functions
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Answer selection
  const selectAnswer = (questionId: number, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };
  
  // Submit quiz
  const submitQuiz = async () => {
    if (!session) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const submittedSession = await mcqsService.submitSession(session.id, userAnswers);
      setSession(submittedSession);
      setShowingResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Function to get status of a question
  const getQuestionStatus = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return 'unanswered';
    
    if (!showingResults) {
      return userAnswers[question.id] ? 'answered' : 'unanswered';
    } else {
      const userAnswer = userAnswers[question.id];
      if (!userAnswer) return 'unanswered';
      return userAnswer === question.correct_option ? 'correct' : 'incorrect';
    }
  };
  
  // Generate a summary of the quiz results
  const getResultsSummary = () => {
    if (!session || !showingResults) return null;
    
    const totalQuestions = questions.length;
    const attempted = Object.keys(userAnswers).length;
    const correct = questions.filter(q => userAnswers[q.id] === q.correct_option).length;
    const score = session.score || Math.round((correct / totalQuestions) * 100);
    
    return {
      totalQuestions,
      attempted,
      correct,
      incorrect: attempted - correct,
      unanswered: totalQuestions - attempted,
      score
    };
  };

  // Helper function to safely get option text
  const getOptionText = (question: McqQuestionRead, optionKey: string): string => {
    const value = question[`option_${optionKey.toLowerCase()}` as keyof typeof question];
    return typeof value === 'string' ? value : '';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert error={error} />
        <div className="mt-4">
          <Button asChild variant="ghost">
            <Link href="/mcqs/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!quiz || !session || !questions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quiz you're looking for doesn't exist or has no questions.
          </p>
          <Button asChild>
            <Link href="/mcqs/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (isNaN(quizId) || isNaN(sessionId) || sessionId === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Invalid Quiz Session</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quiz session is invalid or missing. Please return to the quizzes page.
          </p>
          <Button asChild>
            <Link href="/mcqs/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const results = showingResults ? getResultsSummary() : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation links */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href={`/mcqs/quizzes/${quiz.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/mcqs/quizzes">
            <ListChecks className="w-4 h-4 mr-2" />
            All Quizzes
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
        
      {showingResults ? (
        // Results Screen
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 px-6 py-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
            <p className="text-blue-100">{quiz.title}</p>
          </div>
          
          <div className="p-6">
            {/* Score Summary */}
            <div className="mb-8">
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results?.score}%</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {results?.score && results.score >= 70 ? 'Well done!' : 'Keep practicing!'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You answered {results?.correct} out of {results?.totalQuestions} questions correctly.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{results?.totalQuestions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Questions</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{results?.correct}</div>
                  <div className="text-sm text-green-500 dark:text-green-400">Correct</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{results?.incorrect}</div>
                  <div className="text-sm text-red-500 dark:text-red-400">Incorrect</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{session.time_taken_seconds ? `${Math.floor(session.time_taken_seconds / 60)}:${(session.time_taken_seconds % 60).toString().padStart(2, '0')}` : elapsedTime}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Time Taken</div>
                </div>
              </div>
            </div>
            
            {/* Question Review */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Review</h3>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = userAnswer === question.correct_option;
                const questionStatus = getQuestionStatus(index);
                
                return (
                  <div 
                    key={question.id} 
                    className={`p-4 rounded-lg border ${
                      questionStatus === 'correct' 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : questionStatus === 'incorrect'
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start mb-4">
                      <div className={`mt-1 flex-shrink-0 w-5 h-5 ${
                        questionStatus === 'correct' 
                          ? 'text-green-500' 
                          : questionStatus === 'incorrect' 
                            ? 'text-red-500' 
                            : 'text-gray-400'
                      }`}>
                        {questionStatus === 'correct' && <CheckCircle className="w-5 h-5" />}
                        {questionStatus === 'incorrect' && <XCircle className="w-5 h-5" />}
                        {questionStatus === 'unanswered' && <HelpCircle className="w-5 h-5" />}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {question.question_text}
                        </p>
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="space-y-2 ml-8">
                      {['A', 'B', 'C', 'D'].map(option => {
                        const optionText = getOptionText(question, option);
                        if (!optionText) return null;
                        
                        const isUserSelection = userAnswer === option;
                        const isCorrectOption = question.correct_option === option;
                        
                        let optionClassName = 'flex items-center p-3 rounded-md border ';
                        
                        if (isUserSelection && isCorrectOption) {
                          optionClassName += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                        } else if (isUserSelection && !isCorrectOption) {
                          optionClassName += 'border-red-500 bg-red-50 dark:bg-red-900/20';
                        } else if (isCorrectOption) {
                          optionClassName += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                        } else {
                          optionClassName += 'border-gray-200 dark:border-gray-700';
                        }
                        
                        return (
                          <div key={option} className={optionClassName}>
                            <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center mr-3 border border-current">
                              {option}
                            </div>
                            <span>{optionText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Actions */}
            <div className="flex justify-between mt-8">
              <Button asChild variant="outline">
                <Link href={`/mcqs/quizzes/${quiz.id}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Quiz
                </Link>
              </Button>
              <Button asChild>
                <Link href="/mcqs/quizzes">
                  Find More Quizzes
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Quiz Taking Interface
        <>
          {/* Quiz Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <ListChecks className="w-4 h-4 mr-1" />
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              <div className="flex items-center mr-4 text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>{elapsedTime}</span>
              </div>
              <Button 
                onClick={submitQuiz} 
                disabled={submitting}
                variant="outline"
                className="text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-1" />
                    Finish Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Question Navigation */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
            <div className="flex space-x-2">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                let bgColor = 'bg-gray-200 dark:bg-gray-700';
                
                if (status === 'answered') {
                  bgColor = 'bg-blue-500 text-white';
                } else if (index === currentQuestionIndex) {
                  bgColor = 'bg-yellow-500 text-white';
                }
                
                return (
                  <button
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${bgColor} font-medium text-sm`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Current Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {currentQuestion.question_text}
                </h2>
                {currentQuestion.hint && (
                  <div className="flex items-start p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 mb-4">
                    <HelpCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{currentQuestion.hint}</p>
                  </div>
                )}
              </div>
              
              {/* Options */}
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map(option => {
                  const optionText = getOptionText(currentQuestion, option);
                  if (!optionText) return null;
                  
                  const isSelected = userAnswers[currentQuestion.id] === option;
                  
                  return (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-md border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={() => selectAnswer(currentQuestion.id, option)}
                    >
                      <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'border border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4" /> : option}
                      </div>
                      <span className="flex-grow">
                        {optionText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            {/* Question Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              
              <Button 
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Submit Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {Object.keys(userAnswers).length} of {questions.length} questions answered
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full sm:w-64">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <Button 
                onClick={submitQuiz}
                disabled={submitting || Object.keys(userAnswers).length === 0}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
            
            {Object.keys(userAnswers).length === 0 && (
              <div className="mt-4 flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">You need to answer at least one question to submit.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 