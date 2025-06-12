import { createPortal } from 'react-dom';
import React from 'react';

interface OverlayPortalProps {
  onClick: () => void;
}

export const OverlayPortal: React.FC<OverlayPortalProps> = ({ onClick }) => {
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9998] bg-black/10" onClick={onClick}></div>,
    portalRoot
  );
};
