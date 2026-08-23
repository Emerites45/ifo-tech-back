import { Test, TestingModule } from '@nestjs/testing';
import { CreatesubscriptionController } from './createsubscription.controller';
import { CreatesubscriptionService } from './createsubscription.service';

describe('CreatesubscriptionController', () => {
  let controller: CreatesubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatesubscriptionController],
      providers: [CreatesubscriptionService],
    }).compile();

    controller = module.get<CreatesubscriptionController>(CreatesubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
