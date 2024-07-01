import React from "react";

const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="🤚 relative w-6 h-6 ml-20">
        <div className="👉 absolute"></div>
        <div className="👉 absolute"></div>
        <div className="👉 absolute"></div>
        <div className="👉 absolute"></div>
        <div className="🌴 absolute w-full h-full"></div>
        <div className="👍 absolute"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
