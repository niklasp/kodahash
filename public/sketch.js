const DEFAULT_HASH_1 =
  "0x175adf5fc058830a6319b8238ecc911db6e1b8dd40965629b5f0c5bee655598c";
const DEFAULT_HASH_2 =
  "0xa3b47cf8e159640f2b8acd89ef4c2d1a7b9e5d2c40172638c9d0e1fab1234567";
const DEFAULT_HASH =
  "0x1c2d3a4b5e6f79808765c4b3a29180e2d3c4b5a6e7f890121314151617181920";
const DEFAULT_HASH_4 =
  "0xffeeddccbbaa99887766554433221100aabbccddeeff00112233445566778899";
const DEFAULT_HASH_5 =
  "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01";
const DEFAULT_HASH_6 =
  "0xdeadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef";

let hexagonPoints = [];
let radius = 600;
let centerX = 1600;
let centerY = 1600;
let angleOffset = 0;
const size = 3200;
let backgroundCol = "#fffff5";
let diffColors;
let numOfPoints;
const border = 600;
let rows;
let numberOfCircles = 0;
const maxRadius = (size - 2 * border) / 2; // Maximum radius within the border

let dots;

let palette = ["#E6007A", "#552BBF", "#00B2FF", "#D3FF33", "#56F39A"];

let attributes = {};

//////////////////////////////////////////////////
// Object for creation and real-time resize of canvas
// Good function to create canvas and resize functions. I use this in all examples.
const C = {
  loaded: false,
  prop() {
    return this.height / this.width;
  },
  isLandscape() {
    return window.innerHeight <= window.innerWidth * this.prop();
  },
  resize() {
    if (this.isLandscape()) {
      document.getElementById(this.css).style.height = "100%";
      document.getElementById(this.css).style.removeProperty("width");
    } else {
      document.getElementById(this.css).style.removeProperty("height");
      document.getElementById(this.css).style.width = "100%";
    }
  },
  setSize(w, h, p, css) {
    (this.width = w), (this.height = h), (this.pD = p), (this.css = css);
  },
  createCanvas() {
    (this.main = createCanvas(size, size, WEBGL)),
      pixelDensity(this.pD),
      this.main.id(this.css),
      this.resize();
  },
  save() {
    save(this.main, hash + ".png");
  },
};
C.setSize(size, size, 1, "mainCanvas");

function windowResized() {
  C.resize();
}

//////////////////////////////////////////////////
// The example really starts here

function extractValueFromAddress(address, max, start = 0, range = 4) {
  const part = address.substring(2 + start, 2 + start + range); // Skipping '0x' and taking the next range characters

  // Convert the hexadecimal string to a number
  const num = parseInt(part, 16);

  // Return a value between 0 and 255
  // This is done by taking the modulus of 256

  console.log("part", part, "num", num, "num % max", num % max);
  return num % max;
}

function generateRandomPseudoETHAddress() {
  let address = "0x";
  const characters = "0123456789abcdef";
  for (let i = 0; i < 40; i++) {
    address += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return address;
}
function hashRandom(hash, index) {
  // Simple hash-based pseudo-random number generator
  // 'index' ensures different values for different calls
  if (index < 0) {
    index = 0;
  }
  const char = hash.charCodeAt(index % hash.length);
  const seed = (char * (index + 1)) % 256;
  return seed / 255;
}

function setupRandomness(hash) {}

function setup() {
  C.createCanvas();
  angleMode(DEGREES);

  const params = getURLParams();

  // hash = params.hash || DEFAULT_HASH_2;
  hash = params.hash || generateRandomPseudoETHAddress();
  console.log("your hash is", hash);

  numberOfCircles = extractValueFromAddress(hash, 4);
  pointsPerCircle =
    (extractValueFromAddress(hash, 8, 4, 2) + 5) * (5 - numberOfCircles) * 0.5; //initial points per circle
  nextCirclePointsPlus = extractValueFromAddress(hash, 6, 6, 2) + 3; //points per circle increase

  rows = extractValueFromAddress(hash, 7, 20, 9) + 5; //rows
  spacing = (size - 2 * border) / (rows - 1);
  console.log("rows", rows);

  const shape = extractValueFromAddress(hash, 2, 11);
  console.log("shape", shape);

  if (shape === 0) {
    dots = calculateDotsOnCircles();
  } else {
    dots = calculateDotsOnGrid();
  }

  attributes.shape = shape === 0 ? "Circle" : "Grid";
  attributes.dots = dots.length;

  allColors = [];
  for (let i = 0; i < dots.length; i++) {
    allColors.push(palette[extractValueFromAddress(hash, 5, i % 40, 1)]);
  }

  console.log("allColors", allColors);
  console.log("pointsPerCircle", pointsPerCircle);
  console.log("numberOfCircles", numberOfCircles);

  noLoop(); // No need to loop since the dots don't change
}
function draw() {
  translate(-width / 2, -height / 2);
  background(backgroundCol);
  fill(0);
  noStroke();
  drawDots();
  // C.save();
}

function drawDots() {
  let colors = [];

  for (let i = 0; i < dots.length; i++) {
    const [x, y, radius] = dots[i];

    brush.noStroke();
    brush.noFill();
    brush.noHatch();

    let bleedSize = random(0.2, 0.9);

    // let dotColor = selectN(palette, [0.8, 0.125, 0.025, 0.025, 0.015]);
    let dotColor = allColors[i];
    colors.push(dotColor);

    brush.fill(dotColor, random(60, 120));
    brush.bleed(bleedSize);
    brush.circle(x, y, radius);

    // fill(dotColor);
    // ellipse(x, y, radius, radius);
  }

  attributes.dots_pink = countOccurrences(colors, palette[0]);
  attributes.dots_purple = countOccurrences(colors, palette[1]);
  attributes.dots_cyan = countOccurrences(colors, palette[2]);
  attributes.dots_lime = countOccurrences(colors, palette[3]);
  attributes.dots_green = countOccurrences(colors, palette[4]);

  console.log("attributes", attributes);
}

function countOccurrences(array, element) {
  let count = 0;
  array.forEach((item) => {
    if (item === element) {
      count++;
    }
  });
  return count;
}

function calculateDotsOnGrid() {
  const dots = [];
  let centerCell = Math.floor(rows / 2);
  for (let i = 0; i < rows; i++) {
    y = border + i * spacing;
    for (let j = 0; j < rows; j++) {
      let xOffset = ((i % 2) * spacing) / 2.0;
      x = border - xOffset + j * spacing;

      let distFromCenter =
        Math.max(Math.abs(i - centerCell), Math.abs(j - centerCell)) * 1.8;

      // Calculate the ellipse size based on the distance from the center
      let radius = (rows - distFromCenter) * (spacing / rows);
      radius = random(radius * 0.7, radius * 0.9);

      dots.push([x, y, radius]);
    }
  }
  return dots;
}

function calculateDotsOnCircles() {
  const center = size / 2; // Center of the sketch
  const dots = [[center, center, 300]]; // Start with the center dot

  if (numberOfCircles === 0) {
    return [
      [center, center, 300],
      [center, center, 140],
    ];
  }

  for (let i = 1; i <= numberOfCircles; i++) {
    const radius = (maxRadius / numberOfCircles) * i * 0.78; // Calculate radius for each circle
    const angleOffset = Math.PI * random(1); // Offset the angle so that the first dot is at the top

    for (let j = 0; j < pointsPerCircle; j++) {
      const angle = ((2 * Math.PI) / pointsPerCircle) * j + angleOffset;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      let distFromCenter =
        Math.max(Math.abs(i - center), Math.abs(j - center)) * 1.8;

      let brushSize =
        (numberOfCircles - distFromCenter) * (spacing / numberOfCircles);
      brushSize = random(radius * 0.7, radius * 0.9);

      dots.push([x, y, random(20, 150)]);
    }

    pointsPerCircle += nextCirclePointsPlus;
  }

  return dots;
}

function selectN(elements, probabilities) {
  if (elements.length !== probabilities.length) {
    throw new Error(
      "The lengths of elements and probabilities arrays must be equal."
    );
  }

  const totalProbability = probabilities.reduce((acc, val) => acc + val, 0);
  if (1.0 - totalProbability > 0.01) {
    throw new Error(
      `The sum of probabilities must be 1, not ${totalProbability}`
    );
  }

  let cumulativeProbability = 0;
  const threshold = Math.random();
  for (let i = 0; i < elements.length; i++) {
    cumulativeProbability += probabilities[i];
    if (cumulativeProbability >= threshold) {
      return elements[i];
    }
  }

  // As a fallback, return the last element. This case should not occur if probabilities sum up to 1.
  return elements[elements.length - 1];
}
