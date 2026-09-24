var pages=document.querySelectorAll(".page");
var navBtns=document.querySelectorAll(".nav-btn");
var goBtns=document.querySelectorAll("[data-go]");
var fileInput=document.getElementById("file-input");
var previewCanvas=document.getElementById("preview-canvas");
var previewCtx=previewCanvas.getContext("2d");
var previewText=document.getElementById("preview-text");
var borderSize=document.getElementById("border-size");
var borderValue=document.getElementById("border-value");
var borderColor=document.getElementById("border-color");
var addStickersBtn=document.getElementById("add-sticker");
var designCanvas=document.getElementById("design-canvas");
var designCtx=designCanvas.getContext("2d");
var layersBox=document.getElementById("layers");
var stickers=[];
var selected=-1;
var nextId=1;
var imageFile=null;
var imageData=null;
var dragData=null;
var lastSheetData=null;
function showpage(name) {
    pages.forEach(function(page) {
        page.classList.remove("active-page");
    });
    navBtns.forEach(function(btn) {
        btn.classList.remove("active");
    });
    document.getElementById(name).classList.add("active-page");
    navBtns.forEach(function(btn) {
        if(btn.getAttribute("data-page")===name) {
            btn.classList.add("active");
        }
    });
    if(name==="design") {
        draw();
    }
    if(name==="print") {
        makesheet();
    }
}
function msg(text) {
    var box=document.getElementById("message");
    box.textContent=text;
    box.classList.add("show");
    setTimeout(function() {
        box.classList.remove("show");
    }, 1600);
}
navBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        showpage(btn.getAttribute("data-page"));
    });
});
goBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        showpage(btn.getAttribute("data-go"));
    });
});
fileInput.addEventListener("change", function() {
    var file=fileInput.files[0];
    if(!file) {
        return;
    }
    if(file.type.indexOf("image/")!==0) {
        msg("Please choose an image.");
        fileInput.value="";
        return;
    }
    imageFile=file;
    var reader=new FileReader();
    reader.onload=function(e) {
        var img=new Image();
        img.onload=function() {
            imageData=img;
            addStickersBtn.disabled=false;
            previewCanvas.style.display="block";
            previewText.style.display="none";
            drawpreview();
            msg("Image loaded.");
        };
        img.src=e.target.result;
    };
    reader.readAsDataURL(file);
});
borderSize.addEventListener("input", function() {
    borderValue.textContent=borderSize.value+" px";
    drawpreview();
});
borderColor.addEventListener("input", function() {
    drawpreview();
});
function drawpreview() {
    if(!imageData) {
        return;
    }
    previewCtx.clearRect(
        0, 
        0,
        previewCanvas.width,
        previewCanvas.height 
    );
    var max=400;
    var scale=Math.min(
        max/imageData.width,
        max/imageData.height
    );
    var w=imageData.width*scale;
    var h=imageData.height*scale;
    var x=(previewCanvas.width-w)/2;
    var y=(previewCanvas.height-h)/2;
    var size=Number(borderSize.value);
    var color=borderColor.value;
    previewCtx.save();
    previewCtx.shadowColor=color;
    previewCtx.shadowBlur=size*3;
    previewCtx.drawImage(
        imageData,
        x,
        y,
        w,
        h      
    );
    previewCtx.restore();
    previewCtx.drawImage (
        imageData,
        x,
        y,
        w,
        h
    );
}
addStickersBtn.addEventListener("click", function() {
    if(!imageData) {
        return;
    }
    var name=imageFile
    ? imageFile.name
    :"Sticker";
    stickers.push({
        id: nextId,
        type: "image",
        name: name,
        image: imageData,
        x: 450+stickers.length*20,
        y:300+stickers.length*20,
        w: 160,
        h: 160,
        r: 0,
        border: Number(borderSize.value),
        borderColor: borderColor.value 
    });
    nextId+=1;
    selected=stickers.length-1;
    draw();
    showpage("design");
    msg("Sticker Added.");
});
document.getElementById("add-text").addEventListener("click", function() {
    var text=prompt("Type your text:");
    if(!text) {
        return;
    }
    stickers.push({
        id: nextId,
        type: "text",
        name: text,
        text: text,
        x: 450,
        y: 300,
        w: 220,
        h: 70,
        r: 0
    });
    nextId+=1;
    selected=stickers.length-1;
    draw();
    msg("Text added.");
});
function draw() {
    designCtx.clearRect(
        0,
        0,
        designCanvas.width,
        designCanvas.height   
    );
    stickers.forEach(function(sticker, index) {
        if (sticker.type==="image") {
            drawimage(
                sticker,
                index===selected
            );
        } else {
            drawtext(
                sticker,
                index===selected
            );
        }
    });
    updatelayers();
}
function drawimage(sticker, isSelected) {
    designCtx.save();
    designCtx.translate(
        sticker.x,
        sticker.y
    );
    designCtx.rotate(
        sticker.r*Math.PI/180
    );
    if(sticker.border>0) {
        designCtx.save();
        designCtx.shadowColor=sticker.borderColor;
        designCtx.shadowBlur=sticker.border*3;
        designCtx.drawImage(
            sticker.image,
            -sticker.w/2,
            -sticker.h/2,
            sticker.w,
            sticker.h
        );
        designCtx.restore();
    }
    designCtx.drawImage(
        sticker.image,
        -sticker.w/2,
        -sticker.h/2,
        sticker.w,
        sticker.h
    );
    if(isSelected) {
        designCtx.strokeStyle="#222";
        designCtx.lineWidth=2;
        designCtx.setLineDash([6, 4]);
        designCtx.strokeRect(
            -sticker.w/2-5,
            -sticker.h/2-5,
            sticker.w+10,
            sticker.h+10
        );
    }
    designCtx.restore();
}
function drawtext(sticker, isSelected) {
    designCtx.save();
    designCtx.translate(
        sticker.x,
        sticker.y
    );
    designCtx.rotate(
        sticker.r*Math.PI/180
    );
    designCtx.font="bold 36px Arial";
    designCtx.textAlign="center";
    designCtx.textBaseline="middle";
    designCtx.lineWidth=12;
    designCtx.strokeStyle="white";
    designCtx.strokeText(
        sticker.text,
        0,
        0
    );
    designCtx.fillStyle="#222";
    designCtx.fillText(
        sticker.text,
        0,
        0
    );
    if(isSelected) {
        designCtx.strokeStyle="#222";
        designCtx.lineWidth=2;
        designCtx.setLineDash([6, 4]);
        designCtx.strokeRect(
            -sticker.w/2,
            -sticker.h/2,
            sticker.w,
            sticker.h
        );
    }
    designCtx.restore();
}
function hit(sticker, x, y) {
    var angle=
    -sticker.r*Math.PI/180;
    var dx=x-sticker.x;
    var dy=y-sticker.y;
    var localX=
    dx*Math.cos(angle)-dy*Math.sin(angle);
    var localY=
    dx*Math.sin(angle)+dy*Math.cos(angle);
    return (
        localX >= -sticker.w/2 &&
        localX <= sticker.w/2 &&
        localY >= -sticker.h/2 &&
        localY <= sticker.h/2
    );
}
function getmouse(e) {
    var rect=designCanvas.getBoundingClientRect();
    var scaleX=designCanvas.width/rect.width;
    var scaleY=designCanvas.height/rect.height;
    return {
        x:
        (e.clientX-rect.left)*scaleX,
        y:
        (e.clientY-rect.top)*scaleY
    };
}
designCanvas.addEventListener("pointerdown", function(e) {
    var m=getmouse(e);
    var found= -1;
    for (
        var i=stickers.length-1;
        i >=0;
        i -=1
    ) {
        if(
            hit(
                stickers[i],
                m.x,
                m.y
            )
        ) {
            found=i;
            break;
        }
    }
    if (found=== -1) {
        selected= -1;
        draw();
        return;
    }
    selected=found;
    designCanvas.setPointerCapture(e.pointerId);
    dragData={
        x: m.x,
        y: m.y,
        stickerX: stickers[found].x,
        stickerY: stickers[found].y
    };
    designCanvas.style.cursor="grabbing";
    draw();
    }
);
designCanvas.addEventListener(
    "pointermove",
    function(e) {
        if(
            !dragData || selected === -1
        ) {return;}
        var m=getmouse(e);
        stickers[selected].x=dragData.stickerX+(m.x-dragData.x);
        stickers[selected].y=dragData.stickerY+(m.y-dragData.y);
        draw();
    }
);
designCanvas.addEventListener(
  "pointerup",
  function() {
    dragData = null;
    designCanvas.style.cursor = "default";
  }
);
designCanvas.addEventListener(
  "pointerleave",
  function() {
    dragData = null;
    designCanvas.style.cursor = "default";
  }
);
function changesize(amount) {
  if (selected === -1) {
    msg("Select a sticker first.");
    return;
  }
  stickers[selected].w += amount;
  stickers[selected].h += amount;
  if (stickers[selected].w < 30) {
    stickers[selected].w = 30;
  }
  if (stickers[selected].h < 30) {
    stickers[selected].h = 30;
  }
  draw();
}
document.getElementById("bigger").addEventListener(
    "click",
    function() {
        changesize(20);
    }
);
document.getElementById("smaller").addEventListener("click", function() {
    changesize(-20);
});
document.getElementById("turn-left").addEventListener(
  "click",
  function() {
    if (selected === -1) {
      msg("Select a sticker first.");
      return;
    }
    stickers[selected].r -= 15;
    draw();
  }
);
document.getElementById("turn-right").addEventListener("click", function() {
    if(selected=== -1){
        msg("Select a sticker first.");
        return;
    }
    stickers[selected].r +=15;
    draw();
}
);
document.getElementById("delete-sticker").addEventListener("click",
    function() {
        if(selected=== -1) {
            msg("Select a sticker bro");
            return;
        }
        stickers.splice(
            selected,
            1
        );
        selected= -1;
        draw();
        msg("Sticker deleted");
    }
);
document.getElementById("copy-sticker").addEventListener("click", function() {
    if(selected=== -1) {
        msg("Select a sticker first.");
        return;
    }
    var old=stickers[selected];
    var copy = {
        id: nextId,
        type: old.type,
        name: old.name+" copy",
        image: old.image,
        text: old.text,
        x: old.x + 30,
        y: old.y + 30,
        w: old.w,
        h: old.h,
        r: old.r,
        border: old.border,
        borderColor: old.borderColor
    };
    nextId += 1;
    stickers.push(copy);
    selected=stickers.length-1;
    draw();
});
function updatelayers() {
  layersBox.innerHTML = "";
  if (stickers.length === 0) {
    layersBox.innerHTML =
      '<p class="tip">No stickers yet.</p>';
    return;
  }
  stickers.forEach(
    function(sticker, index) {
      var item =
        document.createElement("div");
      item.className =
        "layer-item";
      if (index === selected) {
        item.className +=
          " selected";
      }
      if (sticker.type === "text") {
        item.textContent =
          "T " + sticker.name;
      } else {
        item.textContent =
          "Frame Pic " + sticker.name;
      }
      item.addEventListener(
        "click",
        function() {
          selected = index;
          draw();
        }
      );
      layersBox.appendChild(item);
    }
  );
}
function makesheetdata() {
    var paper=document.getElementById("paper").value;
    var margin=Number(document.getElementById("margin").value);
    var gap=Number(document.getElementById("gap").value);
    var width;
    var height;
    if (paper==="a4") {
        width=794;
        height=1123;
    } else {
        width=816;
        height=1056;
    }
    var card=150;
    var innerW=width-margin*2;
    var innerH=height-margin*2;
    var cols=Math.max(1,
        Math.floor(
            (innerW+gap)/(card+gap)
        )
    );
    var rows=Math.max (
        1, Math.floor(
            (innerH+gap)/(card+gap)
        )
    );
    var perPage=cols*rows;
    var count=stickers.length;
    var pagesNeeded;
    if(count===0){
        pagesNeeded=0;
    } else {
        pagesNeeded=Math.ceil(count/perPage);
    }
    return {
        paper: paper,
        margin: margin,
        gap: gap,
        width: width,
        height: height,
        card: card,
        cols: cols,
        rows: rows,
        perPage: perPage,
        count: count,
        pagesNeeded: pagesNeeded
    };
}
function makesheet() {
  var data =
    makesheetdata();
  lastSheetData = data;
  document.getElementById(
    "sticker-count"
  ).textContent =
    data.count;
  document.getElementById(
    "sheet-count"
  ).textContent =
    data.pagesNeeded;
  document.getElementById(
    "per-sheet"
  ).textContent =
    data.perPage;
  var box =
    document.getElementById(
      "sheet-preview"
    );
  box.innerHTML = "";
  if (data.count === 0) {
    box.innerHTML =
      '<p class="tip">Add stickers in Design first.</p>';
    return;
  }
  for (
    var pageNumber = 0;
    pageNumber < data.pagesNeeded;
    pageNumber += 1
  ) {
    var holder =
      document.createElement("div")
    holder.className =
      "sheet-page";
    holder.style.width =
      "360px";
    var canvas =
      document.createElement("canvas");
    canvas.width =
      data.width;
    canvas.height =
      data.height;
    drawsheet(
      canvas,
      data,
      pageNumber
    );
    holder.appendChild(canvas);
    box.appendChild(holder);
  }
}
function drawsheet(
  canvas,
  data,
  pageNumber
) {
  var ctx =
    canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(
    0,
    0,
    data.width,
    data.height
  );
  var start =
    pageNumber * data.perPage;
  var end =
    Math.min(
      start + data.perPage,
      stickers.length
    );
  for (
    var i = start;
    i < end;
    i += 1
  ) {
    var local =
      i - start;
    var col =
      local % data.cols;
    var row =
      Math.floor(
        local / data.cols
      );
    var x =
      data.margin
      +
      col * (data.card + data.gap)
      +
      data.card / 2;
    var y =
      data.margin
      +
      row * (data.card + data.gap)
      +
      data.card / 2;
    drawbox(
      ctx,
      stickers[i],
      x,
      y,
      data.card,
      data.card
    );
  }
}
function drawbox(
  ctx,
  sticker,
  x,
  y,
  boxW,
  boxH
) {
  ctx.save();
  ctx.translate(
    x,
    y
  );
  ctx.rotate(
    sticker.r * Math.PI / 180
  );
  if (sticker.type === "image") {
    var scale =
      Math.min(
        boxW / sticker.w,
        boxH / sticker.h,
        1
      );
    var w =
      sticker.w * scale;
    var h =
      sticker.h * scale;
    if (sticker.border > 0) {
      ctx.save();
      ctx.shadowColor =
        sticker.borderColor;
      ctx.shadowBlur =
        sticker.border *3;
      ctx.drawImage(
        sticker.image,
        -w / 2,
        -h / 2,
        w,
        h
      );
      ctx.restore();
    }
    ctx.drawImage(
      sticker.image,
      -w / 2,
      -h / 2,
      w,
      h
    );
  } else {
    ctx.font =
      "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    ctx.strokeText(
      sticker.text,
      0,
      0
    );
    ctx.fillStyle = "#222";
    ctx.fillText(
      sticker.text,
      0,
      0
    );
  }
  ctx.restore();
}
document.getElementById("make-sheet").addEventListener(
    "click",
    function() {
        makesheet();
        msg("Sheet updated.");
    }
);
document.getElementById("paper").addEventListener(
    "change",
    function() {
        makesheet();
    }
);
document.getElementById("margin").addEventListener(
  "input",
  function() {
    document.getElementById(
      "margin-value"
    ).textContent =
      document.getElementById(
        "margin"
      ).value;
    makesheet();
  }
);
document.getElementById("gap").addEventListener(
    "input",
    function() {
        document.getElementById(
            "gap-value").textContent=document.getElementById("gap"
        ).value;
        makesheet();
    }
);
function drawcopy(ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(
    0,
    0,
    designCanvas.width,
    designCanvas.height
  );
  stickers.forEach(function(sticker) {
    if (sticker.type === "image") {
      ctx.save();
      ctx.translate(
        sticker.x,
        sticker.y
      );
      ctx.rotate(
        sticker.r * Math.PI / 180
      );
      if (sticker.border > 0) {
        ctx.save();
        ctx.shadowColor =
          sticker.borderColor;
        ctx.shadowBlur =
          sticker.border * 3;
        ctx.drawImage(
          sticker.image,
          -sticker.w / 2,
          -sticker.h / 2,
          sticker.w,
          sticker.h
        );
        ctx.restore();
      }
      ctx.drawImage(
        sticker.image,
        -sticker.w / 2,
        -sticker.h / 2,
        sticker.w,
        sticker.h
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(
        sticker.x,
        sticker.y
      );
      ctx.rotate(
        sticker.r * Math.PI / 180
      );
      ctx.font =
        "bold 36px Arial";
      ctx.textAlign =
        "center";
      ctx.textBaseline =
        "middle";
      ctx.lineWidth = 12;
      ctx.strokeStyle = "white";
      ctx.strokeText(
        sticker.text,
        0,
        0
      );
      ctx.fillStyle = "#222";
      ctx.fillText(
        sticker.text,
        0,
        0
      );
      ctx.restore();
    }
  });
}
function downloaddesign() {
    if(stickers.length===0) {
        msg("Add a sticker first.");
        return;
    }
    var out=document.createElement("canvas");
    out.width=designCanvas.width;
    out.height=designCanvas.height;
    var ctx=out.getContext("2d");
    drawcopy(ctx);
    var link=document.createElement("a");
    link.download="sticker-design.png";
    link.href=out.toDataURL("image/png");
    link.click();
}
document.getElementById("export-btn").addEventListener(
    "click",
    function() {
        downloaddesign();
    }
);
document.getElementById("download-sheet").addEventListener(
  "click",
  function() {
    if (
      !lastSheetData ||
      stickers.length === 0
    ) {
      msg(
        "Add stickers and make the sheet first."
      );
      return;
    }
    for (
      var i = 0;
      i < lastSheetData.pagesNeeded;
      i += 1
    ) {
      var canvas =
        document.createElement("canvas");
      canvas.width =
        lastSheetData.width;
      canvas.height =
        lastSheetData.height;
      drawsheet(
        canvas,
        lastSheetData,
        i
      );
      var link =
        document.createElement("a");
      link.download =
        "sticker-sheet-" +
        (i + 1) +
        ".png";
      link.href =
        canvas.toDataURL("image/png");
      link.click();
    }
    msg("Sheet download started.");
  }
);
document.getElementById("save-btn").addEventListener(
  "click",
  function() {
    var data = [];
    stickers.forEach(function(sticker) {
      data.push({
        id: sticker.id,
        type: sticker.type,
        name: sticker.name,
        text: sticker.text || "",
        image:
          sticker.type === "image" &&
          sticker.image
            ? sticker.image.src
            : "",
        x: sticker.x,
        y: sticker.y,
        w: sticker.w,
        h: sticker.h,
        r: sticker.r,
        border:
          sticker.border || 0,
        borderColor:
          sticker.borderColor || "#ffffff"
      });
    });
    try {
      localStorage.setItem(
        "stickerStudio",
        JSON.stringify(data)
      );
      msg("Project saved.");
    } catch (e) {
      msg("Could not save the project.");
    }
  }
);
document.getElementById("load-btn").addEventListener(
  "click",
  function() {
    var saved =
      localStorage.getItem(
        "stickerStudio"
      );
    if (!saved) {
      msg("No saved project.");
      return;
    }
    var list;
    try {
      list =
        JSON.parse(saved);
    } catch (e) {
      msg("Saved project is broken.");
      return;
    }
    stickers = [];
    selected = -1;
    nextId = 1;
    list.forEach(function(item) {
      var sticker = {
        id: item.id,
        type: item.type,
        name: item.name,
        text: item.text,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        r: item.r,
        border: item.border,
        borderColor: item.borderColor
      };
      if (
        item.type === "image" &&
        item.image
      ) {
        var img =
          new Image();
        img.src =
          item.image;
        sticker.image =
          img;
        img.onload = function() {
          draw();
          if (
            document
              .getElementById("print")
              .classList
              .contains("active-page")
          ) {
            makesheet();
          }
        };
      }
      stickers.push(sticker);
      if (item.id >= nextId) {
        nextId =
          item.id + 1;
      }
    });
    draw();
    makesheet();
    msg("Project loaded.");
  }
);
draw();
