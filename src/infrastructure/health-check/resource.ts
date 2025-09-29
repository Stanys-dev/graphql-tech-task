export type HealthStatus = 'UP';

export class HealthCheckResource {
  status: HealthStatus;

  constructor(status: HealthStatus) {
    this.status = status;
  }
}
