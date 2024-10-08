declare module "accept-webp" {
  import { RequestHandler } from "express";

  function acceptWebp(
    dirName: string,
    extensions?: string | string[]
  ): RequestHandler;

  export = acceptWebp;
}
