import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const token = this.signToken(user._id.toString(), user.email);
    return { access_token: token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const token = this.signToken(user._id.toString(), user.email);
    return { access_token: token, user: this.sanitize(user) };
  }

  private signToken(sub: string, email: string) {
    return this.jwtService.sign({ sub, email });
  }

  private sanitize(user: any) {
    return {
      id: user._id,
      email: user.email,
      childName: user.childName,
      childAge: user.childAge,
      language: user.language,
      avatarId: user.avatarId,
      totalXp: user.totalXp,
      streakCurrent: user.streakCurrent,
      onboardingDone: user.onboardingDone,
    };
  }
}
