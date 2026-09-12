process.env.RUNTIME_NODE_MODULES='/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {resolvePresentationFont,finalizePresentation} from '/Users/mac/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/mac/Desktop/CallDine/architecture-presentation', build=root+'/.build', out=root+'/output';
const skill='/Users/mac/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const font=resolvePresentationFont({fontFamily:'Arial'});
const c={bg:'#fff8ee',ink:'#34231d',muted:'#88766b',accent:'#c9502f',line:'#ead7c0',paper:'#fffdf8',soft:'#f6e7d4',green:'#4e8358',purple:'#805299',teal:'#00897b'};
const icons={};
for(const name of ['calldine','bedrock','textract','transcribe','polly','chime','sagemaker','cloudwatch','s3','secrets','fastapi']){icons[name]=await sharp(await fs.readFile(build+'/assets/'+name+'.svg')).resize(512,512,{fit:'contain'}).png().toBuffer();}
for(const name of ['aws','next']) icons[name]=await fs.readFile(build+'/assets/'+name+'.png');
icons.qdrant=await sharp(await fs.readFile(build+'/assets/qdrant.svg')).png().toBuffer();
icons.docker=await sharp(await fs.readFile(build+'/assets/docker.svg')).png().toBuffer();
icons.sqlite=await sharp(await fs.readFile(build+'/assets/sqlite.gif')).png().toBuffer();
const sources='Source: CallDine repository scanned 12 September 2026. AWS icons: https://aws.amazon.com/architecture/icons/ . AWS logo: https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png . Next.js logo: https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png . FastAPI icon: https://github.com/fastapi/fastapi/blob/master/docs/en/docs/img/icon-white.svg . CallDine logo: Frontend/components/ui/Logo.tsx. Brand colors: Frontend/app/globals.css. SQLite logo: https://sqlite.org/images/sqlite370_banner.gif . Qdrant logo: https://github.com/qdrant/qdrant/blob/master/docs/logo.svg . Docker logo: https://www.docker.com/company/newsroom/media-resources/ .';
function txt(s,t,x,y,w,h,size=30,color=c.ink,bold=false){let a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={typeface:font,fontSize:size,color,bold,autoFit:'none'};return a;}
function rect(s,x,y,w,h,fill=c.paper,stroke=c.line,dashed=false){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:2,style:dashed?'dashed':'solid'}});}
function img(s,key,x,y,w,h=w){s.images.add({blob:icons[key],contentType:'image/png',alt:key+' logo',fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function base(p,title,sub,index){const s=p.slides.add();s.background.fill=c.bg;img(s,'calldine',60,40,52);txt(s,'CallDine',125,47,260,48,32,c.accent,true);txt(s,title,60,130,1760,90,58,c.ink,true);if(sub)txt(s,sub,63,224,1760,75,29,c.muted);txt(s,String(index).padStart(2,'0'),1790,1002,70,40,25,c.muted);return s;}
function edge(s,a,b,from='right',to='left',dashed=false,color=c.accent){return s.shapes.connect(a,b,{kind:'elbow',fromSide:from,toSide:to,line:{fill:color,width:3,style:dashed?'dashed':'solid'},tail:{type:'triangle',width:'med',length:'med'}});}
function node(s,{x,y,w=490,h=230,title,desc='',icon,num,fill=c.paper,stroke=c.line}){
 const box=rect(s,x,y,w,h,fill,stroke);
 if(num&&!icon){if(/Qdrant/.test(title))icon='qdrant';else if(['Repositories','Conversation memory','Save the reference','Save the order','Assign and confirm'].includes(title))icon='sqlite';}
 if(num){
  txt(s,String(num).padStart(2,'0'),x+25,y+20,75,48,28,c.accent,true);
  if(icon){if(icon==='fastapi')rect(s,x+w/2-48,y+30,96,96,c.teal,c.teal);if(icon==='qdrant'){img(s,'qdrant',x+108,y+51,235,72);img(s,'docker',x+363,y+55,80,64);}else if(icon==='sqlite'){img(s,icon,x+w/2-125,y+35,250,95);}else img(s,icon,x+w/2-48,y+30,96);}
  const label=txt(s,title,x+25,y+(icon?151:97),w-50,80,36,c.ink,true);label.text.style={typeface:font,fontSize:36,color:c.ink,bold:true,alignment:'center',autoFit:'none'};
  return box;
 }
 if(title==='Qdrant in Docker'){img(s,'qdrant',x+20,y+18,164,48);img(s,'docker',x+206,y+17,62,52);txt(s,'Qdrant in Docker',x+23,y+82,w-46,43,24,c.ink,true);return box;}
 if(title==='SQLite'){img(s,'sqlite',x+23,y+13,190,62);txt(s,desc,x+23,y+82,w-46,42,22,c.muted);return box;}
 const compact=h<150, size=compact?25:30;
 let tx=x+23,tw=w-46;
 if(icon){const iz=compact?58:64;if(icon==='fastapi')rect(s,x+20,y+20,iz,iz,c.teal,c.teal);img(s,icon,x+20,y+20,iz);tx=x+99;tw=w-122;}
 txt(s,title,tx,y+22,tw,compact?55:76,size,c.ink,true);
 if(desc)txt(s,desc,x+23,y+(compact?71:110),w-46,Math.max(40,h-(compact?76:115)),compact?22:25,c.muted);
 return box;
}
let script=[];
function steps(p,title,sub,data,takeaway,notes,src,planned=false){let s=base(p,title,planned?'Planned feature':'',p.slides.items.length+1);const pos=[[60,345],[715,345],[1370,345],[1370,655],[715,655],[60,655]];let boxes=data.map((d,i)=>node(s,{x:pos[i][0],y:pos[i][1],w:490,h:235,title:d[0],desc:'',icon:d[2],num:i+1,stroke:planned?c.purple:c.line}));for(let i=0;i<boxes.length-1;i++){if(i===2)edge(s,boxes[i],boxes[i+1],'bottom','top',planned,planned?c.purple:c.accent);else if(i<2)edge(s,boxes[i],boxes[i+1],'right','left',planned,planned?c.purple:c.accent);else edge(s,boxes[i],boxes[i+1],'left','right',planned,planned?c.purple:c.accent);}
 if(planned)txt(s,'Planned: live training and inference are not connected.',60,937,1750,65,28,c.purple,true);s.speakerNotes.textFrame.setText(notes+'\n\nSource files: '+src+'\n'+sources);script.push({title,notes,steps:data.map(d=>({label:d[0],say:d[1]}))});return s;}
function overview(){const p=Presentation.create({slideSize:{width:1920,height:1080}});const s=base(p,'Complete system architecture','Application services coordinate AI, voice, restaurant data and knowledge retrieval.',1);img(s,'aws',1530,12,330,145);
 txt(s,'APPLICATION RUNTIME',60,299,690,42,24,c.accent,true);txt(s,'AWS MANAGED SERVICES',1320,292,540,42,24,c.accent,true);
 const ui=node(s,{x:60,y:350,w:275,h:215,title:'Browser',desc:'Customer + admin\nVoice and text',icon:'calldine'});
 const next=node(s,{x:385,y:350,w:290,h:215,title:'Next.js',desc:'Interface + API proxy\nLocal port 3000',icon:'next'});
 const api=node(s,{x:755,y:350,w:390,h:215,title:'FastAPI',desc:'Routes + service orchestration\nLocal port 8000',icon:'fastapi'});
 edge(s,ui,next);edge(s,next,api);
 const chat=node(s,{x:755,y:620,w:390,h:135,title:'Chat + business tools',desc:'Knowledge, voice, orders, bookings'});edge(s,api,chat,'bottom','top');
 const q=node(s,{x:385,y:620,w:290,h:135,title:'Qdrant in Docker',desc:'Knowledge vectors'});edge(s,chat,q,'left','right',false,c.teal);
 const repo=node(s,{x:755,y:800,w:390,h:130,title:'Repositories',desc:'SQLModel data access'});edge(s,chat,repo,'bottom','top');
 const db=node(s,{x:385,y:800,w:290,h:130,title:'SQLite',desc:'Operational records'});edge(s,repo,db,'left','right');
 const ch=node(s,{x:60,y:620,w:275,h:190,title:'Chime SDK',desc:'Meeting media\nAPI session setup',icon:'chime'});edge(s,ui,ch,'bottom','top');
 const defs=[['bedrock','Bedrock','GPT-OSS reasoning + Titan embeddings'],['s3','Amazon S3','PDFs, menu images, call recordings'],['textract','Amazon Textract','PDF text extraction'],['transcribe','Amazon Transcribe','Uploaded speech turns to text'],['polly','Amazon Polly','Neural voice synthesis']];
 const aws=defs.map((d,i)=>node(s,{x:1320,y:345+i*119,w:540,h:105,title:d[1],icon:d[0]}));defs.forEach((d,i)=>txt(s,d[2],1419,407+i*119,419,37,20,c.muted));
 const bus=rect(s,1230,397,2,476,c.accent,c.accent);edge(s,api,bus,'right','left');aws.forEach(a=>edge(s,bus,a,'right','left'));
 img(s,'bedrock',60,975,48);txt(s,'Guardrails: optional',120,983,360,47,24,c.muted);
 img(s,'sagemaker',495,975,48);txt(s,'SageMaker: planned',555,983,360,47,24,c.purple);
 img(s,'cloudwatch',955,975,48);txt(s,'CloudWatch: helper only',1015,983,440,47,24,c.muted);
 img(s,'secrets',1480,975,48);txt(s,'Secrets: helper only',1540,983,340,47,24,c.muted);
 s.speakerNotes.textFrame.setText('The browser uses the Next.js interface and server API proxy. FastAPI coordinates chat, voice, knowledge, orders and reservations. Controlled services call Bedrock, S3, Textract, Transcribe and Polly through AWS clients. Knowledge search uses Qdrant, while repositories access SQLite. The browser connects to Chime separately and FastAPI creates the session. Guardrails are optional chat configuration. SageMaker remains planned. CloudWatch and Secrets Manager have client factories only. Solid lines represent source-code paths, not verified live AWS operation. AWS hosting is not established.\n'+sources);return p;}


const detailed=Presentation.create({slideSize:{width:1920,height:1080}});
steps(detailed,'1. Knowledge base pipeline','',[
 ['Upload restaurant PDF','The admin uploads restaurant information through Next.js and FastAPI.','next'],
 ['Store PDF in S3','FastAPI stores the original PDF in Amazon S3.','s3'],
 ['Textract reads the PDF','FastAPI asks Textract to extract the text and retrieves the results.','textract'],
 ['FastAPI splits the text','The backend splits the text into smaller chunks.','fastapi'],
 ['Titan creates vectors','Titan Text Embeddings converts each chunk into a numerical vector.','bedrock'],
 ['Save in Qdrant','FastAPI stores the vectors and source text in Qdrant, running in Docker.','qdrant']
],'','This pipeline prepares restaurant knowledge. FastAPI coordinates S3, Textract, text chunking, Titan embeddings and Qdrant. The search-knowledge tool later uses these stored chunks for retrieval-augmented generation. Background processing runs inside the FastAPI application.','backend/app/services/knowledge_service.py; backend/app/services/embedding_service.py');
{
 const s=base(detailed,'2. Complete voice conversation','',2);
 const setupA=node(s,{x:60,y:250,w:480,h:120,title:'FastAPI creates session',icon:'fastapi'});
 const setupB=node(s,{x:710,y:250,w:480,h:120,title:'Amazon Chime SDK',icon:'chime'});
 const setupC=node(s,{x:1360,y:250,w:500,h:120,title:'Browser joins meeting',icon:'calldine'});
 edge(s,setupA,setupB);edge(s,setupB,setupC);
 const ds=[['Customer speaks','The browser captures the customer’s microphone audio and finishes the turn after a short silence.','calldine'],['Upload to FastAPI','Next.js forwards the completed audio turn to the FastAPI voice service.','fastapi'],['Transcribe to text','FastAPI sends the audio to Amazon Transcribe Streaming, which produces the transcript.','transcribe'],['Send transcript to chat','The transcript returns to the browser, which submits it to FastAPI Chat Service.','next'],['Bedrock + tools','Chat Service sends conversation context to Bedrock and executes any requested business tools.','bedrock'],['Return answer text','FastAPI returns a cleaned answer to the browser. The browser then requests speech.','fastapi'],['Polly creates speech','FastAPI sends the answer to Polly and returns MP3 audio through Next.js.','polly'],['Customer hears reply','The browser plays the reply, then resumes listening.','calldine']];
 const pos=[[60,440],[535,440],[1010,440],[1485,440],[1485,710],[1010,710],[535,710],[60,710]];
 const boxes=ds.map((d,i)=>{const [x,y]=pos[i],w=375,h=210;const box=rect(s,x,y,w,h);txt(s,String(i+1).padStart(2,'0'),x+20,y+18,60,45,26,c.accent,true);if(d[2]==='fastapi')rect(s,x+148,y+21,80,80,c.teal,c.teal);img(s,d[2],x+148,y+21,80);let t=txt(s,d[0],x+20,y+126,w-40,75,30,c.ink,true);t.text.style={typeface:font,fontSize:30,bold:true,color:c.ink,alignment:'center'};return box;});
 for(let i=0;i<7;i++)edge(s,boxes[i],boxes[i+1],i===3?'bottom':i<3?'right':'left',i===3?'top':i<3?'left':'right');
 txt(s,'Turn-based audio. Chime meeting media is separate from the transcription path.',60,960,1730,60,27,c.muted);
 const notes='FastAPI creates the Chime meeting and attendee, and the browser joins that session. Separately, the browser captures completed microphone turns for the assistant. There is no direct Chime-to-Transcribe bridge. Audio uploads through Next.js to FastAPI, which uses Transcribe Streaming. The transcript returns to the browser and is submitted to Chat Service. Bedrock chooses tools, FastAPI executes them, and Bedrock generates the answer. The browser submits the cleaned answer to the speech endpoint. FastAPI invokes Polly, and the browser plays the MP3 response. Guardrails are optional on the Bedrock chat calls.';
 s.speakerNotes.textFrame.setText(notes+'\n'+sources);script.push({title:'2. Complete voice conversation',notes,steps:ds.map(d=>({label:d[0],say:d[1]}))});
}
{
 const s=base(detailed,'3. AI tools and RAG','Bedrock selects a tool. FastAPI runs it and returns the result.',3);
 const rows=[['search-knowledge','RAG: retrieve restaurant knowledge from PDFs.'],['search-menu','Find dishes, prices, availability and stock.'],['check-order-items','Validate quantities, stock and the subtotal.'],['create-order-draft','Save a delivery draft after address approval.'],['confirm-order','Recheck stock and confirm the approved draft.'],['check-table-availability','Check table capacity and booking overlaps.'],['create-reservation-draft','Save an unconfirmed booking.'],['confirm-reservation','Recheck availability, assign a table and confirm.']];
 rows.forEach((r,i)=>{const y=327+i*73;txt(s,r[0],65,y,630,49,30,c.accent,true);txt(s,r[1],735,y,1120,49,29,c.ink);});
 txt(s,'RAG: query embedding, Qdrant search, four chunks, then a Bedrock answer.',65,952,1760,70,28,c.teal,true);
 const notes='The knowledge tool uses RAG, which means retrieval-augmented generation. FastAPI embeds the query using Titan, searches Qdrant, and returns the four most relevant chunks to Bedrock as a tool result. The other tools use restaurant business services and the operational database. Drafts are separate from confirmation. The prompts ask for customer approval, while the service checks model-supplied confirmation flags and business conditions. The main chat path uses Bedrock tools and Python dispatch, not the separate prototype MCP adapter.';
 s.speakerNotes.textFrame.setText(notes+'\n'+sources);script.push({title:'3. AI tools and RAG',notes,steps:rows.map(r=>({label:r[0],say:r[1]}))});
}
steps(detailed,'4. SageMaker demand forecasting','',[
 ['Prepare order history','The planned pipeline would aggregate historical orders by day and menu category.'],
 ['Store training dataset','The prepared time-series data would be stored in S3.','s3'],
 ['Train DeepAR','SageMaker would train and evaluate a DeepAR forecasting model.','sagemaker'],
 ['Predict future demand','Inference would produce seven-day category forecasts and prediction ranges.','sagemaker'],
 ['Prepare recommendations','Backend business rules would turn forecasts into preparation and inventory recommendations.','fastapi'],
 ['Show admin dashboard','Next.js would display the forecast and recommendations to the restaurant admin.','next']
],'','This is a planned feature. The current recommendations page shows static demo values. Training, inference and dashboard integration are not connected. Daily category demand does not establish the busiest hourly window or staffing needs without additional data and business rules. Forecasting is independent of the Bedrock conversation model.','backend/app/aws/sagemaker_client.py; Frontend/app/(admin)/admin/recommendations/page.tsx',true);
async function save(p,name){let candidate=build+'/'+name+'.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);console.log('exported '+name);await finalizePresentation({explicitTotalSlideCount:4,workspaceDir:root,candidatePath:candidate,finalPath:out+'/'+name+'.pptx',pythonExecutable:'/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:build+'/'+name+'.validation.json'});for(let i=0;i<p.slides.items.length;i++){const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(out+'/images/'+name+'-'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await blob.arrayBuffer()));}console.log('rendered '+name);}

await save(detailed,'CallDine-Four-Workflows');
await fs.writeFile(out+'/Four-Workflows-Narration.md','# CallDine: four workflows\n\n'+script.map(a=>'## '+a.title+'\n\n'+a.steps.map((v,j)=>'### '+(j+1)+'. '+v.label+'\n\n'+v.say).join('\n\n')+'\n\n'+a.notes).join('\n\n'));
console.log('Four-slide revision complete');
