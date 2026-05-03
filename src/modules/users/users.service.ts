import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({ ...dto, password: hashed });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async updateOnboardingDone(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { onboardingDone: true });
  }

  async updateAvatar(userId: string, avatarId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { avatarId });
  }

  async addXp(userId: string, xp: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $inc: { totalXp: xp } });
  }

  async updateStreak(userId: string): Promise<{ streakCurrent: number; streakLongest: number }> {
    const user = await this.userModel.findById(userId);
    if (!user) return { streakCurrent: 0, streakLongest: 0 };

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.lastSessionDate
      ? new Date(user.lastSessionDate).toISOString().slice(0, 10)
      : null;

    let newStreak = user.streakCurrent;

    if (lastDate === today) {
      // Already played today — no change
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yest = yesterday.toISOString().slice(0, 10);

      newStreak = lastDate === yest ? user.streakCurrent + 1 : 1;
    }

    const longestStreak = Math.max(newStreak, user.streakLongest);

    await this.userModel.findByIdAndUpdate(userId, {
      streakCurrent: newStreak,
      streakLongest: longestStreak,
      lastSessionDate: new Date(),
    });

    return { streakCurrent: newStreak, streakLongest: longestStreak };
  }
}
