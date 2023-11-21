import { Request as ExpressRequest } from 'express'; 
interface CustomRequest extends ExpressRequest {
  database: string;
  userId: string;
}

export default CustomRequest;
