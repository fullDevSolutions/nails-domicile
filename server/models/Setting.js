const db = require('../../config/database');

const Setting = {
  async get(key) {
    const row = await db('settings').where({ setting_key: key }).first();
    if (!row) return null;
    if (row.setting_type === 'json') {
      try { return JSON.parse(row.setting_value); } catch { return row.setting_value; }
    }
    if (row.setting_type === 'number') return Number(row.setting_value);
    if (row.setting_type === 'boolean') return row.setting_value === 'true';
    return row.setting_value;
  },

  async set(key, value, type = 'string') {
    const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
    const exists = await db('settings').where({ setting_key: key }).first();
    if (exists) {
      return db('settings').where({ setting_key: key }).update({
        setting_value: stringValue,
        setting_type: type
      });
    }
    return db('settings').insert({
      setting_key: key,
      setting_value: stringValue,
      setting_type: type
    });
  },

  async getAll() {
    const rows = await db('settings');
    const result = {};
    rows.forEach(row => {
      if (row.setting_type === 'json') {
        try { result[row.setting_key] = JSON.parse(row.setting_value); } catch { result[row.setting_key] = row.setting_value; }
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
