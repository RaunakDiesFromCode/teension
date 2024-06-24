import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

interface ShareScreenProps {
  onClose: () => void;
  Strlink: string;
}

const ShareScreen: React.FC<ShareScreenProps> = ({ onClose, Strlink }) => {
  const [copied, setCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const copyToClipboard = () => {
    // Select the input field
    const input = document.getElementById("npm-install") as HTMLInputElement;
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999); // For mobile devices

      // Attempt to copy the selected text
      document.execCommand("copy");

      // Update state to show "Copied!" message
      setCopied(true);
      setShowCopiedMessage(true);

      // Hide the "Copied!" message after 1500ms
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-90 flex justify-center items-center">
      <div className="p-6 m-4 relative bg-slate-800 rounded-lg">
        <button
          className="absolute top-0 right-0 -mt-9 -mr-9"
          onClick={onClose}
        >
          <IoClose size={40} />
        </button>

        <div className="grid grid-cols-8 gap-2 w-full max-w-[23rem]">
          <label htmlFor="npm-install" className="sr-only">
            Label
          </label>
          <input
            id="npm-install"
            type="text"
            className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={Strlink}
            readOnly
            aria-label="npm install command"
          />
          <button
            onClick={copyToClipboard}
            className="col-span-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center inline-flex justify-center relative z-10"
          >
            <span id="default-message">Copy</span>
            <span
              id="success-message"
              className={
                showCopiedMessage
                  ? "inline-flex items-center"
                  : "hidden inline-flex items-center"
              }
            >
              <svg
                className="w-3 h-3 text-white me-1.5"
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>
              Copied!
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareScreen;
