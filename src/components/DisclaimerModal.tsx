import { useState, useEffect } from "react";
import { X } from "lucide-react";
import disclaimerBg from "@/assets/disclaimer-bg.jpg";

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the disclaimer in this session
    const hasSeenDisclaimer = sessionStorage.getItem("disclaimerSeen");
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("disclaimerSeen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.8)), url(${disclaimerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          aria-label="Close disclaimer"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-5 pt-10">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Disclaimer</h2>
          </div>

          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              This platform uses <span className="font-semibold">pre-existing market data</span> to help you 
              analyze and trade more efficiently.
            </p>

            <p>
              All information provided is for <span className="font-semibold">educational purposes only</span>{" "}
              and does not constitute investment advice.
            </p>

            <p className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs">
              Users are solely responsible for their investment decisions. 
              Consult a <span className="font-semibold text-red-600">SEBI-registered adviser</span> before trading.
            </p>

            <p className="text-gray-500 text-xs">
              We do not guarantee accuracy. No liability for any loss from using this data.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="mt-5 w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
