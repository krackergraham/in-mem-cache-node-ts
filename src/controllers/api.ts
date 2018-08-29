import { NextFunction, Request, Response } from 'express';
import Cache, { CacheOptions } from '../layers/cache';
import * as request from '../layers/request';

// Set max cache size to 50,000 address and min age to 10 minutes
const cache = new Cache(new CacheOptions(50000, 10));

export const getTaxRateByAddress = (req:Request, res:Response, next:NextFunction) => {

  req.checkQuery('address', 'Must provide an address').notEmpty().isString().isLength({ min: 5 });

  const errs = req.validationErrors();

  if (errs) {
    console.log(errs);
    res.sendStatus(400);

    return;
  }

  const address = req.query.address;
  const retVal = cache.getByKey(address);

  if (retVal) {
    res.send({ 'rate': retVal, 'isCache': true });
  } else {
    request
      .getTaxRateFromAddress(address)
      .then((rate:string) => {
        res.send({ 'rate': rate, 'isCache': false });
        cache.setByKey(address, rate);
      });
  }
};
