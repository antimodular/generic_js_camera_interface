
function sendCroppedData(croppedFaceData){
  var yourUrl = PARAMS['POST_URL']
  var xhr = new XMLHttpRequest();

  dataToSend = JSON.stringify({
    image: croppedFaceData  
  })
  
  xhr.open("POST", yourUrl, true);

  xhr.setRequestHeader('Content-Type', 'application/json');
 
  xhr.send(dataToSend);

  xhr.onload = function() {
    data = this.responseText
    if(data.length > 30){
      data = JSON.parse(data.toString())
    }
    else{
      data = null
    }
    console.log('returned data')
    console.log(data)
  }

}

function getTimestampInSeconds () {
  return Math.floor(Date.now() / 1000)
}

function setupCanvas() {

  // canvas to record video
  canvasVideo = document.getElementById("formatted-video");
  canvasCroppedVideo = document.getElementById("cropped-video");

  if (state.landscapeCamera){
       canvasVideo.width = videoHeight;
       canvasVideo.height = videoWidth;
  }
  else{
       canvasVideo.width = videoWidth;
       canvasVideo.height = videoHeight;
  }

}

lastCalled = 0

async function renderCallback(model){

    drawFormattedVideo();
    if (showStats) stats.begin();

    const faces = await detector.estimateFaces(video,
        {
            input: video,
            returnTensors: false,
            flipHorizontal: false,
        }
    );
    
    if (faces[0]){
        face = faces[0]
        let isPassing = false;
    
        let faceWid = face.box.width;
        if( faceWid > state.faceSizeThreshold){
            isPassing = true;
        }

        if(isPassing){
            console.log('face detected and valid')
            drawCroppedFace(face.box)
            croppedFaceData = document.getElementById('cropped-video').toDataURL("image/jpeg").replace("image/jpeg", "").replace("data:;", "").replace("base64,", "");
          
            if (lastCalled == 0 || getTimestampInSeconds() - lastCalled > 5){
              //sendCroppedData(croppedFaceData)
              lastCalled = getTimestampInSeconds()
            }
            
        }
    }

    if (showStats) stats.end();
    
    requestAnimationFrame( renderCallback );
    
}
function rotate(ctx) {
  W = ctx.canvas.width 
  H = ctx.canvas.height;

  const pxRead = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const r32 = new Uint32Array(pxRead.data.buffer);  /* not needed for 8 bit ver */
  const pxWrite = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const w32 = new Uint32Array(pxWrite.data.buffer); /* not needed for 8 bit ver */


  const ang = state.rotate * (Math.PI / 180);
  const scale = state.scale / 100;

  /* For 8bit replace the following line with the commented line below it */
  scanLine(W / 2, H / 2, ang, scale, r32, w32);
  // scanLine8Bit(W / 2, H / 2, ang, scale, pxRead.data, pxWrite.data);

  ctx.putImageData(pxWrite,0,0);
}
function scanLine(ox, oy, ang, scale, r32, w32) {
  const xAx = Math.cos(ang) / scale;
  const xAy = Math.sin(ang) / scale;
  w32.fill(0);
  var rx, ry, idxW, x = 0, y = 0;
  while (y < H) {
      const xx = x - ox, yy = y - oy;
      rx = xx * xAx - yy * xAy + ox; // Get image coords for row start
      ry = xx * xAy + yy * xAx + oy;
      idxW = y * W + x;
      while (x < W) {
          if (rx >= 0 && rx < W && ry >= 0 && ry < H) {
              w32[idxW] = r32[(ry | 0) * W + (rx | 0)]; 
          }
          idxW ++;
          rx += xAx;
          ry += xAy;
          x++;
      }
      y ++;
      x = 0;
  }
}

 function drawFormattedVideo(){
    ctxVideo.save();

    if(state.flipVideo){
        ctxVideo.translate(canvasVideo.width,0);
        ctxVideo.scale (-1,1);
    }

    aspectRatio = parseFloat(PARAMS['ASPECT_RATIO'])      

    if (state.landscapeCamera){
        
        ctxVideo.drawImage(
            video, 
            videoWidth/4,
            0, 
            videoWidth,
            videoHeight,
            0,
            0,
            Math.round(videoWidth*aspectRatio),
            Math.round(videoHeight*aspectRatio),
        )
           
    }
    
    else{
      ctxVideo.drawImage(video, 0, 0, videoWidth,videoHeight);
    }
   
    rotate(ctxVideo)
    ctxVideo.restore()
}

function drawCroppedFace(faceBox){
  ctxCroppedVideo.save();
  canvasCroppedVideo.width = faceBox.width
  canvasCroppedVideo.height = faceBox.height
  canvasCroppedVideo.style.height=`${faceBox.height}px`
  canvasCroppedVideo.style.width=`${faceBox.width}px`
 
  if(state.flipVideo){
    ctxCroppedVideo.translate(canvasCroppedVideo.width,0);
    ctxCroppedVideo.scale (-1,1);
  }

  
  ctxCroppedVideo.drawImage(
    document.getElementById('video'),
      faceBox.xMin,//Start Clipping
      faceBox.yMin,//Start Clipping
      faceBox.width,//Clipping Width  (video.width/1.44)/3.33
      faceBox.height,//Clipping Height
      0,//Place X
      0,//Place Y
      faceBox.width,//Place Width
      faceBox.height//Place Height
  );

  rotate(ctxCroppedVideo)


  ctxCroppedVideo.restore()

}

function setupCanvas() {

  // canvas to record video
  canvasVideo = document.getElementById("formatted-video");
  canvasCroppedVideo = document.getElementById("cropped-video");

  if (state.landscapeCamera){
       canvasVideo.width = videoHeight;
       canvasVideo.height = videoWidth;
  }
  else{
       canvasVideo.width = videoWidth;
       canvasVideo.height = videoHeight;
  }

  ctxVideo = canvasVideo.getContext('2d');
  ctxVideo.scale(1, 1);
  ctxVideo.fillStyle = state.backgroundCol;
  ctxVideo.strokeStyle = state.backgroundCol;
  ctxVideo.lineWidth = 0.4;

  ctxCroppedVideo = canvasCroppedVideo.getContext('2d');
  ctxCroppedVideo.scale(1, 1);
}
  
  async function main() {
    
    // Audio/Video Streams
    setupCanvas();
    await setupCamera();
    video.play();
    captureStream = canvasVideo.captureStream();
    
    
     // Load Face Landmarks Detection
     const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
   
        const detectorConfig = {
          maxFaces: 1,
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    
        };
        detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    
    
    // GUI
    setupDatGui();
    gui.hide();
    
    // Stats
    if (showStats) {
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.getElementById('body').appendChild(stats.dom);
    }
    
    renderCallback(model)
    
};