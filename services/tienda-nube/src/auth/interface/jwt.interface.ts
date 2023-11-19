interface DataJWT {
  user: string;
  database: string;
  clientId: string;
  iat: number;
  exp: number;
}

export default DataJWT;
