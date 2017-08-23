let upload_button = document.getElementById('upload-btn') as HTMLButtonElement;
let upload_control = document.getElementById('upload') as HTMLInputElement;
let image_div = document.querySelector('div.image') as HTMLDivElement;
let canvas = document.querySelector('canvas#container') as HTMLCanvasElement;
let canvas_preview =
    document.querySelector('canvas#preview') as HTMLCanvasElement;
let context = canvas.getContext('2d');
let context_preview = canvas_preview.getContext('2d');
let image = document.querySelector('img#image') as HTMLImageElement;
let slider = document.querySelector('input#range') as HTMLInputElement;
let textarea = document.querySelector('textarea') as HTMLTextAreaElement;

let CANVAS_WIDTH = 300;
let CANVAS_HEIGHT = 300;
let X = 150;
let Y = 150;
let LEFT = 0;
let TOP = 0;
canvas.width = 300;
canvas.height = 300;
let ORI_RADIUS = 40;
let RADIUS = ORI_RADIUS * 1;
let DISPLAY_WIDTH = 0;
let DISPLAY_HEIGHT = 0;
if (window.window.innerWidth <= 400) {
  CANVAS_HEIGHT = 256;
  CANVAS_WIDTH = 256;
  X = CANVAS_WIDTH / 2;
  Y = CANVAS_HEIGHT / 2;
}
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let DrawContext = () => {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.drawImage(image, LEFT, TOP, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  DisplayClip();

  context.fillStyle = 'rgba(0,0,0,.5)';
  //   context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.beginPath();
  context.arc(X, Y, RADIUS, 0, 2 * Math.PI);
  context.fill();
};

let DisplayClip = () => {
  let imagedata =
      context.getImageData(X - RADIUS, Y - RADIUS, 2 * RADIUS, 2 * RADIUS);
  let tempimage = document.createElement('img');
  let tempcanvas = document.createElement('canvas');
  tempcanvas.width = 2 * RADIUS;
  tempcanvas.height = 2 * RADIUS;
  document.body.appendChild(tempcanvas);
  document.body.appendChild(tempimage);
  let tempcontext = tempcanvas.getContext('2d');
  tempcontext.putImageData(imagedata, 0, 0);
  let imageuri = tempcanvas.toDataURL();
  tempimage.width = 2 * ORI_RADIUS;
  tempimage.height = 2 * ORI_RADIUS;
  tempimage.src = imageuri;
  tempimage.style.opacity = '0';
  tempcanvas.remove();
  setTimeout(() => {
    context_preview.clearRect(0, 0, 2 * ORI_RADIUS, 2 * ORI_RADIUS);
    context_preview.drawImage(tempimage, 0, 0, 2 * ORI_RADIUS, 2 * ORI_RADIUS);
    tempimage.remove();
  }, 50);
};
let UpdateProperties = () => {
  let img_width = image.width;
  let img_height = image.height;
  let ratio = img_height / img_width;
  if (img_width >= img_height) {
    DISPLAY_WIDTH = CANVAS_WIDTH;
    DISPLAY_HEIGHT = DISPLAY_WIDTH * ratio;
  } else {
    DISPLAY_HEIGHT = CANVAS_HEIGHT;
    DISPLAY_WIDTH = DISPLAY_HEIGHT / ratio;
  }
  LEFT = (CANVAS_WIDTH - DISPLAY_WIDTH) / 2;
  TOP = (CANVAS_HEIGHT - DISPLAY_HEIGHT) / 2;
};

let DisplayDataUrl = () => {
  setTimeout(() => {
    let data = canvas_preview.toDataURL();
    textarea.value = data;
  }, 100);
};

image.style.opacity = '0';
setTimeout(() => {
  image.style.display = 'block';
  UpdateProperties();
  DrawContext();
  image.style.display = 'none';
}, 16);

slider.onchange = (ev) => {
  let value = parseInt(slider.value) + 50;
  RADIUS = value / 100 * ORI_RADIUS;
  DrawContext();
};

upload_button.addEventListener('click', (ev) => { upload_control.click(); });
upload_control.addEventListener('change', (ev) => {
  let files = upload_control.files;
  if (files.length > 0) {
    image.style.display = 'block';
    image.style.opacity = '0';
    let reader = new FileReader();
    reader.readAsDataURL(files.item(0));
    reader.onloadend = (ev) => {
      image.src = reader.result as string;
      setTimeout(() => {
        image.style.display = 'block';
        UpdateProperties();
        DrawContext();

        image.style.display = 'none';
      }, 200);
    };
    // reader.onprogress = (ev) => { console.log(ev.loaded / ev.total); };
  }
});
let DRAGGING = false;
let TOUCHSTART_ID = void 0;
canvas.onmousedown = (ev) => {
  DRAGGING = true;
  ev.stopPropagation();
  // ev.preventDefault();
  X = Math.max(ev.offsetX, LEFT + RADIUS);
  X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
  Y = Math.max(ev.offsetY, TOP + RADIUS);
  Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
  setTimeout(() => { DrawContext(); }, 16);
};
canvas.ontouchstart = (ev) => {
  DRAGGING = true;
  TOUCHSTART_ID = ev.touches[0].identifier;
  ev.stopPropagation();
  // ev.preventDefault();
  X = Math.max(
      ev.touches[0].clientX - canvas.getBoundingClientRect().left,
      LEFT + RADIUS);
  X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
  Y = Math.max(
      ev.touches[0].clientY - canvas.getBoundingClientRect().top, TOP + RADIUS);
  Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
  setTimeout(() => { DrawContext(); }, 16);
};
canvas.onmouseup = (ev) => {
  DRAGGING = false;
  ev.stopPropagation();
  DisplayDataUrl();
};
canvas.ontouchend = (ev) => {
  DRAGGING = false;
  TOUCHSTART_ID = void 0;
  ev.stopPropagation();
  DisplayDataUrl();
};
canvas.onmousemove = (ev) => {
  ev.stopPropagation();
  ev.preventDefault();
  if (DRAGGING || ev.buttons === 1) {
    X = Math.max(ev.offsetX, LEFT + RADIUS);
    X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
    Y = Math.max(ev.offsetY, TOP + RADIUS);
    Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
    setTimeout(() => { DrawContext(); }, 16);
  }
};
canvas.ontouchmove = (ev) => {
  ev.stopPropagation();
  ev.preventDefault();
  if (ev.touches.length === 0) return;
  let touch: Touch;
  for (let i = 0; i < ev.touches.length; i++) {
    if (ev.touches[i].identifier === TOUCHSTART_ID) {
      touch = ev.touches[i];
      break;
    }
  }
  if (DRAGGING || touch !== void 0) {
    X = Math.max(
        touch.clientX - canvas.getBoundingClientRect().left, LEFT + RADIUS);
    X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
    Y = Math.max(
        touch.clientY - canvas.getBoundingClientRect().top, TOP + RADIUS);
    Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
    setTimeout(() => { DrawContext(); }, 16);
  }
};