// src/pages/NotFound.jsx
import { Frown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex min-h-[80vh] flex-col items-center justify-center text-center"
  >
    <Frown className="h-24 w-24 text-destructive mb-6" />
    <h1 className="text-5xl font-extrabold mb-4">404 - Not Found</h1>
    <p className="text-xl text-muted-foreground mb-8">
      Sorry, the page you are looking for does not exist.
    </p>
    <Button asChild>
      <Link to="/">Go to Dashboard</Link>
    </Button>
  </motion.div>
);

export default NotFound;