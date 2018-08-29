export const getTaxRateFromAddress = (address:string):Promise<string> => {
  return new Promise((resolve:(value?:string | PromiseLike<string>) => void) => {
    setTimeout(() => {
      resolve(randomTaxRate(address));
    }, 2000); // Fake a 2 sec response
  });
};

const randomTaxRate = (address:string) => {
  let hash = getHash(address);
  if (hash < 0) hash *= -1;
  while (hash > 10) hash /= 10;

  return hash.toFixed(2);
};

const getHash = (val:string) => {
  let hash = 0, i, chr;
  if (val.length === 0) return hash;
  for (i = 0; i < val.length; i++) {
    chr = val.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
};
