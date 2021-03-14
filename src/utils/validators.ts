const isStringArray = (arr: string[]) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string') throw new Error(
      `Expected 'string[]'. Got ${JSON.stringify(arr)}.`,
    );
  }
};

export {
  isStringArray,
};
