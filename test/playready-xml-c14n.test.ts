import { DOMParser } from '@xmldom/xmldom';
import { expect, test } from 'vitest';
import { canonicalizeXml } from '../src/lib/playready/xml-c14n';

// Expected bytes follow the rules and examples in W3C Canonical XML 1.0, sections 2 and 3.
test.each([
  {
    name: 'namespace and attribute ordering by URI, then local name',
    xml: '<root xmlns:z="urn:a" xmlns:a="urn:z"><target a:a="1" z:z="2" z:a="3" b="4" a="5"/></root>',
    expected:
      '<target xmlns:a="urn:z" xmlns:z="urn:a" a="5" b="4" z:a="3" z:z="2" a:a="1"></target>',
  },
  {
    name: 'namespace reset, prefix rebinding, and sibling scope',
    xml: '<root xmlns="urn:root" xmlns:p="urn:p"><target><empty xmlns=""/><p:child xmlns:p="urn:child"/><p:child/><same xmlns="urn:root"/></target></root>',
    expected:
      '<target xmlns="urn:root" xmlns:p="urn:p"><empty xmlns=""></empty><p:child xmlns:p="urn:child"></p:child><p:child></p:child><same></same></target>',
  },
  {
    name: 'inherited xml attributes use nearest ancestor and root overrides',
    xml: '<root xml:lang="en" xml:space="preserve" xml:base="https://example.org/"><inner xml:lang="de"><target xml:space="default"><child/></target></inner></root>',
    expected:
      '<target xml:base="https://example.org/" xml:lang="de" xml:space="default"><child></child></target>',
  },
  {
    name: 'character references, CDATA, and XML line endings',
    xml: '<target attr="&quot;&amp;&lt;>&#x9;&#xA;&#xD;\t\r\n">&lt;&amp;&gt;&#xD;\r\n<![CDATA[<&>]]></target>',
    expected:
      '<target attr="&quot;&amp;&lt;>&#x9;&#xA;&#xD;  ">&lt;&amp;&gt;&#xD;\n&lt;&amp;&gt;</target>',
  },
  {
    name: 'comments omitted, processing instructions and whitespace preserved',
    xml: '<target> \n<!--comment--><?empty?><?data hello?> text </target>',
    expected: '<target> \n<?empty?><?data hello?> text </target>',
  },
  {
    name: 'empty default namespace and explicit xml namespace are omitted',
    xml: '<root xmlns="urn:root"><target xmlns="" xmlns:xml="http://www.w3.org/XML/1998/namespace"/></root>',
    expected: '<target></target>',
  },
  {
    name: 'namespace URIs sorted by Unicode code points',
    xml: '<target xmlns:a="urn:\u{10000}" xmlns:b="urn:\uE000" a:a="1" b:b="2"/>',
    expected: '<target xmlns:a="urn:\u{10000}" xmlns:b="urn:\uE000" b:b="2" a:a="1"></target>',
  },
])('$name', ({ xml, expected }) => {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const target = document.getElementsByTagName('target')[0]!;
  const original = document.toString();
  expect(canonicalizeXml(target)).toBe(expected);
  expect(document.toString()).toBe(original);
});

test('rejects relative namespace URIs', () => {
  const document = new DOMParser().parseFromString(
    '<target xmlns:p="relative"/>',
    'application/xml',
  );
  expect(() => canonicalizeXml(document.documentElement!)).toThrow('Relative namespace URI');
});
