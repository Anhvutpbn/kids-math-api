import { Injectable } from '@nestjs/common';
import { SkillsService } from '../skills/skills.service';
import { QuestionsService } from '../questions/questions.service';
import { UsersService } from '../users/users.service';
import { SubmitPlacementTestDto } from './dto/submit-placement-test.dto';

const SKILL_ORDER = ['SK01', 'SK02', 'SK03', 'SK04', 'SK05', 'SK06', 'SK07'];
const CORRECT_INITIAL_MASTERY = 50;

@Injectable()
export class PlacementTestService {
  constructor(
    private skillsService: SkillsService,
    private questionsService: QuestionsService,
    private usersService: UsersService,
  ) {}

  async getQuestions() {
    const questions: any[] = [];
    for (const skillId of SKILL_ORDER) {
      const all = await this.questionsService.findBySkill(skillId, 1);
      if (all.length) questions.push(all[0]);
    }
    return questions;
  }

  async submit(userId: string, dto: SubmitPlacementTestDto) {
    const initialScores: Record<string, number> = {};

    for (const ans of dto.answers) {
      if (ans.isCorrect) {
        initialScores[ans.skillId] = CORRECT_INITIAL_MASTERY;
      } else {
        initialScores[ans.skillId] = initialScores[ans.skillId] ?? 0;
      }
    }

    const skillMap = await this.skillsService.initSkillMap(userId, initialScores);
    await this.usersService.updateOnboardingDone(userId);

    return { skillMap, initialScores };
  }
}
