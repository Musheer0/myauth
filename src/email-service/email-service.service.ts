import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { sendEmailPayload } from 'src/shared/types';
import { SendEmail } from 'src/shared/utils/send-email';

@Injectable()
export class EmailServiceService {
  @OnEvent('send:email', { async: true })
  async SendEmail(data: sendEmailPayload) {
    return await SendEmail(data);
  }
}
