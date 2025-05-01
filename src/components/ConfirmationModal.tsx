"use client";

import React, { useState, JSX } from "react";
import cross from "../assets/icons/crossIcon.svg";

interface ConfirmationModalProps {
    text: string;
    onConfirm: () => void;
    cannotUndo: boolean;
    trigger: JSX.Element
}

function ConfirmationModal({ text, onConfirm, cannotUndo, trigger }: ConfirmationModalProps) {
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
            <div className="flex items-center justify-center">
                {React.cloneElement(trigger, {
                    onClick: () => setIsModalOpen(true),
                })}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="relative bg-camp-background-modal p-[48px_56px] rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[576px] h-fit text-center gap-[36px]">
                        {/* Close Button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-6 right-6 flex-shrink-0"
                        >
                            <img src={cross.src} alt="close" className="w-[29px] h-[29px] aspect-[29/29]" />
                        </button>

                        {/* Confirmation Text */}
                        <h2 className="text-[29px] font-lato font-bold text-camp-text-modalTitle text-center mb-2 p-[8px] gap-[8px]">
                            {text}
                        </h2>
                        { cannotUndo && (
                                <p className="flex flex-col justify-center items-center text-[20px] text-camp-text-modalSecondaryTitle font-lato font-normal mb-6 gap-[36px]">
                                    WARNING: This action cannot be undone
                                </p>
                            )
                        }
                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="bg-camp-buttons-neutral text-black font-lato text-[20px] fold-bold leading-normal rounded-[40px] px-[56px] py-[16px] w-[196px] flex justify-center items-center flex-shrink-0 hover:bg-gray-500 hover:text-white transition duration-300"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="bg-camp-text-error text-white font-lato text-[20px] fold-bold leading-normal rounded-[40px] px-[56px] py-[16px] w-[196px] flex justify-center items-center flex-shrink-0 hover:bg-red-800 transition duration-300"
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