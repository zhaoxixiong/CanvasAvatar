var upload_button = document.getElementById('upload-btn');
var upload_control = document.getElementById('upload');
var image_div = document.querySelector('div.image');
var canvas = document.querySelector('canvas#container');
var canvas_preview = document.querySelector('canvas#preview');
var context = canvas.getContext('2d');
var context_preview = canvas_preview.getContext('2d');
var image = document.querySelector('img#image');
var slider = document.querySelector('input#range');
var textarea = document.querySelector('textarea');
var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var X = 150;
var Y = 150;
var LEFT = 0;
var TOP = 0;
canvas.width = 300;
canvas.height = 300;
var ORI_RADIUS = 40;
var RADIUS = ORI_RADIUS * 1;
var DISPLAY_WIDTH = 0;
var DISPLAY_HEIGHT = 0;
if (window.window.innerWidth <= 400) {
    CANVAS_HEIGHT = 256;
    CANVAS_WIDTH = 256;
    X = CANVAS_WIDTH / 2;
    Y = CANVAS_HEIGHT / 2;
}
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
var DrawContext = function () {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.drawImage(image, LEFT, TOP, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    DisplayClip();
    context.fillStyle = 'rgba(0,0,0,.5)';
    //   context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.beginPath();
    context.arc(X, Y, RADIUS, 0, 2 * Math.PI);
    context.fill();
};
var DisplayClip = function () {
    var imagedata = context.getImageData(X - RADIUS, Y - RADIUS, 2 * RADIUS, 2 * RADIUS);
    var tempimage = document.createElement('img');
    var tempcanvas = document.createElement('canvas');
    tempcanvas.width = 2 * RADIUS;
    tempcanvas.height = 2 * RADIUS;
    document.body.appendChild(tempcanvas);
    document.body.appendChild(tempimage);
    var tempcontext = tempcanvas.getContext('2d');
    tempcontext.putImageData(imagedata, 0, 0);
    var imageuri = tempcanvas.toDataURL();
    tempimage.width = 2 * ORI_RADIUS;
    tempimage.height = 2 * ORI_RADIUS;
    tempimage.src = imageuri;
    tempimage.style.opacity = '0';
    tempcanvas.remove();
    setTimeout(function () {
        context_preview.clearRect(0, 0, 2 * ORI_RADIUS, 2 * ORI_RADIUS);
        context_preview.drawImage(tempimage, 0, 0, 2 * ORI_RADIUS, 2 * ORI_RADIUS);
        tempimage.remove();
    }, 50);
};
var UpdateProperties = function () {
    var img_width = image.width;
    var img_height = image.height;
    var ratio = img_height / img_width;
    if (img_width >= img_height) {
        DISPLAY_WIDTH = CANVAS_WIDTH;
        DISPLAY_HEIGHT = DISPLAY_WIDTH * ratio;
    }
    else {
        DISPLAY_HEIGHT = CANVAS_HEIGHT;
        DISPLAY_WIDTH = DISPLAY_HEIGHT / ratio;
    }
    LEFT = (CANVAS_WIDTH - DISPLAY_WIDTH) / 2;
    TOP = (CANVAS_HEIGHT - DISPLAY_HEIGHT) / 2;
};
var DisplayDataUrl = function () {
    setTimeout(function () {
        var data = canvas_preview.toDataURL();
        textarea.value = data;
    }, 100);
};
image.style.opacity = '0';
setTimeout(function () {
    image.style.display = 'block';
    UpdateProperties();
    DrawContext();
    image.style.display = 'none';
}, 16);
slider.onchange = function (ev) {
    var value = parseInt(slider.value) + 50;
    RADIUS = value / 100 * ORI_RADIUS;
    DrawContext();
};
upload_button.addEventListener('click', function (ev) { upload_control.click(); });
upload_control.addEventListener('change', function (ev) {
    var files = upload_control.files;
    if (files.length > 0) {
        image.style.display = 'block';
        image.style.opacity = '0';
        var reader_1 = new FileReader();
        reader_1.readAsDataURL(files.item(0));
        reader_1.onloadend = function (ev) {
            image.src = reader_1.result;
            setTimeout(function () {
                image.style.display = 'block';
                UpdateProperties();
                DrawContext();
                image.style.display = 'none';
            }, 200);
        };
        // reader.onprogress = (ev) => { console.log(ev.loaded / ev.total); };
    }
});
var DRAGGING = false;
var TOUCHSTART_ID = void 0;
canvas.onmousedown = function (ev) {
    DRAGGING = true;
    ev.stopPropagation();
    // ev.preventDefault();
    X = Math.max(ev.offsetX, LEFT + RADIUS);
    X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
    Y = Math.max(ev.offsetY, TOP + RADIUS);
    Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
    setTimeout(function () { DrawContext(); }, 16);
};
canvas.ontouchstart = function (ev) {
    DRAGGING = true;
    TOUCHSTART_ID = ev.touches[0].identifier;
    ev.stopPropagation();
    // ev.preventDefault();
    X = Math.max(ev.touches[0].clientX - canvas.getBoundingClientRect().left, LEFT + RADIUS);
    X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
    Y = Math.max(ev.touches[0].clientY - canvas.getBoundingClientRect().top, TOP + RADIUS);
    Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
    setTimeout(function () { DrawContext(); }, 16);
};
canvas.onmouseup = function (ev) {
    DRAGGING = false;
    ev.stopPropagation();
    DisplayDataUrl();
};
canvas.ontouchend = function (ev) {
    DRAGGING = false;
    TOUCHSTART_ID = void 0;
    ev.stopPropagation();
    DisplayDataUrl();
};
canvas.onmousemove = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (DRAGGING || ev.buttons === 1) {
        X = Math.max(ev.offsetX, LEFT + RADIUS);
        X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
        Y = Math.max(ev.offsetY, TOP + RADIUS);
        Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
        setTimeout(function () { DrawContext(); }, 16);
    }
};
canvas.ontouchmove = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (ev.touches.length === 0)
        return;
    var touch;
    for (var i = 0; i < ev.touches.length; i++) {
        if (ev.touches[i].identifier === TOUCHSTART_ID) {
            touch = ev.touches[i];
            break;
        }
    }
    if (DRAGGING || touch !== void 0) {
        X = Math.max(touch.clientX - canvas.getBoundingClientRect().left, LEFT + RADIUS);
        X = Math.min(X, (CANVAS_WIDTH + DISPLAY_WIDTH) / 2 - RADIUS);
        Y = Math.max(touch.clientY - canvas.getBoundingClientRect().top, TOP + RADIUS);
        Y = Math.min(Y, (CANVAS_HEIGHT + DISPLAY_HEIGHT) / 2 - RADIUS);
        setTimeout(function () { DrawContext(); }, 16);
    }
};
