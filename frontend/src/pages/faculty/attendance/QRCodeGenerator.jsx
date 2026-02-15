import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import axios from '../../../api/axiosConfig';
import { RefreshCw, Clock, ShieldCheck, AlertCircle, Info } from 'lucide-react';

const QRCodeGenerator = ({ courseId }) => {
    const [token, setToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateToken = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/attendance/qr/generate?courseId=${courseId}`);
            setToken(res.data.token);
            setTimeLeft(60);
        } catch (err) {
            console.error("Failed to generate QR token", err);
            setError("Unable to generate secure token. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        generateToken();
        const interval = setInterval(generateToken, 60000);
        return () => clearInterval(interval);
    }, [generateToken]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            <div className="w-full bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white shadow-2xl p-5 relative overflow-hidden group qr-code-modal-card">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-5 px-3 py-1.5 bg-teal-50 rounded-full border border-teal-100/50">
                        <ShieldCheck size={14} className="text-teal-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">Secure Dynamic Token</span>
                    </div>

                    <div className="relative group/qr w-full mx-auto qr-code-wrapper-force">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500/20 to-teal-600/20 rounded-[2rem] blur-xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative p-4 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 flex items-center justify-center">
                            {isLoading ? (
                                <div className="aspect-square w-full flex flex-col items-center justify-center gap-3 bg-gray-50/50 rounded-xl">
                                    <div className="w-8 h-8 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Hashing...</span>
                                </div>
                            ) : error ? (
                                <div className="aspect-square w-full flex flex-col items-center justify-center gap-2 bg-rose-50 rounded-xl p-4 text-center">
                                    <AlertCircle size={24} className="text-rose-500" />
                                    <p className="text-[9px] font-bold text-rose-700 uppercase leading-relaxed">{error}</p>
                                    <button onClick={generateToken} className="mt-1 text-[9px] font-black underline underline-offset-4 text-rose-600 hover:text-rose-800">RETRY</button>
                                </div>
                            ) : (
                                <div className="w-full aspect-square bg-white flex items-center justify-center">
                                    <QRCode
                                        value={token}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 w-full space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Clock size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Refresh</span>
                                    <span className="text-xs font-bold text-gray-700">{timeLeft}s</span>
                                </div>
                            </div>
                            <button
                                onClick={generateToken}
                                disabled={isLoading}
                                className="qr-refresh-btn"
                            >
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                <span>Refresh</span>
                            </button>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeLeft / 60) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase tracking-wide">
                                Scan with Gurukul App
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
