let hexagonPoints = [];
let radius = 600;
let centerX = 1600;
let centerY = 1600;
let angleOffset = 0;
let size = 3200;
let backgroundCol = "#fffff5";
let diffColors;
let numOfPoints;
let border = 600;
let rows = 12;
let spacing = (size - 2 * border) / (rows - 1);
console.log( 'spacing', spacing);

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
};
C.setSize(1500, 2000, 1, "mainCanvas");

function windowResized() {
  C.resize();
}

//////////////////////////////////////////////////
// The example really starts here

let palette = [
  "#E6007A",
  "#552BBF",
  "#00B2FF",
  "#D3FF33",
  "#56F39A",
];

function setup() {
  C.createCanvas();
  angleMode(DEGREES);
  
  let bg = random(palette);
  
  let hueValue = floor( hue(bg) );
  let saturationValue = saturation(bg);
  let lightnessValue = lightness(bg);  
  
  bg = `hsl(${ hueValue }, ${ saturationValue }%, 97%)`
  
  //background(bg);
  background(backgroundCol);

  translate(-width / 2, -height / 2);

  // We define the brushes for the hatches, and the brushes for the strokes
  let hatch_brushes = ["marker", "marker2"];
  let stroke_brushes = ["2H", "HB", "charcoal"];

  // Test Different Flowfields here: "zigzag", "seabed", "curved", "truncated"
  brush.field("seabed");
  // You can also disable field completely with brush.noField()
  
  numOfPoints = selectN([2,3,4,5,6,7,8,9], [0.02,0.08,0.1,0.2,0.3,0.1,0.1,0.1])

  hexagonPoints = calculatePointsOnGrid();
    
    //calculatePointsOnCircle(numOfPoints);

  noFill();
  stroke(0);
  beginShape();
  for (let i = 0; i < hexagonPoints.length; i++) {
    //vertex(hexagonPoints[i].x, hexagonPoints[i].y);
  }
  endShape(CLOSE);
  drawDots();
  //calculateHexagonPoints();
}

function drawDots() {
  //let colors = selectN(palette, [0.6,0.1,0.1,0.1,0.1])
  let colors = [];
  let defaultBrushSize = random(20,50)
  let defaultBleed = random(0.1,0.4)

  for (let i = 0; i < hexagonPoints.length; i++) {
    // Reset states for next cell
    brush.noStroke();
    brush.noFill();
    brush.noHatch();

    //let brushSize = random(60, 720-hexagonPoints.length * 60);
    //let bleedSize = random(0.1,1.0-0.04*hexagonPoints.length);
    
    let brushSize=defaultBrushSize + random(0,100);
    let bleedSize=1;

    //brush.fill(random(palette), random(60, 100));
    let color = selectN(palette, [0.5,0.225,0.125,0.075,0.10]);
    colors.push(color);
    brush.fill(color, random(60, 120));
    brush.bleed(bleedSize);
    //brush.fillTexture(0.1, 0.8);
    //brush.rect(hexagonPoints[i].x - col_size / 2.0, hexagonPoints[i].y - row_size/2.0, col_size, row_size)

    let x = hexagonPoints[i].x //+ random(520) - 260;
    let y = hexagonPoints[i].y //+ random(520) - 260;
    brush.circle(x, y, brushSize);
  }
  
  console.log('numOfPoints', hexagonPoints.length);
  console.log('numOfColors', new Set(colors).size);
  console.log('pink', countOccurrences(colors, palette[0]))
  console.log('purple', countOccurrences(colors, palette[1]))
  console.log('cyan', countOccurrences(colors, palette[2]))
  console.log('lime', countOccurrences(colors, palette[3]))
  console.log('green', countOccurrences(colors, palette[4]))
}

function countOccurrences(array, element) {
    let count = 0;
    array.forEach(item => {
        if (item === element) {
            count++;
        }
    });
    return count;
}

function generatePolkadotPattern() {
      const points = [];
    // Calculate the effective size (sketch area minus the border)
    const effectiveSize = size - 2 * border;
    // Calculate the spacing based on the effective size
    const spacing = effectiveSize / (rows - 1);
    // Adjust the number of columns to ensure there's a border on the right side
    const numberOfColumns = Math.floor((effectiveSize - spacing / 2) / spacing);

    for (let row = 0; row < rows; row++) {
        // Offset every second row to create the polka dot effect
        const xOffset = (row % 2) * (spacing / 2) + border;
        // Add the vertical border to the y-coordinate
        const yOffset = row * spacing + border;

        for (let col = 0; col < numberOfColumns; col++) {
            // Calculate the x-coordinate with the horizontal border included
            const x = col * spacing + xOffset;
            // Calculate the y-coordinate
            const y = yOffset;
            // Add the point to the array
            points.push([x, y]);
        }
    }

    // Add extra column of dots on the right side if there's enough space for at least a border
    const remainingSpace = size - (numberOfColumns * spacing + border);
    if (remainingSpace > border) {
        for (let row = 0; row < rows; row++) {
            const xOffset = ((row % 2) === 0 ? 0 : spacing / 2) + numberOfColumns * spacing + border;
            const yOffset = row * spacing + border;
            points.push(createVector(xOffset, yOffset));
        }
    }

    return points;
}

function calculatePointsOnGrid() {
  const points = [];
  for (let i = 0; i < rows; i ++) {
    y = border + i * spacing;
    for( let j = 0; j < rows; j++) {
      let xOffset = (i % 2) * spacing / 2.0;
      x = border - xOffset + j * spacing;
      points.push(createVector(x, y));
    }
  }
  console.log( points.map(p => `${p.x}, ${p.y}`))
  return points
}

function calculateHexagonPoints() {
  for (let i = 0; i < 6; i++) {
    let angle = 60 * i;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    hexagonPoints.push(createVector(x, y));
  }
}

function calculatePointsOnCircle(numberOfPoints) {
    const points = [];
    for (let i = 0; i < numberOfPoints; i++) {
        // Calculate angle for each point
        const angle = (2 * Math.PI / numberOfPoints) * i;

        // Calculate x and y coordinates
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        points.push({ x, y });
    }
    return points;
}

function selectN(elements, probabilities) {
    if (elements.length !== probabilities.length) {
        throw new Error("The lengths of elements and probabilities arrays must be equal.");
    }

    const totalProbability = probabilities.reduce((acc, val) => acc + val, 0);
    if (1.0 - totalProbability > 0.01) {
        throw new Error(`The sum of probabilities must be 1, not ${ totalProbability}`);
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

function pick6from5(elements) {
    // Check if the input array has exactly 5 elements
    if (elements.length !== 5) {
        throw new Error('Array must contain exactly 5 elements');
    }

    // Function to generate a random integer within a range
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate a random number for weighted probability
    const randomNum = getRandomInt(1, 500);
    let pickedElements = [];

    if (randomNum <= 5) { // Only 1 color
        const color = elements[getRandomInt(0, 4)];
        pickedElements = Array(6).fill(color);
      diffColors = 1;
    } else if (randomNum <= 25) { // 5 different colors
        pickedElements = [...elements, elements[getRandomInt(0, 4)]];
      diffColors=5;
    } else {
        // Shuffle the array and pick the first N elements based on the scenario
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffleArray(elements);

        if (randomNum <= 275) { // 4 different colors
            pickedElements = [...elements.slice(0, 4), elements[0], elements[1]];
          diffColors=4;
        } else if (randomNum <= 410) { // 3 different colors
            pickedElements = [...elements.slice(0, 3), elements[0], elements[1], elements[2]];
          diffColors=3;
        } else { // 2 different colors
            pickedElements = [...elements.slice(0, 2), ...elements.slice(0, 2), ...elements.slice(0, 2)];
          diffColors = 2;
        }
    }
  
  console.log("Different Colors", diffColors);

    return pickedElements;
}


function pick6from6(elements) {
    // Check if the input array has exactly 6 elements
    if (elements.length !== 6) {
        throw new Error('Array must contain exactly 6 elements');
    }

    // Function to generate a random integer within a range
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate a random number for weighted probability
    const randomNum = getRandomInt(1, 500);
    let pickedElements = [];

    if (randomNum <= 2) { // Only 1 color
        const color = elements[getRandomInt(0, 5)];
        pickedElements = Array(6).fill(color);
    } else if (randomNum <= 10) { // 6 different colors
        pickedElements = [...elements];
    } else {
        // Shuffle the array and pick the first N elements based on the scenario
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffleArray(elements);

        if (randomNum <= 30) { // 5 different colors
            pickedElements = [...elements.slice(0, 5), elements[0]];
        } else if (randomNum <= 260) { // 4 different colors
            pickedElements = [...elements.slice(0, 4), elements[0], elements[1]];
        } else if (randomNum <= 410) { // 3 different colors
            pickedElements = [...elements.slice(0, 3), elements[0], elements[1], elements[2]];
        } else { // 2 different colors
            pickedElements = [...elements.slice(0, 2), ...elements.slice(0, 2), ...elements.slice(0, 2)];
        }
    }

    return pickedElements;
}
