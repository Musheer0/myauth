export const getUserIdKey = (id: string) => `user:id:${id}`;
export const getUserEmailKey = (email: string) => `user:email:${email}`;
export const getVerificationTokenKey = (id: string) =>
  `verification:token:${id}`;
