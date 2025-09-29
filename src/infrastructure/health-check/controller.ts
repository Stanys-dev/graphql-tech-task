import { Controller, Get } from '@nestjs/common';

import { HealthCheckResource } from './resource';

@Controller()
export class HealthCheckController {
  @Get('/_health')
  async getHealthCheck(): Promise<HealthCheckResource> {
    return new HealthCheckResource('UP');
  }
}
