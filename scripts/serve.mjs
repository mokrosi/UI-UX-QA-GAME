import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/offline.html':'offline.html','/can-you-use-it.zip':'can-you-use-it.zip'};
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!Object.hasOwn(files,path)){res.writeHead(404);res.end();return;}
  try{
    const data=await readFile(new URL('../dist/'+files[path],import.meta.url));
    res.writeHead(200,{'Content-Type':path.endsWith('.zip')?'application/zip':'text/html; charset=utf-8'});res.end(data);
  }catch{res.writeHead(503);res.end('Run npm run build first.');}
}).listen(port,()=>console.log('HCI Arcade is available on http://localhost:'+port));
