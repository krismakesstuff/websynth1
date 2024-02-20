
// function playNote() {
// // create a synth
// const synth = new Tone.Synth().toDestination();
// // play a note from that synth
// synth.triggerAttackRelease("F#2", "8n");
// }

//const synth = new Tone.Synth().toDestination();

const analyserSettings = {
    size: 2048,
    maxDecibels: -30,
    minDecibels: -100,
    smoothing: 0.5,
};


const analyser = new Tone.Analyser("waveform", analyserSettings);
let waveformBuffer = new Float32Array(2048);

function getAudioData() {
    waveformBuffer = analyser.getValue();
}

function draw() {

    requestAnimationFrame(draw);

    getAudioData();

    // get the canvas
    const canvas = document.getElementById("waveform-canvas");
    const ctx = canvas.getContext("2d");

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(227, 255, 127";
    ctx.beginPath();

    let x = 0;
    let sliceWidth = canvas.width * 1.0 / waveformBuffer.length;

    // draw the waveform
    for (let i = 0; i < waveformBuffer.length; i++) {
        const y = (0.5 + waveformBuffer[i] / 2) * canvas.height;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}
draw();

//window.requestAnimationFrame(draw);

const synth = new Tone.PolySynth();

const keyboard = new AudioKeys({
    polyphony: 4,
    rows: 2,
    priority: "last"
});

keyboard.down((key) => 
{
    synth.triggerAttackRelease(key.frequency, "8n");
    console.log(key)
});

// create an autopanner and start it
//const autoPanner = new Tone.AutoPanner("2n");

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

// connect the synth to the panner 
//synth.connect(feedbackDelay);
//synth.connect(autoPanner);
//autoPanner.connect(feedbackDelay);
//autoPanner.toDestination();
//feedbackDelay.toDestination();
//analyser.connect(synth);
synth.connect(analyser);
analyser.toDestination();

//autoPanner.start();








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

