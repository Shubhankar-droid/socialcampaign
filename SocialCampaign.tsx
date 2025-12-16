import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Video, Upload, Instagram, Check, Gift, Share2, Camera, StopCircle, Play, RotateCcw, Sparkles, PartyPopper, Star, TreePine, Snowflake as SnowflakeIcon, Info } from "lucide-react";
import downtown30Logo from "@/assets/downtown30-logo-new.png";
import mcdonaldsLogo from "@/assets/mcdonalds-logo.jpg";
import mcdonaldsArches from "@/assets/mcdonalds-arches.png";
import eatgoodLogo from "@/assets/eatgood-logo-new.png";

const INSTAGRAM_PAGE = "https://instagram.com/downtown.30";
const INSTAGRAM_HANDLE = "@downtown.30";

// Confetti/celebration component with variety
const Confetti = ({ style, variant }: { style: React.CSSProperties; variant: number }) => {
  const celebrationChars = ['🎉', '🎊', '✨', '⭐', '🌟', '🎁', '🥳', '🎈', '💫', '🎀'];
  return (
    <div 
      className="absolute pointer-events-none animate-fall select-none"
      style={style}
    >
      {celebrationChars[variant % celebrationChars.length]}
    </div>
  );
};

// Floating logo component
const FloatingLogo = ({ src, alt, className, size = "h-12" }: { src: string; alt: string; className: string; size?: string }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`absolute pointer-events-none ${size} object-contain drop-shadow-2xl ${className}`}
  />
);

const SocialCampaign = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confetti, setConfetti] = useState<Array<{ id: number; style: React.CSSProperties; variant: number }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instagramHandle: "",
    permissionGranted: false,
    alreadyFollowing: false,
    hasSharedPage: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCriteria, setShowCriteria] = useState(true);

  // Track mouse for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate confetti
  useEffect(() => {
    const generateConfetti = () => {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        variant: Math.floor(Math.random() * 10),
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 4 + 5}s`,
          animationDelay: `${Math.random() * 4}s`,
          fontSize: `${Math.random() * 20 + 14}px`,
          opacity: Math.random() * 0.5 + 0.5,
        } as React.CSSProperties,
      }));
      setConfetti(pieces);
    };
    generateConfetti();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record a video.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedVideo(blob);
      setRecordedVideoUrl(URL.createObjectURL(blob));
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setRecordedVideoUrl(null);
    setUploadedVideo(null);
    setUploadedVideoUrl(null);
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a video under 100MB.",
          variant: "destructive",
        });
        return;
      }
      setUploadedVideo(file);
      setUploadedVideoUrl(URL.createObjectURL(file));
      setRecordedVideo(null);
      setRecordedVideoUrl(null);
    }
  };

  const handleShareInstagram = () => {
    window.open(INSTAGRAM_PAGE, "_blank");
    setFormData((prev) => ({ ...prev, hasSharedPage: true }));
    toast({
      title: "Great! 🎄",
      description: "Follow us and come back to complete your entry!",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recordedVideo && !uploadedVideo) {
      toast({
        title: "No Video",
        description: "Please record or upload a video first.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.permissionGranted) {
      toast({
        title: "Permission Required",
        description: "Please grant permission to share your video on social media.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.alreadyFollowing && !formData.hasSharedPage) {
      toast({
        title: "Follow Required",
        description: "Please follow us on Instagram or share our page to be eligible for the lucky draw.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: "Submission Successful! 🎉🎄",
      description: "You're now in the Christmas & New Year Lucky Draw!",
    });
  };

  const currentVideo = recordedVideoUrl || uploadedVideoUrl;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1IMjR2LTJoMTJ6bTAtNFYyOEgyNHYyaDF6bS0xNiA4di0yaDJ2MmgtMnptMTggMHYtMmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        {/* Confetti */}
        {confetti.map((piece) => (
          <Confetti key={piece.id} style={piece.style} variant={piece.variant} />
        ))}
        
        {/* Floating brand logos */}
        <FloatingLogo src={mcdonaldsArches} alt="McDonald's" className="top-10 left-10 animate-float opacity-40" size="h-16" />
        <FloatingLogo src={eatgoodLogo} alt="Eatgood" className="top-20 right-16 animate-float-delayed opacity-40" size="h-14" />
        <FloatingLogo src={downtown30Logo} alt="Downtown 30" className="bottom-20 left-20 animate-float opacity-40" size="h-12" />
        <FloatingLogo src={mcdonaldsArches} alt="McDonald's" className="bottom-16 right-10 animate-float-delayed opacity-40" size="h-14" />
        
        <Card className="max-w-lg w-full text-center shadow-[0_0_100px_rgba(255,255,255,0.4)] border-2 border-white/60 bg-white/95 backdrop-blur-xl animate-scale-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-amber-500/10" />
          <CardHeader className="relative z-10">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_60px_rgba(255,100,150,0.5)] animate-pulse-glow">
              <PartyPopper className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            <CardTitle className="text-4xl text-gray-800 font-black tracking-tight">Woohoo! 🎉🥳</CardTitle>
            <CardDescription className="text-xl text-gray-600 mt-2">
              You're now in our <span className="text-pink-600 font-bold">New Year 2026 Celebration</span> Lucky Draw!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Brand logos showcase */}
            <div className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-pink-50 to-amber-50 rounded-2xl border border-pink-200">
              <img src={downtown30Logo} alt="Downtown 30" className="h-14 object-contain drop-shadow-lg hover:scale-110 transition-transform" />
              <span className="text-3xl font-black text-pink-500 animate-pulse">×</span>
              <img src={mcdonaldsArches} alt="McDonald's" className="h-14 object-contain drop-shadow-lg hover:scale-110 transition-transform" />
              <span className="text-3xl font-black text-pink-500 animate-pulse">×</span>
              <img src={eatgoodLogo} alt="Eatgood" className="h-12 object-contain drop-shadow-lg hover:scale-110 transition-transform" />
            </div>
            <p className="text-gray-700 text-lg">
              We'll tag you at <span className="font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded">@{formData.instagramHandle}</span>
            </p>
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 rounded-xl p-4 border border-orange-200">
              <p className="text-orange-700 font-bold flex items-center justify-center gap-3 text-lg">
                <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                Winners announced on New Year 2026!
                <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:from-pink-600 hover:via-rose-600 hover:to-orange-600 text-white font-bold text-lg py-6 shadow-lg hover:shadow-pink-500/30 transition-all hover:scale-[1.02]"
            >
              Submit Another Video 🎬✨
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 relative overflow-hidden">
      {/* Custom styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(720deg); }
        }
        .animate-fall { animation: fall linear infinite; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(-3deg); } 50% { transform: translateY(-25px) rotate(3deg); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        @keyframes float-delayed { 0%, 100% { transform: translateY(-10px) rotate(3deg); } 50% { transform: translateY(15px) rotate(-3deg); } }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; }
        
        @keyframes pulse-glow { 
          0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2); }
          50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.3); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        
        @keyframes bounce-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,215,0,0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,215,0,0.8)); }
        }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }
        @keyframes shine { 0% { left: -50%; } 100% { left: 150%; } }
      `}</style>

      {/* Animated pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTYgOHYtMmgydjJoLTJ6bTE4IDB2LTJoMnYyaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {/* Confetti */}
      {confetti.map((piece) => (
        <Confetti key={piece.id} style={piece.style} variant={piece.variant} />
      ))}

      {/* Floating brand logos in background */}
      <FloatingLogo src={mcdonaldsArches} alt="McDonald's" className="top-[15%] left-[5%] animate-float opacity-15 hidden md:block" size="h-20" />
      <FloatingLogo src={eatgoodLogo} alt="Eatgood" className="top-[25%] right-[8%] animate-float-delayed opacity-15 hidden md:block" size="h-16" />
      <FloatingLogo src={mcdonaldsArches} alt="McDonald's" className="bottom-[35%] left-[8%] animate-float-delayed opacity-10 hidden md:block" size="h-14" />
      <FloatingLogo src={eatgoodLogo} alt="Eatgood" className="bottom-[20%] right-[5%] animate-float opacity-15 hidden md:block" size="h-18" />
      <FloatingLogo src={downtown30Logo} alt="Downtown 30" className="top-[60%] left-[3%] animate-float opacity-10 hidden lg:block" size="h-12" />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-pink-200 sticky top-0 z-50 shadow-[0_4px_30px_rgba(255,100,150,0.2)]">
        <div className="container mx-auto px-4 py-4">
          {/* Main brand showcase */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <img src={downtown30Logo} alt="Downtown 30" className="h-10 md:h-14 object-contain drop-shadow-lg hover:scale-105 transition-transform cursor-pointer" />
            <span className="text-2xl md:text-3xl font-black text-pink-500 animate-pulse">×</span>
            <img src={mcdonaldsArches} alt="McDonald's" className="h-10 md:h-14 object-contain drop-shadow-lg hover:scale-105 transition-transform cursor-pointer" />
            <span className="text-2xl md:text-3xl font-black text-pink-500 animate-pulse">×</span>
            <img src={eatgoodLogo} alt="Eatgood" className="h-8 md:h-12 object-contain drop-shadow-lg hover:scale-105 transition-transform cursor-pointer" />
          </div>
          <div className="text-center mt-3">
            <p className="text-sm md:text-base text-orange-600 font-bold tracking-wider flex items-center justify-center gap-3">
              <PartyPopper className="w-5 h-5 text-pink-500 animate-bounce-gentle" />
              New Year 2026 Celebration! 🎉
              <Star className="w-5 h-5 text-amber-500 animate-glow-pulse" />
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-8">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-3 bg-white/90 text-pink-600 px-8 py-4 rounded-full text-base md:text-lg font-bold border-2 border-pink-300 shadow-[0_0_40px_rgba(255,100,150,0.3)] animate-pulse-glow backdrop-blur-sm">
            <Gift className="w-6 h-6 animate-bounce-gentle text-amber-500" />
            <span>🎉 New Year 2026 Lucky Draw 🥳</span>
            <Sparkles className="w-6 h-6 animate-spin-slow text-pink-500" />
          </div>
          
          {/* Main title with logos */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight">
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">Downtown 30</span>
            </h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <img src={mcdonaldsArches} alt="McDonald's" className="h-12 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:scale-110 transition-transform" />
              <span className="text-4xl md:text-5xl font-black text-white animate-pulse">×</span>
              <img src={eatgoodLogo} alt="Eatgood" className="h-10 md:h-16 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform" />
            </div>
          </div>
          
          <p className="text-2xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-shimmer">
              🎁 Share Your Experience & Win Big! 🎊
            </span>
          </p>
          
          <p className="text-white/90 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-medium drop-shadow-lg">
            Celebrate the new year with us! Record a video sharing your experience, 
            get featured on our social media, and win amazing prizes! Let's party! 🥳
          </p>

          {/* Interactive emoji bar */}
          <div className="flex justify-center gap-3 flex-wrap">
            {['🎉', '🥳', '🎊', '🎁', '⭐', '✨', '💫', '🎈'].map((emoji, i) => (
              <div 
                key={i} 
                className="w-14 h-14 md:w-18 md:h-18 bg-white/30 rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-white/40 cursor-pointer hover:bg-white/50 hover:scale-125 hover:rotate-12 transition-all duration-300 backdrop-blur-sm shadow-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="animate-bounce-gentle" style={{ animationDelay: `${i * 0.15}s` }}>{emoji}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Recording Section */}
          {/* Video Criteria Dialog */}
          <Dialog open={showCriteria} onOpenChange={setShowCriteria}>
            <DialogContent className="max-w-[95vw] sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Collaborative logos */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-3 mb-2">
                  <img src={downtown30Logo} alt="Downtown 30" className="h-8 sm:h-10 object-contain" />
                  <span className="text-lg sm:text-xl font-black text-pink-500">×</span>
                  <img src={mcdonaldsArches} alt="McDonald's" className="h-8 sm:h-10 object-contain" />
                  <span className="text-lg sm:text-xl font-black text-pink-500">×</span>
                  <img src={eatgoodLogo} alt="Eatgood" className="h-7 sm:h-9 object-contain" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  🎬 Video Criteria
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm sm:text-base text-center">
                  Please follow these guidelines for your video submission
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 mt-3">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 sm:p-4">
                  <h4 className="font-bold text-pink-700 flex items-center gap-2 mb-1 sm:mb-2 text-sm sm:text-base">
                    ⏱️ Duration
                  </h4>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    Minimum <span className="font-bold text-pink-600">15 seconds</span>, Maximum <span className="font-bold text-pink-600">60 seconds</span>
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                  <h4 className="font-bold text-amber-700 flex items-center gap-2 mb-1 sm:mb-2 text-sm sm:text-base">
                    📸 Format & Content
                  </h4>
                  <ul className="text-gray-700 text-xs sm:text-sm space-y-1 list-disc list-inside">
                    <li>Selfie / Reel format</li>
                    <li>Include <span className="font-bold text-amber-600">McDonald's McCafe</span></li>
                    <li>Include <span className="font-bold text-amber-600">Downtown 30</span> building/premises</li>
                    <li>Add a <span className="font-bold text-pink-600">Merry Christmas</span> or <span className="font-bold text-pink-600">Happy New Year</span> greeting</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                  <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-1 sm:mb-2 text-sm sm:text-base">
                    💬 Share Your Experience
                  </h4>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    Tell us <span className="font-bold text-orange-600">what you liked/loved</span> about your experience!
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCriteria(false)} 
                className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-5 sm:py-6 text-sm sm:text-base"
              >
                Got it! Let's Go! 🎉
              </Button>
            </DialogContent>
          </Dialog>

          <Card className="card-hover shadow-[0_0_60px_rgba(255,100,150,0.2)] border-2 border-pink-300 bg-white/95 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-amber-500 to-orange-500 animate-shimmer" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-800 text-xl md:text-2xl">
                <div className="p-2 bg-pink-100 rounded-xl">
                  <Video className="w-6 h-6 text-pink-500" />
                </div>
                Record or Upload Video
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCriteria(true)}
                  className="ml-auto text-pink-500 hover:text-pink-600 hover:bg-pink-50 p-2"
                >
                  <Info className="w-5 h-5" />
                </Button>
                <span className="text-3xl animate-bounce-gentle">🎬</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Share your happy moments with us! 🎉 
                <button 
                  onClick={() => setShowCriteria(true)} 
                  className="text-pink-500 hover:text-pink-600 underline ml-1 font-medium"
                >
                  View video criteria
                </button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="aspect-video bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-pink-300 shadow-inner">
                {stream && !currentVideo ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : currentVideo ? (
                  <video
                    src={currentVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-6">
                    <div className="text-7xl mb-4 animate-bounce-gentle">🎥</div>
                    <div className="p-3 bg-pink-200 rounded-full mb-3">
                      <Camera className="w-10 h-10 text-pink-500" />
                    </div>
                    <p className="text-base font-semibold">Start camera or upload a video</p>
                    <p className="text-sm mt-2 text-pink-500 font-medium">🎉 Share your happy moments! 🥳</p>
                  </div>
                )}

                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    Recording...
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {!stream && !currentVideo && (
                  <>
                    <Button onClick={startCamera} className="flex-1 btn-shine bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold shadow-lg hover:shadow-pink-500/30 transition-all py-6 text-base text-white">
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera 🎬
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-bold py-6 text-base backdrop-blur-sm"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Video 📁
                    </Button>
                  </>
                )}

                {stream && !isRecording && !currentVideo && (
                  <>
                    <Button onClick={startRecording} className="flex-1 btn-shine bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold py-6 text-white">
                      <Play className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                    <Button variant="outline" onClick={stopCamera} className="border-gray-300 text-gray-600 hover:bg-gray-100 py-6">
                      Cancel
                    </Button>
                  </>
                )}

                {isRecording && (
                  <Button onClick={stopRecording} className="w-full bg-rose-500 hover:bg-rose-600 font-bold animate-pulse py-6 text-white">
                    <StopCircle className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {currentVideo && (
                  <Button onClick={resetRecording} variant="outline" className="w-full border-pink-400 text-pink-600 hover:bg-pink-50 py-6">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Record/Upload New Video
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="card-hover shadow-[0_0_60px_rgba(251,191,36,0.2)] border-2 border-amber-300 bg-white/95 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 animate-shimmer" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-800 text-xl md:text-2xl">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Instagram className="w-6 h-6 text-pink-500" />
                </div>
                Your Details
                <span className="ml-auto text-3xl animate-bounce-gentle">📝</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Fill in your details to enter the lucky draw! 🎉
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold text-base">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    className="bg-amber-50 border-amber-200 text-gray-800 placeholder:text-gray-400 h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email (optional)"
                    className="bg-amber-50 border-amber-200 text-gray-800 placeholder:text-gray-400 h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold text-base">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    required
                    className="bg-amber-50 border-amber-200 text-gray-800 placeholder:text-gray-400 h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-gray-700 font-semibold text-base">Instagram Username *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                    <Input
                      id="instagram"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instagramHandle: e.target.value.replace("@", "") }))}
                      placeholder="your_username"
                      className="pl-8 bg-amber-50 border-amber-200 text-gray-800 placeholder:text-gray-400 h-12 text-base focus:border-pink-400 focus:ring-pink-400"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-5 space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => setFormData((prev) => ({ ...prev, permissionGranted: !prev.permissionGranted }))}>
                    <Checkbox
                      id="permission"
                      checked={formData.permissionGranted}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, permissionGranted: checked === true }))
                      }
                      className="border-amber-400 data-[state=checked]:bg-pink-500 mt-0.5"
                    />
                    <Label htmlFor="permission" className="text-sm leading-relaxed cursor-pointer text-gray-700">
                      I give permission to feature my video on social media and tag me.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => setFormData((prev) => ({ ...prev, alreadyFollowing: !prev.alreadyFollowing }))}>
                    <Checkbox
                      id="following"
                      checked={formData.alreadyFollowing}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, alreadyFollowing: checked === true }))
                      }
                      className="border-amber-400 data-[state=checked]:bg-pink-500 mt-0.5"
                    />
                    <Label htmlFor="following" className="text-sm leading-relaxed cursor-pointer text-gray-700">
                      I already follow <span className="font-bold text-pink-500">{INSTAGRAM_HANDLE}</span> on Instagram
                    </Label>
                  </div>
                </div>

                {!formData.alreadyFollowing && (
                  <div className="bg-gradient-to-r from-pink-50 to-amber-50 border-2 border-pink-200 rounded-2xl p-5 space-y-4">
                    <p className="text-sm text-gray-700 font-semibold">
                      <strong>Not following us yet?</strong> Follow to be eligible! 🎉
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShareInstagram}
                      className="w-full border-2 border-pink-400 text-pink-600 hover:bg-pink-50 font-bold py-5"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Follow {INSTAGRAM_HANDLE} 📸
                    </Button>
                    {formData.hasSharedPage && (
                      <p className="text-sm text-green-600 flex items-center gap-2 font-semibold">
                        <Check className="w-5 h-5" />
                        Thanks for visiting our page! 🎉
                      </p>
                    )}
                  </div>
                )}

                {/* Pro tip for higher winning chances */}
                <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border-2 border-amber-300 rounded-2xl p-5 text-center">
                  <p className="text-amber-800 font-bold text-base flex items-center justify-center gap-2 mb-2">
                    ⭐ Pro Tip for Higher Chances! ⭐
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    For a <span className="font-bold text-pink-600">higher possibility to win</span>, post a story on your Instagram and tag <span className="font-bold text-pink-600">{INSTAGRAM_HANDLE}</span> in it along with <span className="font-bold text-amber-600">three of your friends!</span> 🎉📸
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-shine bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:from-pink-600 hover:via-rose-600 hover:to-orange-600 text-white font-black text-lg py-7 shadow-[0_0_40px_rgba(255,100,150,0.3)] hover:shadow-[0_0_60px_rgba(255,100,150,0.5)] transition-all hover:scale-[1.02]"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">🎉</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6 mr-2" />
                      Submit & Enter Lucky Draw 🎁✨
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { emoji: "🎬", icon: Video, title: "Record Your Video", desc: "Share your happy experience with Downtown 30!", gradient: "from-pink-100 to-pink-200", border: "border-pink-300" },
            { emoji: "📸", icon: Instagram, title: "Get Featured", desc: "We'll tag you on our social media pages!", gradient: "from-amber-100 to-amber-200", border: "border-amber-300" },
            { emoji: "🎁", icon: Gift, title: "Win Big Prizes", desc: "Lucky draw winners announced New Year 2026!", gradient: "from-orange-100 to-orange-200", border: "border-orange-300" },
          ].map((item, i) => (
            <Card key={i} className={`card-hover bg-gradient-to-b ${item.gradient} backdrop-blur-xl border-2 ${item.border} overflow-hidden group cursor-pointer`}>
              <CardContent className="pt-8 pb-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300" style={{ animationDelay: `${i * 0.2}s` }}>
                  {item.emoji}
                </div>
                <h3 className="font-bold text-gray-800 text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Brand Showcase Banner */}
        <div className="mt-12 bg-white/80 rounded-3xl p-8 md:p-10 border border-pink-200 backdrop-blur-xl shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Proudly Presented By 🎉</h3>
          </div>
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
            <div className="group">
              <img src={downtown30Logo} alt="Downtown 30" className="h-16 md:h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform cursor-pointer" />
              <p className="text-center text-gray-600 text-sm mt-2 font-medium">Downtown 30</p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-pink-500 animate-pulse">×</span>
            <div className="group">
              <img src={mcdonaldsArches} alt="McDonald's" className="h-16 md:h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform cursor-pointer" />
              <p className="text-center text-gray-600 text-sm mt-2 font-medium">McDonald's</p>
            </div>
            <span className="text-3xl md:text-4xl font-black text-pink-500 animate-pulse">×</span>
            <div className="group">
              <img src={eatgoodLogo} alt="Eatgood" className="h-14 md:h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform cursor-pointer" />
              <p className="text-center text-gray-600 text-sm mt-2 font-medium">Eatgood</p>
            </div>
          </div>
        </div>

        {/* Celebration Banner */}
        <div className="mt-12 bg-gradient-to-r from-pink-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl p-8 md:p-10 text-center border-2 border-pink-300 animate-pulse-glow backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
          <div className="relative z-10">
            <div className="flex justify-center gap-3 text-4xl md:text-5xl mb-6">
              {['🎉', '🥳', '🎊', '✨', '🎁', '💫', '⭐', '🎈'].map((e, i) => (
                <span key={i} className="animate-bounce-gentle hover:scale-150 transition-transform cursor-pointer" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
              ))}
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 drop-shadow-lg">
              Happy New Year 2026! 🎉🥳
            </h3>
            <p className="text-gray-700 text-lg md:text-xl font-medium mb-6">
              Thank you for celebrating with us! Let's make 2026 amazing!
            </p>
            <div className="inline-flex items-center gap-3 bg-white/60 px-8 py-3 rounded-full border border-pink-300 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-pink-500 animate-spin-slow" />
              <span className="text-gray-700 font-bold text-lg">Wishing you joy, happiness & delicious moments!</span>
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-xl border-t border-pink-200 mt-16 py-10 relative z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
            <img src={downtown30Logo} alt="Downtown 30" className="h-10 md:h-14 object-contain hover:scale-105 transition-transform" />
            <span className="text-2xl md:text-3xl font-bold text-pink-500 animate-pulse">×</span>
            <img src={mcdonaldsArches} alt="McDonald's" className="h-10 md:h-14 object-contain hover:scale-105 transition-transform" />
            <span className="text-2xl md:text-3xl font-bold text-pink-500 animate-pulse">×</span>
            <img src={eatgoodLogo} alt="Eatgood" className="h-8 md:h-12 object-contain hover:scale-105 transition-transform" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            © {new Date().getFullYear()} Downtown 30 × McDonald's × Eatgood New Year Campaign 🎉
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your video will be saved securely and only used with your permission.
          </p>
          <div className="mt-6 flex justify-center gap-2 text-2xl">
            {['🎉', '🥳', '🎊', '✨', '🎁', '⭐', '💫', '🎈'].map((e, i) => (
              <span key={i} className="hover:scale-150 transition-transform cursor-pointer">{e}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SocialCampaign;
