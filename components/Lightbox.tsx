
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from './icons';

interface LightboxProps {
    images: string[];
    startIndex: number;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex]);

    const goToPrevious = () => {
        const isFirstImage = currentIndex === 0;
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastImage = currentIndex === images.length - 1;
        const newIndex = isLastImage ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                    aria-label="Close"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>

                {/* Left Arrow */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon className="w-10 h-10" />
                </button>

                {/* Image */}
                <div className="max-w-screen-lg max-h-screen-lg flex items-center justify-center">
                    <img
                        src={images[currentIndex]}
                        alt={`Property image ${currentIndex + 1}`}
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                </div>

                {/* Right Arrow */}
                <button
                    onClick={goToNext}
                    className="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                    aria-label="Next image"
                >
                    <ChevronRightIcon className="w-10 h-10" />
                </button>
                
                 {/* Counter */}
                <div className="absolute bottom-4 text-white text-lg bg-black bg-opacity-50 rounded-lg px-3 py-1">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
