import type { Attr, Element, Node } from '@xmldom/xmldom';
import { InvalidLicense } from './exceptions';

export const C14N_ALGORITHM = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';

const isElement = (node: Node): node is Element => node.nodeType === 1;

// C14N orders by Unicode code point, without locale collation or UTF-16 ordering.
const compareNames = (left: string, right: string) => {
  const leftPoints = Array.from(left, (char) => char.codePointAt(0)!);
  const rightPoints = Array.from(right, (char) => char.codePointAt(0)!);
  for (let index = 0; index < Math.min(leftPoints.length, rightPoints.length); index++) {
    const difference = leftPoints[index]! - rightPoints[index]!;
    if (difference) return difference;
  }
  return leftPoints.length - rightPoints.length;
};

const escapeText = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\r', '&#xD;');

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\t', '&#x9;')
    .replaceAll('\n', '&#xA;')
    .replaceAll('\r', '&#xD;');

/** Inclusive C14N 1.0 without comments for a complete element subtree.
 * Keep the element attached so ancestor namespaces and xml:* attributes are available.
 * DTD-dependent documents are unsupported by the license parser.
 */
export const canonicalizeXml = (root: Element) => {
  const ancestors: Element[] = [];
  for (let parent = root.parentNode; parent && isElement(parent); parent = parent.parentNode) {
    ancestors.unshift(parent);
  }
  const inheritedNamespaces = new Map<string, string>();
  const inheritedAttributes = new Map<string, Attr>();
  for (const ancestor of ancestors) {
    for (const attribute of Array.from(ancestor.attributes)) {
      if (attribute.namespaceURI === XMLNS_NAMESPACE) {
        inheritedNamespaces.set(
          attribute.name === 'xmlns' ? '' : attribute.localName!,
          attribute.value,
        );
      } else if (attribute.namespaceURI === XML_NAMESPACE) {
        inheritedAttributes.set(attribute.name, attribute);
      }
    }
  }

  const render = (
    element: Element,
    parentNamespaces: Map<string, string>,
    renderedNamespaces: Map<string, string>,
  ): string => {
    const namespaces = new Map(parentNamespaces);
    const attributes = element === root ? new Map(inheritedAttributes) : new Map<string, Attr>();
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.namespaceURI === XMLNS_NAMESPACE) {
        namespaces.set(attribute.name === 'xmlns' ? '' : attribute.localName!, attribute.value);
      } else {
        attributes.set(attribute.name, attribute);
      }
    }
    let output = `<${element.tagName}`;
    for (const [prefix, uri] of [...namespaces].sort((left, right) =>
      compareNames(left[0], right[0]),
    )) {
      if (prefix === 'xml') continue;
      if (uri && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri)) {
        throw new InvalidLicense('Relative namespace URI is not supported by C14N');
      }
      if (uri === (renderedNamespaces.get(prefix) ?? '')) continue;
      output += ` ${prefix ? `xmlns:${prefix}` : 'xmlns'}="${escapeAttribute(uri)}"`;
    }
    const sortedAttributes = [...attributes.values()].sort(
      (left, right) =>
        compareNames(left.namespaceURI ?? '', right.namespaceURI ?? '') ||
        compareNames(left.localName ?? left.name, right.localName ?? right.name),
    );
    for (const attribute of sortedAttributes) {
      output += ` ${attribute.name}="${escapeAttribute(attribute.value)}"`;
    }
    output += '>';
    for (const child of Array.from(element.childNodes)) {
      if (isElement(child)) {
        output += render(child, namespaces, namespaces);
      } else if (child.nodeType === 3 || child.nodeType === 4) {
        output += escapeText(child.nodeValue ?? '');
      } else if (child.nodeType === 7) {
        const data = (child.nodeValue ?? '').replaceAll('\r', '&#xD;');
        output += `<?${child.nodeName}${data ? ` ${data}` : ''}?>`;
      } else if (child.nodeType !== 8) {
        throw new InvalidLicense('Unsupported XML node in C14N');
      }
    }
    return `${output}</${element.tagName}>`;
  };

  return render(root, inheritedNamespaces, new Map());
};
