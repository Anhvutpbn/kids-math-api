import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>) {}

  findBySkill(skillId: string, difficulty?: number) {
    const filter: any = { skillId };
    if (difficulty) filter.difficulty = difficulty;
    return this.questionModel.find(filter);
  }

  findById(id: string) {
    return this.questionModel.findOne({ id });
  }

  findMany(ids: string[]) {
    return this.questionModel.find({ id: { $in: ids } });
  }

  findBySkills(skillIds: string[], difficulty?: number) {
    const filter: any = { skillId: { $in: skillIds } };
    if (difficulty) filter.difficulty = difficulty;
    return this.questionModel.find(filter);
  }
}
