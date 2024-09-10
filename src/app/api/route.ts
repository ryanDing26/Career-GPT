import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { model } from '../lib/constants';
import { isSimilarPrompt, getEmbeddings, updateRAG } from '../lib/utils';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * POST request for LLM.
 * @param request NextRequest sent by the user to the LLM
 * @returns streamed NextResponse of the LLM OR webscraper
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    let data = await request.json();
    // This indicates a user asks a question that RAG can solve, so it updates its knowledge base!
    if (await isSimilarPrompt(data[data.length - 1].content)) await updateRAG();
    const pc = new Pinecone({ apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY! });
    const index = pc.index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME!);
    const query: number[] = (await getEmbeddings([data[data.length - 1].content]))[0];
    const context = (await index.query({ vector: query, topK: 250, includeMetadata: true })).matches.map(match => match.metadata!.text).join('\n');
    // Generates an LLM response (with RAG capabilities)
    const systemPrompt: string = `You are a helpful assistant that is tailored to give advice to users in topics to advance someone's career, from accessing relevant network connections through the provided web scraper and general advising on different career-related fields in computer science. Additionally, here is some more information context regarding recent internship offerings:\n`;
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    });
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            { "role": "system", "content": systemPrompt },
            ...data
        ],
        stream: true
    });
    // Streams LLM-based response
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) controller.enqueue(content);
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }              
        }
    }).pipeThrough(new TextEncoderStream());
    return new NextResponse(stream); 
};