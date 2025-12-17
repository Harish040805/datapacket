let db;
const dbName = "snakeDB";
const storeName = "inputs";
const request = indexedDB.open(dbName, 1);
request.onupgradeneeded = function(event) { db = event.target.result; db.createObjectStore(storeName, { keyPath: "id" }); };
request.onsuccess = function(event) { db = event.target.result; loadInputs(); };
request.onerror = function() { console.error("Error opening IndexedDB"); };
function saveInput(id, value) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.put({ id, value });
}
function loadInputs() {
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  ["input1","input2","input3","input4"].forEach(id => {
    const req = store.get(id);
    req.onsuccess = () => {
      if(req.result) document.getElementById(id).value = req.result.value;
    };
  });
}
function clearAllInputs() {
  ["input1","input2","input3","input4"].forEach(id => {
    document.getElementById(id).value = "";
  });
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.clear();
}
["input1","input2","input3","input4"].forEach(id => { document.getElementById(id).addEventListener("input", e => { if(db) saveInput(id, e.target.value); }); });
const containers = Array.from(document.querySelectorAll('.container'));
const head = containers[0];
let speed = 20;
const SEGMENT_SPACING = 2;
const positionHistory = containers.map(c => [{ left: c.offsetLeft, top: c.offsetTop }]);
const MAX_HISTORY = 200;
let targetHeadAngle = 0;
let currentHeadAngle = 0;
function lerp(a, b, t) { return a + (b - a) * t; }
function moveSnake(dx, dy){
  let headLeft = head.offsetLeft + dx * speed;
  let headTop = head.offsetTop + dy * speed;
  const maxLeft = window.innerWidth - head.offsetWidth;
  const maxTop = window.innerHeight - head.offsetHeight;
  headLeft = Math.max(0, Math.min(headLeft, maxLeft));
  headTop = Math.max(0, Math.min(headTop, maxTop));
  head.style.left = headLeft + 'px';
  head.style.top = headTop + 'px';
  if(dx!==0||dy!==0){targetHeadAngle=Math.atan2(dy,dx)*(180/Math.PI);}
  currentHeadAngle = lerp(currentHeadAngle, targetHeadAngle, 0.2);
  head.style.transform = `rotate(${currentHeadAngle}deg)`;
  positionHistory[0].unshift({left:headLeft, top:headTop});
  if(positionHistory[0].length>MAX_HISTORY) {positionHistory[0].pop();}
  for(let i=1;i<containers.length;i++){
    const prevHistory = positionHistory[i-1]; let idx = SEGMENT_SPACING*i; if(idx>=prevHistory.length) idx=prevHistory.length-1;
    const pos = prevHistory[idx]; containers[i].style.left=pos.left+'px'; containers[i].style.top=pos.top+'px';
    const dxSeg=prevHistory[0].left-pos.left; const dySeg=prevHistory[0].top-pos.top; const angle=Math.atan2(dySeg, dxSeg)*(180/Math.PI);
    containers[i].style.transform=`rotate(${angle}deg)`; positionHistory[i].unshift({left:pos.left, top:pos.top});
    if(positionHistory[i].length>MAX_HISTORY) { positionHistory[i].pop(); }
  }
}
document.addEventListener('keydown', (e) => { if(e.key==="ArrowUp") { moveSnake(0,-0.5); } if(e.key==="ArrowDown") { moveSnake(0,0.5); } 
  if(e.key==="ArrowLeft") { moveSnake(-0.5,0); } if(e.key==="ArrowRight") { moveSnake(0.5,0); } });
document.querySelectorAll('.control-btn').forEach(btn => {
  btn.addEventListener('click', () => { const dir = btn.dataset.dir; if(dir==="up") { moveSnake(0,-0.5); }
    if(dir==="down") { moveSnake(0,0.5); } if(dir==="left") { moveSnake(-0.5,0); } if(dir==="right") { moveSnake(0.5,0); }
  });
});
document.getElementById("speed-slider").addEventListener("input", e => { speed = parseInt(e.target.value); });
const clearSlider = document.getElementById("clear-slider");
clearSlider.addEventListener("change", () => {
  if(clearSlider.value>=90){ const confirmClear = confirm("Do you want to clear all the data?"); if(confirmClear) clearAllInputs(); clearSlider.value=0; }
});
