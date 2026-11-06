const {test}=require('node:test'),assert=require('node:assert/strict');
const {convert,balance,compareRecords}=require('../shane-detangler-engineering.cjs');
test('converts dimensional quantities and rejects incompatible units',()=>{assert.ok(Math.abs(convert(1,'gal','L')-3.785411784)<1e-10);assert.throws(()=>convert(1,'gal','kW'));});
test('checks conserved quantities without approving engineering',()=>{const r=balance({id:'water',unit:'L',inputs:[{value:10,unit:'L'}],outputs:[{value:9,unit:'L'}]});assert.equal(r.residual,1);assert.equal(r.withinTolerance,false);assert.equal(r.engineeringVerified,false);});
test('detects contradictory controlling records',()=>{const r=compareRecords([{key:'water',value:30,unit:'gal',sourceRef:'A',revision:'R1'},{key:'water',value:20,unit:'gal',sourceRef:'B',revision:'R2'}]);assert.equal(r.findings.length,1);assert.deepEqual(r.findings[0].sourceRefs,['A','B']);});
test('recognizes dimensionally equivalent document claims',()=>{const r=compareRecords([{key:'volume',value:1,unit:'gal',sourceRef:'A'},{key:'volume',value:3.785411784,unit:'L',sourceRef:'B'}]);assert.equal(r.findings.length,0);});
