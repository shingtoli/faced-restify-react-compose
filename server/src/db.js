import levelup from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';

const db = levelup(encode(leveldown('./data'), { valueEncoding: 'json' }));

export default db;
