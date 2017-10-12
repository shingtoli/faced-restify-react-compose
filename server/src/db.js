import level from 'level';

const db = level('./data', { valueEncoding: 'json' });

export default db;
