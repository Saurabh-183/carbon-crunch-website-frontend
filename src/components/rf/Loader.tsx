
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-transparent">
      <div className="relative h-32 w-32 flex items-center justify-center">
        
        {/* Nucleus / Center Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <span className="text-emerald-500 font-black text-xl tracking-tighter">C</span>
        </motion.div>

        {/* 3D Orbit 1 (Vertical) */}
        <motion.div
          animate={{ rotateX: 360, rotateY: 180 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[1px] border-emerald-500 rounded-full"
          style={{ transformStyle: "preserve-3d", perspective: "800px" }}
        />

        {/* 3D Orbit 2 (Horizontal) */}
        <motion.div
          animate={{ rotateY: 360, rotateZ: 45 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[1px] border-gray-500 rounded-full"
          style={{ transformStyle: "preserve-3d", perspective: "800px" }}
        />

        {/* Traveling Electron Dot */}
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] absolute -top-1 left-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-emerald-500/5 blur-[60px] rounded-full" />
      </div>

      {/* Branding */}
      <div className="mt-8 text-center space-y-1">
        <h2 className="text-slate-900 font-black text-lg tracking-[0.2em] uppercase">
          Carbon<span className="text-emerald-600">OS</span>
        </h2>
        <div className="flex items-center justify-center gap-1">
          <span className="h-1 w-1 bg-emerald-500 rounded-full animate-bounce" />
          <span className="h-1 w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1 w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        </div>
      </div>
    </div>
  );
};

export default Loader;