import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines: 

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Include a variety of different question types, for example definitions, examples, comparisons, and application questions.
4. Avoid overly complex or ambiguous questions.
5. Aim to create a balanced set of flashcards that cover the topic comprehensively.

Return your response in the following JSON format:
{
    "flashcards": [
        {
            "front": "string",
            "back": "string"
        }
    ]
}
`;

export async function POST(req) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const data = await req.text();

        const fullPrompt = `${systemPrompt}\nHere are the notes:\n${data}`;

        const response = await model.generateContent({ prompt: [fullPrompt] });

        if (!response || !response.content) {
            return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
        }

        const flashcards = JSON.parse(response.content);

        return NextResponse.json(flashcards.flashcards);
    } catch (error) {
        console.error("Error in POST /api/generate-flashcards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}