const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'src', 'modules', 'user', 'user.service.ts');
const text = fs.readFileSync(p, 'utf8');
const replacement = `  static async findByEmailOrPhone(query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    const digitsOnly = query.replace(/\\D/g, '');

    const conditions: any[] = [];
    if (normalizedQuery.includes('@')) {
      conditions.push({ email: normalizedQuery });
    }
    if (digitsOnly.length > 0) {
      conditions.push({ phone: digitsOnly });
      conditions.push({ phone: { $regex: digitsOnly, $options: 'i' } });
    }
    if (conditions.length === 0) {
      conditions.push({ email: normalizedQuery }, { phone: normalizedQuery });
    }

    const user = await UserModel.findOne({ $or: conditions }).lean();
    return normalizeUser(user);
  }
`;
const regex = /static async findByEmailOrPhone[\s\S]*?return normalizeUser\(user\);\s*\n\s*\}/;
const result = text.replace(regex, replacement);
if (result === text) {
  throw new Error('Pattern not found');
}
fs.writeFileSync(p, result, 'utf8');
console.log('Replaced function block');
