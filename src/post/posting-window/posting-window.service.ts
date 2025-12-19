import { Injectable } from '@nestjs/common';

@Injectable()
export class PostingWindowService {
  private postingEnabled = false;

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
