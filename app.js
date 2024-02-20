

let volume = -6;
let attack = 100;
let decay = 20;
let sustain = 0.5;
let release = 200;

const synth = new Tone.PolySynth();

const keyboard = new AudioKeys({
    polyphony: 4,
    rows: 2,
    priority: "last"
});

// audio keys event listener
keyboard.down((key) => 
{
    synth.triggerAttackRelease(key.frequency, "8n");
    console.log(key)
});

// create feedback delay options object
const delaySettings = {
    delayTime: "4n",
    feedback: 0.80,
    wet: 0.25,

    //maxDelay: 0.15
};


// make a feedback delay with the settings in delaySettings
const feedbackDelay = new Tone.FeedbackDelay(delaySettings);
//const feedbackDelay = new Tone.FeedbackDelay("8n.", 0.50);
let analyserBinSize = 1024;


const analyserSettings = {
    size: analyserBinSize,
    maxDecibels: -10,
    minDecibels: -50,
    smoothing: 0.1,
};


const waveformAnalyser = new Tone.Analyser("waveform", analyserSettings);
let waveformBuffer = new Float32Array(analyserBinSize);

const freqAnalyser = new Tone.Analyser("fft", analyserBinSize);
let freqBuffer = new Float32Array(analyserBinSize);    


function drawWaveform() {

    requestAnimationFrame(drawWaveform);

    // load buffer from analyser
    waveformBuffer = waveformAnalyser.getValue();
    
    // get the waveform canvas
    const waveformCanvas = document.getElementById("waveform-canvas");
    const waveformCtx = waveformCanvas.getContext("2d");

    // clear the waveform canvas
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    waveformCtx.lineWidth = 2;
    waveformCtx.strokeStyle = "rgb(227, 255, 127";
    waveformCtx.beginPath();

    let wx = 0;
    let wsliceWidth = waveformCanvas.width * 1.0 / waveformBuffer.length;

    // draw the waveform
    for (let i = 0; i < waveformBuffer.length; i++) {
        const wy = (0.5 + waveformBuffer[i] / 2) * waveformCanvas.height;
        if (i === 0) {
            waveformCtx.moveTo(wx, wy);
        } else {
            waveformCtx.lineTo(wx, wy);
        }
        wx += wsliceWidth;
    }
    waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    waveformCtx.stroke();

}

function drawFreq(){

    requestAnimationFrame(drawFreq);

    freqBuffer = freqAnalyser.getValue();

    // get the frequency canvas
    const freqCanvas = document.getElementById("freq-canvas");
    const freqCtx = freqCanvas.getContext("2d");

    // clear the frequency canvas
    freqCtx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);

    freqCtx.lineWidth = 2;
    //freqCtx.strokeStyle = "rgb(227, 255, 127)";
    freqCtx.beginPath();


    // draw the frequencies
    var barWidth = ( freqCanvas.width / freqBuffer.length  );
    var barHeight;
    var fx = 0;
    var fy = 0;

    

    for (var i = 0; i < freqBuffer.length; i++) {
        
        barHeight = freqBuffer[i] * 1.0;
        freqCtx.fillStyle = 'rgb(227, 255, 127)';
        fy = freqCanvas.height - (barHeight/2);
        freqCtx.fillRect(fx, fy, barWidth, barHeight);
        fx += barWidth + 1;
    }    


}

drawWaveform();
drawFreq();
//window.requestAnimationFrame(draw);


function setVolume(newVolume){
    synth.volume.value = newVolume;
    console.log("Volume: " + newVolume);
}


function setAttack(attackTime) {
  synth.set({attack: attackTime});
}


synth.fan(waveformAnalyser, freqAnalyser);
synth.toDestination();









// Trigger note when space bar is pressed
// document.addEventListener('keydown', function(e) {
//   if (e.code === 'Space') {
//     synth.triggerAttackRelease('F#2', '8n');
//   }
// });

// Trigger note when number 1 key is pressed
// document.addEventListener('keydown', function(e) {
//   if (e.code === 'Digit1') {
//     synth.triggerAttackRelease('F#2', '4n');
//     // log keypress
//     console.log("Key pressed: " + e.code);
//   }
//   if (e.code === 'Digit2') {
//     synth.triggerAttackRelease('A#2', '4n');
//     console.log("Key pressed: " + e.code);
//   }
// });

// function playNote2(){
//     // play a note a major third about the space bar note
//     synth.triggerAttackRelease("A#2", "4n");

// }



// log tone context state
//console.log(" end of file state: " + Tone.context.state); 

