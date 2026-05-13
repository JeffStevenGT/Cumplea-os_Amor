import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Heart,
  Gift,
  Sparkles,
  ArrowLeft,
  Play,
  SkipBack,
  SkipForward,
  Pause,
  LockKeyhole,
  Disc,
  Star,
  MoveHorizontal,
  ChevronDown,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lrc } from "react-lrc";
import { loveData } from "./data/content";

// --- 1. LLUVIA DE CORAZONES (EFECTO CATARATA TOTAL) ---
const LluviaDeCorazonesMasiva = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 w-full">
    {[...Array(35)].map((_, i) => {
      const startX = Math.random() * 100; // porcentaje del ancho del viewport
      const startY = Math.floor(Math.random() * -200); // altura inicial aleatoria
      const size = `${Math.floor(Math.random() * 20 + 16)}px`; // tamaño aleatorio
      const colors = ["❤️", "💜", "💙", "💖"];
      const heart = colors[Math.floor(Math.random() * colors.length)];

      return (
        <motion.div
          key={`heart-${i}`}
          className="absolute"
          style={{ fontSize: size }}
          initial={{ y: startY, x: `${startX}vw`, opacity: 0 }}
          animate={{
            y: "110vh",
            x: [`${startX}vw`, `${startX + (Math.random() * 20 - 10)}vw`],
            opacity: [0, 1, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        >
          {heart}
        </motion.div>
      );
    })}
  </div>
);

// --- 2. TARJETAS MISTERIO 1 (ESTILO POLAROID PREMIUM) ---
const SwipeCard = ({ text, image, index, total, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const randomTilt = useRef(Math.random() * 8 - 4);

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: total - index,
        rotateZ: randomTilt.current,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      whileDrag={{ scale: 1.05 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80) onSwipe();
      }}
      className="absolute inset-0 w-full h-[380px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-4 flex flex-col items-center border-[12px] border-white cursor-grab active:cursor-grabbing shrink-0"
    >
      <div className="w-full h-56 bg-slate-100 overflow-hidden mb-4 shadow-inner relative">
        <img src={image} alt="Templo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <p className="text-sm font-serif italic text-slate-700 text-center leading-tight flex-1 flex items-center px-1">
        "{text}"
      </p>
      <div className="absolute bottom-2 flex items-center gap-2 text-[7px] text-slate-400 font-bold uppercase tracking-widest">
        Dato {index + 1} de {total}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState("landing");
  const [activeGift, setActiveGift] = useState(null);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [coverIndex, setCoverIndex] = useState(0);
  const [songFinished, setSongFinished] = useState(false);
  const [showFinalSurprise, setShowFinalSurprise] = useState(false);
  const [m1Index, setM1Index] = useState(0);
  const [m2Reveal, setM2Reveal] = useState(0);
  const audioRef = useRef(null);

  const misterio1Cards = [
    {
      text: "Por ser mi refugio en los días difíciles.",
      img: "/images/templo1.jpeg",
    },
    {
      text: "Por la luz de Cristo que irradias siempre.",
      img: "/images/templo2.jpeg",
    },
    {
      text: "Por cada sonrisa que me regalas sin motivo.",
      img: "/images/templo3.jpeg",
    },
    {
      text: "Por esos 20 meses llenos de bendiciones.",
      img: "/images/templo4.jpeg",
    },
    {
      text: "Por cómo cuidas de nosotros y de tu fe.",
      img: "/images/templo5.jpeg",
    },
    {
      text: "Por ser la mujer más virtuosa que conozco.",
      img: "/images/templo6.jpeg",
    },
    {
      text: "Por soñar conmigo un futuro en el Templo.",
      img: "/images/templo7.jpeg",
    },
    {
      text: "Por tu paciencia y tu amor infinito.",
      img: "/images/templo8.jpeg",
    },
    {
      text: "Por ser mi mejor amiga y mi compañera.",
      img: "/images/templo9.jpeg",
    },
    { text: "Por existir y elegirme cada día.", img: "/images/templo10.jpeg" },
  ];

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleNoClick = () => {
    setNoButtonPos({ x: Math.random() * 120 - 60, y: Math.random() * 80 - 40 });
  };

  const closeGift = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveGift(null);
    setView("selection");
    setSongFinished(false);
    setShowFinalSurprise(false);
    setM1Index(0);
    setM2Reveal(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && activeGift === "birthday" && !songFinished) {
      interval = setInterval(() => {
        setCoverIndex((prev) => (prev + 1) % 10);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeGift, songFinished]);

  const WindowWrapper = ({ children, title }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-sm bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white flex flex-col h-[85dvh] relative z-10 mx-auto"
    >
      <div className="bg-slate-100/80 backdrop-blur-md px-5 py-3 flex items-center border-b border-slate-200 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
          <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
          <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 text-center font-mono text-[7px] text-slate-400 font-bold uppercase tracking-widest truncate px-2">
          {title}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[#FCF8F5]">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-[#FFE4E6] flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden relative">
      <audio
        ref={audioRef}
        src={loveData.musicPlayer.audioSrc}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setSongFinished(true);
        }}
      />

      <AnimatePresence mode="wait">
        {view === "landing" && (
          <WindowWrapper key="landing" title="ACCESO_RESTRINGIDO.EXE">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-8"
              >
                🎁
              </motion.div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 mb-8 italic">
                ¿Me permites mostrarte algo?
              </h2>
              <div className="flex gap-4 relative">
                <button
                  onClick={() => setView("selection")}
                  className="px-8 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg active:scale-95 text-[10px] uppercase"
                >
                  Sí, acepto
                </button>
                <motion.button
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  onMouseEnter={handleNoClick}
                  onTouchStart={handleNoClick}
                  className="px-8 py-3 bg-slate-200 text-slate-400 font-bold rounded-xl text-[10px] uppercase absolute left-[110px]"
                >
                  No
                </motion.button>
              </div>
            </div>
          </WindowWrapper>
        )}

        {view === "selection" && (
          <WindowWrapper key="selection" title="BASE_DE_DATOS_AMOR">
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              {["anniversary", "eternity", "birthday"].map((type, idx) => (
                <motion.button
                  key={type}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setActiveGift(type);
                    setView("gift-view");
                  }}
                  className="w-full bg-white p-4 rounded-[1.5rem] shadow-sm border border-rose-50 flex items-center gap-4 group active:scale-95"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${idx === 0 ? "bg-rose-400" : idx === 1 ? "bg-amber-400" : "bg-indigo-400"}`}
                  >
                    {idx === 0 ? (
                      <Heart size={16} />
                    ) : idx === 1 ? (
                      <Star size={16} />
                    ) : (
                      <Disc size={16} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-700 text-xs">
                      Misterio #{idx + 1}
                    </p>
                    <p className="text-[7px] text-rose-300 font-black uppercase tracking-widest">
                      Abrir
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </WindowWrapper>
        )}

        {view === "gift-view" && (
          <WindowWrapper key="gift-view" title="CARGANDO_RECUERDO">
            <button
              onClick={closeGift}
              className="absolute top-4 left-4 z-50 p-1.5 bg-white/90 rounded-lg text-rose-500 shadow-md border border-white"
            >
              <ArrowLeft size={16} />
            </button>

            {activeGift === "anniversary" && (
              <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
                <div className="pt-14 pb-2 px-6 text-center shrink-0">
                  <h2 className="text-lg font-serif font-bold text-rose-500 italic">
                    Razones de mi Amor
                  </h2>
                  <p className="text-[7px] text-rose-300 uppercase tracking-widest">
                    Desliza las fotos
                  </p>
                </div>
                <div className="flex-1 relative px-10 py-6 mb-10 shrink-0">
                  <AnimatePresence>
                    {misterio1Cards.map(
                      (card, i) =>
                        i >= m1Index && (
                          <SwipeCard
                            key={i}
                            text={card.text}
                            image={card.img}
                            index={i}
                            total={misterio1Cards.length}
                            onSwipe={() => setM1Index((prev) => prev + 1)}
                          />
                        ),
                    )}
                  </AnimatePresence>
                  {m1Index >= misterio1Cards.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center px-4"
                    >
                      <Sparkles className="w-8 h-8 text-amber-400 mb-2" />
                      <p className="font-serif italic text-slate-500 text-sm">
                        Y mil razones más...
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeGift === "eternity" && (
              <div className="flex-1 flex flex-col bg-[#0a0a0a] relative overflow-hidden h-full">
                <div className="pt-14 pb-2 px-6 text-center z-10 shrink-0">
                  <h2 className="text-amber-100 font-serif text-lg italic font-bold">
                    Nuestra Eternidad
                  </h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
                  <div className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-amber-100/20 shadow-2xl mb-8 shrink-0">
                    <motion.img
                      src={loveData.jesusImage}
                      style={{
                        filter: `blur(${15 - m2Reveal * 0.15}px) grayscale(${100 - m2Reveal}%)`,
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full max-w-[180px] mb-8 relative shrink-0">
                    <AnimatePresence>
                      {m2Reveal < 10 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-6 left-0 right-0 text-center text-[7px] text-amber-200 font-bold uppercase tracking-widest flex items-center justify-center gap-1"
                        >
                          <MoveHorizontal size={8} /> Desliza la luz
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden">
                      <motion.div
                        style={{ width: `${m2Reveal}%` }}
                        className="absolute inset-0 bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={m2Reveal}
                      onChange={(e) => setM2Reveal(e.target.value)}
                      className="absolute -top-2 inset-0 w-full h-4 opacity-0 cursor-pointer z-20"
                    />
                  </div>
                  <motion.p
                    style={{ opacity: m2Reveal / 100 }}
                    className="text-white font-serif italic text-xs leading-relaxed text-center px-2"
                  >
                    "{loveData.eternityMessage}"
                  </motion.p>
                </div>
              </div>
            )}

            {activeGift === "birthday" && (
              <div className="flex-1 flex flex-col bg-gradient-to-b from-rose-200 to-rose-50 h-full overflow-hidden relative">
                {!showFinalSurprise ? (
                  <div className="flex-1 flex flex-col h-full pt-12 px-6">
                    <div className="flex-1 flex flex-col items-center justify-center max-h-[65%]">
                      <motion.div
                        animate={{
                          rotate: isPlaying ? 360 : 0,
                          scale: isPlaying ? 0.8 : 1,
                        }}
                        transition={{
                          rotate: {
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: { duration: 0.5 },
                        }}
                        className="w-32 h-32 rounded-full shadow-xl border-4 border-white overflow-hidden relative mb-4 shrink-0"
                      >
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={coverIndex}
                            src={`/images/${coverIndex + 1}.jpg`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </AnimatePresence>
                      </motion.div>
                      <div className="text-center mb-2 shrink-0 px-2">
                        <h3 className="text-base font-bold text-slate-800 leading-tight">
                          {loveData.musicPlayer.songName}
                        </h3>
                        <p className="text-[7px] font-black text-rose-400 uppercase tracking-widest">
                          {loveData.musicPlayer.artist}
                        </p>
                      </div>
                      <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="mb-2 shrink-0"
                      >
                        <p className="text-[8px] font-bold text-rose-500 tracking-[0.2em] uppercase">
                          ✨ Escucha hasta el final ✨
                        </p>
                      </motion.div>
                      <div className="w-full mb-4 shrink-0 px-4">
                        <div
                          onClick={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            audioRef.current.currentTime =
                              ((e.clientX - rect.left) / rect.width) * duration;
                          }}
                          className="h-1 bg-rose-100 rounded-full overflow-hidden mb-1.5 cursor-pointer relative"
                        >
                          <motion.div
                            className="h-full bg-rose-500"
                            style={{
                              width: `${(currentTime / duration) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[7px] text-slate-400 font-bold">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex justify-center items-center gap-6 mb-2 shrink-0">
                        <button
                          onClick={() => (audioRef.current.currentTime -= 10)}
                          className="text-slate-400 active:scale-75"
                        >
                          <SkipBack size={18} />
                        </button>
                        <button
                          onClick={togglePlay}
                          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90"
                        >
                          {isPlaying ? (
                            <Pause size={20} className="fill-current" />
                          ) : (
                            <Play size={20} className="fill-current ml-1" />
                          )}
                        </button>
                        <button
                          onClick={() => (audioRef.current.currentTime += 10)}
                          className="text-slate-400 active:scale-75"
                        >
                          <SkipForward size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="h-28 w-full bg-white/40 backdrop-blur-sm rounded-[1.5rem] p-4 border border-white/50 overflow-hidden relative shrink-0 mb-4">
                      <Lrc
                        lrc={loveData.musicPlayer.lrcString}
                        currentMillisecond={currentTime * 1000}
                        lineRenderer={({ active, line }) => (
                          <div
                            className={`text-center py-1.5 transition-all duration-500 ${active ? "opacity-100 scale-105" : "opacity-20 scale-95"}`}
                          >
                            <p
                              className={`font-serif text-[10px] leading-snug ${active ? "text-rose-600 font-bold italic" : "text-slate-500"}`}
                            >
                              {line.content}
                            </p>
                          </div>
                        )}
                        style={{ height: "100%", overflow: "hidden" }}
                      />
                    </div>
                    <AnimatePresence>
                      {songFinished && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-8 text-center"
                        >
                          <h2 className="text-xl font-serif font-bold text-slate-800 mb-8 leading-tight">
                            ¿Quieres saber qué es lo que más me hace feliz?
                          </h2>
                          <button
                            onClick={() => {
                              setShowFinalSurprise(true);
                              confetti({ particleCount: 150 });
                            }}
                            className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-xl active:scale-95"
                          >
                            DESCUBRIR
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#FDFBF7] z-[70] flex flex-col overflow-y-auto"
                  >
                    <LluviaDeCorazonesMasiva />
                    {/* AVISO SUBIDO A bottom-20 */}
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="fixed bottom-20 left-0 right-0 flex flex-col items-center gap-1 z-[80] pointer-events-none"
                    >
                      <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest drop-shadow-sm">
                        Desliza preciosa
                      </span>
                      <ChevronDown
                        size={18}
                        className="text-rose-500 animate-bounce"
                      />
                    </motion.div>
                    <div className="pt-16 px-6 pb-28 relative z-10">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: 0.2 } },
                        }}
                        className="flex flex-col items-center"
                      >
                        <motion.h2
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="text-5xl font-serif italic text-rose-500 mb-8 font-bold text-center leading-tight"
                        >
                          Tú.
                        </motion.h2>
                        <div className="grid grid-cols-2 gap-3 w-full mb-10">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <motion.div
                              key={n}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0"
                            >
                              <img
                                src={`/images/${n}.jpg`}
                                alt="Nosotros"
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 text-center mb-8 w-full font-serif italic text-xs text-slate-600 leading-relaxed px-4 italic">
                          "Hoy celebro tu vida, mi reina. Eres mi mayor
                          bendición hoy y siempre. ¡Feliz cumpleaños! ¡Feliz
                          aniversario!"
                        </div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pb-6 italic">
                          Eternamente nosotros
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </WindowWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
