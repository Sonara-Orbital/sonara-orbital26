import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request) {
    try {
        const { userInput } = await request.json();
        
        if (!userInput) {
            return NextResponse.json({error: "Input Text Required"}, {status: 400});
        }

        const songSchema = {
            type: Type.OBJECT,
            properties: {
                songs: {
                    type: Type.ARRAY,
                    description: "list of songs found in user input. return empty array if none exist",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            songName: {
                                type: Type.STRING,
                                description: "The title of the track. Capitalized properly. Return null if unclear."
                            },
                            artistName: {
                                type: Type.STRING,
                                description: "The name of the singer or band. Capitalized properly. Return null if unclear."
                            },
                        },
                        required: ["songName", "artistName"]
                    },
                },
            },
            required: ["songs"]
        };

        const interaction = await ai.interactions.create({
            model: "gemini-2.5-flash",
            input: `Analyse the following text and extract the given song name and the artist name: "${userInput}"`,
            generation_config: {
                temperature: 0.1,
            },
            response_format: {
                type: "text",
                mime_type: "application/json",
                schema: songSchema,
            },
        });

        const data = JSON.parse(interaction.output_text);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini Extraction Error", error);
        return NextResponse.json({error: "Failed to extract song data"}, {status: 500});
    }
}