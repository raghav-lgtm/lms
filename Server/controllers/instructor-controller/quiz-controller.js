const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateQuiz = async (req, res) => {
  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        success: false,
        message: "Context text or video transcript is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: GEMINI_API_KEY missing in .env.",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ── Few-Shot Prompting & JSON Enforcement ──────────────────────────────
    const systemInstruction = `You are an expert pedagogical assistant. Your task is to generate exactly 5 multiple choice questions based on the provided curriculum text or video transcript.

You must return a strict JSON object with a single root property "questions" which is an array of question objects.

Example Output Constraint (Few-Shot):
{
  "questions": [
    {
      "question": "What is the main purpose of React?",
      "options": ["To build database schemas", "To build user interfaces", "To compile CSS", "To perform server-side routing"],
      "correctAnswerIndex": 1
    },
    {
      "question": "Which hook is used to manage state in a functional component?",
      "options": ["useEffect", "useContext", "useState", "useReducer"],
      "correctAnswerIndex": 2
    }
  ]
}

Make sure the difficulty is appropriate, do not hallucinate fake information, and all facts must be strictly derived from the provided context. Ensure that correctAnswerIndex is an integer between 0 and 3 mapping to the correct item in the options array.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Here is the context to generate questions from:\n\n${context}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsedContent = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      data: parsedContent.questions,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the quiz.",
    });
  }
};

module.exports = { generateQuiz };
