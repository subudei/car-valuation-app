import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);
//  promisify is a function that takes a function that uses a callback and returns a promise

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // 1.see if email is available
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // 2.hash the users password
    // 2.1 generate a salt
    const salt = randomBytes(8).toString('hex');

    // 2.2 hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer; // as Buffer is a type assertion to tell typescript that we know what we are doing and we are sure that the result of scrypt is a buffer, Buffer is a type that is used to represent a sequence of binary data.
    // 2.3join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex');
    // 3.create a new user and save it
    const user = await this.usersService.create(email, result);
    // 4.return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
