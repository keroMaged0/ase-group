import { config } from 'dotenv';

config();

export const env = {
  port: +(process.env.PORT || 3000) as number,
  environment: process.env.NODE_ENV?.trim() || 'development',
  frontUrl: process.env.FRONT_URL?.split(',').map((el) => el.trim()) as string[],
  apiUrl: process.env.API_URL!,
  bcrypt: {
    salt: +(process.env.BCRYPT_SALT || 1) as number,
    paper: process.env.BCRYPT_PAPER,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    accessExpireIn: +(process.env.JWT_ACCESS_EXPIRE_IN || 24 * 60 * 60) as number,
    refreshExpireIn: +(process.env.JWT_REFRESH_EXPIRE_IN || 12 * 30 * 24 * 60 * 60) as number,
  },
  mail: {
    host: process.env.MAIL_HOST,
    service: process.env.MAIL_SERVICE,
    port: +(process.env.MAIL_PORT || 1) as number,
    driver: process.env.MAIL_DRIVER!,
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },
  redis: {
    url: process.env.REDIS_URI!,
  },
  firebase: {
    apiKey: process.env.FB_APIKEY,
    authDomain: process.env.FB_AUTHDOMAIN,
    projectId: process.env.FB_PROJECTID,
    storageBucket: process.env.FB_STORAGEBUCKET,
    messagingSenderId: process.env.FB_MESSAGINGSENDERID,
    appId: process.env.FB_APPID,
    measurementId: process.env.FB_MEASUREMENTID,
    clientEmail: process.env.FB_CLIENTEMAIL,
    privateKey: process.env.FB_PRIVATEKEY,
  },
  postgres: {
    host: process.env.PG_HOST!,
    port: +process.env.PG_PORT!,
    username: process.env.PG_USERNAME!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY_ID!,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
    bucket: process.env.AWS_BUCKET!,
  },
};

export const checkEnvVariables = () => {
  if (!env.bcrypt.salt) throw new Error('env:BCRYPT_SALT must be defined');
  if (!Number.isInteger(env.bcrypt.salt)) throw new Error('env:BCRYPT_SALT must be integer');
  if (!Number.isInteger(env.jwt.accessExpireIn))
    throw new Error('env:JWT_ACCESS_EXPIRE_IN must be integer');
  if (!Number.isInteger(env.jwt.refreshExpireIn))
    throw new Error('env:JWT_REFRESH_EXPIRE_IN must be integer');
  if (!env.jwt.secret) throw new Error('env:JWT_SECRET must be defined');
  if (!env.mail.port) throw new Error('env:MAIL_PORT must be defined');
  if (!Number.isInteger(env.mail.port)) throw new Error('env:MAIL_PORT must be integer');
  if (!env.mail.driver) throw new Error('env:MAIL_DRIVER must be defined');
  if (!env.mail.user) throw new Error('env:MAIL_USER must be defined');
  if (!env.mail.pass) throw new Error('env:MAIL_PASS must be defined');
  if (!env.frontUrl) throw new Error('env:FRONT_URL must be defined');
  if (!env.apiUrl) throw new Error('env:API_URL must be defined');
  if (!env.firebase.projectId) throw new Error('env:FB_PROJECTID must be defined');
  if (!env.firebase.clientEmail) throw new Error('env:FB_CLIENTEMAIL must be defined');
  if (!env.firebase.privateKey) throw new Error('env:FB_PRIVATEKEY must be defined');
  if (!env.firebase.apiKey) throw new Error('env:FB_APIKEY must be defined');
  if (!env.firebase.authDomain) throw new Error('env:FB_AUTHDOMAIN must be defined');
  if (!env.firebase.messagingSenderId) throw new Error('env:FB_MESSAGINGSENDERID must be defined');
  if (!env.firebase.appId) throw new Error('env:FB_APPID must be defined');
  if (!env.firebase.measurementId) throw new Error('env:FB_MEASUREMENTID must be defined');
  if (!env.postgres.host) throw new Error('env:PG_HOST must be defined');
  if (!env.postgres.port) throw new Error('env:PG_PORT must be defined');
  if (!Number.isInteger(env.postgres.port)) throw new Error('env:PG_PORT must be integer');
  if (!env.postgres.username) throw new Error('env:PG_USERNAME must be defined');
  if (!env.postgres.password) throw new Error('env:PG_PASSWORD must be defined');
  if (!env.postgres.database) throw new Error('env:PG_DATABASE must be defined');
  if (!env.aws.accessKey) throw new Error('env:AWS_ACCESS_KEY_ID must be defined');
  if (!env.aws.secretKey) throw new Error('env:AWS_SECRET_ACCESS_KEY must be defined');
  if (!env.aws.region) throw new Error('env:AWS_REGION must be defined');
  if (!env.aws.bucket) throw new Error('env:AWS_BUCKET must be defined');
};
