import { messageMappings } from '../lib/constants';
import { Message } from '../lib/types';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ headerIds: false, mangle: false })

export default function Chat({ messages }: { messages: Message[] }) {
    return (
        <>
            {messages.map((message: Message, index: number) => (
            <div key={index} className={`flex my-2 ${messageMappings[message.role][0]} w-full`}>
                <div 
                className={`${messageMappings[message.role][1]} p-4 rounded-lg shadow prose text-white`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.content))}}>
                </div>
            </div>))}
        </>
    );
};
