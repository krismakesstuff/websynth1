

let volume = -6;
let attack = 100;
let decay = 20;
let sustain = 0.5;
let release = 200;


//const synth = new Tone.PolySynth();

const synths = [
    new Tone.Synth({oscillator: {type: "fatsine"}}),
    new Tone.Synth({oscillator: {type: "fmsine"}}),
    new Tone.Synth({oscillator: {type: "amsine"}}),
    new Tone.Synth({oscillator: {type: "fattriangle"}}),
];

const gainNodes = [
    new Tone.Gain(0.5),
    new Tone.Gain(0.5),
    new Tone.Gain(0.5),
    new Tone.Gain(0.5),
];



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

const seqRows = [
    document.getElementById("seq-inst1"),
    document.getElementById("seq-inst2"),
    document.getElementById("seq-inst3"),
    document.getElementById("seq-inst4"),
];


const notes = [
    ["C3", "D3", "E3", "F3", "G3", "A3", "A#3", "B3"],
    ["C4", "D4", "E4", "F4", "G4", "A4", "A#4", "B4"],
    ["C5", "D5", "E5", "F5", "G5", "A5", "A#5", "B5"],
    ["C6", "D6", "E6", "F6", "G6", "A6", "A#6", "B6"],
];


Tone.Transport.bpm.value = 100;
Tone.Transport.scheduleRepeat(onBeat, '8n');
Tone.Transport.start();
console.log("Transport State: " + Tone.Transport.state);  

let index = 0;

function onBeat(time){
    for(let i = 0; i < seqRows.length; i++){
        let row = seqRows[i].children;
        let synth = synths[i];
        for(let j = 0; j < row.length; j++){
            let step = row[index % 8];
            if(step.tagName === "INPUT" && step.checked){
                synth.triggerAttackRelease(notes[i][j], "8n", time);
            }
        }
    }
    index++;
}

// spacebar event listener that toggles transport start/stop
document.addEventListener("keydown", (event) => {
    if(event.code === "Space"){
        if(Tone.Transport.state === "started"){
            Tone.Transport.stop();
        }
        else{
            Tone.Transport.start();
        }
        console.log(Tone.Transport.state);
    }
});


// connect synths to gainNodes
for(let i = 0; i < synths.length; i++){
 //   synths[i].connect(ampEnv);
    synths[i].connect(gainNodes[i]);
    synths[i].fan(waveformAnalyser, freqAnalyser);
}

// connect gainNodes to destination
for(let i = 0; i < gainNodes.length; i++){
    gainNodes[i].toDestination();
}

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


// audio keys event listener
// const keyboard = new AudioKeys({
//     polyphony: 4,
//     rows: 2,
//     priority: "last"
// });

// keyboard.down((key) => 
// {
//     //synth.set({})
//     //ampEnv.triggerAttack();
//     synth.triggerAttackRelease(key.frequency, "8n");
//     console.log(key)
// });

// event callbacks
function setVolume(newVolume){
    //synth.volume.value = newVolume;
    //osc.volume.value = newVolume;
    //console.log("Volume: " + newVolume);
    //gain.gain.value = newVolume;
}

function setOsc1Gain(newGain){
    gainNodes[0].gain.value = newGain;
    console.log("Osc1 Gain: " + newGain);
}

function setOsc2Gain(newGain){
    gainNodes[1].gain.value = newGain;
    console.log("Osc2 Gain: " + newGain);
}

function setOsc3Gain(newGain){
    gainNodes[2].gain.value = newGain;
    console.log("Osc3 Gain: " + newGain);
}

function setOsc4Gain(newGain){
    gainNodes[3].gain.value = newGain;
    console.log("Osc4 Gain: " + newGain);
}


