const pages = Array.from(document.querySelectorAll('.page'));
const book = document.getElementById('book');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const pageNumber = document.getElementById('pageNumber');
const progress = document.getElementById('progress');
const music = document.getElementById('music');
const musicToggle = document.getElementById('musicToggle');
const enter = document.getElementById('enter');

let current = 0;
let musicWasPlayingBeforeVideo = false;

function setMusicButton(playing){
  if(!musicToggle) return;
  musicToggle.textContent = playing ? 'Ⅱ' : '♫';
  musicToggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}
function playMusic(){
  if(!music) return;
  music.play().then(()=>setMusicButton(true)).catch(()=>setMusicButton(false));
}
function pauseMusic(){ if(!music) return; music.pause(); setMusicButton(false); }

function updatePage(){
  pages.forEach((p,i)=>{
    p.classList.toggle('active', i===current);
    p.classList.toggle('prev', i<current);
  });
  const n=current+1;
  pageNumber.textContent = String(n).padStart(2,'0')+' / '+String(pages.length).padStart(2,'0');
  progress.style.setProperty('--progress', ((n/pages.length)*100)+'%');
  backBtn.disabled = current===0;
  nextBtn.disabled = current===pages.length-1;
  nextBtn.textContent = current===pages.length-1 ? 'Finished ❤️' : 'Next ❤️';

  if(pages[current]?.classList.contains('video-page')){
    startCurrentVideo();
  } else {
    stopVideoAndRestoreMusic();
  }
}
function goTo(i){
  current=Math.max(0,Math.min(pages.length-1,i));
  updatePage();
}
function next(){ goTo(current+1); }
function back(){ goTo(current-1); }

enter?.addEventListener('click',()=>{
  playMusic();
  next();
});
nextBtn?.addEventListener('click',next);
backBtn?.addEventListener('click',back);
musicToggle?.addEventListener('click',()=>music?.paused ? playMusic() : pauseMusic());

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight') next();
  if(e.key==='ArrowLeft') back();
});

let startX=null;
book?.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
book?.addEventListener('touchend',e=>{
  if(startX===null)return;
  const dx=e.changedTouches[0].clientX-startX;
  if(Math.abs(dx)>60) dx<0 ? next() : back();
  startX=null;
},{passive:true});

document.querySelectorAll('.love-tile').forEach(tile=>{
  tile.addEventListener('click',()=>{
    document.getElementById('tileText').textContent=tile.dataset.text||'';
  });
});
document.querySelectorAll('.open-card').forEach(card=>{
  card.addEventListener('click',()=>{
    document.getElementById('openText').textContent=card.dataset.message||'';
  });
});
document.getElementById('letterOpen')?.addEventListener('click',()=>{
  document.getElementById('letterNote')?.classList.toggle('open');
});
document.getElementById('secret')?.addEventListener('click',()=>{
  document.getElementById('secretText').textContent='You found the secret. ❤️ I could build a hundred pages and still not fit everything I feel into them. So for today, just remember one thing: you are deeply, ridiculously special to me.';
});

/* ----- Five-video sequence ----- */
const video=document.getElementById('memoryVideo');
const source=document.getElementById('memorySource');
const videoCount=document.getElementById('videoCount');
const videoLabel=document.getElementById('videoLabel');
const videoPause=document.getElementById('videoPause');
const videoHint=document.getElementById('videoHint');
const videoUnmute=document.getElementById('videoUnmute');
const videoDots=Array.from(document.querySelectorAll('.video-dot'));

const videoFiles=['video-01.mp4','video-02.mp4','video-03.mp4','video-04.mp4','video-05.mp4'];
const videoLabels=['memory one','memory two','memory three','memory four','memory five'];
let videoIndex=0;
let videoAutoplaying=false;

function updateVideoUI(){
  videoCount.textContent=String(videoIndex+1).padStart(2,'0')+' / '+String(videoFiles.length).padStart(2,'0');
  videoLabel.textContent=videoLabels[videoIndex];
  videoDots.forEach((dot,i)=>dot.classList.toggle('active',i===videoIndex));
  if(videoPause) videoPause.textContent = video?.paused ? '▶ Play' : 'Ⅱ Pause';
}

function loadVideo(i, autoplay=true){
  if(!video || !source) return;
  videoIndex=(i+videoFiles.length)%videoFiles.length;
  videoAutoplaying=autoplay;
  video.pause();
  videoUnmute?.setAttribute('hidden','');
  source.src='assets/'+videoFiles[videoIndex];
  video.load();
  updateVideoUI();
  if(autoplay) video.play().catch(()=>{
    // Chrome may block autoplay with sound. Fall back to muted autoplay.
    video.muted=true;
    video.play().then(()=>{
      videoUnmute?.removeAttribute('hidden');
      if(videoHint) videoHint.textContent='Autoplay is on. Tap “video sound” if you want the original audio. ❤️';
    }).catch(()=>{});
  });
}

function startCurrentVideo(){
  if(!video) return;
  musicWasPlayingBeforeVideo=!music.paused;
  if(musicWasPlayingBeforeVideo) pauseMusic();
  loadVideo(videoIndex,true);
}
function stopVideoAndRestoreMusic(){
  if(!video) return;
  const wasRunning=!video.paused && !video.ended;
  video.pause();
  if(wasRunning && musicWasPlayingBeforeVideo) playMusic();
  videoAutoplaying=false;
}

video?.addEventListener('play',()=>{
  if(!pages[current]?.classList.contains('video-page')) return;
  if(music && !music.paused) musicWasPlayingBeforeVideo=true;
  if(musicWasPlayingBeforeVideo) pauseMusic();
  if(videoPause) videoPause.textContent='Ⅱ Pause';
});
video?.addEventListener('pause',()=>{
  if(videoPause) videoPause.textContent='▶ Play';
});
video?.addEventListener('ended',()=>{
  if(videoIndex < videoFiles.length-1){
    loadVideo(videoIndex+1,true);
  } else {
    videoAutoplaying=false;
    if(musicWasPlayingBeforeVideo) playMusic();
    if(videoHint) videoHint.textContent='All five memories. ❤️';
    if(videoPause) videoPause.textContent='↻ Replay';
  }
});
videoPause?.addEventListener('click',()=>{
  if(!video) return;
  if(video.ended){
    loadVideo(0,true);
    return;
  }
  if(video.paused) video.play().catch(()=>{});
  else video.pause();
});
videoUnmute?.addEventListener('click',()=>{
  if(!video) return;
  video.muted=false;
  video.play().catch(()=>{});
  videoUnmute.setAttribute('hidden','');
  if(videoHint) videoHint.textContent='The five memories will play one after another. ❤️';
});
videoDots.forEach(dot=>{
  dot.addEventListener('click',()=>{
    if(!pages[current]?.classList.contains('video-page')) return;
    loadVideo(Number(dot.dataset.video),true);
  });
});

/* Floating hearts */
function heart(){
  const c=document.getElementById('floatingHearts');
  if(!c)return;
  const h=document.createElement('span');
  h.className='float';
  h.textContent=['♡','❤️','🩷','✨','♡'][Math.floor(Math.random()*5)];
  h.style.left=Math.random()*100+'vw';
  h.style.fontSize=11+Math.random()*15+'px';
  h.style.animationDuration=8+Math.random()*8+'s';
  c.appendChild(h);
  setTimeout(()=>h.remove(),17000);
}
setInterval(heart,900);

updatePage();
