import React, { useState } from 'react';
import { Volume2, Play, Pause, X, ExternalLink, Bookmark, FastForward, Rewind } from 'lucide-react';
import { LiturgicalAudioTrack, WorkItem, DIVISIONS } from '../types';
import { AudioWaveformVisualizer } from './Ornaments';

export const LiturgicalAudioFloatingIsland: React.FC<{
  track: LiturgicalAudioTrack;
  isPlaying: boolean;
  progress: number;
  onTogglePlayPause: () => void;
  onClose: () => void;
  onOpenDetails: () => void;
}> = ({ track, isPlaying, progress, onTogglePlayPause, onClose, onOpenDetails }) => {
  const divisionInfo = DIVISIONS[track.division];

  return (
    <aside
      aria-label="የድምፅ ንባብ መቆጣጠሪያ"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg md:ml-auto z-40 bg-white/95 dark:bg-[#111D30]/95 backdrop-blur-md rounded-2xl border-2 border-[#B88500]/40 shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* Top Thin Audio Progress Bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-[#B88500] to-[#0C4A9E] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>

      <div className="p-3 flex items-center justify-between gap-3">
        {/* Pulsing Audio Circle */}
        <button
          onClick={onOpenDetails}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#B88500]/15 border border-[#B88500]/40 group-hover:scale-105 transition-transform">
            {isPlaying ? (
              <AudioWaveformVisualizer isPlaying={true} barColor="#B88500" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#B88500]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {track.title}
              </h4>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 text-white"
                style={{ backgroundColor: divisionInfo.accentColor }}
              >
                {divisionInfo.titleAmharic}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {track.narratorOrCantor} • {track.durationAmharic}
            </p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onTogglePlayPause}
            className="w-9 h-9 rounded-full bg-[#B88500] hover:bg-[#966C00] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? 'አቁም' : 'አጫውት'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="ዝጋ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const LiturgicalAudioPlayerModal: React.FC<{
  isOpen: boolean;
  track: LiturgicalAudioTrack;
  isPlaying: boolean;
  progress: number;
  onTogglePlayPause: () => void;
  onSeek: (progress: number) => void;
  onClose: () => void;
}> = ({ isOpen, track, isPlaying, progress, onTogglePlayPause, onSeek, onClose }) => {
  if (!isOpen) return null;

  const currentSeconds = Math.floor(progress * track.durationSeconds);
  const curMin = Math.floor(currentSeconds / 60);
  const curSec = currentSeconds % 60;
  const timeFormatted = `${curMin}:${curSec < 10 ? '0' : ''}${curSec}`;

  const divisionInfo = DIVISIONS[track.division];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#111D30] border-2 border-[#B88500]/50 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Illuminated Waveform Disk */}
        <div className="w-24 h-24 mx-auto rounded-full bg-[#B88500]/15 border-2 border-[#B88500] flex items-center justify-center shadow-lg my-2">
          <AudioWaveformVisualizer isPlaying={isPlaying} barColor="#B88500" className="scale-150" />
        </div>

        <h3 className="text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-3">
          {track.title}
        </h3>

        <p className="text-sm font-medium text-[#B88500] dark:text-[#FFD54F] mt-1">
          {track.narratorOrCantor}
        </p>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-blue-300">
            {track.categoryName}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: divisionInfo.accentColor }}
          >
            {divisionInfo.titleAmharic}
          </span>
        </div>

        {track.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-serif-ethiopic italic mt-3 px-4">
            «{track.description}»
          </p>
        )}

        {/* Progress Slider */}
        <div className="mt-6 px-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full accent-[#B88500] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{timeFormatted}</span>
            <span>{track.durationAmharic}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={() => onSeek(Math.max(0, progress - 0.1))}
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            title="-15 ሰከንድ"
          >
            <Rewind className="w-4 h-4 mr-0.5" />
          </button>

          <button
            onClick={onTogglePlayPause}
            className="w-16 h-16 rounded-full bg-[#B88500] hover:bg-[#966C00] text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
          </button>

          <button
            onClick={() => onSeek(Math.min(1, progress + 0.1))}
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            title="+15 ሰከንድ"
          >
            <FastForward className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuickWorkPreviewModal: React.FC<{
  isOpen: boolean;
  work: WorkItem | null;
  onDismiss: () => void;
  onOpenFullDetail: (workId: string) => void;
  onPlayAudio: (work: WorkItem) => void;
  onToggleBookmark: (workId: string) => void;
}> = ({ isOpen, work, onDismiss, onOpenFullDetail, onPlayAudio, onToggleBookmark }) => {
  if (!isOpen || !work) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#111D30] border-2 border-[#B88500]/40 p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
              {work.categoryName}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-blue-300">
              {DIVISIONS[work.division].titleAmharic}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBookmark(work.id)}
              className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                work.isBookmarked ? 'text-[#B88500]' : 'text-slate-400'
              }`}
              title="ዕልባት"
            >
              <Bookmark className={`w-5 h-5 ${work.isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-3">
          {work.title}
        </h3>

        <p className="text-xs text-[#0C4A9E] dark:text-blue-400 font-medium mt-1">
          ፀሐፊ፦ {work.writerName} • {work.dateAmharic} • የንባብ ቆይታ፦ {work.readTime}
        </p>

        {/* Excerpt card */}
        <div className="mt-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[#B88500]/30 font-serif-ethiopic text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
          « {work.excerpt} »
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => {
              onPlayAudio(work);
              onDismiss();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#B88500] hover:bg-[#966C00] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>በድምፅ አድምጥ</span>
          </button>

          <button
            onClick={() => {
              onDismiss();
              onOpenFullDetail(work.id);
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ሙሉውን አንብብ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
