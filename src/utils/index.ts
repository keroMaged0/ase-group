import { Bcrypt } from './bcrypt';
import { Crypto } from './crypto';
import { DateHelper } from './date';
import { mailTransporter } from './mail';
import { notify } from './notification';
import { Tokens } from './token';

export const Utils = {
  Bcrypt,
  Crypto,
  DateHelper,
  MailTransporter: mailTransporter,
  Tokens,
  notify,
};
