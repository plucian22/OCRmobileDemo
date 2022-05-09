
//Check if Safari or Chrome:


//window.open("googlechrome://navigate?url=" + url,"_system");
//window.open("googlechrome://navigate?url=" + "www.google.com","_system");

/*if(!IsCompatibleBrowser())
{
  window.open(
    "googlechrome://navigate?url=" + "www.google.com",
    "_system"
  );
}
*/


//Store hooks and video sizes:
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
var vidWidth = 0;
var vidHeight = 0;
var xStart = 0;
var yStart = 0;



const imageSize = 375;
//const captureSize={w:100,h:50};//pxels
const captureSize={w:150,h:60};//pxels
//Match prob. threshold for object detection:
var classProbThreshold = 0.4;//40%


//Creating canvas for OCR:
const c = document.createElement('canvas');
//const c = document.getElementById('canvas');
c.width = captureSize.w;
c.height = captureSize.h;
var click_pos = {x:0, y:0};
var mouse_pos = {x:0, y:0};


var Analyzef=false;





//----------Put video on canvas:
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

function renderFrame() {
  // re-register callback
  requestAnimationFrame(renderFrame);
  // set internal canvas size to match HTML element size
  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollHeight;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // scale and horizontally center the camera image
    var videoSize = { width: video.videoWidth, height: video.videoHeight };
    var canvasSize = { width: canvas.width, height: canvas.height };
    var renderSize = calculateSize(videoSize, canvasSize);
    var xOffset = 0;//(canvasSize.width - renderSize.width) / 2;
    var yOffset = 0;//(canvasSize.height - renderSize.height) / 2;

    context.drawImage(video, xOffset, yOffset, renderSize.width, renderSize.height);
  }
}


//Streching image on canvas:
function calculateSize(srcSize, dstSize) {
    var srcRatio = srcSize.width / srcSize.height;
    var dstRatio = dstSize.width / dstSize.height;
    if (dstRatio > srcRatio) {
      return {
        width:  dstSize.height * srcRatio,
        height: dstSize.height
      };
    } else {
      return {
        width:  dstSize.width,
        height: dstSize.width / srcRatio
      };
    }
  }


//Capture on canvas the image:
function Capture(e)
{
  /*
  mouse.x = (event.mouseX / gwidth) * 2 - 1;
  mouse.y = -(event.mouseY / gheight) * 2 + 1;
  */
  var initialX=0,initialY=0;
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
  } else {
    initialX = e.clientX;
    initialY = e.clientY;
  }

  let mouse= {x:0,y:0};
  mouse.x = initialX;
  mouse.y = initialY;
  mouse_pos = mouse;
  console.log('mouse readings:', mouse);
  xy = getCursorPosition(canvas, e);
  console.log('click canvas readings:', xy);
  click_pos = {x: xy.x-(captureSize.w/2), y: (xy.y-captureSize.h/2)};

  //click_pos = {x: mouse.x-(captureSize.w/2), y: (mouse.y-captureSize.h/2)};//update click pos
  //MarkArea(mouse.x-captureSize.w/2, mouse.y-captureSize.h/2,captureSize.w,captureSize.h);
  Analyzef=true;
}



//Image detects object that matches the preset:
async function detectTFMOBILE(imgToPredict) {

  //Get next video frame:
  //Perform OCR:
  if(Analyzef)//Analyzef
  {
    //c.getContext('2d').drawImage(video, click_pos.x, click_pos.y, captureSize, captureSize);
    //c.getContext('2d').drawImage(video, click_pos.x, click_pos.y, captureSize.w, captureSize.h);
    //c.getContext('2d').drawImage(video, click_pos.x, click_pos.y, captureSize.w, captureSize.h,0,0,captureSize.w, captureSize.h);
    c.getContext('2d').drawImage(canvas, click_pos.x, click_pos.y,
      captureSize.w, captureSize.h,0,0,captureSize.w, captureSize.h);

    //MarkArea(mouse_pos.x-captureSize.w/2,mouse_pos.y-captureSize.h/2,

    //  captureSize.w,captureSize.h,"");

     // captureSize.w,captureSize.h,"");
    let tempMark = MarkAreaSimple(mouse_pos.x-captureSize.w/2,mouse_pos.y-captureSize.h/2,captureSize.w,captureSize.h);

    let res = await Recognize(c);

    tempMark.remove();

    //MarkArea(click_pos.x,click_pos.y+captureSize.h/2,captureSize.w,captureSize.h,res);
    MarkArea(mouse_pos.x-captureSize.w/2,mouse_pos.y-captureSize.h/2,captureSize.w,captureSize.h,res);
    Analyzef=false;

    //window.location.href = 'sms://send?phone='+res.replaceAll('-','');
    if(res.length>=10)
      window.location.href = 'sms:'+ res.replaceAll('-','');

    //window.location.href = 'whatsapp://send?phone='+res.replaceAll('-','');
  }
}

//Mark OCR area:
function MarkArea(minX, minY,width_,height_,text) {

  var highlighter = document.createElement('div');
  highlighter.setAttribute('class', 'highlighter');

  //minX = (minX+width_/2).toFixed(0);
  //minY= (minY+height_/2).toFixed(0);

  //console.log('mxx',minX);
  //console.log('my',minY);

  highlighter.style = 'left: ' + minX + 'px; ' +
      'top: ' + minY + 'px; ' +
      'width: ' + width_ + 'px; ' +
      'height: ' + height_ + 'px;';
  highlighter.innerHTML = '<p>'+ text +'</p>';
  liveView.appendChild(highlighter);
  //canvas.appendChild(highlighter);
  children.push(highlighter);

  if (text.length < 1) {
    liveView.removeChild(highlighter);
  } else {
    setTimeout(() => {
      liveView.removeChild(highlighter);
    }, 5000);
  }
}

//Mark OCR area:
function MarkAreaSimple(minX, minY,width_,height_) {
  var highlighter = document.createElement('div');
  highlighter.setAttribute('class', 'highlighter_s');

  //minX = (minX+width_/2).toFixed(0);
  //minY= (minY+height_/2).toFixed(0);

  //console.log('mxx',minX);
  //console.log('my',minY);

  highlighter.style = 'left: ' + minX + 'px; ' +
      'top: ' + minY + 'px; ' +
      'width: ' + width_ + 'px; ' +
      'height: ' + height_ + 'px;';
  //highlighter.innerHTML = '<p>'+ text +'</p>';
  liveView.appendChild(highlighter);
  //canvas.appendChild(highlighter);
  children.push(highlighter);

  return highlighter;
}









// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to activation button:
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if model has finished loading.
  if (!model) {
    return;
  }
  //Enable click event:
  //document.addEventListener("mousedown", Capture, false);
  canvas.addEventListener("mousedown", Capture, false);
  //const canvas = document.querySelector('canvas')
  canvas.addEventListener('mousedown', function(e) {
      getCursorPosition(canvas, e)
  });


  // Hide the button once clicked.
  enableWebcamButton.classList.add('removed');

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Stream video from VAR (for safari also)
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment"
    },
  }).then(stream => {
    let $video = document.querySelector('video');
    $video.srcObject = stream;
    $video.onloadedmetadata = () => {
      vidWidth = $video.videoHeight;
      vidHeight = $video.videoWidth;
      //The start position of the video (from top left corner of the viewport)
      xStart = Math.floor((vw - vidWidth) / 2);
      yStart = (Math.floor((vh - vidHeight) / 2)>=0) ? (Math.floor((vh - vidHeight) / 2)):0;
      $video.play();
      //Attach detection model to loaded data event:
      $video.addEventListener('loadeddata', predictWebcamTF);

      renderFrame();//TBD
    }
  });
}



var model = undefined;
model_url = 'https://raw.githubusercontent.com/KostaMalsev/ImageRecognition/master/model/mobile_netv2/web_model2/model.json';
//Call load function
Init();//async load tessaract model
//asyncLoadModel(model_url);
model = 2;//TBD



//Function Loads the GraphModel type model of
async function asyncLoadModel(model_url) {
    model = await tf.loadGraphModel(model_url);
    console.log('Model loaded');
    //Enable start button:
    enableWebcamButton.classList.remove('invisible');
    enableWebcamButton.innerHTML = 'Start camera';
}



var children = [];
//Perform prediction based on webcam using Layer model model:
function predictWebcamTF() {
    // Now let's start classifying a frame in the stream.
    detectTFMOBILE(video).then(function () {
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcamTF);
    });
}









//Function Renders boxes around the detections:
function renderPredictionBoxes (predictionBoxes, predictionClasses, predictionScores)
{
    //Remove all detections:
    for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
    }
    children.splice(0);
//Loop through predictions and draw them to the live view if they have a high confidence score.
    for (let i = 0; i < 99; i++) {
//If we are over 66% sure we are sure we classified it right, draw it!
        const minY = (predictionBoxes[i * 4] * vidHeight+yStart).toFixed(0);
        const minX = (predictionBoxes[i * 4 + 1] * vidWidth+xStart).toFixed(0);
        const maxY = (predictionBoxes[i * 4 + 2] * vidHeight+yStart).toFixed(0);
        const maxX = (predictionBoxes[i * 4 + 3] * vidWidth+xStart).toFixed(0);
        const score = predictionScores[i * 3] * 100;
const width_ = (maxX-minX).toFixed(0);
        const height_ = (maxY-minY).toFixed(0);
//If confidence is above 70%
        if (score > 70 && score < 100){
            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + minX + 'px; ' +
                'top: ' + minY + 'px; ' +
                'width: ' + width_ + 'px; ' +
                'height: ' + height_ + 'px;';
            highlighter.innerHTML = '<p>'+Math.round(score) + '% ' + 'Your Object Name'+'</p>';
            liveView.appendChild(highlighter);
            children.push(highlighter);
        }
    }
}



//Get click on canvas:
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    //console.log("x: " + x + " y: " + y);
    return {x,y};
}






























//If compatible browser:
function IsCompatibleBrowser()
{

  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1 - 79
  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

  // Edge (based on chromium) detection
  var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;

  if(!isChrome && !isSafari && !isFirefox)
  {
    return false
  }else{
    return true;
  }
}
