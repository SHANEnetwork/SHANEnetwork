const test=require("node:test");
const assert=require("node:assert/strict");
const owner="11111111-1111-4111-8111-111111111111";
const guest="22222222-2222-4222-8222-222222222222";
const outsider="33333333-3333-4333-8333-333333333333";
function collaboration(){
 const state={status:"pending",sender:guest,recipient:owner,messages:[],tasks:[],purpose:"",nextStep:""};
 const allowed=user=>state.status==="accepted"&&[owner,guest].includes(user);
 return {
  state,
  respond(user,decision){if(user!==state.recipient||state.status!=="pending"||!["accepted","declined"].includes(decision))return false;state.status=decision;return true},
  send(user,body){if(!allowed(user)||!body.trim())return false;state.messages.push({user,body});return true},
  addTask(user,title){if(!allowed(user))return null;const task={id:state.tasks.length+1,creator:user,title,completed:false};state.tasks.push(task);return task},
  editTask(user,id,completed){if(!allowed(user))return false;const task=state.tasks.find(t=>t.id===id);if(!task)return false;task.completed=completed;return true},
  removeTask(user,id){if(!allowed(user))return false;const idx=state.tasks.findIndex(t=>t.id===id&&t.creator===user);if(idx<0)return false;state.tasks.splice(idx,1);return true},
  saveOverview(user,purpose,nextStep){if(!allowed(user))return false;state.purpose=purpose;state.nextStep=nextStep;return true},
  read(user){if(!allowed(user))return null;return structuredClone(state)}
 };
}
test("two independent members accept, exchange messages, share tasks, and resume",()=>{
 const app=collaboration();
 assert.equal(app.send(guest,"Before approval"),false);
 assert.equal(app.respond(guest,"accepted"),false);
 assert.equal(app.respond(owner,"accepted"),true);
 assert.equal(app.respond(owner,"declined"),false);
 assert.equal(app.send(guest,"Let's build this"),true);
 assert.equal(app.send(owner,"I'll take the first task"),true);
 const task=app.addTask(owner,"Draft our first event");
 assert.equal(app.editTask(guest,task.id,true),true);
 assert.equal(app.saveOverview(guest,"Create a welcoming event","Invite local collaborators"),true);
 const ownerReturn=app.read(owner),guestReturn=app.read(guest);
 assert.deepEqual(ownerReturn,guestReturn);
 assert.equal(ownerReturn.messages.length,2);
 assert.equal(ownerReturn.tasks[0].completed,true);
 assert.equal(ownerReturn.nextStep,"Invite local collaborators");
 assert.equal(app.removeTask(guest,task.id),false);
 assert.equal(app.removeTask(owner,task.id),true);
});
test("declined invitations and outsiders never gain workspace access",()=>{
 const app=collaboration();
 assert.equal(app.respond(owner,"declined"),true);
 assert.equal(app.respond(owner,"accepted"),false);
 assert.equal(app.read(owner),null);
 assert.equal(app.read(guest),null);
 assert.equal(app.send(outsider,"intrusion"),false);
});
