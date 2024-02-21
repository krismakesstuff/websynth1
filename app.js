

let volume = -6;
let attack = 100;
let decay = 20;
let sustain = 0.5;
let release = 200;


const synth = new Tone.PolySynth();

const ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0.1,    
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
});


// make analyser nodes
let analyserBinSize = 256;
const analyserSettings = {
    size: analyserBinSize,
    maxDecibels: -10,
    minDecibels: -100,
    smoothing: 0.5,
};

const waveformAnalyser = new Tone.Analyser("waveform", analyserSettings);
let waveformBuffer = new Float32Array(analyserBinSize);

const freqAnalyser = new Tone.Analyser("fft", analyserSettings);
let freqBuffer = new Float32Array(analyserBinSize);    

// connect sounds to output nodes
synth.fan(waveformAnalyser, freqAnalyser);
synth.toDestination();

// synth.connect(ampEnv);
// ampEnv.toDestination();

// osc.fan(waveformAnalyser, freqAnalyser);
// osc.toDestination();
//osc.start();



// start an oscillator at 220hz
//const osc = new Tone.Oscillator(120, "sine").toDestination();

// create feedback delay options object
// const delaySettings = {
//     delayTime: "4n",
//     feedback: 0.80,
//     wet: 0.25,

//     //maxDelay: 0.15
// };
// // make a feedback delay with the settings in delaySettings
// const feedbackDelay = new Tone.FeedbackDelay(delaySettings);
//const feedbackDelay = new Tone.FeedbackDelay("8n.", 0.50);

// function that gets called every frame to draw the waveform
function drawWaveform() {

    requestAnimationFrame(drawWaveform);

    // load buffer from analyser
    waveformBuffer = waveformAnalyser.getValue();
    
    // get the waveform canvas
    const waveformCanvas = document.getElementById("waveform-canvas");
    const waveformCtx = waveformCanvas.getContext("2d");

    // clear the waveform canvas
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    // set the line color and width
    waveformCtx.lineWidth = 1;
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

// function that gets called every frame to draw the FFT
function drawFreq(){

    requestAnimationFrame(drawFreq);

    // load buffer from analyser
    freqBuffer = freqAnalyser.getValue();

    // get the frequency canvas
    const freqCanvas = document.getElementById("freq-canvas");
    const freqCtx = freqCanvas.getContext("2d");

    // clear the frequency canvas
    freqCtx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);

    // set the line color and width
    freqCtx.beginPath();
    freqCtx.strokeStyle = "rgb(227, 255, 127)";
    freqCtx.lineWidth = 1;

    // map the amplitude to the y axis
    let dbToY = d3.scaleLinear().domain([-100, 0]). range([freqCanvas.height, 0]);
    
    // map the frequency to the x axis, logaritmicaly
    let freqToX = d3.scaleLog().domain([20, 20000]).range([0, freqCanvas.width]);

    // initialize the x and y coordinates
    let fx = 0;
    let fy = 0;
    
    // make path from the frequency buffer
    for(let i = 0; i < freqBuffer.length; i++){
        
        fy = dbToY(freqBuffer[i]);

        if(i === 0){
            freqCtx.moveTo(fx, fy);
        }
        else{
            freqCtx.lineTo(fx, fy);
        }

        fx = freqToX(i);
    }

    // draw the path
    freqCtx.stroke();

}

// call to trigger animation requests
drawWaveform();
drawFreq();

// event listeners
const keyboard = new AudioKeys({
    polyphony: 4,
    rows: 2,
    priority: "last"
});

// audio keys event listener
keyboard.down((key) => 
{
    //synth.set({})
    //ampEnv.triggerAttack();
    synth.triggerAttackRelease(key.frequency, "8n");
    console.log(key)
});

// event callbacks
function setVolume(newVolume){
    synth.volume.value = newVolume;
    osc.volume.value = newVolume;
    console.log("Volume: " + newVolume);
    
}

function setAttack(attackTime) {
    ampEnv.set({attack: attackTime});
    // log the new attack time
    console.log("Attack: " + attackTime);
}

function setDecay(decayTime) {
    ampEnv.set({decay: decayTime});
    // log the new decay time
    console.log("Decay: " + decayTime);
}

function setSustain(sustainLevel) {
    ampEnv.set({sustain: sustainLevel});
    // log the new sustain level
    console.log("Sustain: " + sustainLevel);
}

function setRelease(releaseTime) {
    ampEnv.set({release: releaseTime});
    // log the new release time
    console.log("Release: " + releaseTime);
}


