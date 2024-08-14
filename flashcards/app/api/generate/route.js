import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines: 

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Include a variety of different question types, for example definitions, examples, comparisons, and application questions.
4. Avoid overly complex or ambiguous questions.
5. Aim to create a balanced set of flashcards that cover the topic comprehensively.

Remember, the goal is to facilitate effective learning and retention of information through these flashcards.

Return your response in the following JSON format:
{
    "flashcard":[{
        "front (question)": str,
        "back (answer)": str,
    }]
}
`

export async function POST(req){
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const data = await req.text(); // Get the prompt

    let response = await model.generateContent(data)
    const flashcards = JSON.parse(response)
    return NextResponse.json(flashcards.flashcard)
}