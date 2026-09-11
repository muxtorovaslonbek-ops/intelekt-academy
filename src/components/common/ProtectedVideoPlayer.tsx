import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle } from 'lucide-react';

interface ProtectedVideoPlayerProps {
  videoId?: string;
  libraryId?: string;
  directUrl?: string;
  onEnded?: () => void;
  onCompleted?: () => void;
  isCompleted?: boolean;
  title?: string;
  duration?: string;
  currentUser?: any;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  videoId,
  libraryId = '380785',
  directUrl,
  onEnded,
  onCompleted,
  isCompleted,
}) => {
  const { user, profile, currentUser } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [directVideoFailed, setDirectVideoFailed] = useState(false);

  const activeVideoId = videoId || '';
  const activeLibraryId = libraryId || '';

  // Bunny.net iframe URL with secure parameters
  const bunnyUrl = `https://iframe.mediadelivery.net/embed/${activeLibraryId}/${activeVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;

  const handleEnd = () => {
    if (onEnded) onEnded();
    if (onCompleted) onCompleted();
  };

  const displayName =
    profile?.first_name ||
    currentUser?.firstName ||
    user?.email ||
    currentUser?.email ||
    'Himoyalangan Ta\'lim';

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-slate-800">
      {/* Dynamic Watermark (Ekran yozib olishni qiyinlashtiruvchi dinamik suv belgisi) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md">
          <ShieldAlert className="w-3 h-3 text-indigo-400" />
          <span>{displayName}</span>
        </div>
      </div>

      {/* Direct Video or Bunny.net Player */}
      {directUrl && !directVideoFailed ? (
        <video
          ref={videoRef}
          src={directUrl}
          controls
          controlsList="nodownload"
          onEnded={handleEnd}
          onError={() => setDirectVideoFailed(true)}
          className="w-full h-full object-contain pointer-events-auto bg-black"
        />
      ) : activeVideoId && activeLibraryId ? (
        <iframe
          ref={iframeRef}
          src={bunnyUrl}
          loading="lazy"
          className="w-full h-full border-0 pointer-events-auto"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onEnded={handleEnd}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          {directUrl ? 'Video formatini brauzer ocholmadi yoki fayl URL manzili ishlamayapti.' : 'Ushbu dars uchun Bunny video sozlanmagan.'}
        </div>
      )}

      {/* Context Menu / Download Disable Shield */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Completion Overlay Banner */}
      {isCompleted && (
        <div className="absolute top-4 left-4 z-20 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Dars bajarilgan</span>
        </div>
      )}
    </div>
  );
};

export default ProtectedVideoPlayer;
