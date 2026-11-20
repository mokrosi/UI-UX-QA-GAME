import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Check,Eye,Gamepad2,PencilRuler,SlidersHorizontal,Sun,Timer,Trophy,MousePointer2,RotateCcw,Play,ScanEye,Target} from 'lucide-react';
import {fields,initialDesign,sample,workshops,nicknames,pick,total,evaluate,formatTime,readBoard,saveScore} from './game.mjs';
import {Header,Welcome,Footer,Modal,Help,RoomCard,Choices} from './ui.jsx';
import {Concept,FieldNotes,Debrief} from './learning.jsx';
import './style.css';

const blankStats=()=>({times:[],misses:0,wrong:0,invalid:0});
const labels=['Design','Test','Improve'];
function PhaseBar({phase,name}){
  const i=phase==='design'?0:phase==='test'?1:2;
  return <div className="phasebar"><div className="phases" aria-label="Round progress">{labels.map((label,n)=><span key={label} className={n===i?'current':n<i?'done':''}>{n<i?<Check size={14}/>:<b>{n+1}</b>}{label}</span>)}</div><span className="player"><Gamepad2 size={16}/>{name}</span></div>;
}
function Preview({children,label='Live preview',toggle,glare,controls}){
  return <div className="preview"><div className="preview-head">{controls||<span><Eye size={15}/>{label}</span>}{toggle&&<button className={'glare-switch'+(glare?' on':'')} type="button" onClick={toggle} aria-pressed={glare}><Sun size={15}/>Glare</button>}</div><div className="preview-inner">{children}</div></div>;
}
function Checks({design}){return <div className="checks">{evaluate(design).map(c=><details key={c.title} ><summary><span>{c.title}</span><small>{c.metric}</small><b className={c.points===2?'pass':'partial'}>{c.points}/2</b></summary><p>{c.feedback}<small>{c.principle}</small></p></details>)}</div>}
function BoardRows({rows}){return <ol className="board">{rows.map((r,i)=><li key={i}><span className="rank">{i+1}</span><strong>{r.name}</strong><small>{formatTime(r.ms)}</small><b>{r.score}/10</b></li>)}</ol>}
function Board({rows}){
  const earlier=readBoard('hci-arcade-rounds-v1');
  return <>{rows.length?<><p className="note">Top five first-round designs on this device. Test time breaks a tie.</p><BoardRows rows={rows}/></>:<div className="empty"><Trophy size={32}/><h3>Make the first entry.</h3><p>Finish a student test to record a score.</p></div>}
    {earlier.length>0&&<details className="test-log"><summary>Previous five-choice edition</summary><BoardRows rows={earlier}/></details>}</>;
}
function pageFor(key){return key==='input'||key==='session'?'form':'event';}
function CardViews({page,setPage}){
  return <div className="view-switch" role="group" aria-label="Preview screen">{[['event','Event card'],['form','Registration']].map(([id,label])=><button key={id} onClick={()=>setPage(id)} aria-pressed={page===id}>{label}</button>)}</div>;
}
function App(){
  const [phase,setPhase]=useState('welcome'),[name,setName]=useState(''),[design,setDesign]=useState({...initialDesign});
  const [step,setStep]=useState(0),[event,setEvent]=useState(sample),[task,setTask]=useState(0),[stats,setStats]=useState(blankStats);
  const [error,setError]=useState(''),[dialog,setDialog]=useState(null),[muted,setMuted]=useState(true),[board,setBoard]=useState(readBoard);
  const [fixField,setFixField]=useState(0),[fixValue,setFixValue]=useState(null),[glare,setGlare]=useState(false),[idle,setIdle]=useState(null);
  const [view,setView]=useState('event');
  const taskStart=useRef(0),pauseAt=useRef(null),audioRef=useRef(null),heading=useRef(null),lastActive=useRef(Date.now()),taskLock=useRef(false);
  const modal=idle!==null?'idle':dialog;
  const draft=fixValue===null?design:{...design,[fields[fixField].key]:fixValue};
  const originalScore=total(design),newScore=total(draft),sumTime=stats.times.reduce((a,b)=>a+b,0);
  const testTasks=['What time does the workshop start?','Open the workshop location.','Register for a session.'];
  function sound(enabled=!muted) {
    if(!enabled)return;
    try{
      const ctx=audioRef.current ||= new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==='suspended')ctx.resume().catch(()=>{});
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      oscillator.type='sine';oscillator.frequency.setValueAtTime(520,ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(720,ctx.currentTime+0.07);
      gain.gain.setValueAtTime(0.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);
      oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+0.1);
    }catch{}
  }
  function reset(){
    setPhase('welcome');setName('');setDesign({...initialDesign});setStep(0);setTask(0);setEvent(sample);
    setStats(blankStats());setError('');setFixValue(null);setGlare(false);setView('event');setIdle(null);setDialog(null);
    lastActive.current=Date.now();pauseAt.current=null;taskLock.current=false;
  }
  useEffect(()=>{
    const record=()=>{lastActive.current=Date.now()};
    const types=['pointerdown','keydown','input','wheel','touchmove'];
    types.forEach(type=>window.addEventListener(type,record,{passive:true}));
    return ()=>types.forEach(type=>window.removeEventListener(type,record));
  },[]);
  useEffect(()=>{
    if(phase==='welcome')return;
    const interval=setInterval(()=>{
      const elapsed=Date.now()-lastActive.current;
      if(idle===null && elapsed>=45000)setIdle(10);
      else if(idle!==null){if(idle<=1)reset();else setIdle(idle-1)}
    },1000);
    return ()=>clearInterval(interval);
  },[phase,idle]);
  useEffect(()=>{
    if(phase!=='test')return;
    const sync=()=>{
      const paused=Boolean(modal)||document.hidden;
      if(paused && pauseAt.current===null)pauseAt.current=performance.now();
      if(!paused && pauseAt.current!==null){taskStart.current+=performance.now()-pauseAt.current;pauseAt.current=null;}
    };
    sync();document.addEventListener('visibilitychange',sync);
    return ()=>document.removeEventListener('visibilitychange',sync);
  },[phase,modal]);
  useLayoutEffect(()=>{
    if(phase!=='welcome'){heading.current?.focus({preventScroll:true});}
    window.scrollTo(0,0);
    const main=document.getElementById('main');if(main)main.scrollTop=0;
    taskLock.current=false;
  },[phase,step,task]);
  function start(){sound();setName(name.trim()||pick(nicknames));setPhase('design')}
  function beginTest(){sound();setEvent(pick(workshops));setStats(blankStats());setTask(0);setError('');setPhase('test');taskStart.current=performance.now();pauseAt.current=null;}
  function finishTask(){
    if(taskLock.current || modal)return;
    taskLock.current=true;
    const now=performance.now(),times=[...stats.times,Math.max(0,now-taskStart.current)];
    sound();setStats(s=>({...s,times}));setError('');taskStart.current=now;
    if(task===2){
      setView('event');setBoard(saveScore({name,score:originalScore,ms:times.reduce((a,b)=>a+b,0)}));setPhase('results');
    }else setTask(task+1);
  }
  function cardTap(key){if(task===1&&key==='location'||task===2&&key==='join')finishTask();else if(task>0)setStats(s=>({...s,misses:s.misses+1}));else setError('Choose the workshop time below the question.');}
  function beginFix(){
    const low=evaluate(design).reduce((a,b)=>b.points<a.points?b:a);
    setFixField(fields.findIndex(f=>f.key===low.field));setFixValue(null);setPhase('fix');setGlare(false);sound();
  }
  function resume(){lastActive.current=Date.now();setIdle(null)}
  const titleProps={ref:heading,tabIndex:-1};
  return <><a className="skip" href="#main">Skip to game</a><Header muted={muted} onSound={()=>{setMuted(!muted);sound(muted)}} show={setDialog} reset={()=>phase==='welcome'?setDialog(null):setDialog('restart')}/>
    <main id="main" className={'wrap screen-'+phase}>
    {phase==='welcome'?<Welcome name={name} setName={setName} shuffle={()=>setName(pick(nicknames.filter(n=>n!==name)))} start={start}/>:['design','test','fix'].includes(phase)&&<PhaseBar phase={phase} name={name}/>}
    {phase==='design'&&<section className="stage-grid"><div className="work-panel">
      <div className="eyebrow"><PencilRuler size={16}/>CARD BUILDER <span className="counter">{step+1} / {fields.length}</span></div>
      <div className="progress-ticks">{fields.map((f,i)=><i key={f.key} className={i<=step?'filled':''}/>)}</div>
      <h1 className="page-title" {...titleProps}>{fields[step].question}</h1><p>{fields[step].hint}</p>
      <Choices field={fields[step]} value={design[fields[step].key]} choose={value=>setDesign({...design,[fields[step].key]:value})}/>
      <Concept field={fields[step]}/><div className="actions"><button className="secondary" onClick={()=>step?setStep(step-1):setPhase('welcome')}>Back</button><button className="primary" onClick={()=>{if(step===fields.length-1)beginTest();else{sound();setStep(step+1)}}}>{step===fields.length-1?<><Play size={16}/>Test as a student</>:'Continue'}</button></div>
      </div><Preview><RoomCard design={design} event={sample} page={pageFor(fields[step].key)}/></Preview></section>}
    {phase==='test'&&<section className="stage-grid"><div className="work-panel"><div className="eyebrow"><ScanEye size={16}/>STUDENT TEST <span className="counter">{task+1} / 3</span></div>
      <div className="progress-ticks">{[0,1,2].map(i=><i key={i} className={i<=task?'filled':''}/>)}</div>
      <h1 className="page-title" {...titleProps}>{testTasks[task]}</h1>
      <p>{['Read the new event card, then pick the correct time.','Find the location link inside your card and select it.','Use the details below to complete the registration form. Then select Join workshop.'][task]}</p>
      {task===0&&<div className="time-options">{event.times.map(t=><button key={t} onClick={()=>{if(t===event.time)finishTask();else {setStats(s=>({...s,wrong:s.wrong+1}));setError('Take another look at the start time.')}}}>{t}</button>)}</div>}
      {task===2&&<><div className="task-brief"><div><span>Workshop code</span><b>{event.code}</b></div><div><span>Session</span><b>{event.session}</b></div></div><div className="room-found"><Check size={17}/>Location found · {event.room}</div></>}
      <p className="input-feedback" role="status">{error}</p></div>
      <Preview label="Your student card"><RoomCard design={design} event={event} stage={task} page={task===2?'form':'event'} onInvalid={()=>setStats(s=>({...s,invalid:s.invalid+1}))} onTarget={cardTap} onMiss={()=>{if(task>0)setStats(s=>({...s,misses:s.misses+1}))}}/></Preview></section>}
    {phase==='results'&&<><section className="result-top"><div><div className="eyebrow"><Trophy size={16}/> DESIGN RESULTS</div><h1 className="page-title" {...titleProps}>{name}’s score</h1><p>{originalScore===10?'Every check passed. Can a different look do just as well?':'Open a check to see the design evidence, then choose one change.'}</p></div><div className="score">{originalScore}<span>/10</span></div></section>
      <section className="stage-grid results"><div className="work-panel"><h2>Heuristic review</h2><p className="rubric-note">Five design checks · 2 points each</p><Checks design={design}/><div className="actions"><button className="secondary" onClick={reset}>Next visitor</button><button className="primary" onClick={beginFix}><SlidersHorizontal size={16}/>Change one thing</button></div></div>
      <div><Preview controls={<CardViews page={view} setPage={setView}/>} label="Tested design" glare={glare} toggle={()=>setGlare(!glare)}><RoomCard design={design} event={event} page={view} glare={glare}/></Preview>
      <div className="stats"><span><Timer size={16}/><b>{formatTime(sumTime)}</b> total time</span><span><MousePointer2 size={16}/><b>{stats.misses}</b> {stats.misses===1?'missed tap':'missed taps'}</span></div>
      <button className="evidence-button" onClick={()=>setDialog('evidence')}>Observed task evidence</button></div></section></>}
    {phase==='fix'&&<section className="stage-grid"><div className="work-panel"><div className="eyebrow"><SlidersHorizontal size={16}/>ONE-CHANGE CHALLENGE</div>
      <h1 className="page-title" {...titleProps}>Make one edit.</h1><p>Choose a setting, try a new option, then lock in your change.</p>
      <label className="select-label" htmlFor="fix-field">Setting to change</label><select id="fix-field" value={fixField} onChange={e=>{setFixField(Number(e.target.value));setFixValue(null)}}>{fields.map((f,i)=><option key={f.key} value={i}>{f.label}</option>)}</select>
      <Choices field={fields[fixField]} value={fixValue} omit={design[fields[fixField].key]} choose={setFixValue}/>
      <div className="actions"><button className="secondary" onClick={()=>setPhase('results')}>Back</button><button className="primary" disabled={fixValue===null} onClick={()=>{sound();setView(pageFor(fields[fixField].key));setPhase('compare')}}>Compare designs</button></div>
      </div><Preview label="Revised preview"><RoomCard design={draft} event={event} page={pageFor(fields[fixField].key)}/></Preview></section>}
    {phase==='compare'&&<><section className="result-top"><div><div className="eyebrow"><Target size={16}/>ROUND COMPLETE <div className="delta">{newScore===originalScore?'Same score':(newScore>originalScore?'+':'')+(newScore-originalScore)+' points'}</div></div><h1 className="page-title" {...titleProps}>Before &amp; after.</h1><p>{fields[fixField].label} changed from <b>{fields[fixField].options.find(o=>o.value===design[fields[fixField].key]).name}</b> to <b>{fields[fixField].options.find(o=>o.value===fixValue).name}</b>.</p></div><div className="compare-tools"><CardViews page={view} setPage={setView}/><button className={'secondary'+(glare?' active':'')} aria-pressed={glare} onClick={()=>setGlare(!glare)}><Sun size={17}/> Glare preview</button></div></section>
      <section className="compare-grid">{[design,draft].map((d,i)=><div key={i}><Preview label={(i?'After':'Before')+' · '+total(d)+'/10'}><RoomCard design={d} event={event} page={view} glare={glare}/></Preview></div>)}</section>
      <div className="final-actions"><div className="metrics">{evaluate(design).map((c,i)=>{const n=evaluate(draft)[i];return c.metric!==n.metric?<span key={c.title}><b>{c.title}</b> {c.metric} → {n.metric}</span>:null})}</div><button className="secondary" onClick={()=>setDialog('debrief')}>Learning debrief</button><button className="primary" onClick={reset}><RotateCcw size={16}/>Next visitor</button></div></>}
    </main><Footer/>
    {modal&&<Modal key={modal} title={{evidence:'Observed task evidence',notes:'HCI field notes',debrief:'Reflect on your change',help:'How to play',board:'Booth leaderboard',restart:'Leave this round?',idle:'Still playing?'}[modal]} onClose={modal==='idle'?resume:()=>setDialog(null)}>
      {modal==='evidence'&&<div className="test-log"><ul>{stats.times.map((v,i)=><li key={i}>{['Read the time','Open location','Join workshop'][i]}<b>{formatTime(v)}</b></li>)}<li>Incorrect time answers<b>{stats.wrong}</b></li><li>Form correction attempts<b>{stats.invalid}</b></li></ul><p>These timings and errors describe one attempt. Ask a second student to try the same task and compare their experience.</p></div>}
      {modal==='notes'&&<FieldNotes/>}{modal==='debrief'&&<Debrief field={fields[fixField]}/>}
      {modal==='help'&&<Help/>}{modal==='board'&&<Board rows={board}/>}
      {modal==='restart'&&<><p>Your current round will end.</p><div className="actions"><button className="secondary" onClick={()=>setDialog(null)}>Keep playing</button><button className="primary" onClick={reset}>Start over</button></div></>}
      {modal==='idle'&&<><p>The booth will reset in {idle} seconds.</p><div className="actions"><button className="secondary" onClick={reset}>End round</button><button className="primary" onClick={resume}>Keep playing</button></div></>}
    </Modal>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
