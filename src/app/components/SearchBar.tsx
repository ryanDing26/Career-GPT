'use client'
import { useState } from 'react'
import { Message } from '../lib/types';

export default function SearchBar({ messages, setMessages }: { messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
    const [message, setMessage] = useState('');
    const sendMessage = async (e: any) => {
        e.preventDefault();
        if (!message.trim()) return;
        setMessage('');
        setMessages((messages: any[]) => [...messages,
            { role: 'user', content: message },
            { role: 'assistant', content: ''}]
        );
        try {
            const response: Response = await fetch('../api/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([...messages, { role: 'user', content: message}])
            });
            if (!response || !response.ok) throw new Error(`POST request Error: ${response.statusText}`);

            const reader: ReadableStreamDefaultReader<Uint8Array> = await response.body?.getReader()!;

            if (!reader) throw new Error(`Reader not found`);

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                setMessages((messages: any[]) => {
                    let lastMessage = messages[messages.length - 1]
                    let otherMessages = messages.slice(0, messages.length - 1);
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ]
                });
            }
        } catch (err) {
            console.log(`Error: ${err}`); 
            setMessages((messages) => [
                ...messages,
                { role: 'assistant', content: 'Error encountered, please try again' }
            ]);
        }
    };
    // Change components upon chatbot processing
    const [loading, setLoading] = useState(false);
    return (
    <form className="max-w-xl m-auto p-1" onSubmit={sendMessage}>   
        <label htmlFor="searchbar" className="mb-2 text-sm font-medium text-white sr-only">Search</label>
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input value={message} onChange={(e) => setMessage(e.target.value)}type="search" id="searchbar" className="block w-full p-4 ps-10 text-sm text-white placeholder-white rounded-full bg-amber-500 shadow" placeholder="Ask me a question..." />
            <button type="submit" className={`text-white absolute end-2.5 bottom-2.5 bg-lime-700 hover:bg-lime-800 font-medium rounded-full text-sm px-4 py-2 shadow ${Boolean(!message.trim()) ? 'opacity-50' : ''}`} disabled={Boolean(!message.trim())}>Search</button>
        </div>
    </form>
    );
};