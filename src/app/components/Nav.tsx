export default function Nav() {
    return (
        <div className="flex sticky top-0 justify-center bg-lime-700">
            <div className="p-2.5 flex items-center mx-auto space-x-10 w-[90%] sm:w-[80%]">
                {/* TODO: Implement Nabla Google Fonts family */}
                <a className="font-semibold text-white" href="/">CareerGPT</a>
                <button className="text-white bg-amber-500 hover:bg-amber-600 text-gray-800 font-semibold py-2 px-4 rounded shadow">New Chat</button>
            </div>
        </div>
    );
};