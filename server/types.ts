import { isNumber, isObjectOf, isString, TypeFromGuard } from "deep-guards";

export interface DayOfYear {
  month: number;
  day: number;
}

export const isProject = isObjectOf({
  title: isString,
  description: isString,
  img: isString,
  github: isString,
});

export type Project = TypeFromGuard<typeof isProject>;

export const isCompany = isObjectOf({
  url: isString,
  name: isString,
  img: isString,
  aspectRatio: isNumber,
});

export type Company = TypeFromGuard<typeof isCompany>;
