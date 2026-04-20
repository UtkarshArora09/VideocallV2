import React, { useState } from 'react';

export default function PostCallSummary({ roomId, userName, duration }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const notes = localStorage.getItem(`notes-${roomId}`) || '';

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, doctorName: userName, date: new Date().toISOString(), duration })
      });
      const data = await res.json();
      setSummary(data.summary); // Expected JSON structure from backend
    } catch (err) {
      console.error(err);
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    if (!summary) return;
    const text = `Chief Complaint: ${summary.chiefComplaint}\nObservations: ${summary.observations}\nRecommendations: ${summary.recommendations}\nFollow-Up: ${summary.followUp}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="flex flex-col items-center p-8 w-full h-full overflow-y-auto bg-gray-900 text-white">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-2">Call Ended</h2>
        <p className="text-center text-gray-400 mb-8">Duration: {Math.floor(duration/60)}m {Math.floor(duration%60)}s</p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-teal mb-2">Raw Notes</h3>
          <div className="bg-gray-900 p-4 rounded-xl text-gray-300 whitespace-pre-wrap text-sm min-h-[100px]">
            {notes || "No notes were taken."}
          </div>
        </div>

        {!summary && (
          <button 
            onClick={generateSummary}
            disabled={loading || !notes}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors min-h-[48px] flex items-center justify-center space-x-2"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-t-white border-indigo-600 rounded-full animate-spin"></span> <span>Generating AI Summary...</span></>
            ) : "Generate AI Summary"}
          </button>
        )}

        {summary && (
          <div className="mt-8 space-y-6 animate-fade-in text-gray-200">
            <div>
              <h4 className="text-brand-teal font-semibold border-b border-gray-700 pb-1 mb-2">Chief Complaint</h4>
              <p>{summary.chiefComplaint}</p>
            </div>
            <div>
              <h4 className="text-brand-teal font-semibold border-b border-gray-700 pb-1 mb-2">Observations</h4>
              <p>{summary.observations}</p>
            </div>
            <div>
              <h4 className="text-brand-teal font-semibold border-b border-gray-700 pb-1 mb-2">Recommendations</h4>
              <p>{summary.recommendations}</p>
            </div>
            <div>
              <h4 className="text-brand-teal font-semibold border-b border-gray-700 pb-1 mb-2">Follow Up</h4>
              <p>{summary.followUp}</p>
            </div>
            <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-2">
              {summary.disclaimer}
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={copySummary} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl min-h-[48px]">Copy Text</button>
              <button onClick={() => window.print()} className="flex-1 py-2 bg-brand-teal hover:bg-brand-teal-dark rounded-xl min-h-[48px]">Download PDF</button>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center pt-6 border-t border-gray-700">
           <a href="/" className="text-gray-400 hover:text-white transition-colors underline min-h-[48px] p-2 inline-block">Return to Lobby</a>
        </div>
      </div>
    </div>
  );
}
