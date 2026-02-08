const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const logger = require('./logger');

class SupabaseClient {
  constructor() {
    if (!SupabaseClient.instance) {
      this.client = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-application-name': 'building-access-control'
            }
          }
        }
      );
      
      logger.info('Supabase client initialized');
      SupabaseClient.instance = this;
    }
    return SupabaseClient.instance;
  }

  getClient() {
    return this.client;
  }
}

const instance = new SupabaseClient();
module.exports = instance.getClient();
