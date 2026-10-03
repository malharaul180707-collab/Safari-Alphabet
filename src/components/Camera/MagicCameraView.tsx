import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  PenTool,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  SwitchCamera,
  RefreshCw,
  Star,
  ArrowRight,
  Eye,
  Eraser,
  HelpCircle,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeLevel } from '../../types';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LETTER_STROKES } from '../../data/letterStrokes';
import { speech, sfx } from '../../utils/audio';
import { useStudent } from '../../context/StudentContext';

interface MagicCameraViewProps {
  grade: GradeLevel;
  presetLetter?: string;
}

interface AnalysisResult {
  detectedText: string;
  isLetterOrWord: boolean;
  matchesTarget: boolean;
  shapeQuality: 'superstar' | 'great_try' | 'wrong_letter' | 'needs_practice';
  encouragement: string;
  strokeTips: string;
  starsAwarded: number;
  xpAwarded: number;
  funReactionEmoji: string;
}

export const MagicCameraView: React.FC<MagicCameraViewProps> = ({
  grade,
  presetLetter,
}) => {
  const { recordActivityResult, markLetterMastered } = useStudent();

  // Mode: 'camera' or 'canvas'
  const [inputMode, setInputMode] = useState<'camera' | 'canvas'>('camera');
  const [targetType, setTargetType] = useState<'letter' | 'word' | 'free'>('letter');
  const [selectedLetter, setSelectedLetter] = useState<string>(presetLetter || 'A');
  const [selectedWord, setSelectedWord] = useState<string>('CAT');

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Digital drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2563EB'); // Artist Blue
  const [brushSize, setBrushSize] = useState(8);
  const [hasDrawn, setHasDrawn] = useState(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Active target metadata
  const currentAlphabetItem = ALPHABET_DATA.find((a) => a.letter === selectedLetter) || ALPHABET_DATA[0];
  const strokeGuide = LETTER_STROKES[selectedLetter] || {
    letter: selectedLetter,
    name: 'Letter Form',
    shapeDescription: `Make the shape of letter ${selectedLetter}`,
    steps: ['Draw clean lines from top to bottom'],
  };

  const gradeWordsList = ['CAT', 'DOG', 'SUN', 'BUS', 'HAT', 'FISH', 'STAR', 'TREE'];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    try {
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Live webcam streaming is not supported by this browser or window. You can use "Take or Upload Photo" below, or the Drawing Pad!'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: unknown) {
      console.warn('Camera access unavailable:', err);
      const errorName = err instanceof Error ? err.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was blocked. Check your browser address bar (lock 🔒 or camera icon) to allow camera access, then tap Try Again.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError(
          'No camera detected on this device. You can snap or upload a photo of your drawing, or use the Drawing Pad!'
        );
      } else {
        setCameraError(
          'Live camera stream is unavailable in this view. Tap "Take or Upload Photo" below to snap with your camera, or use the Drawing Pad!'
        );
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sfx.playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to reasonable dimensions for quick analysis
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          analyzeImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
      initDrawingCanvas();
    }
    return () => stopCamera();
  }, [inputMode, facingMode]);

  // Read spoken mission cue on change
  useEffect(() => {
    const promptText =
      targetType === 'letter'
        ? `Mission: Draw letter ${selectedLetter}! ${strokeGuide.shapeDescription}`
        : targetType === 'word'
        ? `Mission: Draw or write the word ${selectedWord}!`
        : 'Free draw: Draw any letter or word you want to test!';

    const timer = setTimeout(() => {
      speech.speakText(promptText);
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedLetter, selectedWord, targetType]);

  // Snapshot with 3s countdown
  const capturePhotoWithCountdown = () => {
    sfx.playPop();
    setCountdown(3);
    speech.speakText('3... 2... 1... Steady!');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedImage(dataUrl);
    sfx.playPop();
    analyzeImage(dataUrl);
  };

  // Canvas drawing handlers
  const initDrawingCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCanvasCoordinates(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const submitDrawingCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    sfx.playPop();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    analyzeImage(dataUrl);
  };

  // Send drawing to AI recognition endpoint
  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    speech.speakText("Analyzing your letter strokes and shapes...");

    try {
      const response = await fetch('/api/analyze-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          targetLetter: targetType === 'letter' ? selectedLetter : undefined,
          targetWord: targetType === 'word' ? selectedWord : undefined,
          mode: targetType,
          grade,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const res: AnalysisResult = data.analysis;
        setAnalysisResult(res);

        // STRICT ACCURACY VALIDATION:
        // Only reward if matchesTarget is true!
        if (res.matchesTarget && res.starsAwarded > 0) {
          sfx.playFanfare();
          try {
            confetti({
              particleCount: 70,
              spread: 65,
              origin: { y: 0.6 },
              colors: ['#D97706', '#10B981', '#3B82F6', '#8B5CF6'],
            });
          } catch {
            // ignore
          }

          if (targetType === 'letter') {
            markLetterMastered(selectedLetter);
          }

          recordActivityResult(
            `Magic Camera: Letter ${selectedLetter}`,
            res.starsAwarded,
            3,
            res.starsAwarded
          );
        } else {
          // MISMATCH / WRONG SHAPE DETECTED:
          // Play gentle corrective sound, NO confetti, NO mastery awarded
          sfx.playWrong();
          recordActivityResult(
            `Camera Practice: Letter ${selectedLetter}`,
            0,
            3,
            0
          );
        }

        setTimeout(() => {
          speech.speakText(res.encouragement);
        }, 400);
      }
    } catch (err) {
      console.error('Drawing recognition failed:', err);
      sfx.playWrong();
      setAnalysisResult({
        detectedText: '',
        isLetterOrWord: false,
        matchesTarget: false,
        shapeQuality: 'needs_practice',
        encouragement: `Let's try drawing letter ${selectedLetter} once more with clear lighting!`,
        strokeTips: strokeGuide.shapeDescription,
        starsAwarded: 0,
        xpAwarded: 0,
        funReactionEmoji: '✏️',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextChallenge = () => {
    sfx.playPop();
    setCapturedImage(null);
    setAnalysisResult(null);

    if (targetType === 'letter') {
      const currentIndex = ALPHABET_DATA.findIndex((a) => a.letter === selectedLetter);
      const nextLetter = ALPHABET_DATA[(currentIndex + 1) % ALPHABET_DATA.length].letter;
      setSelectedLetter(nextLetter);
    }

    if (inputMode === 'canvas') {
      initDrawingCanvas();
    }
  };

  const handleRetake = () => {
    sfx.playPop();
    setCapturedImage(null);
    setAnalysisResult(null);
    if (inputMode === 'canvas') {
      initDrawingCanvas();
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      
      {/* Refined Montessori-Inspired Header Banner */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-display font-bold text-lg border border-amber-500/20">
                📸
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 tracking-tight">
                Letter Shape Studio & Camera
              </h2>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl font-sans">
              Draw on paper and hold it up to your camera, or sketch on screen. AI checks your strokes and guides your handwriting.
            </p>
          </div>

          {/* Elegant Segmented Mode Switcher */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                sfx.playPop();
                setInputMode('camera');
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all ${
                inputMode === 'camera'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-700" />
              <span>Camera View</span>
            </button>

            <button
              onClick={() => {
                sfx.playPop();
                setInputMode('canvas');
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all ${
                inputMode === 'canvas'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenTool className="w-4 h-4 text-amber-700" />
              <span>Drawing Pad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Mission & Stroke Guide Deck */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        
        {/* Top Control Bar: Mode (Letter / Word / Free) + Speech */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Exercise:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  sfx.playPop();
                  setTargetType('letter');
                  setCapturedImage(null);
                  setAnalysisResult(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all ${
                  targetType === 'letter' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Alphabet Letter
              </button>
              <button
                onClick={() => {
                  sfx.playPop();
                  setTargetType('word');
                  setCapturedImage(null);
                  setAnalysisResult(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all ${
                  targetType === 'word' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Simple Word
              </button>
              <button
                onClick={() => {
                  sfx.playPop();
                  setTargetType('free');
                  setCapturedImage(null);
                  setAnalysisResult(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all ${
                  targetType === 'free' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Free Draw (Guess)
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playPop();
              const txt =
                targetType === 'letter'
                  ? `Letter ${selectedLetter}: ${strokeGuide.shapeDescription}`
                  : targetType === 'word'
                  ? `Write the word ${selectedWord} clearly!`
                  : 'Draw any letter on paper or screen to see if the camera recognizes it.';
              speech.speakText(txt);
            }}
            className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-semibold border border-amber-200 self-start sm:self-auto transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Hear Shape Guide</span>
          </button>
        </div>

        {/* Letter Selector Pills */}
        {targetType === 'letter' && (
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {ALPHABET_DATA.map((item) => {
                const isSelected = item.letter === selectedLetter;
                return (
                  <button
                    key={item.letter}
                    onClick={() => {
                      sfx.playPop();
                      setSelectedLetter(item.letter);
                      setCapturedImage(null);
                      setAnalysisResult(null);
                      if (inputMode === 'canvas') initDrawingCanvas();
                    }}
                    className={`w-9 h-11 sm:w-10 sm:h-12 shrink-0 rounded-xl font-display font-bold text-base flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs scale-105'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
                    }`}
                  >
                    <span>{item.letter}</span>
                    <span className="text-[10px] -mt-1 opacity-70">{item.lowercase}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Word Selector */}
        {targetType === 'word' && (
          <div className="flex flex-wrap gap-2">
            {gradeWordsList.map((w) => {
              const isSelected = w === selectedWord;
              return (
                <button
                  key={w}
                  onClick={() => {
                    sfx.playPop();
                    setSelectedWord(w);
                    setCapturedImage(null);
                    setAnalysisResult(null);
                    if (inputMode === 'canvas') initDrawingCanvas();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        )}

        {/* Pedagogical Shape Reference Card */}
        {targetType === 'letter' && (
          <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 text-stone-900 font-display font-bold text-3xl flex items-center justify-center shadow-xs">
                {selectedLetter}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-base text-stone-900">
                    Shape: {strokeGuide.name}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    ({currentAlphabetItem.exampleWord})
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {strokeGuide.shapeDescription}
                </p>
              </div>
            </div>

            {/* Stroke Steps */}
            <div className="flex flex-wrap sm:flex-col gap-1 text-[11px] text-stone-700 bg-white px-3 py-2 rounded-xl border border-stone-200/70">
              {strokeGuide.steps.map((step, idx) => (
                <span key={idx} className="font-medium">
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-5 sm:p-7">
        
        {/* WEBCAM CAMERA VIEW */}
        {inputMode === 'camera' && (
          <div className="space-y-4">
            {/* Hidden file input for mobile camera snap or image upload fallback */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {cameraError ? (
              <div className="bg-[#FAF8F5] border border-amber-300 rounded-3xl p-6 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 text-xl">
                  📷
                </div>
                <h4 className="font-display font-bold text-base text-stone-900 mb-1">
                  Camera Access Info
                </h4>
                <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                  {cameraError}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={startCamera}
                    className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Allow & Try Again</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap / Upload Photo</span>
                  </button>

                  <button
                    onClick={() => setInputMode('canvas')}
                    className="w-full sm:w-auto bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-4 py-2.5 rounded-xl font-display font-semibold text-xs transition-colors"
                  >
                    Use Drawing Pad
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden bg-stone-900 border-2 border-stone-300 aspect-4/3 max-w-xl mx-auto shadow-inner flex items-center justify-center">
                
                {/* Live Video */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Minimalist Frosted Viewfinder Frame */}
                <div className="absolute inset-5 sm:inset-7 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="text-center">
                    <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full">
                      Align drawing of "{targetType === 'letter' ? selectedLetter : selectedWord}" in this frame
                    </span>
                  </div>

                  <div className="flex justify-between text-white/60 text-lg px-1">
                    <span>+</span>
                    <span>+</span>
                  </div>
                </div>

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                    <span className="font-display font-bold text-7xl text-amber-300 animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Flip camera control */}
                <button
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                  title="Switch Front/Back Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )}

            {!cameraError && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={capturePhotoWithCountdown}
                  disabled={isAnalyzing || countdown !== null}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-2xl font-display font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-98 transition-all"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>Scan Live Viewfinder</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 px-4 py-2.5 rounded-2xl font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Upload or Take Photo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ARTIST'S SKETCHBOOK DRAWING PAD */}
        {inputMode === 'canvas' && (
          <div className="space-y-4 max-w-xl mx-auto">
            
            {/* Minimalist Crayon Palette */}
            <div className="flex items-center justify-between flex-wrap gap-2 bg-[#FAF8F5] p-2.5 rounded-2xl border border-stone-200">
              
              <div className="flex items-center gap-2">
                {[
                  { color: '#2563EB', name: 'Blue' },
                  { color: '#DC2626', name: 'Red' },
                  { color: '#059669', name: 'Forest' },
                  { color: '#D97706', name: 'Ochre' },
                  { color: '#1C1917', name: 'Charcoal' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => {
                      sfx.playPop();
                      setBrushColor(c.color);
                    }}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      brushColor === c.color ? 'scale-125 ring-2 ring-stone-400 border-white shadow-xs' : 'border-stone-300 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sfx.playPop();
                    setBrushColor('#FFFFFF');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                    brushColor === '#FFFFFF' ? 'bg-white border-stone-400 text-stone-900' : 'bg-transparent border-transparent text-stone-600 hover:bg-stone-200/60'
                  }`}
                  title="Eraser"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>

                <button
                  onClick={() => {
                    sfx.playPop();
                    initDrawingCanvas();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors flex items-center gap-1"
                  title="Clear Canvas"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

            </div>

            {/* Canvas Surface */}
            <div className="relative rounded-3xl overflow-hidden bg-white border border-stone-300 shadow-xs aspect-4/3 flex items-center justify-center cursor-crosshair">
              
              <canvas
                ref={drawingCanvasRef}
                width={560}
                height={420}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full touch-none"
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-stone-300">
                  <PenTool className="w-8 h-8 mb-1.5 opacity-40" />
                  <p className="font-display font-medium text-xs sm:text-sm text-stone-400">
                    Draw letter "{selectedLetter}" inside the canvas
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={submitDrawingCanvas}
                disabled={!hasDrawn || isAnalyzing}
                className={`px-6 py-2.5 rounded-2xl font-display font-semibold text-sm flex items-center gap-2 shadow-xs transition-all ${
                  hasDrawn
                    ? 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer active:scale-98'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Evaluate My Drawing</span>
              </button>
            </div>

          </div>
        )}

        {/* LOADING STATE */}
        {isAnalyzing && (
          <div className="mt-6 bg-[#FAF8F5] rounded-2xl p-6 text-center border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white mx-auto flex items-center justify-center mb-2 shadow-xs animate-spin">
              <Eye className="w-5 h-5" />
            </div>
            <p className="font-display font-semibold text-sm text-stone-900">
              Evaluating stroke geometry and letter recognition...
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              Checking lines, curves, and angles
            </p>
          </div>
        )}

        {/* EVALUATION FEEDBACK & COMPARISON RESULT */}
        {analysisResult && !isAnalyzing && (
          <div
            className={`mt-6 rounded-3xl p-6 border transition-all ${
              analysisResult.matchesTarget
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            {/* Header: Target vs Detected Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
              
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    analysisResult.matchesTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {analysisResult.matchesTarget ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <XCircle className="w-6 h-6 text-amber-700" />
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    {analysisResult.matchesTarget
                      ? `Letter "${selectedLetter}" Formed Successfully!`
                      : `Letter Mismatch Detected`}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    {analysisResult.matchesTarget
                      ? 'The camera recognized your letter shape and proportions.'
                      : analysisResult.detectedText
                      ? `Camera detected: "${analysisResult.detectedText}", but target was: "${selectedLetter}".`
                      : 'The strokes were not recognizable as the target letter.'}
                  </p>
                </div>
              </div>

              {/* Stars Display */}
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= analysisResult.starsAwarded
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-100 text-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* SIDE-BY-SIDE COMPARISON (Shown especially on Mismatch!) */}
            {!analysisResult.matchesTarget && (
              <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Detected Shape */}
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    What was detected
                  </span>
                  <div className="text-3xl font-display font-bold text-stone-800 my-1">
                    {analysisResult.detectedText || 'Unclear Shape'}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {analysisResult.detectedText
                      ? `Looks like letter ${analysisResult.detectedText}`
                      : 'Needs clearer strokes and lighting'}
                  </p>
                </div>

                {/* Target Shape & Guide */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-center">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                    Target letter to draw
                  </span>
                  <div className="text-3xl font-display font-bold text-emerald-700 my-1">
                    {selectedLetter}
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">
                    {strokeGuide.name}
                  </p>
                </div>

              </div>
            )}

            {/* Teacher Encouragement & Stroke Tip */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 my-3.5 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">💬</span>
                <div>
                  <p className="text-xs sm:text-sm font-display font-semibold text-stone-900 leading-snug">
                    "{analysisResult.encouragement}"
                  </p>
                </div>
              </div>

              {analysisResult.strokeTips && (
                <div className="pt-2 border-t border-stone-100 flex items-start gap-2">
                  <span className="text-base mt-0.5">✏️</span>
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Shape Formation Tip:
                    </span>
                    <p className="text-xs text-stone-600 font-medium">
                      {analysisResult.strokeTips}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* XP & Rewards (Only if matchesTarget) */}
            {analysisResult.matchesTarget && analysisResult.xpAwarded > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 bg-emerald-100/60 px-3 py-2 rounded-xl border border-emerald-200 mb-4">
                <span>+{analysisResult.xpAwarded} XP Recorded</span>
                <span>+{analysisResult.starsAwarded} Stars Added to Profile</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetake}
                className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 py-2 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-stone-500" />
                <span>Try Drawing {selectedLetter} Again</span>
              </button>

              {analysisResult.matchesTarget && (
                <button
                  onClick={handleNextChallenge}
                  className="bg-stone-900 hover:bg-stone-800 text-white py-2 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Letter Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
