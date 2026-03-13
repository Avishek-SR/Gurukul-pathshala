import axios from 'axios';

// URL for the new Python FastAPI microservice
const DEEPFACE_API_URL = 'http://localhost:8000';

export const loadModels = async () => {
    try {
        await axios.get(`${DEEPFACE_API_URL}/health`);
        console.log("DeepFace Python API is connected.");
    } catch (e) {
        console.error("Warning: DeepFace API might not be running at " + DEEPFACE_API_URL, e);
    }
};

const captureVideoFrame = (videoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
};

export const getFaceDescriptor = async (videoElement) => {
    const base64Image = captureVideoFrame(videoElement);
    
    try {
        const response = await axios.post(`${DEEPFACE_API_URL}/extract`, {
            image: base64Image,
            model_name: "ArcFace"
        });
        
        if (response.data.success) {
            return response.data.embedding;
        } else {
            console.warn("Face detection failed:", response.data.error);
            return null;
        }
    } catch (error) {
        console.error("Error communicating with DeepFace API:", error);
        return null;
    }
};

const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const createFaceMatcher = (studentDescriptors) => {
    const enrolledFaces = studentDescriptors.map(s => {
        let descArray = [];
        try {
            descArray = JSON.parse(s.faceDescriptor);
        } catch(e) {
            console.error("Invalid face descriptor format for user", s.userId);
        }
        return {
            userId: s.userId,
            label: s.userId,
            descriptor: descArray
        };
    }).filter(s => s.descriptor.length > 0);

    return {
        findBestMatch: (queryDescriptor) => {
            let bestMatch = { label: "unknown", toString: () => "unknown", distance: 1.0 };
            
            // Expected threshold for DeepFace + ArcFace using Cosine Distance metric.
            const COSINE_THRESHOLD = 0.68;
            let minDistance = 2.0;

            for (const enrolled of enrolledFaces) {
                const distance = 1 - cosineSimilarity(queryDescriptor, enrolled.descriptor);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = {
                        label: enrolled.label,
                        toString: () => `${enrolled.label} (${distance.toFixed(2)})`,
                        distance: distance
                    };
                }
            }

            if (minDistance > COSINE_THRESHOLD) {
                return {
                    label: "unknown",
                    toString: () => `unknown (${minDistance.toFixed(2)})`,
                    distance: minDistance
                };
            }

            return bestMatch;
        }
    };
};

export const recognizeFaces = async (videoElement, faceMatcher) => {
    const descriptor = await getFaceDescriptor(videoElement);
    
    if (!descriptor) {
        return [];
    }

    const match = faceMatcher.findBestMatch(descriptor);
    return [match]; 
};
