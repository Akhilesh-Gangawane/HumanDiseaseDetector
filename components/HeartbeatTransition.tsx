'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function HeartbeatTransition() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 flex flex-col items-center justify-center">
      {/* Heartbeat Icon */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1, 1.2, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
          <Activity className="w-10 h-10 text-white" />
        </div>

        {/* Pulse rings */}
        <motion.div
          animate={{
            scale: [1, 2, 2.5],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-blue-400 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 2, 2.5],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.2,
          }}
          className="absolute inset-0 bg-teal-400 rounded-full"
        />
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 text-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          Dhanvantari AI
        </h2>
        <p className="text-gray-500 mt-1 text-sm">Loading...</p>
      </motion.div>

      {/* ECG Line Animation */}
      <motion.div className="mt-6 w-56 h-12 relative overflow-hidden">
        <svg viewBox="0 0 200 40" className="w-full h-full">
          <motion.path
            d="M0,20 L40,20 L45,10 L50,30 L55,5 L60,20 L200,20"
            stroke="url(#hb-gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient id="hb-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
