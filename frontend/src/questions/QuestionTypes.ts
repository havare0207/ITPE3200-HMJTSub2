// Describes the question data returned by the API.
export interface Question {
    questionId: number;
    questionText: string;
    category: string;
    difficulty: number;
    answerA: string;
    answerB: string;
    answerC: string;
    answerD: string;
    correctAnswer: number;
    gameId: number;
    gameName: string | null;
}

// Describes the data required when creating or updating a question.
export interface QuestionFormData {
    questionText: string;
    category: string;
    difficulty: number;
    answerA: string;
    answerB: string;
    answerC: string;
    answerD: string;
    correctAnswer: number;
}

// Describes the data required when creating a question.
export interface CreateQuestionData extends QuestionFormData {
    gameId: number;
}

// Describes the optional search and filter parameters.
export interface QuestionFilters {
    searchString?: string;
    category?: string;
    difficulty?: string;
    gameId?: string | number;
}

// Describes a game option in the question filters.
export interface GameOption {
    gameId: number;
    gameName: string;
}