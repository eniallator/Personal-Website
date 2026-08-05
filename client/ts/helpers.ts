// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const getId = <E extends HTMLElement>(id: string) =>
  document.getElementById(id) as E;

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const getEl = <E extends HTMLElement>(
  selector: string,
  el: ParentNode = document
) => el.querySelector(selector) as E;

export const getAll = <E extends HTMLElement>(
  selector: string,
  el: ParentNode = document
) => [...el.querySelectorAll<E>(selector)];
