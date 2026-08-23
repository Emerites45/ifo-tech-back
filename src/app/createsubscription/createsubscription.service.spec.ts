import { Test, TestingModule } from '@nestjs/testing';
import { CreatesubscriptionService } from './createsubscription.service';

describe('CreatesubscriptionService', () => {
  let service: CreatesubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreatesubscriptionService],
    }).compile();

    service = module.get<CreatesubscriptionService>(CreatesubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
