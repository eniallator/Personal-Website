export const getAllPages =
  <T>(getPage: (page: number, perPage: number) => Promise<T[]>) =>
  async (perPage: number): Promise<T[]> => {
    let page: number = 1;
    const data: T[] = [];
    do data.push(...(await getPage(page, perPage)));
    while (data.length === page++ * perPage);
    return data;
  };
