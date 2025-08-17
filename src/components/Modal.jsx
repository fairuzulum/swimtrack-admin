import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay (latar belakang gelap)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      {/* Kontainer Modal */}
      <div className="relative w-full max-w-lg p-8 mx-4 bg-white rounded-xl shadow-lg transform transition-all">
        {/* Tombol Close di sudut kanan atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {/* Judul Modal */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        
        {/* Konten (form akan dimasukkan di sini) */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;