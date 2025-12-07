// src/pages/LoadingScreen.jsx
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
  >
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="mt-4 text-lg font-medium text-muted-foreground">Loading UniAttend...</p>
  </motion.div>
);

export default LoadingScreen;