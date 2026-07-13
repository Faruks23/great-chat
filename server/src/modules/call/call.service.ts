import CallModel from './call.model';

export class CallService {
  static async getAll() {
    return CallModel.find().lean();
  }
}
