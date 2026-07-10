"use client"
import { useState } from 'react';

export default function SearchComponent() {
  const [mode, setMode] = useState('song'); // 'song' or 'mood'
  const [input, setInput] = useState('');

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 p-6 bg-black text-white rounded-2xl border border-gray-800">
      
      {/* 1. Pill-Shaped Segmented Toggle */}
      <div className="relative flex w-64 h-10 p-1 mx-auto bg-gray-900 rounded-full border border-gray-800">
        {/* Animated Sliding Background Glider */}
        <div 
          className={`absolute top-1 bottom-1 left-1 w-[124px] rounded-full transition-all duration-300 ease-out ${
            mode === 'song' ? 'translate-x-0 bg-emerald-500' : 'translate-x-[124px] bg-purple-600'
          }`}
        />
        
        {/* Song Button Option */}
        <button
          type="button"
          onClick={() => { setMode('song'); setInput(''); }}
          className={`z-10 flex-1 text-xs font-bold transition-colors duration-200 ${mode === 'song' ? 'text-black' : 'text-gray-400'}`}
        >
          🎵 Similar Song
        </button>

        {/* Mood Button Option */}
        <button
          type="button"
          onClick={() => { setMode('mood'); setInput(''); }}
          className={`z-10 flex-1 text-xs font-bold transition-colors duration-200 ${mode === 'mood' ? 'text-black' : 'text-gray-400'}`}
        >
          ✨ AI Mood Prompt
        </button>
      </div>

      {/* 2. Dynamic Search Bar Wrapper */}
      <div className={`flex items-center gap-2 p-2 bg-gray-900 rounded-xl border transition-all duration-300 ${
        mode === 'song' ? 'focus-within:border-emerald-500 border-gray-800' : 'focus-within:border-purple-500 border-gray-800'
      }`}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'song' ? "Search a song title or artist..." : "Describe the mood, environment, or feeling..."}
          className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-500"
        />
        <button className={`px-5 py-2 rounded-lg font-bold text-xs text-white transition-colors duration-300 ${
          mode === 'song' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500'
        }`}>
          Search
        </button>
      </div>

      {/* 3. Helper Context Pills underneath */}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
        <span className="self-center">Suggestions:</span>
        {mode === 'song' ? (
          ['Blinding Lights', 'Hotel California', 'Starboy'].map(s => (
            <button key={s} onClick={() => setInput(s)} className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-md hover:border-emerald-500 text-gray-400">{s}</button>
          ))
        ) : (
          ['Rainy Sunday', 'Cyberpunk Alleyway', 'Gym Hype'].map(m => (
            <button key={m} onClick={() => setInput(m)} className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-md hover:border-purple-500 text-gray-400">{m}</button>
          ))
        )}
      </div>

    </div>
  );
}