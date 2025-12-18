import { Injectable } from '@nestjs/common';

@Injectable()
export class PostingWindowService {
  private postingEnabled = true;

  enable() {
    this.postingEnabled = true;
  }

  disable() {
    this.postingEnabled = false;
  }

  isEnabled(): boolean {
    return this.postingEnabled;
  }
}
