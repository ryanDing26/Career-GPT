## CareerGPT

This chatbot uses Pinecone's vector databases for retrieval augmented generation of internship offerings from [SimplifyJobs' 2025 Summer Internships](https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md), and will provide up-to-date internship opportunities to users!

## Internship RAG

One notable feature of this chatbot is that it utilizes retrieval-augmented generation via [Pinecone](https://www.pinecone.io/) vector databases, which is dynamically updated whenever changes are made to the dev branch of the SimplifyJobs' README!

## LinkedIn Networking Recommendation System

Due to the current [user agreement](https://www.linkedin.com/legal/user-agreement) LinkedIn has, this feature has been removed from all future offerings. It should be noted that code in previous commits of `webScraper.ts` will not work as a result of security features LinkedIn provides to its feed system. 