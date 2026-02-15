import React, { useRef, useEffect, useState } from 'react';
import { loadModels } from '../../services/faceApi';
import { Camera, X, RefreshCw } from 'lucide-react';

const FaceScanner = ({ onScan, onClose, title = "Scan Face", autoScan = false, scanStatus = "" }) => {
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let stream = null;

        const init = async () => {
            try {
                await loadModels();
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setLoading(false);
            } catch (err) {
                console.error("Camera/FaceAPI error:", err);
                setError("Failed to access camera or load models.");
                setLoading(false);
            }
        };

        init();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Use a ref to access the latest onScan without restarting the effect
    const onScanRef = useRef(onScan);
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    // Auto-scan logic
    useEffect(() => {
        let timeoutId;
        let mounted = true;

        const scanLoop = async () => {
            if (!mounted) return;

            if (autoScan && !loading && !error && videoRef.current && onScanRef.current) {
                // Ensure video is ready
                if (videoRef.current.readyState === 4) {
                    setIsScanning(true);
                    try {
                        await onScanRef.current(videoRef.current);
                    } catch (err) {
                        console.error("Auto-scan error:", err);
                    } finally {
                        if (mounted) setIsScanning(false);
                    }
                }
            }

            if (mounted && autoScan) {
                // Adjust interval as needed, 800ms gives a good balance
                timeoutId = setTimeout(scanLoop, 800);
            }
        };

        if (autoScan && !loading && !error) {
            scanLoop();
        }

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [autoScan, loading, error]); // Removed onScan from deps

    const handleCapture = () => {
        if (videoRef.current && onScan) {
            onScan(videoRef.current);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full mx-auto">
            <div className="flex justify-between items-center w-full mb-6">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                {loading && (
                    <div className="flex flex-col items-center">
                        <RefreshCw className="animate-spin text-white mb-2" size={32} />
                        <p className="text-white text-sm">Initializing...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 text-center">
                        <p className="text-red-400 text-sm mb-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="text-white underline text-xs">Retry</button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'}`}
                />

                {!loading && !error && (
                    <div className={`absolute inset-0 border-2 pointer-events-none transition-colors duration-300 ${isScanning ? 'border-green-500/50' : 'border-indigo-500/30'}`}>
                        {/* Guide overlay */}
                        <div className={`absolute inset-[15%] border-2 border-dashed rounded-full transition-all duration-300 ${isScanning ? 'border-green-400/80 scale-105' : 'border-white/50 scale-100'}`} />

                        {/* Scanning beam effect */}
                        {autoScan && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-[10%] w-full animate-scan" style={{ animationDuration: '2s' }}></div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 w-full">
                {autoScan ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 text-indigo-600 font-bold animate-pulse">
                            <RefreshCw size={20} className="animate-spin" />
                            <span>Scanning Automatically...</span>
                        </div>
                        {scanStatus && (
                            <p className="text-sm font-semibold text-gray-700 mt-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                                {scanStatus}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Keep faces steady in the frame</p>
                    </div>
                ) : (
                    <button
                        onClick={handleCapture}
                        disabled={loading || !!error}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-200"
                    >
                        <Camera size={22} />
                        Capture & Process
                    </button>
                )}
            </div>

            {!autoScan && (
                <p className="mt-4 text-xs text-center text-gray-400">
                    Position your face within the frame and ensure good lighting.
                </p>
            )}
        </div>
    );
};

export default FaceScanner;
