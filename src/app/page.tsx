'use client'

import Image from "next/image";
import { useState, useEffect, useRef } from 'react' 
import SearchBar from "./components/SearchBar";
import Chat from "./components/Chat"
import { chatbotGreeting } from "./lib/constants";
import { Message } from './lib/types';

export default function Home() {
  // React hooks

  // Used for autoscrolling to bottom of conversation
  const chatRef = useRef(null);

  // Updates messages and message history
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant',
      content: chatbotGreeting 
    }]);
  
  
  // useEffect(() => {
  //   chatRef.current.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  return (
    <div className="flex flex-col items-center bg-amber-200 p-3">
      <div className="w-[95%] sm:w-[50%]">
        <Chat messages={messages}></Chat>
        <div className="fixed inset-x-0 bottom-[1.5rem]">
          <SearchBar messages={messages} setMessages={setMessages}></SearchBar>
        </div>
      </div>
    </div>
  );
}
