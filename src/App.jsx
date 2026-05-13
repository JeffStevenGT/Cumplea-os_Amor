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
  Sun,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lrc } from "react-lrc";
import { loveData } from "./data/content";

// --- COMPONENTES GLOBALES ---

const LluviaDeCorazonesMasiva = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={`h-${i}`}
        className="absolute text-3xl"
        initial={{ y: -100, x: `${Math.random() * 100}%`, opacity: 0 }}
        animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
        transition={{
          duration: Math.random() * 3 + 4,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        ❤️
      </motion.div>
    ))}
  </div>
);

// --- COMPONENTE MISTERIO 1: SWIPE CARDS ---
const SwipeCard = ({ text, index, total, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const opacity = useTransform(x, [-150, -50, 0, 50, 150], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: total - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) onSwipe();
      }}
      className="absolute inset-0 w-full h-[400px] bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center border-8 border-white cursor-grab active:cursor-grabbing"
    >
      <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
      </div>
      <p className="text-xl font-serif italic text-slate-700 text-center leading-relaxed">
        "{text}"
      </p>
      <div className="absolute bottom-6 text-[10px] text-slate-300 font-bold tracking-widest uppercase">
        Desliza para continuar {index + 1}/{total}
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
  const [m1Index, setM1Index] = useState(0); // Para el stack de cartas
  const [m2Reveal, setM2Reveal] = useState(0); // Para el slider de luz
  const audioRef = useRef(null);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && activeGift === "birthday" && !songFinished) {
      interval = setInterval(() => {
        setCoverIndex(
          (prev) => (prev + 1) % loveData.musicPlayer.covers.length,
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeGift, songFinished]);

  const WindowWrapper = ({ children, title }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md bg-[#FDFBF7] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden border border-white flex flex-col h-[85dvh] sm:h-[750px] relative z-10"
    >
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center border-b border-rose-50 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 text-center font-mono text-[9px] text-rose-300 font-bold tracking-[0.3em] uppercase">
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
        {/* LANDING */}
        {view === "landing" && (
          <WindowWrapper key="landing" title="SISTEMA.EXE">
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-10"
              >
                🎁
              </motion.div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-10 leading-tight italic px-4">
                Princesa, preparé algo muy especial para ti...
              </h2>
              <div className="flex gap-4 relative">
                <button
                  onClick={() => setView("selection")}
                  className="px-10 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-xl active:scale-90 transition-all uppercase tracking-widest text-xs"
                >
                  Abrir
                </button>
                <motion.button
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  onMouseEnter={() =>
                    setNoButtonPos({
                      x: Math.random() * 140 - 70,
                      y: Math.random() * 100 - 50,
                    })
                  }
                  className="px-10 py-4 bg-slate-200 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest absolute left-[125px]"
                >
                  No
                </motion.button>
              </div>
            </div>
          </WindowWrapper>
        )}

        {/* SELECTION */}
        {view === "selection" && (
          <WindowWrapper key="selection" title="MIS_MISTERIOS">
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              {["anniversary", "eternity", "birthday"].map((type, idx) => (
                <motion.button
                  key={type}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setActiveGift(type);
                    setView("gift-view");
                  }}
                  className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-rose-50 flex items-center gap-5 group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-90 ${idx === 0 ? "bg-rose-400" : idx === 1 ? "bg-amber-400" : "bg-indigo-400"}`}
                  >
                    {idx === 0 ? <Heart /> : idx === 1 ? <Star /> : <Disc />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-700">
                      Recuerdo #{idx + 1}
                    </p>
                    <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest">
                      Toque para entrar
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </WindowWrapper>
        )}

        {/* GIFT VIEW */}
        {view === "gift-view" && (
          <WindowWrapper key="gift-view" title="DESBLOQUEADO">
            <button
              onClick={closeGift}
              className="absolute top-6 left-6 z-50 p-2 bg-white/80 rounded-xl text-rose-500 shadow-lg border border-white active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* MISTERIO 1: SWIPE CARDS (PARA MÓVIL) */}
            {activeGift === "anniversary" && (
              <div className="p-8 pt-20 h-full flex flex-col items-center bg-white">
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2 italic">
                  18 Meses de Amor
                </h2>
                <p className="text-[10px] uppercase font-black tracking-widest text-rose-300 mb-10">
                  Desliza las cartas
                </p>
                <div className="relative w-full h-[400px]">
                  <AnimatePresence>
                    {loveData.anniversaryText
                      .split(". ")
                      .map(
                        (text, i) =>
                          i >= m1Index && (
                            <SwipeCard
                              key={i}
                              text={text}
                              index={i}
                              total={
                                loveData.anniversaryText.split(". ").length
                              }
                              onSwipe={() => setM1Index((prev) => prev + 1)}
                            />
                          ),
                      )}
                  </AnimatePresence>
                  {m1Index >= loveData.anniversaryText.split(". ").length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center"
                    >
                      <Sparkles className="w-12 h-12 text-amber-400 mb-4 animate-pulse" />
                      <p className="font-serif italic text-slate-500">
                        Cada día contigo es un regalo del cielo.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* MISTERIO 2: REVELACIÓN CELESTIAL (PARA MÓVIL) */}
            {activeGift === "eternity" && (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0a] relative overflow-hidden">
                {/* Estrellas */}
                <div className="absolute inset-0 z-0">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute bg-white rounded-full w-1 h-1"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.2)] mb-10">
                    {/* Imagen de Cristo con Blur dinámico */}
                    <motion.img
                      src={loveData.jesusImage}
                      style={{
                        filter: `blur(${20 - m2Reveal * 0.2}px) grayscale(${100 - m2Reveal}%)`,
                      }}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay de Luz */}
                    <motion.div
                      style={{ opacity: m2Reveal / 100 }}
                      className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent pointer-events-none"
                    />
                  </div>

                  <h2 className="text-amber-100 font-serif text-xl italic mb-6 text-center">
                    Nuestra Promesa Eterna
                  </h2>

                  {/* Slider de Revelación (UX Premium) */}
                  <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full relative mb-10">
                    <motion.div
                      style={{ width: `${m2Reveal}%` }}
                      className="absolute inset-0 bg-amber-400 rounded-full shadow-[0_0_10px_#fbbf24]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={m2Reveal}
                      onChange={(e) => setM2Reveal(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <motion.p
                    style={{ opacity: m2Reveal / 100, y: 20 - m2Reveal / 5 }}
                    className="text-white font-serif italic text-lg leading-relaxed text-center px-4"
                  >
                    "{loveData.eternityMessage}"
                  </motion.p>
                </div>
              </div>
            )}

            {/* MISTERIO 3: AUDIO (DADO 3) */}
            {activeGift === "birthday" && (
              <div className="flex-1 flex flex-col bg-gradient-to-b from-rose-200 to-rose-50 h-full overflow-hidden relative">
                {!showFinalSurprise ? (
                  <div className="flex-1 flex flex-col h-full pt-14 px-6">
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
                      className="w-40 h-40 mx-auto rounded-full shadow-2xl border-[6px] border-white overflow-hidden relative mb-8 shrink-0"
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={coverIndex}
                          src={loveData.musicPlayer.covers[coverIndex]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </AnimatePresence>
                      <div className="absolute w-8 h-8 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-100 z-20" />
                    </motion.div>

                    <div className="text-center mb-6 shrink-0">
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">
                        {loveData.musicPlayer.songName}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mt-1">
                        {loveData.musicPlayer.artist}
                      </p>
                    </div>

                    <div className="w-full px-4 mb-6 shrink-0">
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          audioRef.current.currentTime =
                            ((e.clientX - rect.left) / rect.width) * duration;
                        }}
                        className="h-1.5 bg-rose-100 rounded-full overflow-hidden mb-2 cursor-pointer relative"
                      >
                        <motion.div
                          className="h-full bg-rose-500"
                          style={{
                            width: `${(currentTime / duration) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>{formatTime(currentTime)}</span>
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          Escucha hasta el final ✨
                        </motion.span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-8 mb-8 shrink-0">
                      <button
                        onClick={() => (audioRef.current.currentTime -= 10)}
                        className="text-slate-400 active:scale-90"
                      >
                        <SkipBack />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl active:scale-90"
                      >
                        {isPlaying ? (
                          <Pause className="fill-current" />
                        ) : (
                          <Play className="fill-current ml-1" />
                        )}
                      </button>
                      <button
                        onClick={() => (audioRef.current.currentTime += 10)}
                        className="text-slate-400 active:scale-90"
                      >
                        <SkipForward />
                      </button>
                    </div>

                    <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-t-[2.5rem] p-6 border-t border-rose-50 overflow-hidden relative">
                      <Lrc
                        lrc={loveData.musicPlayer.lrcString}
                        currentMillisecond={currentTime * 1000}
                        autoScroll={true}
                        lineRenderer={({ active, line }) => (
                          <div
                            className={`text-center py-3 transition-all duration-500 ${active ? "opacity-100 scale-110" : "opacity-20 scale-90"}`}
                          >
                            <p
                              className={`font-serif text-base leading-snug ${active ? "text-rose-600 font-bold italic" : "text-slate-500"}`}
                            >
                              {line.content}
                            </p>
                          </div>
                        )}
                        style={{ height: "140px", overflow: "hidden" }}
                      />
                    </div>

                    <AnimatePresence>
                      {songFinished && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-white/90 backdrop-blur-2xl z-[60] flex flex-col items-center justify-center p-10 text-center"
                        >
                          <h2 className="text-3xl font-serif font-bold text-slate-800 mb-10 leading-tight">
                            ¿Quieres saber qué es lo que más me hace feliz?
                          </h2>
                          <button
                            onClick={() => {
                              setShowFinalSurprise(true);
                              confetti({ particleCount: 150 });
                            }}
                            className="w-full py-5 bg-rose-500 text-white rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95"
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
                    <div className="pt-24 px-6 pb-20">
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
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="text-6xl font-serif italic text-rose-500 mb-12 font-bold"
                        >
                          Tú.
                        </motion.h2>
                        <div className="grid grid-cols-2 gap-4 w-full mb-16 px-2">
                          {loveData.musicPlayer.covers.map((src, idx) => (
                            <motion.div
                              key={idx}
                              initial={{
                                opacity: 0,
                                y: 50,
                                rotate: idx % 2 === 0 ? -5 : 5,
                              }}
                              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6 }}
                              className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white"
                            >
                              <img
                                src={src}
                                alt="Memorias"
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-rose-50 text-center mb-10 w-full font-serif italic text-lg text-slate-600 leading-relaxed px-6">
                          "Hoy celebro tu vida, princesa. Eres mi mayor
                          bendición hoy y siempre. ¡Feliz cumpleaños!"
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] pb-10 italic">
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
