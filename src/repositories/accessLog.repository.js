const supabase = require('../config/database');

class AccessLogRepository {
  async create(logData) {
    const { data, error } = await supabase
      .from('access_log')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async bulkCreate(logsData) {
    const { data, error } = await supabase
      .from('access_log')
      .insert(logsData)
      .select();

    if (error) throw error;
    return data;
  }

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('access_log')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.cardUid) {
      query = query.eq('card_uid', filters.cardUid);
    }

    if (filters.doorId) {
      query = query.eq('door_id', filters.doorId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    // Pagination and ordering
    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findByCardUid(cardUid, limit = 100) {
    const { data, error } = await supabase
      .from('access_log')
      .select('*')
      .eq('card_uid', cardUid)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async findByDoor(doorId, limit = 100) {
    const { data, error } = await supabase
      .from('access_log')
      .select('*')
      .eq('door_id', doorId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async findDeniedAttempts(filters = {}, limit = 100) {
    let query = supabase
      .from('access_log')
      .select('*')
      .eq('status', 'DENIED')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getAccessStats(filters = {}) {
    let query = supabase
      .from('access_log')
      .select('status', { count: 'exact' });

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters.doorId) {
      query = query.eq('door_id', filters.doorId);
    }

    const { count, error } = await query;

    if (error) throw error;

    // Get granted count
    const { count: grantedCount, error: grantedError } = await supabase
      .from('access_log')
      .select('status', { count: 'exact', head: true })
      .eq('status', 'GRANTED')
      .gte('timestamp', filters.startDate || '2000-01-01')
      .lte('timestamp', filters.endDate || '2100-01-01');

    if (grantedError) throw grantedError;

    // Get denied count
    const { count: deniedCount, error: deniedError } = await supabase
      .from('access_log')
      .select('status', { count: 'exact', head: true })
      .eq('status', 'DENIED')
      .gte('timestamp', filters.startDate || '2000-01-01')
      .lte('timestamp', filters.endDate || '2100-01-01');

    if (deniedError) throw deniedError;

    return {
      total: count,
      granted: grantedCount,
      denied: deniedCount
    };
  }
}

module.exports = new AccessLogRepository();
