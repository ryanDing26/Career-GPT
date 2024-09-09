## CareerGPT

This chatbot uses Pinecone's vector databases for retrieval augmented generation of internship offerings from [SimplifyJobs' 2025 Summer Internships](https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md), and will provide up-to-date internship opportunities to users!

## Internship RAG

One notable feature of this chatbot is that it utilizes retrieval-augmented generation via [Pinecone](https://www.pinecone.io/) vector databases, which is dynamically updated whenever changes are made to the dev branch of the SimplifyJobs' README!

## LinkedIn Networking Recommendation System

CareerGPT has a built-in web scraping system with Puppeteer! Currently, the live site does not support LinkedIn network recommendations for security reasons, though you are able to do it in a local context assuming you have both a [LinkedIn](https://linkedin.com/) account as well as an [OpenRouter](https://openrouter.ai/) API Key to communicate with the chatbot:

1. Create a `.env` file in the main directory of the repository
2. Create the following environmental variables for the program:
   - `NEXT_PUBLIC_OPENROUTER_API_KEY`: key starting with `sk` that you are able to freely access with an account on OpenRouter
   - `NEXT_PUBLIC_LINKEDIN_LOGIN`: Your personal LinkedIn account login
   - `NEXT_PUBLIC_LINKEDIN_PASS`: Your personal LinkedIn account password
3. Run the application with `npm run dev` and open up [http://localhost:3000](http://localhost:3000) with your browser to see the application.
4. Start a networking recommendation prompt with the following phrase `Give me some connections relating to these keywords: ` followed by keywords delimited with spaces (no commas!).
5. You will now be able to securely find LinkedIn connections using your own LinkedIn login details!