import React, { useState } from 'react';
import FaceScanner from '../../../../../../components/attendance/FaceScanner';
import { getFaceDescriptor } from '../../../../../../services/faceApi';
import axios from '../../../../../../api/axiosConfig';
import toast from 'react-hot-toast';
import { UserCheck, Shield } from 'lucide-react';

const FaceRegistrationModal = ({ student, onClose, onComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleScan = async (videoElement) => {
        setIsProcessing(true);
        try {
            const descriptor = await getFaceDescriptor(videoElement);

            if (!descriptor) {
                toast.error("No face detected. Please try again.");
                setIsProcessing(false);
                return;
            }

            // Convert Float32Array to string for JSON storage
            const descriptorString = JSON.stringify(Array.from(descriptor));

            await axios.post(`/admin/face-registration/${student.id}`, {
                descriptor: descriptorString
            });

            toast.success(`Face registered successfully for ${student.name}`);
            if (onComplete) onComplete();
            onClose();
        } catch (err) {
            console.error("Registration error:", err);
            toast.error("Failed to register face descriptor.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg">
                {!isProcessing ? (
                    <FaceScanner
                        onScan={handleScan}
                        onClose={onClose}
                        title={`Register Face: ${student.name}`}
                    />
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Shield className="text-indigo-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Face Data</h3>
                        <p className="text-gray-500 mb-8">Validating landmarks and generating secure descriptor...</p>
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="mt-4 bg-indigo-900/10 border border-white/20 backdrop-blur-md p-4 rounded-2xl flex items-start gap-3">
                    <UserCheck className="text-indigo-600 shrink-0" size={18} />
                    <p className="text-xs text-indigo-900/70 leading-relaxed">
                        <strong>Admin Security Protocol:</strong> This data is used only for attendance verification.
                        The facial descriptor is a mathematical representation and cannot be reversed to an image.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FaceRegistrationModal;
