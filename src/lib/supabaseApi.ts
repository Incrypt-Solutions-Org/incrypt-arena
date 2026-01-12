/**
 * Supabase Direct API - Reliable database operations using fetch
 * Bypasses the Supabase JS client which can deadlock with React 19
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

/**
 * Base headers for all Supabase requests
 * @param authToken - Optional user JWT token for authenticated requests
 */
function getHeaders(options?: { 
  preferSingle?: boolean; 
  preferCount?: boolean;
  authToken?: string;
}): Record<string, string> {
  const token = options?.authToken || supabaseKey;
  const headers: Record<string, string> = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  if (options?.preferSingle) {
    headers['Accept'] = 'application/vnd.pgrst.object+json';
  }
  
  if (options?.preferCount) {
    headers['Prefer'] = 'count=exact';
  }
  
  return headers;
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: Record<string, string | number | boolean>): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    params.append(key, String(value));
  }
  return params.toString();
}

/**
 * Generic API response type
 */
export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * SELECT - Fetch records from a table
 */
export async function select<T>(
  table: string,
  options?: {
    columns?: string;
    filters?: Record<string, string>;
    order?: string;
    limit?: number;
    single?: boolean;
    authToken?: string;
  }
): Promise<ApiResponse<T>> {
  try {
    const columns = options?.columns || '*';
    let url = `${supabaseUrl}/rest/v1/${table}?select=${columns}`;
    
    if (options?.filters) {
      const filterStr = buildQueryString(options.filters);
      if (filterStr) url += `&${filterStr}`;
    }
    
    if (options?.order) {
      url += `&order=${options.order}`;
    }
    
    if (options?.limit) {
      url += `&limit=${options.limit}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders({ preferSingle: options?.single, authToken: options?.authToken }),
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: { 
          message: errorBody.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorBody.code 
        },
      };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * INSERT - Create new record(s)
 * @param authToken - User JWT token for authenticated inserts (required for RLS)
 */
export async function insert<T>(
  table: string,
  records: Record<string, unknown> | Record<string, unknown>[],
  options?: { returnData?: boolean; authToken?: string }
): Promise<ApiResponse<T>> {
  try {
    const url = `${supabaseUrl}/rest/v1/${table}`;
    
    const headers = getHeaders({ authToken: options?.authToken });
    if (options?.returnData) {
      headers['Prefer'] = 'return=representation';
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(records),
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: { 
          message: errorBody.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorBody.code 
        },
      };
    }
    
    if (options?.returnData) {
      const data = await response.json();
      return { data, error: null };
    }
    
    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * UPDATE - Modify existing record(s)
 */
export async function update<T>(
  table: string,
  updates: Record<string, unknown>,
  filters: Record<string, string>,
  options?: { returnData?: boolean; authToken?: string }
): Promise<ApiResponse<T>> {
  try {
    const filterStr = buildQueryString(filters);
    const url = `${supabaseUrl}/rest/v1/${table}?${filterStr}`;
    
    const headers = getHeaders({ authToken: options?.authToken });
    if (options?.returnData) {
      headers['Prefer'] = 'return=representation';
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: { 
          message: errorBody.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorBody.code 
        },
      };
    }
    
    if (options?.returnData) {
      const data = await response.json();
      return { data, error: null };
    }
    
    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * DELETE - Remove record(s)
 */
export async function remove(
  table: string,
  filters: Record<string, string>,
  options?: { authToken?: string }
): Promise<ApiResponse<null>> {
  try {
    const filterStr = buildQueryString(filters);
    const url = `${supabaseUrl}/rest/v1/${table}?${filterStr}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders({ authToken: options?.authToken }),
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: { 
          message: errorBody.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorBody.code 
        },
      };
    }
    
    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * RPC - Call a Supabase function
 */
export async function rpc<T>(
  functionName: string,
  params?: Record<string, unknown>,
  options?: { authToken?: string }
): Promise<ApiResponse<T>> {
  try {
    const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders({ authToken: options?.authToken }),
      body: params ? JSON.stringify(params) : undefined,
    });
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: { 
          message: errorBody.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorBody.code 
        },
      };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

// Export a db object for convenient access
export const db = {
  select,
  insert,
  update,
  remove,
  rpc,
  isConfigured: isSupabaseConfigured,
};

export default db;
