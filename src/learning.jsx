import React,{useState} from 'react';
import {BookOpen,GraduationCap,Lightbulb} from 'lucide-react';

const readings=[
  {title:'Plan with PACT',body:'People, activities, contexts and technologies define a design problem. Here, a first-time student must register quickly at a busy booth using a mouse or a touchscreen.',prompt:'What changes if the student is standing, using one hand, or reading in glare?'},
  {title:'Describe the interface with DIRA',body:'The touchscreen is a device. Tapping is an interaction technique. The location link is a representation, and the sequence from event details to registration is an assembly.',prompt:'Which part of DIRA changes when you replace a text box with radio buttons?'},
  {title:'Evaluate a design',body:'The score applies five design heuristics. The timed tasks record one person’s behavior. This is formative evaluation: use the observations to choose the next design change.',prompt:'Ask a new student to think aloud. Compare what they expect the control to do with what actually happens.'},
  {title:'Distinguish usability and UX',body:'Completing registration measures effectiveness. Time and errors describe efficiency. To understand the wider user experience, ask how confident or frustrated the student felt.',prompt:'Could two students get the same time and score but have different experiences?'}
];
export function FieldNotes(){
  return <div className="field-notes"><p>From the INFS4321 Human–Computer Interaction lecture notes.</p>{readings.map((r,i)=><details key={r.title} open={i===0}><summary>{r.title}</summary><p>{r.body}</p><blockquote>{r.prompt}</blockquote></details>)}</div>;
}
export function Concept({field}){return <aside className="concept"><BookOpen size={17}/><div><strong>{field.concept}</strong><p>{field.lesson}</p></div></aside>}
export function Debrief({field}){
  const [answer,setAnswer]=useState('');
  return <div className="field-notes"><p><b>{field.concept}.</b> {field.lesson}</p><h3>How would you test this change?</h3>
    <div className="debrief-options">{['Ask new students to try both versions in varied order.','Use the higher design score as proof of faster registration.'].map((a,i)=><button key={a} className="secondary" onClick={()=>setAnswer(i===0?'test':'score')}>{a}</button>)}</div>
    <p role="status" className="reflection-answer">{answer==='test'?'Exactly. Keep the task and device consistent, vary the order, and compare time, errors and student comments.':answer==='score'?'The score measures design rules. To claim a performance improvement, observe students completing the task on each version.':''}</p>
    <blockquote><GraduationCap size={18}/> <b>Instructor prompt</b><br/>Which observation from your round supports your decision? What would you need to observe in another student?</blockquote></div>;
}
