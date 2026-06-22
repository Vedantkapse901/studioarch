import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <img src="/logo-bw.png" alt="Loading..." className="h-48 w-auto md:h-64" />
        </motion.div>
        <p className="text-stone-400 uppercase tracking-widest text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingScreenWithText(props: { text?: string }) {
  const text = props.text || 'Loading...';
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <img src="/logo-bw.png" alt={text} className="h-48 w-auto md:h-64" />
        </motion.div>
        <p className="text-stone-400 uppercase tracking-widest text-sm">{text}</p>
      </div>
    </div>
  );
}
