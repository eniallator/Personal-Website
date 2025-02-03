export const getId = (id: string) => document.getElementById(id) as HTMLElement;

export const getEl = (selector: string, el: ParentNode = document) =>
  el.querySelector(selector) as HTMLElement;

export const getAll = <E extends Element>(
  selector: string,
  el: ParentNode = document
) => [...el.querySelectorAll<E>(selector)];
