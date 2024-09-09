import { HfInference } from '@huggingface/inference';
import crypto from 'crypto';
import { BigNumber, dot, norm, number } from 'mathjs';
import { ragThreshold, similarStatements, internshipLink } from './constants';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Generates a unique hash for a vector embedding in the database to serve as the id. Used for efficiency purposes in Pinecone.
 * @param vector 384 dimension text embedding obtained from getEmbeddings()
 * @returns string representing hash value of the vector embedding
 */
function generateHash(vector: number[]): string { 
    // Convert each number to a fixed-point representation with 6 decimal places
    const vectorString = vector.map(num => num.toFixed(6)).join(',');
    // Create a SHA-256 hash of the serialized vector string
    const hash = crypto.createHash('sha256').update(vectorString).digest('hex');
    return hash;
}

/**
 * Calculates the cosine similarity between two text embeddings. Used to see if Pinecone vector database needs to be updated for a prompt.
 * @param embedding1 first embedding for comparison
 * @param embedding2 second embedding for comparison
 * @returns cosine similarity value between 0 and 1 describing the similarity of two text embeddings
 */
function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    const dotProduct: number = dot(embedding1, embedding2);
    const magnitudeA: number | BigNumber = norm(embedding1);
    const magnitudeB: number | BigNumber = norm(embedding2);
    return dotProduct / (number(magnitudeA) * number(magnitudeB));
}

/**
 * Parses the format of the SimplifyJobs 2025 Internships README.md file on the dev branch to produce sentences to feed into Pinecone.
 * @param url url of SimplifyJobs
 * @returns list of strings to then turn into text embeddings with getEmbeddings
 */
async function getMetadata(url: string): Promise<string[]> {
    try {
        // Fetch the data from the given url and parse it into text
        const response: Response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const markdownContent: string = await response.text();
        let ragStrings: string[] = [];
        // This gets the README.md and splits the document to get one job offering per array index
        let splitContent: string[] = markdownContent.split("| ------- | ---- | -------- | ---------------- | ----------- |\n")[1]
            .split('<!-- Please leave a one line gap between this and the table TABLE_END (DO NOT CHANGE THIS LINE) -->')[0]
            .split('\n');

        for (let i = 0; i < splitContent.length; i++) {
            let data = splitContent[i].split('|');
            // Check for missing values in the row, or if the internship is currently closed; skip logging it if so.
            if (!data[1] || !data[2] || !data[3] || data[4]?.trim() == '🔒' || !data[5]) continue;
            let companyName = data[1].trim();
            // Some company name values are just arrows, which indicate that the actual company name is in a row above.
            if (companyName == '↳') {
                let j = i;
                while (j > -1 && companyName == '↳') {
                    companyName = splitContent[j-1].split('|')[1].trim();
                    j--;
                }
            }
            // This regex matcher parses a company name if in the format [COMPANY NAME](URL); index 1 is the COMPANY NAME
            let match = companyName.match(/^\*\*\[(.*?)\]\(.*?\)\*\*$/);
            if (match) companyName = match[1];
            // Remove the emoji from the job name
            let jobName: string = data[2].trim().replaceAll('🛂', '');
            // Replace line breaks (which are used to separate different locations of job offering) with the string ' and '
            let location = data[3].trim().replaceAll('</br>', ' and ');;
            let postDate = data[5].trim();
            // Push the following sentence to the RAG set to later be parsed
            ragStrings.push(`${companyName} offered an internship titled '${jobName}' in ${location} on ${postDate}`);
        }
        return ragStrings;
    } catch (error) {
        console.error('Failed to fetch or process the document:', error);
        return [];
    }
}

/**
 * Checks if a user prompt is similar to one that should be looked for. Used to determine if Pinecone vector database needs to be updated for a prompt. 
 * @param userPrompt 
 * @returns Boolean value of whether or not one of the prompts exceeds the threshold value to activate vector database updating
 */
export async function isSimilarPrompt(userPrompt: string): Promise<Boolean> {
    let similarEmbeddings: number[][] = await getEmbeddings(similarStatements);
    const userEmbedding: number[][] = await getEmbeddings([userPrompt]);
    const similarityValues: number[] = await Promise.all(
        similarEmbeddings.map((embedding) => cosineSimilarity(userEmbedding[0], embedding))
    );
    return Math.max(...similarityValues) >= ragThreshold;
}

/**
 * Converts a group of texts into a 384-dimension embedding with all-MiniLM-L6-v2
 * @param texts Group of texts to convert to embeddings
 * @returns 384-dimension embeddings for each text
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
    const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);
    try {
        const response = await hf.featureExtraction({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: texts,
        });
        return response as number[][];
    } catch (error) {
        console.error('Error fetching embeddings:', error);
        return [];
    }
}

/**
 * Updates vector database given current values in SimplifyJobs' Summer 2025 Internship list
 */
export async function updateRAG() {
    const metadata: string[] = await getMetadata(internshipLink);
    const textEmbeddings: number[][] = await getEmbeddings(metadata);
    const pc = new Pinecone({ apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!})
    const index = pc.Index(process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME!);
    const vectors = textEmbeddings.map((embedding, idx) => ({
        id: generateHash(embedding),
        values: embedding,
        metadata: {
            text: metadata[idx]
        }
    }));
    try {
        const batchSize = 25;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.upsert(batch);
        }
        // await index.upsert(vectors);
        console.log('Upsert successful');
    } catch (error) {
        console.error('Error upserting vectors:', error);
    }
}