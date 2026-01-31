import React from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmationMessage = ({ title = "Action Successful!", children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-sm mt-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-emerald-100 rounded-full p-2 shrink-0">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-emerald-900">{title}</h3>
          
          <div className="text-emerald-800 space-y-2">
            {children || <p>Your request has been received successfully.</p>}
            <p className="font-medium">We will respond to you as soon as possible.</p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 mt-4 border border-emerald-100/50 flex gap-3 items-start">
            <Mail className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-900">
              <p className="font-bold mb-1">Check your inbox!</p>
              <p>
                Please check your email inbox for a confirmation. 
                <span className="block mt-1 text-emerald-700 font-medium">
                  If you don't see it, please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmationMessage;