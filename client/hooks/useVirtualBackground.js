import { useState, useEffect, useRef } from 'react';
import * as Comlink from 'comlink';

export function useVirtualBackground(localStream) {
  const [mode, setMode] = useState('none'); // 'none', 'blur', 'image'
  const [bgImage, setBgImage] = useState(null);
  const [processedStream, setProcessedStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef(null);
  const processorRef = useRef(null);
  const canvasRef = useRef(null);
  const sourceVideoRef = useRef(null);

  useEffect(() => {
    // initialize worker
    const worker = new Worker(new URL('../workers/bgWorker.js', import.meta.url), { type: 'module' });
    const api = Comlink.wrap(worker);
    workerRef.current = api;
    
    api.init().then(() => setIsReady(true)).catch(e => console.error('Virtual BG init error:', e));

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (!localStream || !isReady) {
      if (!localStream) setProcessedStream(null);
      return;
    }

    if (mode === 'none') {
      setProcessedStream(localStream);
      return;
    }

    // Set up processing loops
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvasRef.current = { canvas, ctx };

    const video = document.createElement('video');
    video.srcObject = localStream;
    video.playsInline = true;
    video.muted = true;
    video.play();
    sourceVideoRef.current = video;

    const outStream = canvas.captureStream(15);

    // Muted tracks / audio tracks should be copied over from localStream
    localStream.getAudioTracks().forEach(t => outStream.addTrack(t));

    setProcessedStream(outStream);

    let animationId;
    const processFrame = async () => {
      if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.videoWidth > 0 && mode !== 'none') {
        // Draw video frame to get imageData
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const maskData = await workerRef.current.segment(imageData);
          if (maskData) {
            // Draw original background based on mode
            if (mode === 'blur') {
              ctx.filter = 'blur(10px)';
              ctx.drawImage(video, 0, 0);
              ctx.filter = 'none';
            } else if (mode === 'image' && bgImage) {
              // Ensure bgImage is loaded (HTMLImageElement)
              ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            } else {
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw person
            const tempMaskCanvas = document.createElement('canvas');
            tempMaskCanvas.width = canvas.width;
            tempMaskCanvas.height = canvas.height;
            const tempMaskCtx = tempMaskCanvas.getContext('2d');
            tempMaskCtx.putImageData(maskData, 0, 0);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(tempMaskCanvas, 0, 0); // cut out the person from background

            // Now composite original video on top, but masked
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(video, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
          }
        } catch(e) {
             // Fallback pass-through
             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }

      // 15 FPS Loop
      setTimeout(() => {
        animationId = requestAnimationFrame(processFrame);
      }, 1000 / 15);
    };

    video.onloadedmetadata = () => {
        processFrame();
    };

    return () => {
      cancelAnimationFrame(animationId);
      video.pause();
      video.srcObject = null;
    };
  }, [localStream, mode, isReady, bgImage]);

  return { processedStream, mode, setMode, setBgImage, isReady };
}
