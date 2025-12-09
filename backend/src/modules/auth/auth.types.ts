export interface SignupPayload {
  email: string;
  password: string;
  role: 'BUSINESS' | 'FREELANCER';
}
