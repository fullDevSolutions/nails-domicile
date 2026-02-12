const db = require('../../config/database');

const Setting = {
  async get(key) {
    const row = await db('settings').where({ setting_key: key }).first();
    if (!row) return null;
    if (row.setting_type === 'json') {
      try { return JSON.parse(row.setting_value); } catch (err) {
        console.error('Failed to parse setting JSON for key', key, ':', err.message);
        return row.setting_value;
      }
    }
    if (row.setting_type === 'number') return Number(row.setting_value);
    if (row.setting_type === 'boolean') return row.setting_value === 'true';
    return row.setting_value;
  },

  async set(key, value, type = 'string') {
    const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
    // Use INSERT ... ON DUPLICATE KEY UPDATE to avoid race condition
    return db.raw(
      `INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type)`,
      [key, stringValue, type]
    );
  },

  async getAll() {
    const rows = await db('settings');
    const result = {};
    rows.forEach(row => {
      if (row.setting_type === 'json') {
        try { result[row.setting_key] = JSON.parse(row.setting_value); } catch (err) {
          console.error('Failed to parse setting JSON for key', row.setting_key, ':', err.message);
          result[row.setting_key] = row.setting_value;
        }
      } else if (row.setting_type === 'number') {
        result[row.setting_key] = Number(row.setting_value);
      } else if (row.setting_type === 'boolean') {
        result[row.setting_key] = row.setting_value === 'true';
      } else {
        result[row.setting_key] = row.setting_value;
      }
    });
    return result;
  }
};

module.exports = Setting;
