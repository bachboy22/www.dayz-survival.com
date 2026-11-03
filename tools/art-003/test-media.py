import copy,hashlib,importlib,json,struct,tempfile,unittest,zlib
from pathlib import Path
from media import validate,figure

def png(color):
    def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b'\x00'+bytes(color)))+chunk(b'IEND',b'')

class MediaTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);self.manifest=json.loads(Path('tools/art-003/assets.example.json').read_text())
    def tearDown(self):self.temp.cleanup()
    def select(self,index):
        e=self.manifest['assets'][index];name=e['id']+'.png';data=png((20+index*40,40,60));(self.root/name).write_bytes(data)
        e.update({'final_selected':True,'origin':'synthetic-qa-fixture','creator':'SYNTHETIC SOFTWARE TEST, NOT ART','source_ref':'fixture-only','rights_ref':'fixture-only','selection_ref':'automated-test-only','alt':'Nonrepresentational QA color','caption':'SYNTHETIC QA, not DayZ imagery','variants':[{'file':name,'sha256':hashlib.sha256(data).hexdigest(),'width':1,'height':1}]});return e
    def test_reference_only_allows_architecture_without_art(self):self.assertEqual(validate(self.manifest,self.root),{})
    def test_reference_only_cannot_pass_final_gate(self):
        with self.assertRaises(ValueError):validate(self.manifest,self.root,require_final=True)
    def test_unselected_files_do_not_get_rendered(self):
        self.manifest['assets'][0]['variants']=[{'file':'concept.png'}]
        with self.assertRaises(ValueError):validate(self.manifest,self.root)
    def test_duplicate_slot_rejected(self):
        self.manifest['assets'][1]['id']='cover'
        with self.assertRaises(ValueError):validate(self.manifest,self.root)
    def test_fixture_never_accepted_without_explicit_qa_flag(self):
        self.select(0)
        with self.assertRaises(ValueError):validate(self.manifest,self.root)
    def test_generative_concept_not_made_final_by_metadata(self):
        self.select(0)['origin']='ai-generated'
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_missing_rights_rejected(self):
        self.select(0)['rights_ref']=None
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_wrong_map_rejected(self):
        self.select(3)['map_scope']='Chernarus'
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_remote_url_rejected(self):
        self.select(0)['variants'][0]['file']='https://example.org/test.png'
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_hash_mutation_rejected(self):
        self.select(0)['variants'][0]['sha256']='0'*64
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_dimensions_checked_against_png(self):
        self.select(0)['variants'][0]['width']=2
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_capture_requires_specific_evidence(self):
        self.select(0)['origin']='verified-game-capture'
        with self.assertRaises(ValueError):validate(self.manifest,self.root)
    def test_same_atlas_image_rejected(self):
        first=self.select(2);last=self.select(3);last['variants']=copy.deepcopy(first['variants'])
        with self.assertRaises(ValueError):validate(self.manifest,self.root,allow_test_fixtures=True)
    def test_all_four_qa_slots_can_exercise_final_render_gate(self):
        for i in range(4):self.select(i)
        self.assertEqual(len(validate(self.manifest,self.root,require_final=True,allow_test_fixtures=True)),4)
    def test_figures_escape_metadata_and_set_loading(self):
        e=self.select(0);e['alt']='"><script>alert(1)</script>';e['caption']='<img onerror="bad">'
        selected=validate(self.manifest,self.root,allow_test_fixtures=True);s=figure('cover',selected)
        self.assertNotIn('<script>',s);self.assertNotIn('<img onerror',s);self.assertIn('fetchpriority="high"',s);self.assertIn('width="1"',s)
    def test_missing_asset_is_hidden_without_pending_copy(self):
        s=figure('cover',{});self.assertIn('hidden',s);self.assertNotIn('pendiente',s)
    def test_atlas_caption_always_disclaims_cartography(self):
        self.select(2);s=figure('chernarus',validate(self.manifest,self.root,allow_test_fixtures=True));self.assertIn('no cartografía verificada',s);self.assertIn('loading="lazy"',s)

if __name__=='__main__':unittest.main()
