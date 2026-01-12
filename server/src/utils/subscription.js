export const PLAN_LIMITS = {
  TRIAL: 1,
  BASIC: 2,
  PREMIUM: 5,
  ENTERPRISE: Infinity,
};

export const USER_PRICE = 20;

export const calculatePrice = ({ users, isAnnual }) => {
  const monthly = users * USER_PRICE;
  return isAnnual ? monthly * 12 * 0.8 : monthly;
};
