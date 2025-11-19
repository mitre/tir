import {
  ValidationError,
  ValidationErrorItem,
  DatabaseError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ExclusionConstraintError,
  ConnectionError,
  TimeoutError,
  EmptyResultError,
  OptimisticLockError,
  AggregateError,
} from "sequelize";

type Dict = Record<string, unknown>;

function previewRecord(record: any): Dict | undefined {
  try {
    const dv: Dict | undefined =
      record?.get?.({ plain: true }) ??
      record?.dataValues ??
      (typeof record === "object" ? record : undefined);

    if (!dv) return undefined;

    const keys = Object.keys(dv).slice(0, 12);
    const out: Dict = {};
    for (const k of keys) out[k] = (dv as Dict)[k];
    return out;
  } catch {
    return undefined;
  }
}

function fromValidationItem(e: ValidationErrorItem): SequelizeErrorInfo {
  return {
    service: "database",
    level: "error",
    category: "validation",
    name: "ValidationErrorItem",
    message: e.message,
    path: e.path ?? undefined,
    value: e.value,
    validatorKey: e.validatorKey ?? null,
  };
}

function baseFromDatabaseLike(
  err: any,
  category: SequelizeErrorInfo["category"],
): SequelizeErrorInfo {
  const original = err?.original ?? err?.parent;
  return {
    service: "database",
    level: "error",
    category,
    name: err?.name,
    message: err?.message || String(err),
    sql: err?.sql,
    parameters: err?.parameters,
    original: original?.message,
    code: original?.code,
    errno: original?.errno,
    table: err?.table,
    constraint: err?.constraint,
    index: err?.index,
    fields: err?.fields,
    stack: err?.stack,
  };
}

export function normalizeSequelizeError(err: unknown, extra?: Dict): SequelizeErrorInfo {
  const isBulkWrapper =
    typeof err === "object" &&
    err !== null &&
    (err as any).name === "SequelizeBulkRecordError" &&
    ((err as any).errors || (err as any).record);

  if (isBulkWrapper) {
    const bulk = err as any;
    const inner = bulk.errors;
    const record = bulk.record;

    if (inner instanceof ValidationError) {
      return {
        service: "database",
        level: "error",
        category: "bulk",
        name: "SequelizeBulkRecordError",
        message: "Bulk operation failed for one or more records (validation)",
        errors: inner.errors.map(fromValidationItem),
        recordPreview: previewRecord(record),
        stack: inner.stack,
        extra,
      };
    }

    if (inner instanceof DatabaseError) {
      const base = baseFromDatabaseLike(inner, "bulk");
      base.message = "Bulk operation failed for one or more records (database)";
      base.recordPreview = previewRecord(record);
      base.extra = extra;
      return base;
    }

    return {
      service: "database",
      level: "error",
      category: "bulk",
      name: "SequelizeBulkRecordError",
      message: bulk?.message ?? "Bulk operation failed",
      errors: inner ? [normalizeSequelizeError(inner)] : undefined,
      recordPreview: previewRecord(record),
      extra,
    };
  }

  if (err instanceof UniqueConstraintError) {
    const base = baseFromDatabaseLike(err, "unique");
    base.message = "Unique constraint failed";
    base.fields = err.fields;
    base.extra = extra;
    return base;
  }

  if ((err as any)?.name === "SequelizeNotNullConstraintError") {
    const nn = err as any;
    return {
      service: "database",
      level: "error",
      category: "validation",
      name: nn.name,
      message: nn.message || "NOT NULL constraint failed",
      table: nn.table,
      fields: nn.fields,
      path: nn?.fields ? Object.keys(nn.fields)[0] : undefined,
      original: nn?.original?.message ?? nn?.parent?.message,
      code: nn?.original?.code ?? nn?.parent?.code,
      errno: nn?.original?.errno ?? nn?.parent?.errno,
      stack: nn.stack,
      extra,
    };
  }

  if (err instanceof ValidationError) {
    const anyErr = err as any;
    const parent = anyErr?.original ?? anyErr?.parent;
    return {
      service: "database",
      level: "error",
      category: "validation",
      name: err.name,
      message: "Validation error occurred",
      errors: err.errors.map(fromValidationItem),
      original: parent?.message,
      code: parent?.code,
      errno: parent?.errno,
      stack: err.stack,
      extra,
    };
  }

  if (err instanceof ForeignKeyConstraintError) {
    const base = baseFromDatabaseLike(err, "foreign_key");
    base.message = "Foreign key constraint failed";
    base.extra = extra;
    return base;
  }

  if (err instanceof ExclusionConstraintError) {
    const base = baseFromDatabaseLike(err, "exclusion");
    base.message = "Exclusion constraint failed";
    base.extra = extra;
    return base;
  }

  if (err instanceof DatabaseError) {
    const base = baseFromDatabaseLike(err, "database");
    base.extra = extra;
    return base;
  }

  if (err instanceof ConnectionError) {
    return {
      service: "database",
      level: "error",
      category: "connection",
      name: err.name,
      message: err.message,
      stack: err.stack,
      extra,
    };
  }

  if (err instanceof TimeoutError) {
    return {
      service: "database",
      level: "error",
      category: "timeout",
      name: err.name,
      message: err.message,
      stack: err.stack,
      extra,
    };
  }

  if (err instanceof EmptyResultError) {
    return {
      service: "database",
      level: "warn",
      category: "empty_result",
      name: err.name,
      message: err.message,
      stack: err.stack,
      extra,
    };
  }

  if (err instanceof OptimisticLockError) {
    return {
      service: "database",
      level: "warn",
      category: "optimistic_lock",
      name: err.name,
      message: err.message,
      stack: err.stack,
      extra,
    };
  }

  if (err instanceof AggregateError && Array.isArray((err as any).errors)) {
    const inner: unknown[] = (err as any).errors;
    return {
      service: "database",
      level: "error",
      category: "aggregate",
      name: "AggregateError",
      message: "Multiple errors occurred",
      errors: inner.map((e) => normalizeSequelizeError(e)),
      extra,
    };
  }

  const unknown = err as any;
  return {
    service: "database",
    level: "error",
    category: "unexpected",
    name: unknown?.name,
    message: unknown?.message ?? String(err),
    stack: unknown?.stack,
    extra,
  };
}

export function logSequelizeError(error: unknown, extra?: Dict, rethrow = false): never | void {
  const info = normalizeSequelizeError(error, extra);
  logger.error(info);
  if (rethrow) throw error;
}
