"use client";

import React, { useState } from "react";
import cross from "../assets/cross.svg";

function ConfirmationModal({ text, onConfirm, cannotUndo }: { text: string; onConfirm: () => void; cannotUndo: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Open Button */}
            <div className="flex items-center justify-center min-h-screen">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-camp-tert-green px-24 py-3 font-lato font-bold rounded-full text-white hover:bg-camp-tert-blue transition duration-300"
                >
                    OPEN CONFIRMATION MODAL
                </button>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
                    <div className="relative bg-[#F1F1F1] p-[48px_56px] rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[576px] h-fit text-center gap-[36px]">
                        {/* Close Button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-6 right-6 flex-shrink-0"
                        >
                            <img src={cross.src} alt="close" className="w-[29px] h-[29px] aspect-[29/29]" />
                        </button>

                        {/* Confirmation Text */}
                        <h2 className="text-[29px] font-lato font-bold text-[#333] text-center mb-2 p-[8px] gap-[8px]">
                            {text}
                        </h2>
                        { cannotUndo && (
                                <p className="flex flex-col justify-center items-center text-[20px] text-[#4A4A4A] font-lato font-normal mb-6 gap-[36px]">
                                    WARNING: This action cannot be undone
                                </p>
                            )
                        }
                        

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="bg-[#BDC3C7] text-black font-lato text-[20px] fold-bold leading-normal rounded-[40px] px-[56px] py-[16px] w-[196px] flex justify-center items-center flex-shrink-0 hover:bg-gray-500 hover:text-white transition duration-300"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="bg-[#D32F2F] text-white font-lato text-[20px] fold-bold leading-normal rounded-[40px] px-[56px] py-[16px] w-[196px] flex justify-center items-center flex-shrink-0 hover:bg-red-800 transition duration-300"
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ConfirmationModal;