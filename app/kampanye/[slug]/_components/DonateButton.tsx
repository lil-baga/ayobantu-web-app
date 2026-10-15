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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
      >
        Donasi Sekarang
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Form Donasi</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <DonationForm campaignId={campaignId} campaignTitle={campaignTitle} />
          </div>
        </div>
      )}
    </>
  );
}
