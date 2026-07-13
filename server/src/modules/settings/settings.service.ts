import SettingsModel from './settings.model';
import { SettingsData } from './settings.interface';

export class SettingsService {
  static async getAll() {
    return SettingsModel.find().lean();
  }

  static async update(data: SettingsData) {
    const settings = await SettingsModel.findOneAndUpdate({}, data, { new: true, upsert: true });
    return settings;
  }
}
