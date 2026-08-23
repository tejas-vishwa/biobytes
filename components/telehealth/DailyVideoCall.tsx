"use client";

import { useEffect, useState, useCallback } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { DailyProvider, useDaily, useNetwork, useLocalSessionId, useParticipantIds, useVideoTrack, useAudioTrack } from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle } from "lucide-react";

interface DailyVideoCallProps {
  roomUrl: string;
  token: string;
  onLeave: () => void;
  isDoctor?: boolean;
}

export function DailyVideoCall({ roomUrl, token, onLeave, isDoctor = false }: DailyVideoCallProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomUrl || !token) return;

    // Prevent multiple instances
    if (callObject) return;

    const newCallObject = DailyIframe.createCallObject({
      videoSource: true,
      audioSource: true,
    });

    setCallObject(newCallObject);

    newCallObject.join({ url: roomUrl, token }).catch((err) => {
      console.error("Error joining Daily room", err);
      setError("Failed to join the video call. Please check your camera permissions.");
    });

    return () => {
      newCallObject.leave().then(() => {
        newCallObject.destroy();
      });
    };
  }, [roomUrl, token]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-100 rounded-lg p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button onClick={onLeave} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!callObject) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <CallUI onLeave={onLeave} isDoctor={isDoctor} />
    </DailyProvider>
  );
}

function CallUI({ onLeave, isDoctor }: { onLeave: () => void, isDoctor: boolean }) {
  const callObject = useDaily();
  const network = useNetwork();
  const localSessionId = useLocalSessionId();
  const participantIds = useParticipantIds();

  // The local participant is always included in participantIds, so remote participants are the others
  const remoteParticipantIds = participantIds.filter((id) => id !== localSessionId);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMic = useCallback(() => {
    if (!callObject) return;
    const currentAudio = callObject.localAudio();
    callObject.setLocalAudio(!currentAudio);
    setIsMuted(currentAudio);
  }, [callObject]);

  const toggleVideo = useCallback(() => {
    if (!callObject) return;
    const currentVideo = callObject.localVideo();
    callObject.setLocalVideo(!currentVideo);
    setIsVideoOff(currentVideo);
  }, [callObject]);

  const handleLeave = useCallback(() => {
    if (callObject) {
      callObject.leave();
    }
    onLeave();
  }, [callObject, onLeave]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col">
      {/* Network Quality Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center backdrop-blur-sm">
        <div className={`w-2 h-2 rounded-full mr-2 ${Number(network?.quality) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {Number(network?.quality) > 80 ? 'Good Connection' : 'Checking Connection...'}
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 flex gap-4 items-center justify-center">
        {/* Remote Video (Full size if 1-on-1, or grid if multiple) */}
        {remoteParticipantIds.length > 0 ? (
          remoteParticipantIds.map((id) => (
            <ParticipantTile key={id} participantId={id} isLocal={false} />
          ))
        ) : (
          <div className="text-white/50 text-lg flex flex-col items-center space-y-4">
            <div className="animate-pulse flex items-center justify-center w-16 h-16 rounded-full bg-white/10">
              <UserIcon className="w-8 h-8" />
            </div>
            <p>Waiting for {isDoctor ? 'patient' : 'doctor'} to join...</p>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {localSessionId && (
          <div className={`absolute ${remoteParticipantIds.length > 0 ? 'bottom-20 right-4 w-48 h-32' : 'inset-4 w-full h-full relative'} transition-all duration-300 rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-black`}>
            <ParticipantTile participantId={localSessionId} isLocal={true} />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
              You {isMuted && '(Muted)'}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-16 bg-black/80 backdrop-blur-md flex items-center justify-center space-x-4 px-4 z-20">
        <Button 
          variant="secondary" 
          size="icon" 
          className={`rounded-full h-10 w-10 ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          onClick={toggleMic}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className={`rounded-full h-10 w-10 ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        <Button 
          variant="destructive" 
          className="rounded-full px-6 font-medium"
          onClick={handleLeave}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          {isDoctor ? 'End Call & Generate Rx' : 'Leave Call'}
        </Button>
      </div>
    </div>
  );
}

function ParticipantTile({ participantId, isLocal }: { participantId: string, isLocal: boolean }) {
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-black rounded-lg overflow-hidden">
      {videoTrack.persistentTrack ? (
        <DailyVideo track={videoTrack.persistentTrack} isLocal={isLocal} />
      ) : (
        <div className="bg-slate-800 w-full h-full flex items-center justify-center">
          <UserIcon className="text-slate-600 w-16 h-16" />
        </div>
      )}
      {!isLocal && audioTrack.persistentTrack && (
        <DailyAudio track={audioTrack.persistentTrack} />
      )}
    </div>
  );
}

// Helpers for actual HTML5 media elements
function DailyVideo({ track, isLocal }: { track: MediaStreamTrack, isLocal: boolean }) {
  return (
    <video
      autoPlay
      muted
      playsInline
      className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
      ref={(videoEl) => {
        if (videoEl && track) {
          if (!videoEl.srcObject) {
            videoEl.srcObject = new MediaStream([track]);
          }
        }
      }}
    />
  );
}

function DailyAudio({ track }: { track: MediaStreamTrack }) {
  return (
    <audio
      autoPlay
      playsInline
      ref={(audioEl) => {
        if (audioEl && track) {
          if (!audioEl.srcObject) {
            audioEl.srcObject = new MediaStream([track]);
          }
        }
      }}
    />
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );
}
