import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  side?: boolean;
  children: React.ReactNode;
}

// Glass sheet: bottom sheet on phones, centered card on larger screens.
// Dims the scene 35% instead of blurring it, so glass isn't stacked on glass.
// `side`: on desktop it becomes a right-hand panel that leaves the scene usable behind it.
export function Sheet({ open, onClose, title, subtitle, className = 'max-w-lg', side = false, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/35 flex items-end sm:items-center justify-center z-[1000] sm:p-4 ${
            side ? 'lg:bg-transparent lg:pointer-events-none lg:items-stretch lg:justify-end' : ''
          }`}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal={!side}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={`glass-thick w-full rounded-t-[28px] sm:rounded-[28px] max-h-[88dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] ${className} ${
              side ? 'lg:pointer-events-auto lg:max-w-[440px] lg:max-h-none' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber hints the sheet on phones */}
            <div className="sm:hidden mx-auto mt-2 h-1.5 w-9 rounded-full bg-white/30" />
            <div className="sticky top-0 z-10 flex items-start gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] font-bold text-white leading-tight">{title}</h2>
                {subtitle && <p className="mt-1 text-[15px] text-white/65">{subtitle}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="icon-btn glass-clear -mr-1.5 -mt-1">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 sm:px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
