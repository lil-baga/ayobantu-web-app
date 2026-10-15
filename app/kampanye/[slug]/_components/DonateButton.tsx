'use client';

import { useState } from 'react';
import DonationForm from './DonationForm';

interface Props {
  campaignId: string;
  campaignTitle: string;
}

export default function DonateButton({ campaignId, campaignTitle }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>💖</span> Donasi Sekarang
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 my-8 relative">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Berdonasi</h3>
                <p className="text-xs text-gray-500">Isi data sederhana tanpa perlu membuat akun</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>
            <DonationForm campaignId={campaignId} campaignTitle={campaignTitle} />
          </div>
        </div>
      )}
    </>
  );
}
