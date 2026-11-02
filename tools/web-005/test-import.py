import hashlib,importlib,unittest
from pathlib import Path
api=importlib.import_module('import-corpus')

class PresentationTests(unittest.TestCase):
    def render(self,source):
        p=api.Presentation({'MAN-TEST-001','LIV-TEST-002'},'MAN-TEST-001',{});p.feed(source);return p,''.join(p.out)
    def test_visible_text_preserved(self):
        s='<h1 id="original">Texto &amp; título</h1><p>Acentos: frío. <strong>Íntegro</strong>.</p>'
        p,out=self.render(s);self.assertEqual(api.text(out),api.text(s));self.assertEqual(p.outline[0]['id'],'section-1')
    def test_cross_reference(self):
        p,out=self.render('<a href="#LIV-TEST-002">Livonia</a>');self.assertIn('/articulos/LIV-TEST-002/',out);self.assertEqual(p.refs,{'LIV-TEST-002'})
    def test_markdown_cross_reference(self):
        p,out=self.render('<a href="../../manuscritos/LIV-TEST-002.md">Ver fuente</a>');self.assertIn('/articulos/LIV-TEST-002/',out)
    def test_script_rejected(self):
        with self.assertRaises(ValueError):self.render('<script>alert(1)</script>')
    def test_event_rejected(self):
        with self.assertRaises(ValueError):self.render('<p onclick="alert(1)">texto</p>')
    def test_javascript_link_rejected(self):
        with self.assertRaises(ValueError):self.render('<a href="javascript:alert(1)">texto</a>')
    def test_unknown_file_rejected(self):
        with self.assertRaises(ValueError):self.render('<a href="../../private/secret.md">texto</a>')
    def test_unknown_attribute_dropped(self):
        _,out=self.render('<p style="color:red" data-private="value">Texto</p>');self.assertEqual(out,'<p>Texto</p>')
    def test_external_link_is_only_hyperlink(self):
        p,out=self.render('<a href="https://example.org/">Fuente</a>');self.assertIn('rel="noreferrer"',out);self.assertEqual(p.external,{'https://example.org/'})

if __name__=='__main__':unittest.main()
