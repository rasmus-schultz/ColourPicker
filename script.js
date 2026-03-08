// script.js

const Canvas = document.getElementById("canvas");
const DrawContext = Canvas.getContext("2d");
const Width = Canvas.width;
const Height = Canvas.height;

const BrightnessSlider = document.getElementById("slider");
const Preview = document.getElementById("preview");
const ColorOutput = document.getElementById("color_output");
const Divided255 = 1 / 255;

let CurrentBrightness = BrightnessSlider.value / 255;

// Gonna do stuff with this later
let LastX = 0;
let LastY = 0;
const BrightnessOutput = document.getElementById("brightness_output");
//

// POSITION TO RGB CONVERTER [
function getRGB(Pos) {
  const HueOffset = Pos % 256;
  const Segment = Math.floor(Pos / 256);

  switch (Segment) {
    case 0:
      return [255, HueOffset, 0];
    case 1:
      return [255 - HueOffset, 255, 0];
    case 2:
      return [0, 255, HueOffset];
    case 3:
      return [0, 255 - HueOffset, 255];
    case 4:
      return [HueOffset, 0, 255];
    case 5:
      return [255, 0, 255 - HueOffset];
    default:
      return [255, 0, 0];
  }
}
// ] POSITION TO RGB CONVERTER

// Generate hue spectrum.
const HueSpectrum = new Array(Width);
for (let X = 0; X < Width; X++) {
  HueSpectrum[X] = getRGB(X);
}

// SATURATION & BRIGHTNESS [
function applyEffects(R, G, B, Saturation, Brightness) {
  R = (R + (255 - R) * Saturation) * Brightness;
  G = (G + (255 - G) * Saturation) * Brightness;
  B = (B + (255 - B) * Saturation) * Brightness;

  return [R | 0, G | 0, B | 0];
}
// ] SATURATION & BRIGHTNESS

// COLOR UPDATER [
function updateColor(X, Y) {
  // Get saturation from Y position.
  const Saturation = Y * Divided255;

  // Get RGB.
  let [R, G, B] = HueSpectrum[Math.floor(X)];
  [R, G, B] = applyEffects(R, G, B, Saturation, CurrentBrightness);

  // Translate to Hex.
  const Hex =
    "#" +
    R.toString(16).padStart(2, "0") +
    G.toString(16).padStart(2, "0") +
    B.toString(16).padStart(2, "0");

  // Update HTML.
  ColorOutput.textContent = `RGB(${R}, ${G}, ${B}) | ${Hex}`;
  Preview.style.backgroundColor = `rgb(${R}, ${G}, ${B})`;
}
// ] COLOR UPDATER

// CANVAS UPDATE [
function drawCanvas() {
  const Image = DrawContext.createImageData(Width, Height);
  const ImageData = Image.data;

  const Row = new Uint8ClampedArray(Width * 4);
  for (let Y = 0; Y < Height; Y++) {
    const Saturation = Y * Divided255;
    for (let X = 0; X < Width; X++) {
      let [R, G, B] = HueSpectrum[X];
      [R, G, B] = applyEffects(R, G, B, Saturation, CurrentBrightness);
      const Step = X * 4;
      Row[Step] = R;
      Row[Step + 1] = G;
      Row[Step + 2] = B;
      Row[Step + 3] = 255;
    }
    ImageData.set(Row, Y * Width * 4);
  }
  DrawContext.putImageData(Image, 0, 0);

  BrightnessOutput.textContent = `Brightness: ${BrightnessSlider.value}`;
  updateColor(LastX, LastY);
}
// ] CANVAS UPDATE

// COLOR SELECTION [
function pickColor(Event) {
  // Probably replace some of this later.
  const CanvasRect = Canvas.getBoundingClientRect();
  const X = Math.max(0, Math.min(Width - 1, Event.clientX - CanvasRect.left));
  const Y = Math.max(0, Math.min(Height - 1, Event.clientY - CanvasRect.top));

  LastX = X;
  LastY = Y;

  updateColor(X, Y);
}
// ] COLOR SELECTION

// EVENTS [
BrightnessSlider.addEventListener("input", () => {
  CurrentBrightness = BrightnessSlider.value / 255;
  drawCanvas();
});

let isDragging = false;

Canvas.addEventListener("mousedown", (E) => {
  isDragging = true;
  pickColor(E);
});

window.addEventListener("mousemove", (E) => {
  if (isDragging) pickColor(E);
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});
// ] EVENTS

// Initial draw
drawCanvas();
