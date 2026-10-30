/* SHANE network entitlement vocabulary, v0.1.
 * A catalog, not proof of purchase or authorization. Server-side enforcement is required.
 * SHON is outside this commercial catalog and remains free.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEEntitlements=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const catalog=Object.freeze({
 explorer:Object.freeze({label:"Public Explorer",publicDiscovery:true,requiresPayment:false,capabilities:Object.freeze(["discover.public","destinations.view.public"])}),
 network:Object.freeze({label:"Network Member",requiresPayment:true,capabilities:Object.freeze(["destinations.publish","collaborations.request","communities.participate"])}),
 creator:Object.freeze({label:"Creator",requiresPayment:true,capabilities:Object.freeze(["destinations.publish","collaborations.request","communities.participate","sites.create","sites.manage"])}),
 professional:Object.freeze({label:"Professional",requiresPayment:true,capabilities:Object.freeze(["destinations.publish","collaborations.request","communities.participate","sites.create","sites.manage","professionals.profile"])}),
 organization:Object.freeze({label:"Organization",requiresPayment:true,capabilities:Object.freeze(["destinations.publish","collaborations.request","communities.participate","sites.create","sites.manage","professionals.profile","organizations.manage"])}),
});
const proposed=Object.freeze(["explorer","network","creator","professional","organization"]);
function describe(tier){return catalog[tier]||null}
function isCommercialCapability(capability){return proposed.some(t=>catalog[t].requiresPayment&&catalog[t].capabilities.includes(capability))}
function decision(capability,verifiedEntitlements){if(catalog.explorer.capabilities.includes(capability))return Object.freeze({allowed:true,reason:"public"});if(!Array.isArray(verifiedEntitlements))return Object.freeze({allowed:false,reason:"server-verification-required"});return Object.freeze({allowed:verifiedEntitlements.includes(capability),reason:verifiedEntitlements.includes(capability)?"server-verified":"not-entitled"})}
return Object.freeze({version:"0.1-draft",catalog,describe,isCommercialCapability,decision});
});
