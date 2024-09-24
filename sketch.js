let messages = [
  { code: '1 4 3', message: 'They love you ', advice: 'Cherish love received and kindly reciprocate.', type: 'positive1' },
  { code: '2 2 0', message: 'They are thinking of you ', advice: 'You are valued and remembered, cherish this.', type: 'positive2' },
  { code: '9 1 1', message: 'They need you now ', advice: 'Being needed is a privilege, respond graciously.', type: 'positive3' },
  { code: '5 0 1', message: 'You complete them ', advice: 'Strengthen your bonds by growing together.', type: 'positive4' },
  { code: '6 0 7', message: 'They are missing you ' , advice: 'Connection deepens with distance, stay in touch.', type: 'positive5' },
  { code: '3 9 4', message: 'They do not care about you ', advice: 'Focus on those who value and respect you.', type: 'negative1' },
  { code: '1 8 0', message: 'They are thinking of someone else ', advice: 'Your self-worth is not tied to their thoughts.', type: 'negative2' },
  { code: '6 2 4', message: 'They have moved on ', advice: 'Embrace change, seek growth and personal healing.', type: 'negative3' },
  { code: '4 7 7', message: 'They are emotionally distant ', advice: 'Guard your heart where emotions are not valued.', type: 'negative4' },
  { code: '4 1 1', message: 'There is no connection ', advice: 'Use this time to reconnect with yourself.', type: 'negative5' },
  { code: '4 1 2', message: 'They are focusing on their life ', advice: 'Respect their journey, focus on your growth.', type: 'neutral1' },
  { code: '4 1 5', message: 'They are not seeking love ', advice: 'Enjoy the peace that solitude can bring.', type: 'neutral2' },
  { code: '9 8 7', message: 'They are busy with work ', advice: 'Balance work with personal life diligently.', type: 'neutral3' },
  { code: '1 0 0', message: 'They are taking things slow ', advice: 'Slow progress is still progress, be patient.', type: 'neutral4' },
  { code: '6 2 1', message: 'They are self-content ', advice: 'Personal contentment is the key to happiness.', type: 'neutral5' }
];

let selectedMessage;
let displayMode = 1; // 0 for grid display, 1 for Perlin noise display
let xOffset = 500; 
let yOffset = 5000;
let heartPatternDuplicates = 50; // Duplicates for the heart noise pattern
let noisePatternDuplicates = 150; // Duplicates for the noise pattern
let invertColors = false;
let heartImage;
let noisePatternRunning = true; // Flag to keep the noise pattern running
let userInteracted = false; // Track if the user has interacted to generate a message
let messageIndex = 0;
let messageText = "";
let codeText = "";
let typingSpeed = 100; // Adjust typing speed in milliseconds



function preload() {
  heartImage = loadImage('heartpattern.png'); // Load your 32x32px heart image
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  if (windowWidth <= 768) { // Mobile or tablet width
    textSize(20); // Smaller font size for mobile
    heartPatternDuplicates = 20; // Fewer particles for mobile
    noisePatternDuplicates = 50; // Smaller number of particles
  } else {
    textSize(40); // Default for larger screens
    heartPatternDuplicates = 50; // Default particle duplicates
    noisePatternDuplicates = 150; // Default noise pattern duplicates
  }
  
  textFont('VT323');
  fill(0, 255, 0);

  // Handle double click and double tap for switching modes
  window.addEventListener('dblclick', function() {
    displayMode = (displayMode + 1) % 3; // Cycle through modes
    redraw();
  });
}

  
function draw() {
  if (!userInteracted) {
    // Render the Heart Noise Pattern on the welcome screen
    background(57, 24, 28, 90); // Pink background
    displayHeartNoisePattern(); // Heart noise pattern during the welcome screen
  } else if (selectedMessage) {
    let bgColor = getBackgroundColorForType(selectedMessage.type);
    let rgb = hexToRgb(bgColor);

    switch (displayMode) {
      case 2:
        background(rgb.r, rgb.g, rgb.b, 255); // Fully opaque background for grid display
        textSize(120);
        displayGridPattern();
        frameRate(10);
        break;
      case 1:
        background(rgb.r, rgb.g, rgb.b, 80); // Reduced opacity for Perlin noise to create trail effects
        textSize(45);
        displayNoisePattern();
        frameRate(30);
        break;
      case 0:
        background(rgb.r, rgb.g, rgb.b, 80); // Reduced opacity for Hypnotic Circles to see the animations clearly
        displayHypnoticCircles();
        frameRate(50);
        break;
    }
  }
}


  // Helper function to convert hex color to RGB
function hexToRgb(hex) {
  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}


let typingIntervals = {}; // Store separate intervals for each monitor

// Generate the pager message with typing effect
function generatePagerMessage() {
  let index = floor(random(messages.length));
  selectedMessage = messages[index];

  messageIndex = 0; // Reset index for typing
  codeText = selectedMessage.code;
  messageText = selectedMessage.message;
  adviceText = selectedMessage.advice; // Make sure we define adviceText from selectedMessage

  // Clear existing message areas and stop any active typing interval for each monitor
  monitors.forEach(monitorId => {
    const messageArea = document.querySelector(`#${monitorId} .messageArea`);
    const adviceArea = document.querySelector(`#${monitorId} .adviceArea`);

    // Clear any previous intervals
    clearInterval(typingIntervals[monitorId]);

    messageArea.innerHTML = `Pager Code: <span id="typed-code-${monitorId}"></span><br><br>Message: <span id="typed-message-${monitorId}"></span>`;
    adviceArea.innerHTML = `Advice: <br> <span id="typed-advice-${monitorId}"></span>`;

    // Start typing effect for both the code, message, and advice in every monitor
    typeOutText(`typed-code-${monitorId}`, codeText, monitorId, () => {
      typeOutText(`typed-message-${monitorId}`, messageText, monitorId, () => {
        typeOutText(`typed-advice-${monitorId}`, adviceText, monitorId); // Start typing advice after message is done
      });
    });
  });

  userInteracted = true;
  redraw(); // Force a redraw to update the display
}

// Function to type out text, one character at a time with independent intervals
function typeOutText(elementId, text, monitorId, callback) {
  let i = 0;

  // Ensure we clear the content of the element before typing starts
  document.getElementById(elementId).innerHTML = '';

  // Set up independent intervals for each monitor
  typingIntervals[monitorId] = setInterval(() => {
    if (i < text.length) {
      document.getElementById(elementId).innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(typingIntervals[monitorId]);
      if (callback) callback(); // Call the callback (if provided) once typing is complete
    }
  }, typingSpeed);
}




function getColorForType(type, alpha) {
  const backgroundColors = {
    'positive1': [207, 100, 109, alpha],    // #CF646D
    'positive2': [199, 96, 72, alpha],      // #C76048
    'positive3': [199, 109, 190, alpha],    // #C76DBE
    'positive4': [215, 121, 219, alpha],    // #BF64F0 
    'positive5': [215, 71, 228, alpha],     // #8964F0   
    'negative1': [44, 157, 120, alpha],     // #2C9D78
    'negative2': [44, 157, 88, alpha],      // #2C9D58
    'negative3': [44, 146, 39, alpha],      // #2C9227
    'negative4': [108, 145, 31, alpha],     // #6C911F
    'negative5': [145, 127, 31, alpha],     // #917F1F
    'neutral1': [152, 137, 90, alpha],      // #98895A
    'neutral2': [159, 125, 83, alpha],      // #9F7D53
    'neutral3': [129, 118, 119, alpha],     // #817677
    'neutral4': [111, 107, 108, alpha],     // #6F6B6C
    'neutral5': [89, 114, 129, alpha]       // #597281
  };
  let rgb = backgroundColors[type] || [255, 255, 255, alpha];  // Default to white if type not found
  return color(rgb[0], rgb[1], rgb[2], alpha);  // Correctly creating RGBA color
}



function getBackgroundColorForType(type) {
  const backgroundColors = {
    'positive1': '#240D0F', 
    'positive2': '#250E0E', 
    'positive3': '#290F24', 
    'positive4': '#250923', 
    'positive5': '#270F29', 
    'negative1': '#08211B', 
    'negative2': '#082114', 
    'negative3': '#082108', 
    'negative4': '#172108', 
    'negative5': '#211F08', 
    'neutral1': '#261E18', 
    'neutral2': '#271A16', 
    'neutral3': '#302C2C', 
    'neutral4': '#1F1E1E',
    'neutral5': '#111417' 
  };
  return backgroundColors[type] || '#000000';  // Default to black if type not found
}



function displayGridPattern() {
  let charWidth;
  let gapY;

  if (windowWidth <= 768) { // Mobile or tablet width
    textSize(30); // Smaller text size for mobile
    gapY = 20; // Smaller gap for mobile
    charWidth = textWidth('W'); // Adjust based on smaller font-size
  } else {
    textSize(120); // Larger text size for desktop
    gapY = 80; // Larger gap for desktop
    charWidth = textWidth('W'); // Adjust based on larger font-size
  }

  for (let y = gapY; y < height; y += gapY) {
    for (let x = 0; x < width; x += charWidth) {
      let i = Math.floor((x / charWidth) % selectedMessage.message.length);
      let alpha = random(50, 255); // Dynamic opacity
      fill(getColorForType(selectedMessage.type, alpha)); // Get color based on message type
      text(selectedMessage.message[i], x, y);
    }
  }
}



function displayHeartNoisePattern() {
  let noiseScale = 0.02;
  xOffset += 0.01;
  yOffset += 0.01;

  for (let n = 0; n < heartPatternDuplicates; n++) { // Use heartPatternDuplicates
    let startX = noise(xOffset + n * noiseScale) * width;
    let startY = noise(yOffset + n * noiseScale) * height;

    for (let i = 0; i < 10; i++) { // Create a repetitive pattern
      let x = (startX + (i * 250) + n * 20) % width;
      let y = (startY + (i * 150) + n * 30) % height;
      
      // Draw heart image instead of shapes
      image(heartImage, x, y, 32, 32); // Display the 32x32 heart PNG
    }
  }
}

function displayNoisePattern() {
  let bgColor = getBackgroundColorForType(selectedMessage.type);
  let rgb = hexToRgb(bgColor);
  
  let noiseScale = 0.02;
  xOffset += 0.01;
  yOffset += 0.01;

  for (let n = 0; n < noisePatternDuplicates; n++) { // Use noisePatternDuplicates for noise pattern
    let startX = noise(xOffset + n * noiseScale) * width;
    let startY = noise(yOffset + n * noiseScale) * height;

    for (let i = 0; i < selectedMessage.code.length; i++) {
      let x = (startX + (i * 200) + n * 20) % width;
      let y = (startY + (i * 150) + n * 30) % height;
      fill(getColorForType(selectedMessage.type, 255)); // Color always full opacity here
      text(selectedMessage.code[i], x, y);
    }
  }
}


let angleOffset = 0;  // Global variable to control the rotation

function displayHypnoticCircles() {
  let bgColor = getBackgroundColorForType(selectedMessage.type);
  let rgb = hexToRgb(bgColor);

  let numLayers;
  let baseRadius;
  let textSizeValue;
  let maxRadius;
  let translateX, translateY;

  if (windowWidth <= 768) { // Mobile or tablet width
    numLayers = 5; // Fewer layers for mobile
    baseRadius = 140; // Smaller base radius for mobile
    textSizeValue = 80; // Smaller text size for mobile
    maxRadius = width / 0.75; // Smaller max radius for mobile
    translateX = (width / 2) - 15; // Smaller translation for mobile
    translateY = (height / 2) +15; // Adjust vertical translation for mobile
  } else {
    numLayers = 8; // More layers for desktop
    baseRadius = 240; // Larger base radius for desktop
    textSizeValue = 160; // Larger text size for desktop
    maxRadius = width / 1.5; // Larger max radius for desktop
    translateX = (width / 2) - 25; // Standard translation for desktop
    translateY = (height / 2) + 20; // Standard vertical translation for desktop
  }

  let layerIncrement = (maxRadius - baseRadius) / numLayers; // Radius increment per layer

  push();
  translate(translateX, translateY); // Center the origin based on screen size

  for (let j = 0; j < numLayers; j++) {
    let currentRadius = baseRadius + j * layerIncrement;
    let angleStep = 360 / selectedMessage.message.length;
    let rotationDirection = j % 2 === 0 ? 1 : -1; // Alternate direction

    for (let i = 0; i < 360; i += angleStep) {
      let rad = radians(i + angleOffset * rotationDirection);
      let x = currentRadius * cos(rad);
      let y = currentRadius * sin(rad);

      push();
      translate(x, y);
      rotate(rad + random); // Rotate to align text properly along the circle
      textSize(textSizeValue); // Use dynamic text size
      noFill();

      let charIndex = Math.floor(i / angleStep) % selectedMessage.message.length;
      let msgColor = getColorForType(selectedMessage.type, random(150, 255));
      stroke(msgColor);
      strokeWeight(3);
      text(selectedMessage.message[charIndex], 0, 0);
      pop();
    }
  }

  pop(); // Restore the original drawing style and transformations
  angleOffset += 0.7; // Increment the angle to animate the rotation
}




//-------------- double tap for phone/tablet

let lastTap = 0; // To track the time of the last tap

window.addEventListener('touchend', function(event) {
  let currentTime = new Date().getTime();
  let tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    displayMode = (displayMode + 1) % 3; // Cycle through 0, 1, 2 like double click
    redraw(); // Force redraw if noLoop() is active
  }
  lastTap = currentTime;
});






/*
        document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
        clearInterval(rotationInterval);  // Clear the existing interval if any
        rotationInterval = setInterval(rotateAndInvert, 20);  // Adjust the interval for smoother animation
    }
});



function rotateAndInvert() {
  currentRotation = (currentRotation + 90) % 360; // Increment by 90 degrees on each press
  const monitor = document.getElementById('monitor');
  monitor.style.transform = `rotate(${currentRotation}deg)`; // Apply rotation

  // Toggle visibility based on current angle
  if (currentRotation >= 180) {
    document.getElementById('messageArea').style.display = 'none';
    document.getElementById('adviceArea').style.display = 'block';
  } else {
    document.getElementById('messageArea').style.display = 'block';
    document.getElementById('adviceArea').style.display = 'none';
  }

  // Apply invert filter at 180 degrees rotation
  if (currentRotation === 180) {
    document.body.style.filter = 'invert(1)';
  } else if (currentRotation === 0) {
    document.body.style.filter = 'invert(0)';
  }
}
  */
