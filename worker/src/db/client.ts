/**
 * Parameterized D1 access. Only SQL that binds values via `?` placeholders
 * is permitted — there is no string-concatenation path for user input.
 */

export type SqlValue = string | number | null;

export class D1Client {
  constructor(readonly db: D1Database) {}

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    const { results } = await this.db.prepare(sql).bind(...params).all<T>();
    return results as T[];
  }

  async first<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
    const row = await this.db.prepare(sql).bind(...params).first<T>();
    return (row as T | null) ?? null;
  }

  async run(sql: string, params: SqlValue[] = []): Promise<void> {
    await this.db.prepare(sql).bind(...params).run();
  }

  /** Count helper. Returns 0 on null result. */
  async count(sql: string, params: SqlValue[] = []): Promise<number> {
    const row = await this.first<{ n: number | null }>(sql, params);
    return row?.n ?? 0;
  }

  async transaction<T>(fn: (client: D1Client) => Promise<T>): Promise<T> {
    await this.run("BEGIN IMMEDIATE");
    try {
      const result = await fn(this);
      await this.run("COMMIT");
      return result;
    } catch (err) {
      await this.run("ROLLBACK");
      throw err;
    }
  }
}