/*
=============================
types
--> Kontrak tipe data fitur untuk mencegah bentuk data yang tidak sesuai.
=============================
*/

export interface User {
  name: string;
  email: string;
  demo?: boolean;
}

export interface Account extends User {
  digest: string;
  salt?: string;
}
