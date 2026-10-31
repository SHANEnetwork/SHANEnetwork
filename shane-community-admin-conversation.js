/* Private community administration: prepare an owner's note in the existing form.
   No role changes, saves, or permissions are automated. */
(()=>{"use strict";function init(){const form=document.getElementById("form"),note=document.getElementById("note");if(!form||!note)return;
const host=document.createElement("div");host.className="shane-conversation-intake";host.id="shaneMemberAdminConversation";
host.innerHTML='<h2>What should your community remember about this member?</h2><p>Describe a factual administrative note. It remains private to the owner and is saved only when you choose the existing Save action.</p><label for="shaneMemberAdminGoal">Your note</label><textarea id="shaneMemberAdminGoal" rows="3" maxlength="4000"></textarea><button type="button" id="shaneMemberAdminPrepare">Prepare private note</button><p id="shaneMemberAdminResponse" role="status"></p>';
form.parentNode.insertBefore(host,form);
host.querySelector("button").addEventListener("click",()=>{const text=host.querySelector("textarea").value.trim();if(!text){host.querySelector("textarea").focus();return}
if(!document.getElementById("org").value||!document.getElementById("member").value){host.querySelector("#shaneMemberAdminResponse").textContent="Select the organization and member first.";return}
if(note.value.trim()&&note.value.trim()!==text){host.querySelector("#shaneMemberAdminResponse").textContent="An unsaved note is already present. Review it before replacing anything.";return}
note.value=text;note.dispatchEvent(new Event("input",{bubbles:true}));host.querySelector("#shaneMemberAdminResponse").textContent="Note prepared. Review the selected member and save when ready.";note.focus();
});
}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init()})();