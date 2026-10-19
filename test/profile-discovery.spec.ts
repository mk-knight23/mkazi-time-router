import {describe,it,expect} from 'vitest';
import {profileResponse} from '../src/profile';
describe('expanded professional profile',()=>{
 it('provides public JSON identity with accurate base and target roles',async()=>{const r=profileResponse(new Request('https://mkazi.live/profile.json'))!;expect(r.headers.get('content-type')).toContain('application/json');const p=await r.json() as {location:string,targetRoles:string[]};expect(p.location).toBe('India');expect(p.targetRoles).toContain('Forward Deployed AI Engineer');});
 it('serves the visible biography and links without origin-relative assets',async()=>{const r=profileResponse(new Request('https://mkazi.live/about'))!;const h=await r.text();expect(h).toContain('Wipro Technologies');expect(h).toContain('US clients');expect(h).toContain('https://devtools.mkazi.live/skills');expect(h).not.toMatch(/(?:href|src)="\/(?!\/)/);});
 it('keeps head responses empty and rejects write methods',async()=>{expect(await profileResponse(new Request('https://mkazi.live/profile.json',{method:'HEAD'}))!.text()).toBe('');expect(profileResponse(new Request('https://mkazi.live/profile.json',{method:'POST'}))!.status).toBe(405);});
});
