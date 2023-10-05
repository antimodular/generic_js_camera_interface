let showStats = true;

const stats = new Stats();

const gui = new dat.GUI();
    
let state = {
    flipVideo: true,
    landscapeCamera: true,
    rotate: 0,
    scale:100,
    stationID: 1,
    drawRawVideo: false,
    drawFormattedVideo: false,
    faceSizeThreshold: 110,
    drawCroppedFace: false,
}




function setupDatGui() {
    gui.useLocalStorage = true;
    gui.remember(state);

    /* GENERAL */
    gui.add(state, 'stationID', 1, 5, 1);

    /* FACE TRACKING FOLDER */
    let formatFolder = gui.addFolder('format');

    // flip video along x axis
    formatFolder.add(state, 'flipVideo');

    // convert camera from landscape to portrait
    formatFolder.add(state, 'landscapeCamera').onChange(async val => {
      landscapeCamera = val ? true : false;
      let videoWidth = PARAMS['VIDEO_WIDTH'];
      let videoHeight = PARAMS['VIDEO_HEIGHT'];

      canvasVideo = document.getElementById("formatted-video");

      if (landscapeCamera){
          canvasVideo.width = videoHeight;
          canvasVideo.height = videoWidth;
      }
      else{
          canvasVideo.width = videoWidth;
          canvasVideo.height = videoHeight;
      }
    });

     // toggle video recording visibility
     formatFolder.add(state, 'rotate', 0, 360, .001).onChange(function(rotateVal) {
        state.rotate = rotateVal;

    });
    // toggle video recording visibility
    formatFolder.add(state, 'scale', 0, 400, .5).onChange(function(scaleVal) {
        state.scale = scaleVal;

    });


     // toggle video recording visibility
    formatFolder.add(state, 'drawRawVideo').onChange(async val => {
        document.querySelector('#video').style.visibility = val ? "visible" : "hidden";
    });

    // toggle video recording visibility
    formatFolder.add(state, 'drawFormattedVideo').onChange(async val => {
        document.querySelector('#formatted-video').style.visibility = val ? "visible" : "hidden";
    });

    // toggle video recording visibility
    formatFolder.add(state, 'faceSizeThreshold', 0, 250, .5).onChange(function(faceSizeThreshold) {
        state.faceSizeThreshold= faceSizeThreshold;

    });

    
    formatFolder.add(state, 'drawCroppedFace').onChange(async val => {
        drawCroppedFaceVar = val ? true : false;

        croppedFaceCanvas = document.getElementById("cropped-video");


        if (drawCroppedFaceVar){
            croppedFaceCanvas.style.visibility = 'visible'
        }
        else{
            croppedFaceCanvas.style.visibility = 'hidden'
        }
        
    });

}

document.onkeydown = (event) => {  
    let key = event.key
    console.debug('[KEY]', key);
    switch ( key ) {

        case 'g':
            showStats = !showStats;
            if (showStats) {
                stats.dom.style.display = "block";
                document.querySelector('body').style.cursor = "pointer";
            } else {
                stats.dom.style.display = "none";
                document.querySelector('body').style.cursor = "none";
            }
            dat.GUI.toggleHide();
            break

    }
}