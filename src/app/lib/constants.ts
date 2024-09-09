// Default LLM greeeting in page.tsx
export const chatbotGreeting: string = `Hi, I'm your career preparation assistant. How may I elevate your career today?`;

// formats user-assistant chat in Chat.tsx
export const messageMappings: Record<string, string[]> = {
    'assistant' : ['justify-start', 'bg-lime-700'],
    'user' : ['justify-end', 'bg-amber-500']
  }

// specified LLM model
export const model: string = `meta-llama/llama-3.1-8b-instruct:free`;

// cosine similarity threshold value for the RAG to update itself with text embeddings retrieved from SimplifyJobs
export const ragThreshold: number = 0.8;

// Statements to compare a user prompt to in order to see if text embeddings should be retrieved (via meeting the cosine similarity threshold)
export const similarStatements: string[] = ["Are there any new internship opportunities available right now?",
                                                "Can you tell me about the latest internship postings?",
                                                "What are the recent internships in the tech industry?",
                                                "What are the latest internships for software development?",
                                                "What internships are currently open for students or recent graduates?",
                                                "Are there any new internships suitable for college students?"];

export const internshipLink: string = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md';