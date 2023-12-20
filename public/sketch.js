let hexagonPoints = [];
let radius = 600;
let centerX = 1500;
let centerY = 1500;
let angleOffset = 0;
const size = 3000;
let backgroundCol = "#fffff5";
let diffColors;
let numOfPoints;
const border = 680;
let rows;
let numberOfCircles = 0;
const maxRadius = (size - 2 * border) / 2; // Maximum radius within the border

let dots;
let palette = ["#E6007A", "#552BBF", "#00B2FF", "#D3FF33", "#56F39A"];
let attributes = {};

function extractValueFromAddress(address, max, start = 0, range = 4) {
  const part = address.substring(2 + start, 2 + start + range); // Skipping '0x' and taking the next range characters

  // Convert the hexadecimal string to a number
  const num = parseInt(part, 16);

  // Return a value between 0 and max
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

function setup() {
  // canvasSize = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(size, size, WEBGL);
  pixelDensity(1);
  angleMode(DEGREES);

  // get the hash from the URL ur use a pseudo hash
  const params = getURLParams();
  hash = params.hash || generateRandomPseudoETHAddress();

  numberOfCircles = extractValueFromAddress(hash, 4);
  pointsPerCircle =
    (extractValueFromAddress(hash, 8, 4, 2) + 5) * (5 - numberOfCircles) * 0.5; //initial points per circle
  nextCirclePointsPlus = extractValueFromAddress(hash, 6, 6, 2) + 3; //points per circle increase

  rows = extractValueFromAddress(hash, 7, 20, 9) + 5; //rows
  spacing = (size - 2 * border) / (rows - 1);

  const shape = extractValueFromAddress(hash, 2, 11);

  if (shape === 0) {
    dots = calculateDotsOnCircles();
  } else {
    dots = calculateDotsOnGrid();
  }

  attributes.Shape = shape === 0 ? "Circle" : "Grid";
  attributes.Dots = dots.length;

  allColors = [];
  for (let i = 0; i < dots.length; i++) {
    allColors.push(palette[extractValueFromAddress(hash, 5, i % 40, 1)]);
  }

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

  attributes["Dots Pink"] = countOccurrences(colors, palette[0]);
  attributes["Dots Purple"] = countOccurrences(colors, palette[1]);
  attributes["Dots Cyan"] = countOccurrences(colors, palette[2]);
  attributes["Dots Lime"] = countOccurrences(colors, palette[3]);
  attributes["Dots Green"] = countOccurrences(colors, palette[4]);

  console.log("attributes", attributes);

  const windowAttributes = [
    ...Object.keys(attributes).map((key) => {
      return {
        display: key,
        value: attributes[key],
      };
    }),
  ];
  window.attributes = windowAttributes;
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
