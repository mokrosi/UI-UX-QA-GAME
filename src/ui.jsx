import React,{useEffect,useId,useRef,useState} from 'react';
import {BookOpen,CalendarDays,Check,CircleHelp,Clock3,Download,Eye,Gamepad2,GraduationCap,Keyboard,Link as LinkIcon,List,MapPin,Monitor,MousePointer2,PanelTop,PencilRuler,Play,Radio,ScanEye,Shuffle,SlidersHorizontal,TextCursorInput,Trophy,Volume2,VolumeX,X} from 'lucide-react';
import {fields,buttonStyle,sessionNames,validateRegistration} from './game.mjs';
import arcadeArt from '../assets/arcade.webp';

function BrandMark(){return <span className="brandmark" aria-hidden="true"><i/><i/><i/><i/><i/></span>}
export function Header({show,muted,onSound,reset}){
  return <header><div className="bar wrap">
    <button className="brand" onClick={reset} aria-label="HCI Arcade home"><BrandMark/>HCI Arcade</button>
    <nav aria-label="Game tools"><button className="helpButton" aria-label="Field notes" onClick={()=>show('notes')}><BookOpen size={17}/><span>Field notes</span></button>
    <button className="square" aria-label="How to play" title="How to play" onClick={()=>show('help')}><CircleHelp size={18}/></button>
    <button className="square" onClick={()=>show('board')} aria-label="Open leaderboard" title="Leaderboard"><Trophy size={18}/></button>
    <button className="square" onClick={onSound} aria-label={muted?'Turn sound on':'Mute sound'} aria-pressed={!muted} title={muted?'Turn sound on':'Mute sound'}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button></nav>
  </div></header>;
}
const guide=[
  {Icon:PencilRuler,title:'Design an interface',description:'Choose colors, type and form controls.'},
  {Icon:MousePointer2,title:'Test as a student',description:'Read, locate and register for a workshop.'},
  {Icon:ScanEye,title:'Explain one improvement',description:'Use your observations to revise the design.'}
];
export function Guide(){return <ol className="guide-list">{guide.map(({Icon,title,description})=><li key={title}><span className="guide-icon"><Icon size={20} strokeWidth={1.7}/></span><div><b>{title}</b><p>{description}</p></div></li>)}</ol>}
export function Welcome({name,setName,shuffle,start}){
  const input=useRef(null);
  return <><section className="hero"><i className="crop tl"/><i className="crop tr"/><i className="crop bl"/><i className="crop br"/>
    <div className="hero-copy"><div className="game-tag"><span className="course">INFS4321</span><span>INTERACTION DESIGN LAB</span></div>
      <h1>Can you<br/><em>use it?</em></h1><p>Build a workshop interface, try it as a student, and find out what your design choices change.</p>
      <div className="meta"><span><Clock3/>~3 min</span><b/><span><SlidersHorizontal/>{fields.length} choices</span><b/><span><Trophy/>10 points</span></div>
    </div><div className="hero-art"><img src={arcadeArt} alt="A burgundy engraving of a vintage computer with a pixel eye and cursor"/></div>
  </section><div className="welcome-grid">
    <section className="panel player-panel"><div className="eyebrow"><Gamepad2 size={16}/>PLAYER SETUP</div><h2>Join the lab.</h2>
      <form onSubmit={e=>{e.preventDefault();start()}}><label htmlFor="nickname">Your nickname</label><div className="name-row">
        <input ref={input} id="nickname" placeholder="Enter a nickname" autoComplete="off" maxLength="24" value={name} onChange={e=>setName(e.target.value)}/>
        <button type="button" className="shuffle" onClick={()=>{shuffle();input.current?.focus()}} title="Generate a nickname"><Shuffle size={17}/><span>Random</span></button>
      </div><button className="primary start" type="submit"><Play size={16} fill="currentColor"/>Start lab</button></form>
    </section><aside className="panel field-guide"><div className="eyebrow"><GraduationCap size={17}/>LEARNING OBJECTIVES</div><h2>Inside the lab</h2><Guide/></aside>
  </div></>;
}
export function Footer(){return <footer className="wrap"><span><span className="ready-dot"/>Booth mode</span><span>Human–Computer Interaction <span aria-hidden="true" className="footer-cross">✳</span></span></footer>}
export function Modal({title,onClose,children}){
  const ref=useRef(null),closeRef=useRef(onClose),id=useId();
  closeRef.current=onClose;
  useEffect(()=>{const previous=document.activeElement,dialog=ref.current;dialog.showModal();
    return ()=>{dialog.close();if(previous?.isConnected)previous.focus()};},[]);
  return <dialog aria-labelledby={id} ref={ref} onCancel={e=>{e.preventDefault();closeRef.current()}} onClick={e=>{if(e.target===e.currentTarget)closeRef.current()}}>
    <div className="dialog-body"><div className="dialog-head"><h2 id={id}>{title}</h2><button className="square" onClick={onClose} aria-label="Close dialog"><X size={19}/></button></div>{children}</div>
  </dialog>;
}
export function Help(){return <><Guide/><p className="note">Seven decisions feed five checks worth two points each. The score covers reading, pointing, finding a link, entering a code and selecting a session. Test time and errors appear separately.</p>{location.protocol!=='file:'&&<div className="downloads"><a href="./can-you-use-it.zip" download><Download size={17}/>Download React project</a><a href="./offline.html" download="Can You Use It.html"><Monitor size={17}/>Offline booth game</a></div>}</>}
function BookingForm({design:d,event,testing,onJoin,onInvalid}){
  const id=useId(),codeRef=useRef(null),groupRef=useRef(null),[code,setCode]=useState(''),[session,setSession]=useState('');
  const [errors,setErrors]=useState({});
  const codeId=id+'-code',sessionId=id+'-session';
  const codeHint=d.input==='guided',hasLabel=d.input!=='placeholder';
  function submit(e){
    e.preventDefault();
    if(!testing)return;
    const issues=validateRegistration(event,code,session);
    setErrors(issues);
    if(!issues.code&&!issues.session){onJoin();return;}
    onInvalid();
    if(issues.code)codeRef.current.focus();else groupRef.current?.querySelector('input,select')?.focus();
  }
  const desc=[codeHint?id+'-hint':'',errors.code?id+'-ce':''].filter(Boolean).join(' ')||undefined;
  function setMode(value){setSession(value);setErrors(s=>({...s,session:''}));}
  return <form className="booking" onSubmit={submit} noValidate>
    <div className="code-control">
      <label className={hasLabel?'':'sr-only'} htmlFor={codeId}>Workshop code</label>
      {codeHint&&<small id={id+'-hint'}>Use the four digits on your task card.</small>}
      <input ref={codeRef} id={codeId} value={code} onChange={e=>{setCode(e.target.value);setErrors(s=>({...s,code:''}))}} inputMode="numeric" type="text" maxLength={8} autoComplete="off" placeholder={hasLabel?'': 'Workshop code'} aria-invalid={!!errors.code} aria-describedby={desc}/>
      {errors.code&&<p id={id+'-ce'} className="form-error" role="alert">{errors.code}</p>}
    </div>
    <fieldset className="session-control" ref={groupRef} aria-describedby={errors.session?id+'-se':undefined}><legend>Workshop session</legend>
      {d.session==='radio'?<div className="radio-choices">{sessionNames.map(s=><label key={s}><input type="radio" name={sessionId} value={s} checked={session===s} onChange={()=>setMode(s)}/>{s}</label>)}</div>
        :d.session==='menu'?<select aria-label="Workshop session" aria-invalid={!!errors.session} value={session} onChange={e=>setMode(e.target.value)}><option value="">Choose a session</option>{sessionNames.map(s=><option key={s}>{s}</option>)}</select>
        :<input aria-label="Workshop session" aria-invalid={!!errors.session} value={session} onChange={e=>setMode(e.target.value)} autoComplete="off" maxLength={24}/>}
      {errors.session&&<p id={id+'-se'} className="form-error" role="alert">{errors.session}</p>}
    </fieldset>
    {testing?<button type="submit" className={'join '+d.button}>Join workshop</button>:<span className={'join '+d.button}>Join workshop</span>}
  </form>;
}
export function RoomCard({design:d,event,page='event',stage=-1,onTarget,onMiss,onInvalid,glare=false}){
  const b=buttonStyle(d),active=stage>=0,booking=page==='form';
  const style={'--paper':d.bg,'--ink':d.ink,'--read':d.size+'px','--btn-bg':b.bg||d.bg,'--btn-ink':b.ink||d.ink,'--hit':b.height+'px'};
  const linkClass='event-link '+d.link,linkContent=<>View location{d.link==='icon'&&<LinkIcon size={14}/>}</>;
  function activate(e,key){e.preventDefault();onTarget(key)}
  return <article aria-label={event.title+' '+(booking?'registration form':'event card')} className={'event-card'+(glare?' glare':'')} style={style} onClick={e=>{if(stage===1&&!e.target.closest('[data-control]'))onMiss()}}>
    <div className="ticket-art" aria-hidden="true"><div className="print-orbit"/><i className="print-square"/><i className="print-bars"/><span>HCI</span></div>
    <div className="ticket-body"><div className="ticket-type">{booking?'WORKSHOP REGISTRATION':'CAMPUS WORKSHOP'}</div><h3>{event.title}</h3>
      {booking?<BookingForm key={event.title} design={d} event={event} testing={stage===2} onJoin={()=>onTarget('join')} onInvalid={onInvalid}/>:<>
        <p className="event-detail"><CalendarDays size={17}/>{event.day} · {event.time}</p>
        <p className="location">On campus · {active?<a href="#location" data-control="location" className={linkClass} onClick={e=>activate(e,'location')}>{linkContent}</a>:<span className={linkClass}>{linkContent}</span>}</p>
        {active?<button type="button" className={'join '+d.button} data-control="join" onClick={e=>activate(e,'join')}>Join workshop</button>:<span className={'join '+d.button}>Join workshop</span>}
      </>}
    </div></article>;
}
const inputIcons={guided:PanelTop,label:TextCursorInput,placeholder:Keyboard,radio:Radio,menu:List,text:Keyboard};
export function Choices({field,value,choose,omit}){
  return <div className={'choices '+(['bg','ink'].includes(field.key)?'colors':'')} role="group" aria-label={field.label}>{field.options.filter(o=>o.value!==omit).map(o=>{
    const selected=o.value===value,Icon=inputIcons[o.value];
    return <button key={o.value} className={'choice'+(selected?' selected':'')} aria-pressed={selected} onClick={()=>choose(o.value)}>
      {Icon?<Icon size={18} aria-hidden="true"/>:['bg','ink'].includes(field.key)?<i className="swatch" style={{backgroundColor:o.value}}/>:field.key==='size'?<b aria-hidden="true" className="type-sample" style={{fontSize:o.value}}>Aa</b>:field.key==='link'?<span aria-hidden="true" className={'link-sample '+o.value}>{o.value==='icon'?<LinkIcon size={16}/>: 'Ab'}</span>:<i className={'btn-sample '+o.value}/>}
      <span>{o.name}{field.key==='size'&&<small>{o.value} px</small>}</span>{selected&&<Check className="choice-check" size={17}/>}
    </button>})}</div>;
}
