/**
 * Wraps an async controller function so that any rejected promise
 * (i.e. any thrown error inside an async function) gets forwarded
 * to next(err) automatically, instead of us writing try/catch in
 * every single controller by hand.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};