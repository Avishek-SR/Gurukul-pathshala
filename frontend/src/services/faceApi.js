import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export const loadModels = async () => {
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    ]);
};

export const getFaceDescriptor = async (videoElement) => {
    const detection = await faceapi
        .detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection ? detection.descriptor : null;
};

export const createFaceMatcher = (studentDescriptors) => {
    // studentDescriptors: [{ userId, name, descriptor (string) }]
    const labeledDescriptors = studentDescriptors.map(s => {
        const descArray = new Float32Array(JSON.parse(s.faceDescriptor));
        return new faceapi.LabeledFaceDescriptors(s.userId, [descArray]);
    });

    return new faceapi.FaceMatcher(labeledDescriptors, 0.70); // 0.70 is reliable for webcams and slight variations
};

export const recognizeFaces = async (videoElement, faceMatcher) => {
    // Use SsdMobilenetv1Options with adjusted confidence/minFaceSize if needed
    // Lower minConfidence to 0.4 to detect faces further away/smaller
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 });

    const detections = await faceapi
        .detectAllFaces(videoElement, options)
        .withFaceLandmarks()
        .withFaceDescriptors();

    // console.log(`Detected ${detections.length} faces`); // Optional debug

    const results = detections.map(d => {
        const match = faceMatcher.findBestMatch(d.descriptor);
        console.log("Match result:", match.toString());
        return match;
    });

    return results;
};
