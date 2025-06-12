import { createPortal } from 'react-dom';
import React from 'react';

interface DropdownMenuPortalProps {
  children: React.ReactNode;
  position: { top: number; left: number };
}

export const DropdownMenuPortal: React.FC<DropdownMenuPortalProps> = ({ children, position }) => {
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;
  return createPortal(
    <div
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-[300px] bg-white bg-opacity-100 shadow-2xl rounded-xl border border-gray-200 p-4 isolate mix-blend-normal backdrop-blur-none will-change-transform transform-gpu"
    >
      {children}
    </div>,
    portalRoot
  );
};
