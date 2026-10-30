/* One endeavor, multiple cooperating SHANE capabilities.
 * A planning and continuity contract, not proof of provisioning or payment.
 * No public publication, charging, privileged access, or third-party action occurs here.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANECapabilityManifest=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const definitions=Object.freeze({
 creator:{label:"SHANE Creator",requires:["endeavor"],state:"integrated-foundation"},
 analyst:{label:"SHANE Analyst",requires:["endeavor"],state:"endpoint-available"},
 professionals:{label:"AI Professionals",requires:["endeavor","permissions"],state:"planned-integration"},
 network:{label:"Shane Network",requires:["endeavor","listing"],state:"private-draft-bridge"},
 community:{label:"Clubs and communities",requires:["endeavor","organization"],state:"conditional-private-provisioning"},
 communication:{label:"Messages and collaboration",requires:["listing","member-access"],state:"existing-network-services"},
 video:{label:"Video meetings",requires:["community","permissions"],state:"integration-unverified"},
 games:{label:"Game Master and multiplayer",requires:["endeavor","permissions"],state:"integration-unverified"},
 commerce:{label:"Memberships and commerce",requires:["verified-entitlements","billing"],state:"not-activated"}
});
const safeId=x=>typeof x==="string"&&/^[0-9a-f-]{36}$/i.test(x)?x:null;
function describe(endeavor){if(!endeavor?.id||!endeavor.persisted)throw Error("Load an authenticated saved endeavor first");
 const ids=Object.freeze({endeavor:safeId(endeavor.id),site:safeId(endeavor.linkedSiteId),organization:safeId(endeavor.linkedOrganizationId)});
 if(!ids.endeavor)throw Error("Invalid saved endeavor identifier");
 const capabilities=Object.fromEntries(Object.entries(definitions).map(([name,def])=>[name,Object.freeze({...def,linkedResources:Object.freeze(def.requires.filter(r=>r==="endeavor"||r==="organization").filter(r=>Boolean(ids[r]))),requiresFurtherSetup:def.state!=="integrated-foundation"})]));
 return Object.freeze({version:"0.1",endeavorId:ids.endeavor,resources:ids,capabilities:Object.freeze(capabilities),published:false,billingActivated:false});
}
return Object.freeze({version:"0.1",definitions,describe});
});
