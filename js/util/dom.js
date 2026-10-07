// util/dom.js
// Tiny DOM helpers so app.js/ui.js don't repeat document.createElement
// boilerplate. Nothing clever - this is not a virtual DOM.

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2), value);
    } else if (value !== undefined && value !== null && value !== false) {
      node.setAttribute(key, value === true ? '' : value);
    }
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
