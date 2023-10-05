// Camera
 let videoWidth = PARAMS['VIDEO_WIDTH'];
 let videoHeight = PARAMS['VIDEO_HEIGHT'];
 
 // Canvas
 let model, ctx, video, canvas;
 let ctxVideo, canvasVideo;
 
 async function setupCamera() {
    video = document.getElementById('video');
    console.debug("Preferred camera resolution:", videoWidth, videoHeight);
    videoStream = await navigator.mediaDevices.getUserMedia({
        'audio': true,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: videoWidth,
            height: videoHeight
        },
    });
    video.srcObject = videoStream;
    video.muted = true;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
            videoWidth = video.videoWidth;
            videoHeight = video.videoHeight;
        };
    });
}

