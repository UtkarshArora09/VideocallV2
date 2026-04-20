import React from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import VideoTile from './VideoTile';

export default function VideoGrid({ peerStates }) {
  const cameraTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  return (
    <div className="flex-1 w-full h-full p-4">
      <div className={`w-full h-full grid gap-4 grid-cols-1 md:grid-cols-${Math.min(cameraTracks.length, 2)} ${cameraTracks.length > 2 ? 'md:grid-rows-2' : ''}`}>
        {cameraTracks.map((trackRef) => (
          <VideoTile 
            key={trackRef.participant.identity + trackRef.source}
            trackRef={trackRef}
            participant={trackRef.participant}
            isLocal={trackRef.participant.isLocal}
            peerStates={peerStates}
          />
        ))}
      </div>
    </div>
  );
}
