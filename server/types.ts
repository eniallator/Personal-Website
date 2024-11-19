import { isNumber, isObjectOf, isString } from "deep-guards";

export interface DayOfYear {
  month: number;
  day: number;
}

export interface Project {
  title: string;
  description: string;
  img: string;
  github: string;
}

export const isProject = isObjectOf<Project>({
  title: isString,
  description: isString,
  img: isString,
  github: isString,
});

export interface Company {
  url: string;
  name: string;
  img: string;
  aspectRatio: number;
}

export const isCompany = isObjectOf<Company>({
  url: isString,
  name: isString,
  img: isString,
  aspectRatio: isNumber,
});
