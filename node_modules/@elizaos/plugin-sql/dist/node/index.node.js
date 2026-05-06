import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../node_modules/drizzle-orm/entity.js
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(`Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`);
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}
var entityKind, hasOwnEntityKind;
var init_entity = __esm(() => {
  entityKind = Symbol.for("drizzle:entityKind");
  hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
});

// ../../node_modules/drizzle-orm/logger.js
var ConsoleLogWriter, DefaultLogger, NoopLogger;
var init_logger = __esm(() => {
  init_entity();
  ConsoleLogWriter = class ConsoleLogWriter {
    static [entityKind] = "ConsoleLogWriter";
    write(message) {
      console.log(message);
    }
  };
  DefaultLogger = class DefaultLogger {
    static [entityKind] = "DefaultLogger";
    writer;
    constructor(config) {
      this.writer = config?.writer ?? new ConsoleLogWriter;
    }
    logQuery(query, params) {
      const stringifiedParams = params.map((p) => {
        try {
          return JSON.stringify(p);
        } catch {
          return String(p);
        }
      });
      const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
      this.writer.write(`Query: ${query}${paramsStr}`);
    }
  };
  NoopLogger = class NoopLogger {
    static [entityKind] = "NoopLogger";
    logQuery() {}
  };
});

// ../../node_modules/drizzle-orm/query-promise.js
var QueryPromise;
var init_query_promise = __esm(() => {
  init_entity();
  QueryPromise = class QueryPromise {
    static [entityKind] = "QueryPromise";
    [Symbol.toStringTag] = "QueryPromise";
    catch(onRejected) {
      return this.then(undefined, onRejected);
    }
    finally(onFinally) {
      return this.then((value) => {
        onFinally?.();
        return value;
      }, (reason) => {
        onFinally?.();
        throw reason;
      });
    }
    then(onFulfilled, onRejected) {
      return this.execute().then(onFulfilled, onRejected);
    }
  };
});

// ../../node_modules/drizzle-orm/column.js
var Column;
var init_column = __esm(() => {
  init_entity();
  Column = class Column {
    constructor(table, config) {
      this.table = table;
      this.config = config;
      this.name = config.name;
      this.keyAsName = config.keyAsName;
      this.notNull = config.notNull;
      this.default = config.default;
      this.defaultFn = config.defaultFn;
      this.onUpdateFn = config.onUpdateFn;
      this.hasDefault = config.hasDefault;
      this.primary = config.primaryKey;
      this.isUnique = config.isUnique;
      this.uniqueName = config.uniqueName;
      this.uniqueType = config.uniqueType;
      this.dataType = config.dataType;
      this.columnType = config.columnType;
      this.generated = config.generated;
      this.generatedIdentity = config.generatedIdentity;
    }
    static [entityKind] = "Column";
    name;
    keyAsName;
    primary;
    notNull;
    default;
    defaultFn;
    onUpdateFn;
    hasDefault;
    isUnique;
    uniqueName;
    uniqueType;
    dataType;
    columnType;
    enumValues = undefined;
    generated = undefined;
    generatedIdentity = undefined;
    config;
    mapFromDriverValue(value) {
      return value;
    }
    mapToDriverValue(value) {
      return value;
    }
    shouldDisableInsert() {
      return this.config.generated !== undefined && this.config.generated.type !== "byDefault";
    }
  };
});

// ../../node_modules/drizzle-orm/column-builder.js
var ColumnBuilder;
var init_column_builder = __esm(() => {
  init_entity();
  ColumnBuilder = class ColumnBuilder {
    static [entityKind] = "ColumnBuilder";
    config;
    constructor(name, dataType, columnType) {
      this.config = {
        name,
        keyAsName: name === "",
        notNull: false,
        default: undefined,
        hasDefault: false,
        primaryKey: false,
        isUnique: false,
        uniqueName: undefined,
        uniqueType: undefined,
        dataType,
        columnType,
        generated: undefined
      };
    }
    $type() {
      return this;
    }
    notNull() {
      this.config.notNull = true;
      return this;
    }
    default(value) {
      this.config.default = value;
      this.config.hasDefault = true;
      return this;
    }
    $defaultFn(fn) {
      this.config.defaultFn = fn;
      this.config.hasDefault = true;
      return this;
    }
    $default = this.$defaultFn;
    $onUpdateFn(fn) {
      this.config.onUpdateFn = fn;
      this.config.hasDefault = true;
      return this;
    }
    $onUpdate = this.$onUpdateFn;
    primaryKey() {
      this.config.primaryKey = true;
      this.config.notNull = true;
      return this;
    }
    setName(name) {
      if (this.config.name !== "")
        return;
      this.config.name = name;
    }
  };
});

// ../../node_modules/drizzle-orm/table.utils.js
var TableName;
var init_table_utils = __esm(() => {
  TableName = Symbol.for("drizzle:Name");
});

// ../../node_modules/drizzle-orm/pg-core/foreign-keys.js
function foreignKey(config) {
  function mappedConfig() {
    const { name, columns, foreignColumns } = config;
    return {
      name,
      columns,
      foreignColumns
    };
  }
  return new ForeignKeyBuilder(mappedConfig);
}
var ForeignKeyBuilder, ForeignKey;
var init_foreign_keys = __esm(() => {
  init_entity();
  init_table_utils();
  ForeignKeyBuilder = class ForeignKeyBuilder {
    static [entityKind] = "PgForeignKeyBuilder";
    reference;
    _onUpdate = "no action";
    _onDelete = "no action";
    constructor(config, actions) {
      this.reference = () => {
        const { name, columns, foreignColumns } = config();
        return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
      };
      if (actions) {
        this._onUpdate = actions.onUpdate;
        this._onDelete = actions.onDelete;
      }
    }
    onUpdate(action) {
      this._onUpdate = action === undefined ? "no action" : action;
      return this;
    }
    onDelete(action) {
      this._onDelete = action === undefined ? "no action" : action;
      return this;
    }
    build(table) {
      return new ForeignKey(table, this);
    }
  };
  ForeignKey = class ForeignKey {
    constructor(table, builder) {
      this.table = table;
      this.reference = builder.reference;
      this.onUpdate = builder._onUpdate;
      this.onDelete = builder._onDelete;
    }
    static [entityKind] = "PgForeignKey";
    reference;
    onUpdate;
    onDelete;
    getName() {
      const { name, columns, foreignColumns } = this.reference();
      const columnNames = columns.map((column) => column.name);
      const foreignColumnNames = foreignColumns.map((column) => column.name);
      const chunks = [
        this.table[TableName],
        ...columnNames,
        foreignColumns[0].table[TableName],
        ...foreignColumnNames
      ];
      return name ?? `${chunks.join("_")}_fk`;
    }
  };
});

// ../../node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}
var init_tracing_utils = () => {};

// ../../node_modules/drizzle-orm/pg-core/unique-constraint.js
function unique(name) {
  return new UniqueOnConstraintBuilder(name);
}
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder, UniqueOnConstraintBuilder, UniqueConstraint;
var init_unique_constraint = __esm(() => {
  init_entity();
  init_table_utils();
  UniqueConstraintBuilder = class UniqueConstraintBuilder {
    constructor(columns, name) {
      this.name = name;
      this.columns = columns;
    }
    static [entityKind] = "PgUniqueConstraintBuilder";
    columns;
    nullsNotDistinctConfig = false;
    nullsNotDistinct() {
      this.nullsNotDistinctConfig = true;
      return this;
    }
    build(table) {
      return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
    }
  };
  UniqueOnConstraintBuilder = class UniqueOnConstraintBuilder {
    static [entityKind] = "PgUniqueOnConstraintBuilder";
    name;
    constructor(name) {
      this.name = name;
    }
    on(...columns) {
      return new UniqueConstraintBuilder(columns, this.name);
    }
  };
  UniqueConstraint = class UniqueConstraint {
    constructor(table, columns, nullsNotDistinct, name) {
      this.table = table;
      this.columns = columns;
      this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
      this.nullsNotDistinct = nullsNotDistinct;
    }
    static [entityKind] = "PgUniqueConstraint";
    columns;
    name;
    nullsNotDistinct = false;
    getName() {
      return this.name;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom;i < arrayString.length; i++) {
    const char = arrayString[i];
    if (char === "\\") {
      i++;
      continue;
    }
    if (char === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char === "," || char === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char = arrayString[i];
    if (char === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char === "\\") {
      i += 2;
      continue;
    }
    if (char === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char === "}") {
      return [result, i + 1];
    }
    if (char === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}
var init_array = () => {};

// ../../node_modules/drizzle-orm/pg-core/columns/common.js
var PgColumnBuilder, PgColumn, ExtraConfigColumn, IndexedColumn, PgArrayBuilder, PgArray;
var init_common = __esm(() => {
  init_column_builder();
  init_column();
  init_entity();
  init_foreign_keys();
  init_tracing_utils();
  init_unique_constraint();
  init_array();
  PgColumnBuilder = class PgColumnBuilder extends ColumnBuilder {
    foreignKeyConfigs = [];
    static [entityKind] = "PgColumnBuilder";
    array(size) {
      return new PgArrayBuilder(this.config.name, this, size);
    }
    references(ref, actions = {}) {
      this.foreignKeyConfigs.push({ ref, actions });
      return this;
    }
    unique(name, config) {
      this.config.isUnique = true;
      this.config.uniqueName = name;
      this.config.uniqueType = config?.nulls;
      return this;
    }
    generatedAlwaysAs(as) {
      this.config.generated = {
        as,
        type: "always",
        mode: "stored"
      };
      return this;
    }
    buildForeignKeys(column, table) {
      return this.foreignKeyConfigs.map(({ ref, actions }) => {
        return iife((ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        }, ref, actions);
      });
    }
    buildExtraConfigColumn(table) {
      return new ExtraConfigColumn(table, this.config);
    }
  };
  PgColumn = class PgColumn extends Column {
    constructor(table, config) {
      if (!config.uniqueName) {
        config.uniqueName = uniqueKeyName(table, [config.name]);
      }
      super(table, config);
      this.table = table;
    }
    static [entityKind] = "PgColumn";
  };
  ExtraConfigColumn = class ExtraConfigColumn extends PgColumn {
    static [entityKind] = "ExtraConfigColumn";
    getSQLType() {
      return this.getSQLType();
    }
    indexConfig = {
      order: this.config.order ?? "asc",
      nulls: this.config.nulls ?? "last",
      opClass: this.config.opClass
    };
    defaultConfig = {
      order: "asc",
      nulls: "last",
      opClass: undefined
    };
    asc() {
      this.indexConfig.order = "asc";
      return this;
    }
    desc() {
      this.indexConfig.order = "desc";
      return this;
    }
    nullsFirst() {
      this.indexConfig.nulls = "first";
      return this;
    }
    nullsLast() {
      this.indexConfig.nulls = "last";
      return this;
    }
    op(opClass) {
      this.indexConfig.opClass = opClass;
      return this;
    }
  };
  IndexedColumn = class IndexedColumn {
    static [entityKind] = "IndexedColumn";
    constructor(name, keyAsName, type, indexConfig) {
      this.name = name;
      this.keyAsName = keyAsName;
      this.type = type;
      this.indexConfig = indexConfig;
    }
    name;
    keyAsName;
    type;
    indexConfig;
  };
  PgArrayBuilder = class PgArrayBuilder extends PgColumnBuilder {
    static [entityKind] = "PgArrayBuilder";
    constructor(name, baseBuilder, size) {
      super(name, "array", "PgArray");
      this.config.baseBuilder = baseBuilder;
      this.config.size = size;
    }
    build(table) {
      const baseColumn = this.config.baseBuilder.build(table);
      return new PgArray(table, this.config, baseColumn);
    }
  };
  PgArray = class PgArray extends PgColumn {
    constructor(table, config, baseColumn, range) {
      super(table, config);
      this.baseColumn = baseColumn;
      this.range = range;
      this.size = config.size;
    }
    size;
    static [entityKind] = "PgArray";
    getSQLType() {
      return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        value = parsePgArray(value);
      }
      return value.map((v) => this.baseColumn.mapFromDriverValue(v));
    }
    mapToDriverValue(value, isNestedArray = false) {
      const a = value.map((v) => v === null ? null : is(this.baseColumn, PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v));
      if (isNestedArray)
        return a;
      return makePgArray(a);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/enum.js
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var PgEnumObjectColumn, isPgEnumSym, PgEnumColumn;
var init_enum = __esm(() => {
  init_entity();
  init_common();
  PgEnumObjectColumn = class PgEnumObjectColumn extends PgColumn {
    static [entityKind] = "PgEnumObjectColumn";
    enum;
    enumValues = this.config.enum.enumValues;
    constructor(table, config) {
      super(table, config);
      this.enum = config.enum;
    }
    getSQLType() {
      return this.enum.enumName;
    }
  };
  isPgEnumSym = Symbol.for("drizzle:isPgEnum");
  PgEnumColumn = class PgEnumColumn extends PgColumn {
    static [entityKind] = "PgEnumColumn";
    enum = this.config.enum;
    enumValues = this.config.enum.enumValues;
    constructor(table, config) {
      super(table, config);
      this.enum = config.enum;
    }
    getSQLType() {
      return this.enum.enumName;
    }
  };
});

// ../../node_modules/drizzle-orm/subquery.js
var Subquery, WithSubquery;
var init_subquery = __esm(() => {
  init_entity();
  Subquery = class Subquery {
    static [entityKind] = "Subquery";
    constructor(sql, fields, alias, isWith = false, usedTables = []) {
      this._ = {
        brand: "Subquery",
        sql,
        selectedFields: fields,
        alias,
        isWith,
        usedTables
      };
    }
  };
  WithSubquery = class WithSubquery extends Subquery {
    static [entityKind] = "WithSubquery";
  };
});

// ../../node_modules/drizzle-orm/version.js
var version = "0.45.1";
var init_version = () => {};

// ../../node_modules/drizzle-orm/tracing.js
var otel, rawTracer, tracer;
var init_tracing = __esm(() => {
  init_tracing_utils();
  init_version();
  tracer = {
    startActiveSpan(name, fn) {
      if (!otel) {
        return fn();
      }
      if (!rawTracer) {
        rawTracer = otel.trace.getTracer("drizzle-orm", version);
      }
      return iife((otel2, rawTracer2) => rawTracer2.startActiveSpan(name, (span) => {
        try {
          return fn(span);
        } catch (e) {
          span.setStatus({
            code: otel2.SpanStatusCode.ERROR,
            message: e instanceof Error ? e.message : "Unknown error"
          });
          throw e;
        } finally {
          span.end();
        }
      }), otel, rawTracer);
    }
  };
});

// ../../node_modules/drizzle-orm/view-common.js
var ViewBaseConfig;
var init_view_common = __esm(() => {
  ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
});

// ../../node_modules/drizzle-orm/table.js
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}
var Schema, Columns, ExtraConfigColumns, OriginalName, BaseName, IsAlias, ExtraConfigBuilder, IsDrizzleTable, Table;
var init_table = __esm(() => {
  init_entity();
  init_table_utils();
  Schema = Symbol.for("drizzle:Schema");
  Columns = Symbol.for("drizzle:Columns");
  ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
  OriginalName = Symbol.for("drizzle:OriginalName");
  BaseName = Symbol.for("drizzle:BaseName");
  IsAlias = Symbol.for("drizzle:IsAlias");
  ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
  IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
  Table = class Table {
    static [entityKind] = "Table";
    static Symbol = {
      Name: TableName,
      Schema,
      OriginalName,
      Columns,
      ExtraConfigColumns,
      BaseName,
      IsAlias,
      ExtraConfigBuilder
    };
    [TableName];
    [OriginalName];
    [Schema];
    [Columns];
    [ExtraConfigColumns];
    [BaseName];
    [IsAlias] = false;
    [IsDrizzleTable] = true;
    [ExtraConfigBuilder] = undefined;
    constructor(name, schema, baseName) {
      this[TableName] = this[OriginalName] = name;
      this[Schema] = schema;
      this[BaseName] = baseName;
    }
  };
});

// ../../node_modules/drizzle-orm/sql/sql.js
function isSQLWrapper(value) {
  return value !== null && value !== undefined && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
var StringChunk, SQL, Name, noopDecoder, noopEncoder, noopMapper, Param, Placeholder, IsDrizzleView, View;
var init_sql = __esm(() => {
  init_entity();
  init_enum();
  init_subquery();
  init_tracing();
  init_view_common();
  init_column();
  init_table();
  StringChunk = class StringChunk {
    static [entityKind] = "StringChunk";
    value;
    constructor(value) {
      this.value = Array.isArray(value) ? value : [value];
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  SQL = class SQL {
    constructor(queryChunks) {
      this.queryChunks = queryChunks;
      for (const chunk of queryChunks) {
        if (is(chunk, Table)) {
          const schemaName = chunk[Table.Symbol.Schema];
          this.usedTables.push(schemaName === undefined ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]);
        }
      }
    }
    static [entityKind] = "SQL";
    decoder = noopDecoder;
    shouldInlineParams = false;
    usedTables = [];
    append(query) {
      this.queryChunks.push(...query.queryChunks);
      return this;
    }
    toQuery(config) {
      return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
        const query = this.buildQueryFromSourceParams(this.queryChunks, config);
        span?.setAttributes({
          "drizzle.query.text": query.sql,
          "drizzle.query.params": JSON.stringify(query.params)
        });
        return query;
      });
    }
    buildQueryFromSourceParams(chunks, _config) {
      const config = Object.assign({}, _config, {
        inlineParams: _config.inlineParams || this.shouldInlineParams,
        paramStartIndex: _config.paramStartIndex || { value: 0 }
      });
      const {
        casing,
        escapeName,
        escapeParam,
        prepareTyping,
        inlineParams,
        paramStartIndex
      } = config;
      return mergeQueries(chunks.map((chunk) => {
        if (is(chunk, StringChunk)) {
          return { sql: chunk.value.join(""), params: [] };
        }
        if (is(chunk, Name)) {
          return { sql: escapeName(chunk.value), params: [] };
        }
        if (chunk === undefined) {
          return { sql: "", params: [] };
        }
        if (Array.isArray(chunk)) {
          const result = [new StringChunk("(")];
          for (const [i, p] of chunk.entries()) {
            result.push(p);
            if (i < chunk.length - 1) {
              result.push(new StringChunk(", "));
            }
          }
          result.push(new StringChunk(")"));
          return this.buildQueryFromSourceParams(result, config);
        }
        if (is(chunk, SQL)) {
          return this.buildQueryFromSourceParams(chunk.queryChunks, {
            ...config,
            inlineParams: inlineParams || chunk.shouldInlineParams
          });
        }
        if (is(chunk, Table)) {
          const schemaName = chunk[Table.Symbol.Schema];
          const tableName = chunk[Table.Symbol.Name];
          return {
            sql: schemaName === undefined || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
            params: []
          };
        }
        if (is(chunk, Column)) {
          const columnName = casing.getColumnCasing(chunk);
          if (_config.invokeSource === "indexes") {
            return { sql: escapeName(columnName), params: [] };
          }
          const schemaName = chunk.table[Table.Symbol.Schema];
          return {
            sql: chunk.table[IsAlias] || schemaName === undefined ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
            params: []
          };
        }
        if (is(chunk, View)) {
          const schemaName = chunk[ViewBaseConfig].schema;
          const viewName = chunk[ViewBaseConfig].name;
          return {
            sql: schemaName === undefined || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
            params: []
          };
        }
        if (is(chunk, Param)) {
          if (is(chunk.value, Placeholder)) {
            return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
          }
          const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
          if (is(mappedValue, SQL)) {
            return this.buildQueryFromSourceParams([mappedValue], config);
          }
          if (inlineParams) {
            return { sql: this.mapInlineParam(mappedValue, config), params: [] };
          }
          let typings = ["none"];
          if (prepareTyping) {
            typings = [prepareTyping(chunk.encoder)];
          }
          return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
        }
        if (is(chunk, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== undefined) {
          return { sql: escapeName(chunk.fieldAlias), params: [] };
        }
        if (is(chunk, Subquery)) {
          if (chunk._.isWith) {
            return { sql: escapeName(chunk._.alias), params: [] };
          }
          return this.buildQueryFromSourceParams([
            new StringChunk("("),
            chunk._.sql,
            new StringChunk(") "),
            new Name(chunk._.alias)
          ], config);
        }
        if (isPgEnum(chunk)) {
          if (chunk.schema) {
            return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
          }
          return { sql: escapeName(chunk.enumName), params: [] };
        }
        if (isSQLWrapper(chunk)) {
          if (chunk.shouldOmitSQLParens?.()) {
            return this.buildQueryFromSourceParams([chunk.getSQL()], config);
          }
          return this.buildQueryFromSourceParams([
            new StringChunk("("),
            chunk.getSQL(),
            new StringChunk(")")
          ], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(chunk, config), params: [] };
        }
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }));
    }
    mapInlineParam(chunk, { escapeString }) {
      if (chunk === null) {
        return "null";
      }
      if (typeof chunk === "number" || typeof chunk === "boolean") {
        return chunk.toString();
      }
      if (typeof chunk === "string") {
        return escapeString(chunk);
      }
      if (typeof chunk === "object") {
        const mappedValueAsString = chunk.toString();
        if (mappedValueAsString === "[object Object]") {
          return escapeString(JSON.stringify(chunk));
        }
        return escapeString(mappedValueAsString);
      }
      throw new Error("Unexpected param value: " + chunk);
    }
    getSQL() {
      return this;
    }
    as(alias) {
      if (alias === undefined) {
        return this;
      }
      return new SQL.Aliased(this, alias);
    }
    mapWith(decoder) {
      this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
      return this;
    }
    inlineParams() {
      this.shouldInlineParams = true;
      return this;
    }
    if(condition) {
      return condition ? this : undefined;
    }
  };
  Name = class Name {
    constructor(value) {
      this.value = value;
    }
    static [entityKind] = "Name";
    brand;
    getSQL() {
      return new SQL([this]);
    }
  };
  noopDecoder = {
    mapFromDriverValue: (value) => value
  };
  noopEncoder = {
    mapToDriverValue: (value) => value
  };
  noopMapper = {
    ...noopDecoder,
    ...noopEncoder
  };
  Param = class Param {
    constructor(value, encoder = noopEncoder) {
      this.value = value;
      this.encoder = encoder;
    }
    static [entityKind] = "Param";
    brand;
    getSQL() {
      return new SQL([this]);
    }
  };
  ((sql2) => {
    function empty() {
      return new SQL([]);
    }
    sql2.empty = empty;
    function fromList(list) {
      return new SQL(list);
    }
    sql2.fromList = fromList;
    function raw(str) {
      return new SQL([new StringChunk(str)]);
    }
    sql2.raw = raw;
    function join(chunks, separator) {
      const result = [];
      for (const [i, chunk] of chunks.entries()) {
        if (i > 0 && separator !== undefined) {
          result.push(separator);
        }
        result.push(chunk);
      }
      return new SQL(result);
    }
    sql2.join = join;
    function identifier(value) {
      return new Name(value);
    }
    sql2.identifier = identifier;
    function placeholder2(name2) {
      return new Placeholder(name2);
    }
    sql2.placeholder = placeholder2;
    function param2(value, encoder) {
      return new Param(value, encoder);
    }
    sql2.param = param2;
  })(sql || (sql = {}));
  ((SQL2) => {

    class Aliased {
      constructor(sql2, fieldAlias) {
        this.sql = sql2;
        this.fieldAlias = fieldAlias;
      }
      static [entityKind] = "SQL.Aliased";
      isSelectionField = false;
      getSQL() {
        return this.sql;
      }
      clone() {
        return new Aliased(this.sql, this.fieldAlias);
      }
    }
    SQL2.Aliased = Aliased;
  })(SQL || (SQL = {}));
  Placeholder = class Placeholder {
    constructor(name2) {
      this.name = name2;
    }
    static [entityKind] = "Placeholder";
    getSQL() {
      return new SQL([this]);
    }
  };
  IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
  View = class View {
    static [entityKind] = "View";
    [ViewBaseConfig];
    [IsDrizzleView] = true;
    constructor({ name: name2, schema, selectedFields, query }) {
      this[ViewBaseConfig] = {
        name: name2,
        originalName: name2,
        schema,
        selectedFields,
        query,
        isExisting: !query,
        isAlias: false
      };
    }
    getSQL() {
      return new SQL([this]);
    }
  };
  Column.prototype.getSQL = function() {
    return new SQL([this]);
  };
  Table.prototype.getSQL = function() {
    return new SQL([this]);
  };
  Subquery.prototype.getSQL = function() {
    return new SQL([this]);
  };
});

// ../../node_modules/drizzle-orm/alias.js
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(column, new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false))));
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}
var ColumnAliasProxyHandler, TableAliasProxyHandler;
var init_alias = __esm(() => {
  init_column();
  init_entity();
  init_sql();
  init_table();
  init_view_common();
  ColumnAliasProxyHandler = class ColumnAliasProxyHandler {
    constructor(table) {
      this.table = table;
    }
    static [entityKind] = "ColumnAliasProxyHandler";
    get(columnObj, prop) {
      if (prop === "table") {
        return this.table;
      }
      return columnObj[prop];
    }
  };
  TableAliasProxyHandler = class TableAliasProxyHandler {
    constructor(alias, replaceOriginalName) {
      this.alias = alias;
      this.replaceOriginalName = replaceOriginalName;
    }
    static [entityKind] = "TableAliasProxyHandler";
    get(target, prop) {
      if (prop === Table.Symbol.IsAlias) {
        return true;
      }
      if (prop === Table.Symbol.Name) {
        return this.alias;
      }
      if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
        return this.alias;
      }
      if (prop === ViewBaseConfig) {
        return {
          ...target[ViewBaseConfig],
          name: this.alias,
          isAlias: true
        };
      }
      if (prop === Table.Symbol.Columns) {
        const columns = target[Table.Symbol.Columns];
        if (!columns) {
          return columns;
        }
        const proxiedColumns = {};
        Object.keys(columns).map((key) => {
          proxiedColumns[key] = new Proxy(columns[key], new ColumnAliasProxyHandler(new Proxy(target, this)));
        });
        return proxiedColumns;
      }
      const value = target[prop];
      if (is(value, Column)) {
        return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
      }
      return value;
    }
  };
});

// ../../node_modules/drizzle-orm/selection-proxy.js
var SelectionProxyHandler;
var init_selection_proxy = __esm(() => {
  init_alias();
  init_column();
  init_entity();
  init_sql();
  init_subquery();
  init_view_common();
  SelectionProxyHandler = class SelectionProxyHandler {
    static [entityKind] = "SelectionProxyHandler";
    config;
    constructor(config) {
      this.config = { ...config };
    }
    get(subquery, prop) {
      if (prop === "_") {
        return {
          ...subquery["_"],
          selectedFields: new Proxy(subquery._.selectedFields, this)
        };
      }
      if (prop === ViewBaseConfig) {
        return {
          ...subquery[ViewBaseConfig],
          selectedFields: new Proxy(subquery[ViewBaseConfig].selectedFields, this)
        };
      }
      if (typeof prop === "symbol") {
        return subquery[prop];
      }
      const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
      const value = columns[prop];
      if (is(value, SQL.Aliased)) {
        if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
          return value.sql;
        }
        const newValue = value.clone();
        newValue.isSelectionField = true;
        return newValue;
      }
      if (is(value, SQL)) {
        if (this.config.sqlBehavior === "sql") {
          return value;
        }
        throw new Error(`You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`);
      }
      if (is(value, Column)) {
        if (this.config.alias) {
          return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(value.table, new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false))));
        }
        return value;
      }
      if (typeof value !== "object" || value === null) {
        return value;
      }
      return new Proxy(value, new SelectionProxyHandler(this.config));
    }
  };
});

// ../../node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce((result2, { path, field }, columnIndex) => {
    let decoder;
    if (is(field, Column)) {
      decoder = field;
    } else if (is(field, SQL)) {
      decoder = field.decoder;
    } else if (is(field, Subquery)) {
      decoder = field._.sql.decoder;
    } else {
      decoder = field.sql.decoder;
    }
    let node = result2;
    for (const [pathChunkIndex, pathChunk] of path.entries()) {
      if (pathChunkIndex < path.length - 1) {
        if (!(pathChunk in node)) {
          node[pathChunk] = {};
        }
        node = node[pathChunk];
      } else {
        const rawValue = row[columnIndex];
        const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
        if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
          const objectName = path[0];
          if (!(objectName in nullifyMap)) {
            nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
          } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
            nullifyMap[objectName] = false;
          }
        }
      }
    }
    return result2;
  }, {});
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor")
        continue;
      Object.defineProperty(baseClass.prototype, name, Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null));
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? undefined : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null)
    return false;
  if (data.constructor.name !== "Object")
    return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined")
      return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined")
      return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== undefined)
      return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined")
      return false;
    return true;
  }
  if (Object.keys(data).length === 0)
    return true;
  return false;
}
var textDecoder;
var init_utils = __esm(() => {
  init_column();
  init_entity();
  init_sql();
  init_subquery();
  init_table();
  init_view_common();
  textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder;
});

// ../../node_modules/drizzle-orm/pg-core/columns/int.common.js
var PgIntColumnBaseBuilder;
var init_int_common = __esm(() => {
  init_entity();
  init_common();
  PgIntColumnBaseBuilder = class PgIntColumnBaseBuilder extends PgColumnBuilder {
    static [entityKind] = "PgIntColumnBaseBuilder";
    generatedAlwaysAsIdentity(sequence) {
      if (sequence) {
        const { name, ...options } = sequence;
        this.config.generatedIdentity = {
          type: "always",
          sequenceName: name,
          sequenceOptions: options
        };
      } else {
        this.config.generatedIdentity = {
          type: "always"
        };
      }
      this.config.hasDefault = true;
      this.config.notNull = true;
      return this;
    }
    generatedByDefaultAsIdentity(sequence) {
      if (sequence) {
        const { name, ...options } = sequence;
        this.config.generatedIdentity = {
          type: "byDefault",
          sequenceName: name,
          sequenceOptions: options
        };
      } else {
        this.config.generatedIdentity = {
          type: "byDefault"
        };
      }
      this.config.hasDefault = true;
      this.config.notNull = true;
      return this;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/bigint.js
function bigint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}
var PgBigInt53Builder, PgBigInt53, PgBigInt64Builder, PgBigInt64;
var init_bigint = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  init_int_common();
  PgBigInt53Builder = class PgBigInt53Builder extends PgIntColumnBaseBuilder {
    static [entityKind] = "PgBigInt53Builder";
    constructor(name) {
      super(name, "number", "PgBigInt53");
    }
    build(table) {
      return new PgBigInt53(table, this.config);
    }
  };
  PgBigInt53 = class PgBigInt53 extends PgColumn {
    static [entityKind] = "PgBigInt53";
    getSQLType() {
      return "bigint";
    }
    mapFromDriverValue(value) {
      if (typeof value === "number") {
        return value;
      }
      return Number(value);
    }
  };
  PgBigInt64Builder = class PgBigInt64Builder extends PgIntColumnBaseBuilder {
    static [entityKind] = "PgBigInt64Builder";
    constructor(name) {
      super(name, "bigint", "PgBigInt64");
    }
    build(table) {
      return new PgBigInt64(table, this.config);
    }
  };
  PgBigInt64 = class PgBigInt64 extends PgColumn {
    static [entityKind] = "PgBigInt64";
    getSQLType() {
      return "bigint";
    }
    mapFromDriverValue(value) {
      return BigInt(value);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/bigserial.js
function bigserial(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}
var PgBigSerial53Builder, PgBigSerial53, PgBigSerial64Builder, PgBigSerial64;
var init_bigserial = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgBigSerial53Builder = class PgBigSerial53Builder extends PgColumnBuilder {
    static [entityKind] = "PgBigSerial53Builder";
    constructor(name) {
      super(name, "number", "PgBigSerial53");
      this.config.hasDefault = true;
      this.config.notNull = true;
    }
    build(table) {
      return new PgBigSerial53(table, this.config);
    }
  };
  PgBigSerial53 = class PgBigSerial53 extends PgColumn {
    static [entityKind] = "PgBigSerial53";
    getSQLType() {
      return "bigserial";
    }
    mapFromDriverValue(value) {
      if (typeof value === "number") {
        return value;
      }
      return Number(value);
    }
  };
  PgBigSerial64Builder = class PgBigSerial64Builder extends PgColumnBuilder {
    static [entityKind] = "PgBigSerial64Builder";
    constructor(name) {
      super(name, "bigint", "PgBigSerial64");
      this.config.hasDefault = true;
    }
    build(table) {
      return new PgBigSerial64(table, this.config);
    }
  };
  PgBigSerial64 = class PgBigSerial64 extends PgColumn {
    static [entityKind] = "PgBigSerial64";
    getSQLType() {
      return "bigserial";
    }
    mapFromDriverValue(value) {
      return BigInt(value);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/boolean.js
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}
var PgBooleanBuilder, PgBoolean;
var init_boolean = __esm(() => {
  init_entity();
  init_common();
  PgBooleanBuilder = class PgBooleanBuilder extends PgColumnBuilder {
    static [entityKind] = "PgBooleanBuilder";
    constructor(name) {
      super(name, "boolean", "PgBoolean");
    }
    build(table) {
      return new PgBoolean(table, this.config);
    }
  };
  PgBoolean = class PgBoolean extends PgColumn {
    static [entityKind] = "PgBoolean";
    getSQLType() {
      return "boolean";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/char.js
function char(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgCharBuilder(name, config);
}
var PgCharBuilder, PgChar;
var init_char = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgCharBuilder = class PgCharBuilder extends PgColumnBuilder {
    static [entityKind] = "PgCharBuilder";
    constructor(name, config) {
      super(name, "string", "PgChar");
      this.config.length = config.length;
      this.config.enumValues = config.enum;
    }
    build(table) {
      return new PgChar(table, this.config);
    }
  };
  PgChar = class PgChar extends PgColumn {
    static [entityKind] = "PgChar";
    length = this.config.length;
    enumValues = this.config.enumValues;
    getSQLType() {
      return this.length === undefined ? `char` : `char(${this.length})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/cidr.js
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}
var PgCidrBuilder, PgCidr;
var init_cidr = __esm(() => {
  init_entity();
  init_common();
  PgCidrBuilder = class PgCidrBuilder extends PgColumnBuilder {
    static [entityKind] = "PgCidrBuilder";
    constructor(name) {
      super(name, "string", "PgCidr");
    }
    build(table) {
      return new PgCidr(table, this.config);
    }
  };
  PgCidr = class PgCidr extends PgColumn {
    static [entityKind] = "PgCidr";
    getSQLType() {
      return "cidr";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/custom.js
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}
var PgCustomColumnBuilder, PgCustomColumn;
var init_custom = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgCustomColumnBuilder = class PgCustomColumnBuilder extends PgColumnBuilder {
    static [entityKind] = "PgCustomColumnBuilder";
    constructor(name, fieldConfig, customTypeParams) {
      super(name, "custom", "PgCustomColumn");
      this.config.fieldConfig = fieldConfig;
      this.config.customTypeParams = customTypeParams;
    }
    build(table) {
      return new PgCustomColumn(table, this.config);
    }
  };
  PgCustomColumn = class PgCustomColumn extends PgColumn {
    static [entityKind] = "PgCustomColumn";
    sqlName;
    mapTo;
    mapFrom;
    constructor(table, config) {
      super(table, config);
      this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
      this.mapTo = config.customTypeParams.toDriver;
      this.mapFrom = config.customTypeParams.fromDriver;
    }
    getSQLType() {
      return this.sqlName;
    }
    mapFromDriverValue(value) {
      return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
    }
    mapToDriverValue(value) {
      return typeof this.mapTo === "function" ? this.mapTo(value) : value;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/date.common.js
var PgDateColumnBaseBuilder;
var init_date_common = __esm(() => {
  init_entity();
  init_sql();
  init_common();
  PgDateColumnBaseBuilder = class PgDateColumnBaseBuilder extends PgColumnBuilder {
    static [entityKind] = "PgDateColumnBaseBuilder";
    defaultNow() {
      return this.default(sql`now()`);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/date.js
function date(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}
var PgDateBuilder, PgDate, PgDateStringBuilder, PgDateString;
var init_date = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  init_date_common();
  PgDateBuilder = class PgDateBuilder extends PgDateColumnBaseBuilder {
    static [entityKind] = "PgDateBuilder";
    constructor(name) {
      super(name, "date", "PgDate");
    }
    build(table) {
      return new PgDate(table, this.config);
    }
  };
  PgDate = class PgDate extends PgColumn {
    static [entityKind] = "PgDate";
    getSQLType() {
      return "date";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string")
        return new Date(value);
      return value;
    }
    mapToDriverValue(value) {
      return value.toISOString();
    }
  };
  PgDateStringBuilder = class PgDateStringBuilder extends PgDateColumnBaseBuilder {
    static [entityKind] = "PgDateStringBuilder";
    constructor(name) {
      super(name, "string", "PgDateString");
    }
    build(table) {
      return new PgDateString(table, this.config);
    }
  };
  PgDateString = class PgDateString extends PgColumn {
    static [entityKind] = "PgDateString";
    getSQLType() {
      return "date";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string")
        return value;
      return value.toISOString().slice(0, -14);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/double-precision.js
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}
var PgDoublePrecisionBuilder, PgDoublePrecision;
var init_double_precision = __esm(() => {
  init_entity();
  init_common();
  PgDoublePrecisionBuilder = class PgDoublePrecisionBuilder extends PgColumnBuilder {
    static [entityKind] = "PgDoublePrecisionBuilder";
    constructor(name) {
      super(name, "number", "PgDoublePrecision");
    }
    build(table) {
      return new PgDoublePrecision(table, this.config);
    }
  };
  PgDoublePrecision = class PgDoublePrecision extends PgColumn {
    static [entityKind] = "PgDoublePrecision";
    getSQLType() {
      return "double precision";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        return Number.parseFloat(value);
      }
      return value;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/inet.js
function inet(name) {
  return new PgInetBuilder(name ?? "");
}
var PgInetBuilder, PgInet;
var init_inet = __esm(() => {
  init_entity();
  init_common();
  PgInetBuilder = class PgInetBuilder extends PgColumnBuilder {
    static [entityKind] = "PgInetBuilder";
    constructor(name) {
      super(name, "string", "PgInet");
    }
    build(table) {
      return new PgInet(table, this.config);
    }
  };
  PgInet = class PgInet extends PgColumn {
    static [entityKind] = "PgInet";
    getSQLType() {
      return "inet";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/integer.js
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}
var PgIntegerBuilder, PgInteger;
var init_integer = __esm(() => {
  init_entity();
  init_common();
  init_int_common();
  PgIntegerBuilder = class PgIntegerBuilder extends PgIntColumnBaseBuilder {
    static [entityKind] = "PgIntegerBuilder";
    constructor(name) {
      super(name, "number", "PgInteger");
    }
    build(table) {
      return new PgInteger(table, this.config);
    }
  };
  PgInteger = class PgInteger extends PgColumn {
    static [entityKind] = "PgInteger";
    getSQLType() {
      return "integer";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        return Number.parseInt(value);
      }
      return value;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/interval.js
function interval(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgIntervalBuilder(name, config);
}
var PgIntervalBuilder, PgInterval;
var init_interval = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgIntervalBuilder = class PgIntervalBuilder extends PgColumnBuilder {
    static [entityKind] = "PgIntervalBuilder";
    constructor(name, intervalConfig) {
      super(name, "string", "PgInterval");
      this.config.intervalConfig = intervalConfig;
    }
    build(table) {
      return new PgInterval(table, this.config);
    }
  };
  PgInterval = class PgInterval extends PgColumn {
    static [entityKind] = "PgInterval";
    fields = this.config.intervalConfig.fields;
    precision = this.config.intervalConfig.precision;
    getSQLType() {
      const fields = this.fields ? ` ${this.fields}` : "";
      const precision = this.precision ? `(${this.precision})` : "";
      return `interval${fields}${precision}`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/json.js
function json(name) {
  return new PgJsonBuilder(name ?? "");
}
var PgJsonBuilder, PgJson;
var init_json = __esm(() => {
  init_entity();
  init_common();
  PgJsonBuilder = class PgJsonBuilder extends PgColumnBuilder {
    static [entityKind] = "PgJsonBuilder";
    constructor(name) {
      super(name, "json", "PgJson");
    }
    build(table) {
      return new PgJson(table, this.config);
    }
  };
  PgJson = class PgJson extends PgColumn {
    static [entityKind] = "PgJson";
    constructor(table, config) {
      super(table, config);
    }
    getSQLType() {
      return "json";
    }
    mapToDriverValue(value) {
      return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/jsonb.js
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}
var PgJsonbBuilder, PgJsonb;
var init_jsonb = __esm(() => {
  init_entity();
  init_common();
  PgJsonbBuilder = class PgJsonbBuilder extends PgColumnBuilder {
    static [entityKind] = "PgJsonbBuilder";
    constructor(name) {
      super(name, "json", "PgJsonb");
    }
    build(table) {
      return new PgJsonb(table, this.config);
    }
  };
  PgJsonb = class PgJsonb extends PgColumn {
    static [entityKind] = "PgJsonb";
    constructor(table, config) {
      super(table, config);
    }
    getSQLType() {
      return "jsonb";
    }
    mapToDriverValue(value) {
      return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/line.js
function line(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}
var PgLineBuilder, PgLineTuple, PgLineABCBuilder, PgLineABC;
var init_line = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgLineBuilder = class PgLineBuilder extends PgColumnBuilder {
    static [entityKind] = "PgLineBuilder";
    constructor(name) {
      super(name, "array", "PgLine");
    }
    build(table) {
      return new PgLineTuple(table, this.config);
    }
  };
  PgLineTuple = class PgLineTuple extends PgColumn {
    static [entityKind] = "PgLine";
    getSQLType() {
      return "line";
    }
    mapFromDriverValue(value) {
      const [a, b, c] = value.slice(1, -1).split(",");
      return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
    }
    mapToDriverValue(value) {
      return `{${value[0]},${value[1]},${value[2]}}`;
    }
  };
  PgLineABCBuilder = class PgLineABCBuilder extends PgColumnBuilder {
    static [entityKind] = "PgLineABCBuilder";
    constructor(name) {
      super(name, "json", "PgLineABC");
    }
    build(table) {
      return new PgLineABC(table, this.config);
    }
  };
  PgLineABC = class PgLineABC extends PgColumn {
    static [entityKind] = "PgLineABC";
    getSQLType() {
      return "line";
    }
    mapFromDriverValue(value) {
      const [a, b, c] = value.slice(1, -1).split(",");
      return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
    }
    mapToDriverValue(value) {
      return `{${value.a},${value.b},${value.c}}`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/macaddr.js
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}
var PgMacaddrBuilder, PgMacaddr;
var init_macaddr = __esm(() => {
  init_entity();
  init_common();
  PgMacaddrBuilder = class PgMacaddrBuilder extends PgColumnBuilder {
    static [entityKind] = "PgMacaddrBuilder";
    constructor(name) {
      super(name, "string", "PgMacaddr");
    }
    build(table) {
      return new PgMacaddr(table, this.config);
    }
  };
  PgMacaddr = class PgMacaddr extends PgColumn {
    static [entityKind] = "PgMacaddr";
    getSQLType() {
      return "macaddr";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/macaddr8.js
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}
var PgMacaddr8Builder, PgMacaddr8;
var init_macaddr8 = __esm(() => {
  init_entity();
  init_common();
  PgMacaddr8Builder = class PgMacaddr8Builder extends PgColumnBuilder {
    static [entityKind] = "PgMacaddr8Builder";
    constructor(name) {
      super(name, "string", "PgMacaddr8");
    }
    build(table) {
      return new PgMacaddr8(table, this.config);
    }
  };
  PgMacaddr8 = class PgMacaddr8 extends PgColumn {
    static [entityKind] = "PgMacaddr8";
    getSQLType() {
      return "macaddr8";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/numeric.js
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config?.mode;
  return mode === "number" ? new PgNumericNumberBuilder(name, config?.precision, config?.scale) : mode === "bigint" ? new PgNumericBigIntBuilder(name, config?.precision, config?.scale) : new PgNumericBuilder(name, config?.precision, config?.scale);
}
var PgNumericBuilder, PgNumeric, PgNumericNumberBuilder, PgNumericNumber, PgNumericBigIntBuilder, PgNumericBigInt;
var init_numeric = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgNumericBuilder = class PgNumericBuilder extends PgColumnBuilder {
    static [entityKind] = "PgNumericBuilder";
    constructor(name, precision, scale) {
      super(name, "string", "PgNumeric");
      this.config.precision = precision;
      this.config.scale = scale;
    }
    build(table) {
      return new PgNumeric(table, this.config);
    }
  };
  PgNumeric = class PgNumeric extends PgColumn {
    static [entityKind] = "PgNumeric";
    precision;
    scale;
    constructor(table, config) {
      super(table, config);
      this.precision = config.precision;
      this.scale = config.scale;
    }
    mapFromDriverValue(value) {
      if (typeof value === "string")
        return value;
      return String(value);
    }
    getSQLType() {
      if (this.precision !== undefined && this.scale !== undefined) {
        return `numeric(${this.precision}, ${this.scale})`;
      } else if (this.precision === undefined) {
        return "numeric";
      } else {
        return `numeric(${this.precision})`;
      }
    }
  };
  PgNumericNumberBuilder = class PgNumericNumberBuilder extends PgColumnBuilder {
    static [entityKind] = "PgNumericNumberBuilder";
    constructor(name, precision, scale) {
      super(name, "number", "PgNumericNumber");
      this.config.precision = precision;
      this.config.scale = scale;
    }
    build(table) {
      return new PgNumericNumber(table, this.config);
    }
  };
  PgNumericNumber = class PgNumericNumber extends PgColumn {
    static [entityKind] = "PgNumericNumber";
    precision;
    scale;
    constructor(table, config) {
      super(table, config);
      this.precision = config.precision;
      this.scale = config.scale;
    }
    mapFromDriverValue(value) {
      if (typeof value === "number")
        return value;
      return Number(value);
    }
    mapToDriverValue = String;
    getSQLType() {
      if (this.precision !== undefined && this.scale !== undefined) {
        return `numeric(${this.precision}, ${this.scale})`;
      } else if (this.precision === undefined) {
        return "numeric";
      } else {
        return `numeric(${this.precision})`;
      }
    }
  };
  PgNumericBigIntBuilder = class PgNumericBigIntBuilder extends PgColumnBuilder {
    static [entityKind] = "PgNumericBigIntBuilder";
    constructor(name, precision, scale) {
      super(name, "bigint", "PgNumericBigInt");
      this.config.precision = precision;
      this.config.scale = scale;
    }
    build(table) {
      return new PgNumericBigInt(table, this.config);
    }
  };
  PgNumericBigInt = class PgNumericBigInt extends PgColumn {
    static [entityKind] = "PgNumericBigInt";
    precision;
    scale;
    constructor(table, config) {
      super(table, config);
      this.precision = config.precision;
      this.scale = config.scale;
    }
    mapFromDriverValue = BigInt;
    mapToDriverValue = String;
    getSQLType() {
      if (this.precision !== undefined && this.scale !== undefined) {
        return `numeric(${this.precision}, ${this.scale})`;
      } else if (this.precision === undefined) {
        return "numeric";
      } else {
        return `numeric(${this.precision})`;
      }
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/point.js
function point(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}
var PgPointTupleBuilder, PgPointTuple, PgPointObjectBuilder, PgPointObject;
var init_point = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgPointTupleBuilder = class PgPointTupleBuilder extends PgColumnBuilder {
    static [entityKind] = "PgPointTupleBuilder";
    constructor(name) {
      super(name, "array", "PgPointTuple");
    }
    build(table) {
      return new PgPointTuple(table, this.config);
    }
  };
  PgPointTuple = class PgPointTuple extends PgColumn {
    static [entityKind] = "PgPointTuple";
    getSQLType() {
      return "point";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        const [x, y] = value.slice(1, -1).split(",");
        return [Number.parseFloat(x), Number.parseFloat(y)];
      }
      return [value.x, value.y];
    }
    mapToDriverValue(value) {
      return `(${value[0]},${value[1]})`;
    }
  };
  PgPointObjectBuilder = class PgPointObjectBuilder extends PgColumnBuilder {
    static [entityKind] = "PgPointObjectBuilder";
    constructor(name) {
      super(name, "json", "PgPointObject");
    }
    build(table) {
      return new PgPointObject(table, this.config);
    }
  };
  PgPointObject = class PgPointObject extends PgColumn {
    static [entityKind] = "PgPointObject";
    getSQLType() {
      return "point";
    }
    mapFromDriverValue(value) {
      if (typeof value === "string") {
        const [x, y] = value.slice(1, -1).split(",");
        return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
      }
      return value;
    }
    mapToDriverValue(value) {
      return `(${value.x},${value.y})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0;c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0;i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x = bytesToFloat64(bytes, offset);
    offset += 8;
    const y = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x, y];
  }
  throw new Error("Unsupported geometry type");
}
var init_utils2 = () => {};

// ../../node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js
function geometry(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}
var PgGeometryBuilder, PgGeometry, PgGeometryObjectBuilder, PgGeometryObject;
var init_geometry = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  init_utils2();
  PgGeometryBuilder = class PgGeometryBuilder extends PgColumnBuilder {
    static [entityKind] = "PgGeometryBuilder";
    constructor(name) {
      super(name, "array", "PgGeometry");
    }
    build(table) {
      return new PgGeometry(table, this.config);
    }
  };
  PgGeometry = class PgGeometry extends PgColumn {
    static [entityKind] = "PgGeometry";
    getSQLType() {
      return "geometry(point)";
    }
    mapFromDriverValue(value) {
      return parseEWKB(value);
    }
    mapToDriverValue(value) {
      return `point(${value[0]} ${value[1]})`;
    }
  };
  PgGeometryObjectBuilder = class PgGeometryObjectBuilder extends PgColumnBuilder {
    static [entityKind] = "PgGeometryObjectBuilder";
    constructor(name) {
      super(name, "json", "PgGeometryObject");
    }
    build(table) {
      return new PgGeometryObject(table, this.config);
    }
  };
  PgGeometryObject = class PgGeometryObject extends PgColumn {
    static [entityKind] = "PgGeometryObject";
    getSQLType() {
      return "geometry(point)";
    }
    mapFromDriverValue(value) {
      const parsed = parseEWKB(value);
      return { x: parsed[0], y: parsed[1] };
    }
    mapToDriverValue(value) {
      return `point(${value.x} ${value.y})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/real.js
function real(name) {
  return new PgRealBuilder(name ?? "");
}
var PgRealBuilder, PgReal;
var init_real = __esm(() => {
  init_entity();
  init_common();
  PgRealBuilder = class PgRealBuilder extends PgColumnBuilder {
    static [entityKind] = "PgRealBuilder";
    constructor(name, length) {
      super(name, "number", "PgReal");
      this.config.length = length;
    }
    build(table) {
      return new PgReal(table, this.config);
    }
  };
  PgReal = class PgReal extends PgColumn {
    static [entityKind] = "PgReal";
    constructor(table, config) {
      super(table, config);
    }
    getSQLType() {
      return "real";
    }
    mapFromDriverValue = (value) => {
      if (typeof value === "string") {
        return Number.parseFloat(value);
      }
      return value;
    };
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/serial.js
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}
var PgSerialBuilder, PgSerial;
var init_serial = __esm(() => {
  init_entity();
  init_common();
  PgSerialBuilder = class PgSerialBuilder extends PgColumnBuilder {
    static [entityKind] = "PgSerialBuilder";
    constructor(name) {
      super(name, "number", "PgSerial");
      this.config.hasDefault = true;
      this.config.notNull = true;
    }
    build(table) {
      return new PgSerial(table, this.config);
    }
  };
  PgSerial = class PgSerial extends PgColumn {
    static [entityKind] = "PgSerial";
    getSQLType() {
      return "serial";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/smallint.js
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}
var PgSmallIntBuilder, PgSmallInt;
var init_smallint = __esm(() => {
  init_entity();
  init_common();
  init_int_common();
  PgSmallIntBuilder = class PgSmallIntBuilder extends PgIntColumnBaseBuilder {
    static [entityKind] = "PgSmallIntBuilder";
    constructor(name) {
      super(name, "number", "PgSmallInt");
    }
    build(table) {
      return new PgSmallInt(table, this.config);
    }
  };
  PgSmallInt = class PgSmallInt extends PgColumn {
    static [entityKind] = "PgSmallInt";
    getSQLType() {
      return "smallint";
    }
    mapFromDriverValue = (value) => {
      if (typeof value === "string") {
        return Number(value);
      }
      return value;
    };
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/smallserial.js
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}
var PgSmallSerialBuilder, PgSmallSerial;
var init_smallserial = __esm(() => {
  init_entity();
  init_common();
  PgSmallSerialBuilder = class PgSmallSerialBuilder extends PgColumnBuilder {
    static [entityKind] = "PgSmallSerialBuilder";
    constructor(name) {
      super(name, "number", "PgSmallSerial");
      this.config.hasDefault = true;
      this.config.notNull = true;
    }
    build(table) {
      return new PgSmallSerial(table, this.config);
    }
  };
  PgSmallSerial = class PgSmallSerial extends PgColumn {
    static [entityKind] = "PgSmallSerial";
    getSQLType() {
      return "smallserial";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/text.js
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTextBuilder(name, config);
}
var PgTextBuilder, PgText;
var init_text = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgTextBuilder = class PgTextBuilder extends PgColumnBuilder {
    static [entityKind] = "PgTextBuilder";
    constructor(name, config) {
      super(name, "string", "PgText");
      this.config.enumValues = config.enum;
    }
    build(table) {
      return new PgText(table, this.config);
    }
  };
  PgText = class PgText extends PgColumn {
    static [entityKind] = "PgText";
    enumValues = this.config.enumValues;
    getSQLType() {
      return "text";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/time.js
function time(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}
var PgTimeBuilder, PgTime;
var init_time = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  init_date_common();
  PgTimeBuilder = class PgTimeBuilder extends PgDateColumnBaseBuilder {
    constructor(name, withTimezone, precision) {
      super(name, "string", "PgTime");
      this.withTimezone = withTimezone;
      this.precision = precision;
      this.config.withTimezone = withTimezone;
      this.config.precision = precision;
    }
    static [entityKind] = "PgTimeBuilder";
    build(table) {
      return new PgTime(table, this.config);
    }
  };
  PgTime = class PgTime extends PgColumn {
    static [entityKind] = "PgTime";
    withTimezone;
    precision;
    constructor(table, config) {
      super(table, config);
      this.withTimezone = config.withTimezone;
      this.precision = config.precision;
    }
    getSQLType() {
      const precision = this.precision === undefined ? "" : `(${this.precision})`;
      return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/timestamp.js
function timestamp(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}
var PgTimestampBuilder, PgTimestamp, PgTimestampStringBuilder, PgTimestampString;
var init_timestamp = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  init_date_common();
  PgTimestampBuilder = class PgTimestampBuilder extends PgDateColumnBaseBuilder {
    static [entityKind] = "PgTimestampBuilder";
    constructor(name, withTimezone, precision) {
      super(name, "date", "PgTimestamp");
      this.config.withTimezone = withTimezone;
      this.config.precision = precision;
    }
    build(table) {
      return new PgTimestamp(table, this.config);
    }
  };
  PgTimestamp = class PgTimestamp extends PgColumn {
    static [entityKind] = "PgTimestamp";
    withTimezone;
    precision;
    constructor(table, config) {
      super(table, config);
      this.withTimezone = config.withTimezone;
      this.precision = config.precision;
    }
    getSQLType() {
      const precision = this.precision === undefined ? "" : ` (${this.precision})`;
      return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
    }
    mapFromDriverValue(value) {
      if (typeof value === "string")
        return new Date(this.withTimezone ? value : value + "+0000");
      return value;
    }
    mapToDriverValue = (value) => {
      return value.toISOString();
    };
  };
  PgTimestampStringBuilder = class PgTimestampStringBuilder extends PgDateColumnBaseBuilder {
    static [entityKind] = "PgTimestampStringBuilder";
    constructor(name, withTimezone, precision) {
      super(name, "string", "PgTimestampString");
      this.config.withTimezone = withTimezone;
      this.config.precision = precision;
    }
    build(table) {
      return new PgTimestampString(table, this.config);
    }
  };
  PgTimestampString = class PgTimestampString extends PgColumn {
    static [entityKind] = "PgTimestampString";
    withTimezone;
    precision;
    constructor(table, config) {
      super(table, config);
      this.withTimezone = config.withTimezone;
      this.precision = config.precision;
    }
    getSQLType() {
      const precision = this.precision === undefined ? "" : `(${this.precision})`;
      return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
    }
    mapFromDriverValue(value) {
      if (typeof value === "string")
        return value;
      const shortened = value.toISOString().slice(0, -1).replace("T", " ");
      if (this.withTimezone) {
        const offset = value.getTimezoneOffset();
        const sign = offset <= 0 ? "+" : "-";
        return `${shortened}${sign}${Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")}`;
      }
      return shortened;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/uuid.js
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}
var PgUUIDBuilder, PgUUID;
var init_uuid = __esm(() => {
  init_entity();
  init_sql();
  init_common();
  PgUUIDBuilder = class PgUUIDBuilder extends PgColumnBuilder {
    static [entityKind] = "PgUUIDBuilder";
    constructor(name) {
      super(name, "string", "PgUUID");
    }
    defaultRandom() {
      return this.default(sql`gen_random_uuid()`);
    }
    build(table) {
      return new PgUUID(table, this.config);
    }
  };
  PgUUID = class PgUUID extends PgColumn {
    static [entityKind] = "PgUUID";
    getSQLType() {
      return "uuid";
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/varchar.js
function varchar(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVarcharBuilder(name, config);
}
var PgVarcharBuilder, PgVarchar;
var init_varchar = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgVarcharBuilder = class PgVarcharBuilder extends PgColumnBuilder {
    static [entityKind] = "PgVarcharBuilder";
    constructor(name, config) {
      super(name, "string", "PgVarchar");
      this.config.length = config.length;
      this.config.enumValues = config.enum;
    }
    build(table) {
      return new PgVarchar(table, this.config);
    }
  };
  PgVarchar = class PgVarchar extends PgColumn {
    static [entityKind] = "PgVarchar";
    length = this.config.length;
    enumValues = this.config.enumValues;
    getSQLType() {
      return this.length === undefined ? `varchar` : `varchar(${this.length})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js
function bit(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgBinaryVectorBuilder(name, config);
}
var PgBinaryVectorBuilder, PgBinaryVector;
var init_bit = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgBinaryVectorBuilder = class PgBinaryVectorBuilder extends PgColumnBuilder {
    static [entityKind] = "PgBinaryVectorBuilder";
    constructor(name, config) {
      super(name, "string", "PgBinaryVector");
      this.config.dimensions = config.dimensions;
    }
    build(table) {
      return new PgBinaryVector(table, this.config);
    }
  };
  PgBinaryVector = class PgBinaryVector extends PgColumn {
    static [entityKind] = "PgBinaryVector";
    dimensions = this.config.dimensions;
    getSQLType() {
      return `bit(${this.dimensions})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js
function halfvec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgHalfVectorBuilder(name, config);
}
var PgHalfVectorBuilder, PgHalfVector;
var init_halfvec = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgHalfVectorBuilder = class PgHalfVectorBuilder extends PgColumnBuilder {
    static [entityKind] = "PgHalfVectorBuilder";
    constructor(name, config) {
      super(name, "array", "PgHalfVector");
      this.config.dimensions = config.dimensions;
    }
    build(table) {
      return new PgHalfVector(table, this.config);
    }
  };
  PgHalfVector = class PgHalfVector extends PgColumn {
    static [entityKind] = "PgHalfVector";
    dimensions = this.config.dimensions;
    getSQLType() {
      return `halfvec(${this.dimensions})`;
    }
    mapToDriverValue(value) {
      return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
      return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js
function sparsevec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgSparseVectorBuilder(name, config);
}
var PgSparseVectorBuilder, PgSparseVector;
var init_sparsevec = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgSparseVectorBuilder = class PgSparseVectorBuilder extends PgColumnBuilder {
    static [entityKind] = "PgSparseVectorBuilder";
    constructor(name, config) {
      super(name, "string", "PgSparseVector");
      this.config.dimensions = config.dimensions;
    }
    build(table) {
      return new PgSparseVector(table, this.config);
    }
  };
  PgSparseVector = class PgSparseVector extends PgColumn {
    static [entityKind] = "PgSparseVector";
    dimensions = this.config.dimensions;
    getSQLType() {
      return `sparsevec(${this.dimensions})`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js
function vector(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVectorBuilder(name, config);
}
var PgVectorBuilder, PgVector;
var init_vector = __esm(() => {
  init_entity();
  init_utils();
  init_common();
  PgVectorBuilder = class PgVectorBuilder extends PgColumnBuilder {
    static [entityKind] = "PgVectorBuilder";
    constructor(name, config) {
      super(name, "array", "PgVector");
      this.config.dimensions = config.dimensions;
    }
    build(table) {
      return new PgVector(table, this.config);
    }
  };
  PgVector = class PgVector extends PgColumn {
    static [entityKind] = "PgVector";
    dimensions = this.config.dimensions;
    getSQLType() {
      return `vector(${this.dimensions})`;
    }
    mapToDriverValue(value) {
      return JSON.stringify(value);
    }
    mapFromDriverValue(value) {
      return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/all.js
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}
var init_all = __esm(() => {
  init_bigint();
  init_bigserial();
  init_boolean();
  init_char();
  init_cidr();
  init_custom();
  init_date();
  init_double_precision();
  init_inet();
  init_integer();
  init_interval();
  init_json();
  init_jsonb();
  init_line();
  init_macaddr();
  init_macaddr8();
  init_numeric();
  init_point();
  init_geometry();
  init_real();
  init_serial();
  init_smallint();
  init_smallserial();
  init_text();
  init_time();
  init_timestamp();
  init_uuid();
  init_varchar();
  init_bit();
  init_halfvec();
  init_sparsevec();
  init_vector();
});

// ../../node_modules/drizzle-orm/pg-core/table.js
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
    const colBuilder = colBuilderBase;
    colBuilder.setName(name2);
    const column = colBuilder.build(rawTable);
    rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
    return [name2, column];
  }));
  const builtColumnsForExtraConfig = Object.fromEntries(Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
    const colBuilder = colBuilderBase;
    colBuilder.setName(name2);
    const column = colBuilder.buildExtraConfigColumn(rawTable);
    return [name2, column];
  }));
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
var InlineForeignKeys, EnableRLS, PgTable, pgTable = (name, columns, extraConfig) => {
  return pgTableWithSchema(name, columns, extraConfig, undefined);
};
var init_table2 = __esm(() => {
  init_entity();
  init_table();
  init_all();
  InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
  EnableRLS = Symbol.for("drizzle:EnableRLS");
  PgTable = class PgTable extends Table {
    static [entityKind] = "PgTable";
    static Symbol = Object.assign({}, Table.Symbol, {
      InlineForeignKeys,
      EnableRLS
    });
    [InlineForeignKeys] = [];
    [EnableRLS] = false;
    [Table.Symbol.ExtraConfigBuilder] = undefined;
    [Table.Symbol.ExtraConfigColumns] = {};
  };
});

// ../../node_modules/drizzle-orm/pg-core/checks.js
function check(name, value) {
  return new CheckBuilder(name, value);
}
var CheckBuilder, Check;
var init_checks = __esm(() => {
  init_entity();
  CheckBuilder = class CheckBuilder {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
    static [entityKind] = "PgCheckBuilder";
    brand;
    build(table) {
      return new Check(table, this);
    }
  };
  Check = class Check {
    constructor(table, builder) {
      this.table = table;
      this.name = builder.name;
      this.value = builder.value;
    }
    static [entityKind] = "PgCheck";
    name;
    value;
  };
});

// ../../node_modules/drizzle-orm/pg-core/columns/index.js
var init_columns = __esm(() => {
  init_bigint();
  init_bigserial();
  init_boolean();
  init_char();
  init_cidr();
  init_common();
  init_custom();
  init_date();
  init_double_precision();
  init_enum();
  init_inet();
  init_int_common();
  init_integer();
  init_interval();
  init_json();
  init_jsonb();
  init_line();
  init_macaddr();
  init_macaddr8();
  init_numeric();
  init_point();
  init_geometry();
  init_real();
  init_serial();
  init_smallint();
  init_smallserial();
  init_text();
  init_time();
  init_timestamp();
  init_uuid();
  init_varchar();
  init_bit();
  init_halfvec();
  init_sparsevec();
  init_vector();
});

// ../../node_modules/drizzle-orm/pg-core/indexes.js
function index(name) {
  return new IndexBuilderOn(false, name);
}
var IndexBuilderOn, IndexBuilder, Index;
var init_indexes = __esm(() => {
  init_sql();
  init_entity();
  init_columns();
  IndexBuilderOn = class IndexBuilderOn {
    constructor(unique2, name) {
      this.unique = unique2;
      this.name = name;
    }
    static [entityKind] = "PgIndexBuilderOn";
    on(...columns) {
      return new IndexBuilder(columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }), this.unique, false, this.name);
    }
    onOnly(...columns) {
      return new IndexBuilder(columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = it.defaultConfig;
        return clonedIndexedColumn;
      }), this.unique, true, this.name);
    }
    using(method, ...columns) {
      return new IndexBuilder(columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }), this.unique, true, this.name, method);
    }
  };
  IndexBuilder = class IndexBuilder {
    static [entityKind] = "PgIndexBuilder";
    config;
    constructor(columns, unique2, only, name, method = "btree") {
      this.config = {
        name,
        columns,
        unique: unique2,
        only,
        method
      };
    }
    concurrently() {
      this.config.concurrently = true;
      return this;
    }
    with(obj) {
      this.config.with = obj;
      return this;
    }
    where(condition) {
      this.config.where = condition;
      return this;
    }
    build(table) {
      return new Index(this.config, table);
    }
  };
  Index = class Index {
    static [entityKind] = "PgIndex";
    config;
    constructor(config, table) {
      this.config = { ...config, table };
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/policies.js
var PgPolicy;
var init_policies = __esm(() => {
  init_entity();
  PgPolicy = class PgPolicy {
    constructor(name, config) {
      this.name = name;
      if (config) {
        this.as = config.as;
        this.for = config.for;
        this.to = config.to;
        this.using = config.using;
        this.withCheck = config.withCheck;
      }
    }
    static [entityKind] = "PgPolicy";
    as;
    for;
    to;
    using;
    withCheck;
    _linkedTable;
    link(table) {
      this._linkedTable = table;
      return this;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/primary-keys.js
function primaryKey(...config) {
  if (config[0].columns) {
    return new PrimaryKeyBuilder(config[0].columns, config[0].name);
  }
  return new PrimaryKeyBuilder(config);
}
var PrimaryKeyBuilder, PrimaryKey;
var init_primary_keys = __esm(() => {
  init_entity();
  init_table2();
  PrimaryKeyBuilder = class PrimaryKeyBuilder {
    static [entityKind] = "PgPrimaryKeyBuilder";
    columns;
    name;
    constructor(columns, name) {
      this.columns = columns;
      this.name = name;
    }
    build(table) {
      return new PrimaryKey(table, this.columns, this.name);
    }
  };
  PrimaryKey = class PrimaryKey {
    constructor(table, columns, name) {
      this.table = table;
      this.columns = columns;
      this.name = name;
    }
    static [entityKind] = "PgPrimaryKey";
    columns;
    name;
    getName() {
      return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/view-common.js
var PgViewConfig;
var init_view_common2 = __esm(() => {
  PgViewConfig = Symbol.for("drizzle:PgViewConfig");
});

// ../../node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var CasingCache;
var init_casing = __esm(() => {
  init_entity();
  init_table();
  CasingCache = class CasingCache {
    static [entityKind] = "CasingCache";
    cache = {};
    cachedTables = {};
    convert;
    constructor(casing) {
      this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
    }
    getColumnCasing(column) {
      if (!column.keyAsName)
        return column.name;
      const schema = column.table[Table.Symbol.Schema] ?? "public";
      const tableName = column.table[Table.Symbol.OriginalName];
      const key = `${schema}.${tableName}.${column.name}`;
      if (!this.cache[key]) {
        this.cacheTable(column.table);
      }
      return this.cache[key];
    }
    cacheTable(table) {
      const schema = table[Table.Symbol.Schema] ?? "public";
      const tableName = table[Table.Symbol.OriginalName];
      const tableKey = `${schema}.${tableName}`;
      if (!this.cachedTables[tableKey]) {
        for (const column of Object.values(table[Table.Symbol.Columns])) {
          const columnKey = `${tableKey}.${column.name}`;
          this.cache[columnKey] = this.convert(column.name);
        }
        this.cachedTables[tableKey] = true;
      }
    }
    clearCache() {
      this.cache = {};
      this.cachedTables = {};
    }
  };
});

// ../../node_modules/drizzle-orm/errors.js
var DrizzleError, DrizzleQueryError, TransactionRollbackError;
var init_errors = __esm(() => {
  init_entity();
  DrizzleError = class DrizzleError extends Error {
    static [entityKind] = "DrizzleError";
    constructor({ message, cause }) {
      super(message);
      this.name = "DrizzleError";
      this.cause = cause;
    }
  };
  DrizzleQueryError = class DrizzleQueryError extends Error {
    constructor(query, params, cause) {
      super(`Failed query: ${query}
params: ${params}`);
      this.query = query;
      this.params = params;
      this.cause = cause;
      Error.captureStackTrace(this, DrizzleQueryError);
      if (cause)
        this.cause = cause;
    }
  };
  TransactionRollbackError = class TransactionRollbackError extends DrizzleError {
    static [entityKind] = "TransactionRollbackError";
    constructor() {
      super({ message: "Rollback" });
    }
  };
});

// ../../node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter((c) => c !== undefined);
  if (conditions.length === 0) {
    return;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter((c) => c !== undefined);
  if (conditions.length === 0) {
    return;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
}, ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
}, gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
}, gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
}, lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
}, lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
var init_conditions = __esm(() => {
  init_column();
  init_entity();
  init_table();
  init_sql();
});

// ../../node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}
var init_select = __esm(() => {
  init_sql();
});

// ../../node_modules/drizzle-orm/sql/expressions/index.js
var init_expressions = __esm(() => {
  init_conditions();
  init_select();
});

// ../../node_modules/drizzle-orm/relations.js
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(value[Table.Symbol.Columns])) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(configHelpers(value.table));
      let primaryKey2;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey2) {
            tableConfig.primaryKey.push(...primaryKey2);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey: primaryKey2
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function relations(table, relations2) {
  return new Relations(table, (helpers) => Object.fromEntries(Object.entries(relations2(helpers)).map(([key, value]) => [
    key,
    value.withFieldName(key)
  ])));
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(sourceTable, table, config, config?.fields.reduce((res, f) => res && f.notNull, true) ?? false);
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(`Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`);
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(`Table "${sourceTable[Table.Symbol.Name]}" not found in schema`);
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(referencedTableConfig.relations)) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(`There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`) : new Error(`There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`);
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(`There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`);
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(tablesConfig, tablesConfig[selectionItem.relationTableTsKey], subRows, selectionItem.selection, mapColumnValue) : subRows.map((subRow) => mapRelationalRow(tablesConfig, tablesConfig[selectionItem.relationTableTsKey], subRow, selectionItem.selection, mapColumnValue));
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}
var Relation, Relations, One, Many;
var init_relations = __esm(() => {
  init_table();
  init_column();
  init_entity();
  init_primary_keys();
  init_expressions();
  init_sql();
  Relation = class Relation {
    constructor(sourceTable, referencedTable, relationName) {
      this.sourceTable = sourceTable;
      this.referencedTable = referencedTable;
      this.relationName = relationName;
      this.referencedTableName = referencedTable[Table.Symbol.Name];
    }
    static [entityKind] = "Relation";
    referencedTableName;
    fieldName;
  };
  Relations = class Relations {
    constructor(table, config) {
      this.table = table;
      this.config = config;
    }
    static [entityKind] = "Relations";
  };
  One = class One extends Relation {
    constructor(sourceTable, referencedTable, config, isNullable) {
      super(sourceTable, referencedTable, config?.relationName);
      this.config = config;
      this.isNullable = isNullable;
    }
    static [entityKind] = "One";
    withFieldName(fieldName) {
      const relation = new One(this.sourceTable, this.referencedTable, this.config, this.isNullable);
      relation.fieldName = fieldName;
      return relation;
    }
  };
  Many = class Many extends Relation {
    constructor(sourceTable, referencedTable, config) {
      super(sourceTable, referencedTable, config?.relationName);
      this.config = config;
    }
    static [entityKind] = "Many";
    withFieldName(fieldName) {
      const relation = new Many(this.sourceTable, this.referencedTable, this.config);
      relation.fieldName = fieldName;
      return relation;
    }
  };
});

// ../../node_modules/drizzle-orm/sql/functions/aggregate.js
function count(expression) {
  return sql`count(${expression || sql.raw("*")})`.mapWith(Number);
}
var init_aggregate = __esm(() => {
  init_sql();
});

// ../../node_modules/drizzle-orm/sql/functions/vector.js
function toSql(value) {
  return JSON.stringify(value);
}
function cosineDistance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <=> ${toSql(value)}`;
  }
  return sql`${column} <=> ${value}`;
}
var init_vector2 = __esm(() => {
  init_sql();
});

// ../../node_modules/drizzle-orm/sql/functions/index.js
var init_functions = __esm(() => {
  init_aggregate();
  init_vector2();
});

// ../../node_modules/drizzle-orm/sql/index.js
var init_sql2 = __esm(() => {
  init_expressions();
  init_functions();
  init_sql();
});

// ../../node_modules/drizzle-orm/pg-core/view-base.js
var PgViewBase;
var init_view_base = __esm(() => {
  init_entity();
  init_sql();
  PgViewBase = class PgViewBase extends View {
    static [entityKind] = "PgViewBase";
  };
});

// ../../node_modules/drizzle-orm/pg-core/dialect.js
var PgDialect;
var init_dialect = __esm(() => {
  init_alias();
  init_casing();
  init_column();
  init_entity();
  init_errors();
  init_columns();
  init_table2();
  init_relations();
  init_sql2();
  init_sql();
  init_subquery();
  init_table();
  init_utils();
  init_view_common();
  init_view_base();
  PgDialect = class PgDialect {
    static [entityKind] = "PgDialect";
    casing;
    constructor(config) {
      this.casing = new CasingCache(config?.casing);
    }
    async migrate(migrations, session, config) {
      const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
      const migrationsSchema = typeof config === "string" ? "drizzle" : config.migrationsSchema ?? "drizzle";
      const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
      await session.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`);
      await session.execute(migrationTableCreate);
      const dbMigrations = await session.all(sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} order by created_at desc limit 1`);
      const lastDbMigration = dbMigrations[0];
      await session.transaction(async (tx) => {
        for await (const migration of migrations) {
          if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
            for (const stmt of migration.sql) {
              await tx.execute(sql.raw(stmt));
            }
            await tx.execute(sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`);
          }
        }
      });
    }
    escapeName(name) {
      return `"${name}"`;
    }
    escapeParam(num) {
      return `$${num + 1}`;
    }
    escapeString(str) {
      return `'${str.replace(/'/g, "''")}'`;
    }
    buildWithCTE(queries) {
      if (!queries?.length)
        return;
      const withSqlChunks = [sql`with `];
      for (const [i, w] of queries.entries()) {
        withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
        if (i < queries.length - 1) {
          withSqlChunks.push(sql`, `);
        }
      }
      withSqlChunks.push(sql` `);
      return sql.join(withSqlChunks);
    }
    buildDeleteQuery({ table, where, returning, withList }) {
      const withSql = this.buildWithCTE(withList);
      const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : undefined;
      const whereSql = where ? sql` where ${where}` : undefined;
      return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
    }
    buildUpdateSet(table, set) {
      const tableColumns = table[Table.Symbol.Columns];
      const columnNames = Object.keys(tableColumns).filter((colName) => set[colName] !== undefined || tableColumns[colName]?.onUpdateFn !== undefined);
      const setSize = columnNames.length;
      return sql.join(columnNames.flatMap((colName, i) => {
        const col = tableColumns[colName];
        const onUpdateFnResult = col.onUpdateFn?.();
        const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
        const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
        if (i < setSize - 1) {
          return [res, sql.raw(", ")];
        }
        return [res];
      }));
    }
    buildUpdateQuery({ table, set, where, returning, withList, from, joins }) {
      const withSql = this.buildWithCTE(withList);
      const tableName = table[PgTable.Symbol.Name];
      const tableSchema = table[PgTable.Symbol.Schema];
      const origTableName = table[PgTable.Symbol.OriginalName];
      const alias = tableName === origTableName ? undefined : tableName;
      const tableSql = sql`${tableSchema ? sql`${sql.identifier(tableSchema)}.` : undefined}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}`;
      const setSql = this.buildUpdateSet(table, set);
      const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
      const joinsSql = this.buildJoins(joins);
      const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: !from })}` : undefined;
      const whereSql = where ? sql` where ${where}` : undefined;
      return sql`${withSql}update ${tableSql} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}`;
    }
    buildSelection(fields, { isSingleTable = false } = {}) {
      const columnsLen = fields.length;
      const chunks = fields.flatMap(({ field }, i) => {
        const chunk = [];
        if (is(field, SQL.Aliased) && field.isSelectionField) {
          chunk.push(sql.identifier(field.fieldAlias));
        } else if (is(field, SQL.Aliased) || is(field, SQL)) {
          const query = is(field, SQL.Aliased) ? field.sql : field;
          if (isSingleTable) {
            chunk.push(new SQL(query.queryChunks.map((c) => {
              if (is(c, PgColumn)) {
                return sql.identifier(this.casing.getColumnCasing(c));
              }
              return c;
            })));
          } else {
            chunk.push(query);
          }
          if (is(field, SQL.Aliased)) {
            chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
          }
        } else if (is(field, Column)) {
          if (isSingleTable) {
            chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
          } else {
            chunk.push(field);
          }
        } else if (is(field, Subquery)) {
          const entries = Object.entries(field._.selectedFields);
          if (entries.length === 1) {
            const entry = entries[0][1];
            const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
            if (fieldDecoder) {
              field._.sql.decoder = fieldDecoder;
            }
          }
          chunk.push(field);
        }
        if (i < columnsLen - 1) {
          chunk.push(sql`, `);
        }
        return chunk;
      });
      return sql.join(chunks);
    }
    buildJoins(joins) {
      if (!joins || joins.length === 0) {
        return;
      }
      const joinsArray = [];
      for (const [index2, joinMeta] of joins.entries()) {
        if (index2 === 0) {
          joinsArray.push(sql` `);
        }
        const table = joinMeta.table;
        const lateralSql = joinMeta.lateral ? sql` lateral` : undefined;
        const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : undefined;
        if (is(table, PgTable)) {
          const tableName = table[PgTable.Symbol.Name];
          const tableSchema = table[PgTable.Symbol.Schema];
          const origTableName = table[PgTable.Symbol.OriginalName];
          const alias = tableName === origTableName ? undefined : joinMeta.alias;
          joinsArray.push(sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : undefined}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`);
        } else if (is(table, View)) {
          const viewName = table[ViewBaseConfig].name;
          const viewSchema = table[ViewBaseConfig].schema;
          const origViewName = table[ViewBaseConfig].originalName;
          const alias = viewName === origViewName ? undefined : joinMeta.alias;
          joinsArray.push(sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : undefined}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`);
        } else {
          joinsArray.push(sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table}${onSql}`);
        }
        if (index2 < joins.length - 1) {
          joinsArray.push(sql` `);
        }
      }
      return sql.join(joinsArray);
    }
    buildFromTable(table) {
      if (is(table, Table) && table[Table.Symbol.IsAlias]) {
        let fullName = sql`${sql.identifier(table[Table.Symbol.OriginalName])}`;
        if (table[Table.Symbol.Schema]) {
          fullName = sql`${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
        }
        return sql`${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
      }
      return table;
    }
    buildSelectQuery({
      withList,
      fields,
      fieldsFlat,
      where,
      having,
      table,
      joins,
      orderBy,
      groupBy,
      limit,
      offset,
      lockingClause,
      distinct,
      setOperators
    }) {
      const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
      for (const f of fieldsList) {
        if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, PgViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? undefined : getTableName(table)) && !((table2) => joins?.some(({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])))(f.field.table)) {
          const tableName = getTableName(f.field.table);
          throw new Error(`Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`);
        }
      }
      const isSingleTable = !joins || joins.length === 0;
      const withSql = this.buildWithCTE(withList);
      let distinctSql;
      if (distinct) {
        distinctSql = distinct === true ? sql` distinct` : sql` distinct on (${sql.join(distinct.on, sql`, `)})`;
      }
      const selection = this.buildSelection(fieldsList, { isSingleTable });
      const tableSql = this.buildFromTable(table);
      const joinsSql = this.buildJoins(joins);
      const whereSql = where ? sql` where ${where}` : undefined;
      const havingSql = having ? sql` having ${having}` : undefined;
      let orderBySql;
      if (orderBy && orderBy.length > 0) {
        orderBySql = sql` order by ${sql.join(orderBy, sql`, `)}`;
      }
      let groupBySql;
      if (groupBy && groupBy.length > 0) {
        groupBySql = sql` group by ${sql.join(groupBy, sql`, `)}`;
      }
      const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : undefined;
      const offsetSql = offset ? sql` offset ${offset}` : undefined;
      const lockingClauseSql = sql.empty();
      if (lockingClause) {
        const clauseSql = sql` for ${sql.raw(lockingClause.strength)}`;
        if (lockingClause.config.of) {
          clauseSql.append(sql` of ${sql.join(Array.isArray(lockingClause.config.of) ? lockingClause.config.of : [lockingClause.config.of], sql`, `)}`);
        }
        if (lockingClause.config.noWait) {
          clauseSql.append(sql` nowait`);
        } else if (lockingClause.config.skipLocked) {
          clauseSql.append(sql` skip locked`);
        }
        lockingClauseSql.append(clauseSql);
      }
      const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClauseSql}`;
      if (setOperators.length > 0) {
        return this.buildSetOperations(finalQuery, setOperators);
      }
      return finalQuery;
    }
    buildSetOperations(leftSelect, setOperators) {
      const [setOperator, ...rest] = setOperators;
      if (!setOperator) {
        throw new Error("Cannot pass undefined values to any set operator");
      }
      if (rest.length === 0) {
        return this.buildSetOperationQuery({ leftSelect, setOperator });
      }
      return this.buildSetOperations(this.buildSetOperationQuery({ leftSelect, setOperator }), rest);
    }
    buildSetOperationQuery({
      leftSelect,
      setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
    }) {
      const leftChunk = sql`(${leftSelect.getSQL()}) `;
      const rightChunk = sql`(${rightSelect.getSQL()})`;
      let orderBySql;
      if (orderBy && orderBy.length > 0) {
        const orderByValues = [];
        for (const singleOrderBy of orderBy) {
          if (is(singleOrderBy, PgColumn)) {
            orderByValues.push(sql.identifier(singleOrderBy.name));
          } else if (is(singleOrderBy, SQL)) {
            for (let i = 0;i < singleOrderBy.queryChunks.length; i++) {
              const chunk = singleOrderBy.queryChunks[i];
              if (is(chunk, PgColumn)) {
                singleOrderBy.queryChunks[i] = sql.identifier(chunk.name);
              }
            }
            orderByValues.push(sql`${singleOrderBy}`);
          } else {
            orderByValues.push(sql`${singleOrderBy}`);
          }
        }
        orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
      }
      const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : undefined;
      const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
      const offsetSql = offset ? sql` offset ${offset}` : undefined;
      return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
    }
    buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select: select2, overridingSystemValue_ }) {
      const valuesSqlList = [];
      const columns = table[Table.Symbol.Columns];
      const colEntries = Object.entries(columns).filter(([_, col]) => !col.shouldDisableInsert());
      const insertOrder = colEntries.map(([, column]) => sql.identifier(this.casing.getColumnCasing(column)));
      if (select2) {
        const select22 = valuesOrSelect;
        if (is(select22, SQL)) {
          valuesSqlList.push(select22);
        } else {
          valuesSqlList.push(select22.getSQL());
        }
      } else {
        const values = valuesOrSelect;
        valuesSqlList.push(sql.raw("values "));
        for (const [valueIndex, value] of values.entries()) {
          const valueList = [];
          for (const [fieldName, col] of colEntries) {
            const colValue = value[fieldName];
            if (colValue === undefined || is(colValue, Param) && colValue.value === undefined) {
              if (col.defaultFn !== undefined) {
                const defaultFnResult = col.defaultFn();
                const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
                valueList.push(defaultValue);
              } else if (!col.default && col.onUpdateFn !== undefined) {
                const onUpdateFnResult = col.onUpdateFn();
                const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
                valueList.push(newValue);
              } else {
                valueList.push(sql`default`);
              }
            } else {
              valueList.push(colValue);
            }
          }
          valuesSqlList.push(valueList);
          if (valueIndex < values.length - 1) {
            valuesSqlList.push(sql`, `);
          }
        }
      }
      const withSql = this.buildWithCTE(withList);
      const valuesSql = sql.join(valuesSqlList);
      const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : undefined;
      const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : undefined;
      const overridingSql = overridingSystemValue_ === true ? sql`overriding system value ` : undefined;
      return sql`${withSql}insert into ${table} ${insertOrder} ${overridingSql}${valuesSql}${onConflictSql}${returningSql}`;
    }
    buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
      const concurrentlySql = concurrently ? sql` concurrently` : undefined;
      const withNoDataSql = withNoData ? sql` with no data` : undefined;
      return sql`refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
    }
    prepareTyping(encoder) {
      if (is(encoder, PgJsonb) || is(encoder, PgJson)) {
        return "json";
      } else if (is(encoder, PgNumeric)) {
        return "decimal";
      } else if (is(encoder, PgTime)) {
        return "time";
      } else if (is(encoder, PgTimestamp) || is(encoder, PgTimestampString)) {
        return "timestamp";
      } else if (is(encoder, PgDate) || is(encoder, PgDateString)) {
        return "date";
      } else if (is(encoder, PgUUID)) {
        return "uuid";
      } else {
        return "none";
      }
    }
    sqlToQuery(sql22, invokeSource) {
      return sql22.toQuery({
        casing: this.casing,
        escapeName: this.escapeName,
        escapeParam: this.escapeParam,
        escapeString: this.escapeString,
        prepareTyping: this.prepareTyping,
        invokeSource
      });
    }
    buildRelationalQueryWithoutPK({
      fullSchema,
      schema,
      tableNamesMap,
      table,
      tableConfig,
      queryConfig: config,
      tableAlias,
      nestedQueryRelation,
      joinOn
    }) {
      let selection = [];
      let limit, offset, orderBy = [], where;
      const joins = [];
      if (config === true) {
        const selectionEntries = Object.entries(tableConfig.columns);
        selection = selectionEntries.map(([key, value]) => ({
          dbKey: value.name,
          tsKey: key,
          field: aliasedTableColumn(value, tableAlias),
          relationTableTsKey: undefined,
          isJson: false,
          selection: []
        }));
      } else {
        const aliasedColumns = Object.fromEntries(Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]));
        if (config.where) {
          const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
          where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
        }
        const fieldsSelection = [];
        let selectedColumns = [];
        if (config.columns) {
          let isIncludeMode = false;
          for (const [field, value] of Object.entries(config.columns)) {
            if (value === undefined) {
              continue;
            }
            if (field in tableConfig.columns) {
              if (!isIncludeMode && value === true) {
                isIncludeMode = true;
              }
              selectedColumns.push(field);
            }
          }
          if (selectedColumns.length > 0) {
            selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
          }
        } else {
          selectedColumns = Object.keys(tableConfig.columns);
        }
        for (const field of selectedColumns) {
          const column = tableConfig.columns[field];
          fieldsSelection.push({ tsKey: field, value: column });
        }
        let selectedRelations = [];
        if (config.with) {
          selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
        }
        let extras;
        if (config.extras) {
          extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
          for (const [tsKey, value] of Object.entries(extras)) {
            fieldsSelection.push({
              tsKey,
              value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
            });
          }
        }
        for (const { tsKey, value } of fieldsSelection) {
          selection.push({
            dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
            tsKey,
            field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
            relationTableTsKey: undefined,
            isJson: false,
            selection: []
          });
        }
        let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
        if (!Array.isArray(orderByOrig)) {
          orderByOrig = [orderByOrig];
        }
        orderBy = orderByOrig.map((orderByValue) => {
          if (is(orderByValue, Column)) {
            return aliasedTableColumn(orderByValue, tableAlias);
          }
          return mapColumnsInSQLToAlias(orderByValue, tableAlias);
        });
        limit = config.limit;
        offset = config.offset;
        for (const {
          tsKey: selectedRelationTsKey,
          queryConfig: selectedRelationConfigValue,
          relation
        } of selectedRelations) {
          const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
          const relationTableName = getTableUniqueName(relation.referencedTable);
          const relationTableTsName = tableNamesMap[relationTableName];
          const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
          const joinOn2 = and(...normalizedRelation.fields.map((field2, i) => eq(aliasedTableColumn(normalizedRelation.references[i], relationTableAlias), aliasedTableColumn(field2, tableAlias))));
          const builtRelation = this.buildRelationalQueryWithoutPK({
            fullSchema,
            schema,
            tableNamesMap,
            table: fullSchema[relationTableTsName],
            tableConfig: schema[relationTableTsName],
            queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
            tableAlias: relationTableAlias,
            joinOn: joinOn2,
            nestedQueryRelation: relation
          });
          const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
          joins.push({
            on: sql`true`,
            table: new Subquery(builtRelation.sql, {}, relationTableAlias),
            alias: relationTableAlias,
            joinType: "left",
            lateral: true
          });
          selection.push({
            dbKey: selectedRelationTsKey,
            tsKey: selectedRelationTsKey,
            field,
            relationTableTsKey: relationTableTsName,
            isJson: true,
            selection: builtRelation.selection
          });
        }
      }
      if (selection.length === 0) {
        throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
      }
      let result;
      where = and(joinOn, where);
      if (nestedQueryRelation) {
        let field = sql`json_build_array(${sql.join(selection.map(({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2), sql`, `)})`;
        if (is(nestedQueryRelation, Many)) {
          field = sql`coalesce(json_agg(${field}${orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : undefined}), '[]'::json)`;
        }
        const nestedSelection = [{
          dbKey: "data",
          tsKey: "data",
          field: field.as("data"),
          isJson: true,
          relationTableTsKey: tableConfig.tsName,
          selection
        }];
        const needsSubquery = limit !== undefined || offset !== undefined || orderBy.length > 0;
        if (needsSubquery) {
          result = this.buildSelectQuery({
            table: aliasedTable(table, tableAlias),
            fields: {},
            fieldsFlat: [{
              path: [],
              field: sql.raw("*")
            }],
            where,
            limit,
            offset,
            orderBy,
            setOperators: []
          });
          where = undefined;
          limit = undefined;
          offset = undefined;
          orderBy = [];
        } else {
          result = aliasedTable(table, tableAlias);
        }
        result = this.buildSelectQuery({
          table: is(result, PgTable) ? result : new Subquery(result, {}, tableAlias),
          fields: {},
          fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
            path: [],
            field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
          })),
          joins,
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
      } else {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: selection.map(({ field }) => ({
            path: [],
            field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
          })),
          joins,
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
      }
      return {
        tableTsKey: tableConfig.tsName,
        sql: result,
        selection
      };
    }
  };
});

// ../../node_modules/drizzle-orm/query-builders/query-builder.js
var TypedQueryBuilder;
var init_query_builder = __esm(() => {
  init_entity();
  TypedQueryBuilder = class TypedQueryBuilder {
    static [entityKind] = "TypedQueryBuilder";
    getSelectedFields() {
      return this._.selectedFields;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/select.js
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select2) => ({
      type,
      isAll,
      rightSelect: select2
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
var PgSelectBuilder, PgSelectQueryBuilderBase, PgSelectBase, getPgSetOperators = () => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
}), union, unionAll, intersect, intersectAll, except, exceptAll;
var init_select2 = __esm(() => {
  init_entity();
  init_view_base();
  init_query_builder();
  init_query_promise();
  init_selection_proxy();
  init_sql();
  init_subquery();
  init_table();
  init_tracing();
  init_utils();
  init_utils();
  init_view_common();
  init_utils3();
  PgSelectBuilder = class PgSelectBuilder {
    static [entityKind] = "PgSelectBuilder";
    fields;
    session;
    dialect;
    withList = [];
    distinct;
    constructor(config) {
      this.fields = config.fields;
      this.session = config.session;
      this.dialect = config.dialect;
      if (config.withList) {
        this.withList = config.withList;
      }
      this.distinct = config.distinct;
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    from(source) {
      const isPartialSelect = !!this.fields;
      const src = source;
      let fields;
      if (this.fields) {
        fields = this.fields;
      } else if (is(src, Subquery)) {
        fields = Object.fromEntries(Object.keys(src._.selectedFields).map((key) => [key, src[key]]));
      } else if (is(src, PgViewBase)) {
        fields = src[ViewBaseConfig].selectedFields;
      } else if (is(src, SQL)) {
        fields = {};
      } else {
        fields = getTableColumns(src);
      }
      return new PgSelectBase({
        table: src,
        fields,
        isPartialSelect,
        session: this.session,
        dialect: this.dialect,
        withList: this.withList,
        distinct: this.distinct
      }).setToken(this.authToken);
    }
  };
  PgSelectQueryBuilderBase = class PgSelectQueryBuilderBase extends TypedQueryBuilder {
    static [entityKind] = "PgSelectQueryBuilder";
    _;
    config;
    joinsNotNullableMap;
    tableName;
    isPartialSelect;
    session;
    dialect;
    cacheConfig = undefined;
    usedTables = /* @__PURE__ */ new Set;
    constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
      super();
      this.config = {
        withList,
        table,
        fields: { ...fields },
        distinct,
        setOperators: []
      };
      this.isPartialSelect = isPartialSelect;
      this.session = session;
      this.dialect = dialect;
      this._ = {
        selectedFields: fields,
        config: this.config
      };
      this.tableName = getTableLikeName(table);
      this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
      for (const item of extractUsedTable(table))
        this.usedTables.add(item);
    }
    getUsedTables() {
      return [...this.usedTables];
    }
    createJoin(joinType, lateral) {
      return (table, on) => {
        const baseTableName = this.tableName;
        const tableName = getTableLikeName(table);
        for (const item of extractUsedTable(table))
          this.usedTables.add(item);
        if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
          throw new Error(`Alias "${tableName}" is already used in this query`);
        }
        if (!this.isPartialSelect) {
          if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
            this.config.fields = {
              [baseTableName]: this.config.fields
            };
          }
          if (typeof tableName === "string" && !is(table, SQL)) {
            const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
            this.config.fields[tableName] = selection;
          }
        }
        if (typeof on === "function") {
          on = on(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
        }
        if (!this.config.joins) {
          this.config.joins = [];
        }
        this.config.joins.push({ on, table, joinType, alias: tableName, lateral });
        if (typeof tableName === "string") {
          switch (joinType) {
            case "left": {
              this.joinsNotNullableMap[tableName] = false;
              break;
            }
            case "right": {
              this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
              this.joinsNotNullableMap[tableName] = true;
              break;
            }
            case "cross":
            case "inner": {
              this.joinsNotNullableMap[tableName] = true;
              break;
            }
            case "full": {
              this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
              this.joinsNotNullableMap[tableName] = false;
              break;
            }
          }
        }
        return this;
      };
    }
    leftJoin = this.createJoin("left", false);
    leftJoinLateral = this.createJoin("left", true);
    rightJoin = this.createJoin("right", false);
    innerJoin = this.createJoin("inner", false);
    innerJoinLateral = this.createJoin("inner", true);
    fullJoin = this.createJoin("full", false);
    crossJoin = this.createJoin("cross", false);
    crossJoinLateral = this.createJoin("cross", true);
    createSetOperator(type, isAll) {
      return (rightSelection) => {
        const rightSelect = typeof rightSelection === "function" ? rightSelection(getPgSetOperators()) : rightSelection;
        if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
          throw new Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
        }
        this.config.setOperators.push({ type, isAll, rightSelect });
        return this;
      };
    }
    union = this.createSetOperator("union", false);
    unionAll = this.createSetOperator("union", true);
    intersect = this.createSetOperator("intersect", false);
    intersectAll = this.createSetOperator("intersect", true);
    except = this.createSetOperator("except", false);
    exceptAll = this.createSetOperator("except", true);
    addSetOperators(setOperators) {
      this.config.setOperators.push(...setOperators);
      return this;
    }
    where(where) {
      if (typeof where === "function") {
        where = where(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
      }
      this.config.where = where;
      return this;
    }
    having(having) {
      if (typeof having === "function") {
        having = having(new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
      }
      this.config.having = having;
      return this;
    }
    groupBy(...columns) {
      if (typeof columns[0] === "function") {
        const groupBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })));
        this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
      } else {
        this.config.groupBy = columns;
      }
      return this;
    }
    orderBy(...columns) {
      if (typeof columns[0] === "function") {
        const orderBy = columns[0](new Proxy(this.config.fields, new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })));
        const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).orderBy = orderByArray;
        } else {
          this.config.orderBy = orderByArray;
        }
      } else {
        const orderByArray = columns;
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).orderBy = orderByArray;
        } else {
          this.config.orderBy = orderByArray;
        }
      }
      return this;
    }
    limit(limit) {
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).limit = limit;
      } else {
        this.config.limit = limit;
      }
      return this;
    }
    offset(offset) {
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).offset = offset;
      } else {
        this.config.offset = offset;
      }
      return this;
    }
    for(strength, config = {}) {
      this.config.lockingClause = { strength, config };
      return this;
    }
    getSQL() {
      return this.dialect.buildSelectQuery(this.config);
    }
    toSQL() {
      const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
      return rest;
    }
    as(alias) {
      const usedTables = [];
      usedTables.push(...extractUsedTable(this.config.table));
      if (this.config.joins) {
        for (const it of this.config.joins)
          usedTables.push(...extractUsedTable(it.table));
      }
      return new Proxy(new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]), new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
    }
    getSelectedFields() {
      return new Proxy(this.config.fields, new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
    }
    $dynamic() {
      return this;
    }
    $withCache(config) {
      this.cacheConfig = config === undefined ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
      return this;
    }
  };
  PgSelectBase = class PgSelectBase extends PgSelectQueryBuilderBase {
    static [entityKind] = "PgSelect";
    _prepare(name) {
      const { session, config, dialect, joinsNotNullableMap, authToken, cacheConfig, usedTables } = this;
      if (!session) {
        throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
      }
      const { fields } = config;
      return tracer.startActiveSpan("drizzle.prepareQuery", () => {
        const fieldsList = orderSelectedFields(fields);
        const query = session.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name, true, undefined, {
          type: "select",
          tables: [...usedTables]
        }, cacheConfig);
        query.joinsNotNullableMap = joinsNotNullableMap;
        return query.setToken(authToken);
      });
    }
    prepare(name) {
      return this._prepare(name);
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute = (placeholderValues) => {
      return tracer.startActiveSpan("drizzle.operation", () => {
        return this._prepare().execute(placeholderValues, this.authToken);
      });
    };
  };
  applyMixins(PgSelectBase, [QueryPromise]);
  union = createSetOperator("union", false);
  unionAll = createSetOperator("union", true);
  intersect = createSetOperator("intersect", false);
  intersectAll = createSetOperator("intersect", true);
  except = createSetOperator("except", false);
  exceptAll = createSetOperator("except", true);
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/query-builder.js
var QueryBuilder;
var init_query_builder2 = __esm(() => {
  init_entity();
  init_dialect();
  init_selection_proxy();
  init_subquery();
  init_select2();
  QueryBuilder = class QueryBuilder {
    static [entityKind] = "PgQueryBuilder";
    dialect;
    dialectConfig;
    constructor(dialect) {
      this.dialect = is(dialect, PgDialect) ? dialect : undefined;
      this.dialectConfig = is(dialect, PgDialect) ? undefined : dialect;
    }
    $with = (alias, selection) => {
      const queryBuilder = this;
      const as = (qb) => {
        if (typeof qb === "function") {
          qb = qb(queryBuilder);
        }
        return new Proxy(new WithSubquery(qb.getSQL(), selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}), alias, true), new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
      };
      return { as };
    };
    with(...queries) {
      const self = this;
      function select2(fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: undefined,
          dialect: self.getDialect(),
          withList: queries
        });
      }
      function selectDistinct(fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: undefined,
          dialect: self.getDialect(),
          distinct: true
        });
      }
      function selectDistinctOn(on, fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: undefined,
          dialect: self.getDialect(),
          distinct: { on }
        });
      }
      return { select: select2, selectDistinct, selectDistinctOn };
    }
    select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: undefined,
        dialect: this.getDialect()
      });
    }
    selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: undefined,
        dialect: this.getDialect(),
        distinct: true
      });
    }
    selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: undefined,
        dialect: this.getDialect(),
        distinct: { on }
      });
    }
    getDialect() {
      if (!this.dialect) {
        this.dialect = new PgDialect(this.dialectConfig);
      }
      return this.dialect;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/view.js
var PgMaterializedViewConfig;
var init_view = __esm(() => {
  PgMaterializedViewConfig = Symbol.for("drizzle:PgMaterializedViewConfig");
});

// ../../node_modules/drizzle-orm/pg-core/utils.js
function getTableConfig(table) {
  const columns = Object.values(table[Table.Symbol.Columns]);
  const indexes = [];
  const checks = [];
  const primaryKeys = [];
  const foreignKeys = Object.values(table[PgTable.Symbol.InlineForeignKeys]);
  const uniqueConstraints = [];
  const name = table[Table.Symbol.Name];
  const schema = table[Table.Symbol.Schema];
  const policies = [];
  const enableRLS = table[PgTable.Symbol.EnableRLS];
  const extraConfigBuilder = table[PgTable.Symbol.ExtraConfigBuilder];
  if (extraConfigBuilder !== undefined) {
    const extraConfig = extraConfigBuilder(table[Table.Symbol.ExtraConfigColumns]);
    const extraValues = Array.isArray(extraConfig) ? extraConfig.flat(1) : Object.values(extraConfig);
    for (const builder of extraValues) {
      if (is(builder, IndexBuilder)) {
        indexes.push(builder.build(table));
      } else if (is(builder, CheckBuilder)) {
        checks.push(builder.build(table));
      } else if (is(builder, UniqueConstraintBuilder)) {
        uniqueConstraints.push(builder.build(table));
      } else if (is(builder, PrimaryKeyBuilder)) {
        primaryKeys.push(builder.build(table));
      } else if (is(builder, ForeignKeyBuilder)) {
        foreignKeys.push(builder.build(table));
      } else if (is(builder, PgPolicy)) {
        policies.push(builder);
      }
    }
  }
  return {
    columns,
    indexes,
    foreignKeys,
    checks,
    primaryKeys,
    uniqueConstraints,
    name,
    schema,
    policies,
    enableRLS
  };
}
function extractUsedTable(table) {
  if (is(table, PgTable)) {
    return [table[Schema] ? `${table[Schema]}.${table[Table.Symbol.BaseName]}` : table[Table.Symbol.BaseName]];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}
var init_utils3 = __esm(() => {
  init_entity();
  init_table2();
  init_sql();
  init_subquery();
  init_table();
  init_checks();
  init_foreign_keys();
  init_indexes();
  init_policies();
  init_primary_keys();
  init_unique_constraint();
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/delete.js
var PgDeleteBase;
var init_delete = __esm(() => {
  init_entity();
  init_query_promise();
  init_selection_proxy();
  init_table();
  init_tracing();
  init_utils();
  init_utils3();
  PgDeleteBase = class PgDeleteBase extends QueryPromise {
    constructor(table, session, dialect, withList) {
      super();
      this.session = session;
      this.dialect = dialect;
      this.config = { table, withList };
    }
    static [entityKind] = "PgDelete";
    config;
    cacheConfig;
    where(where) {
      this.config.where = where;
      return this;
    }
    returning(fields = this.config.table[Table.Symbol.Columns]) {
      this.config.returningFields = fields;
      this.config.returning = orderSelectedFields(fields);
      return this;
    }
    getSQL() {
      return this.dialect.buildDeleteQuery(this.config);
    }
    toSQL() {
      const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
      return rest;
    }
    _prepare(name) {
      return tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, undefined, {
          type: "delete",
          tables: extractUsedTable(this.config.table)
        }, this.cacheConfig);
      });
    }
    prepare(name) {
      return this._prepare(name);
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute = (placeholderValues) => {
      return tracer.startActiveSpan("drizzle.operation", () => {
        return this._prepare().execute(placeholderValues, this.authToken);
      });
    };
    getSelectedFields() {
      return this.config.returningFields ? new Proxy(this.config.returningFields, new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })) : undefined;
    }
    $dynamic() {
      return this;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/insert.js
var PgInsertBuilder, PgInsertBase;
var init_insert = __esm(() => {
  init_entity();
  init_query_promise();
  init_selection_proxy();
  init_sql();
  init_table();
  init_tracing();
  init_utils();
  init_utils3();
  init_query_builder2();
  PgInsertBuilder = class PgInsertBuilder {
    constructor(table, session, dialect, withList, overridingSystemValue_) {
      this.table = table;
      this.session = session;
      this.dialect = dialect;
      this.withList = withList;
      this.overridingSystemValue_ = overridingSystemValue_;
    }
    static [entityKind] = "PgInsertBuilder";
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    overridingSystemValue() {
      this.overridingSystemValue_ = true;
      return this;
    }
    values(values) {
      values = Array.isArray(values) ? values : [values];
      if (values.length === 0) {
        throw new Error("values() must be called with at least one value");
      }
      const mappedValues = values.map((entry) => {
        const result = {};
        const cols = this.table[Table.Symbol.Columns];
        for (const colKey of Object.keys(entry)) {
          const colValue = entry[colKey];
          result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
        }
        return result;
      });
      return new PgInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList, false, this.overridingSystemValue_).setToken(this.authToken);
    }
    select(selectQuery) {
      const select2 = typeof selectQuery === "function" ? selectQuery(new QueryBuilder) : selectQuery;
      if (!is(select2, SQL) && !haveSameKeys(this.table[Columns], select2._.selectedFields)) {
        throw new Error("Insert select error: selected fields are not the same or are in a different order compared to the table definition");
      }
      return new PgInsertBase(this.table, select2, this.session, this.dialect, this.withList, true);
    }
  };
  PgInsertBase = class PgInsertBase extends QueryPromise {
    constructor(table, values, session, dialect, withList, select2, overridingSystemValue_) {
      super();
      this.session = session;
      this.dialect = dialect;
      this.config = { table, values, withList, select: select2, overridingSystemValue_ };
    }
    static [entityKind] = "PgInsert";
    config;
    cacheConfig;
    returning(fields = this.config.table[Table.Symbol.Columns]) {
      this.config.returningFields = fields;
      this.config.returning = orderSelectedFields(fields);
      return this;
    }
    onConflictDoNothing(config = {}) {
      if (config.target === undefined) {
        this.config.onConflict = sql`do nothing`;
      } else {
        let targetColumn = "";
        targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
        const whereSql = config.where ? sql` where ${config.where}` : undefined;
        this.config.onConflict = sql`(${sql.raw(targetColumn)})${whereSql} do nothing`;
      }
      return this;
    }
    onConflictDoUpdate(config) {
      if (config.where && (config.targetWhere || config.setWhere)) {
        throw new Error('You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.');
      }
      const whereSql = config.where ? sql` where ${config.where}` : undefined;
      const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : undefined;
      const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : undefined;
      const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
      let targetColumn = "";
      targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
      this.config.onConflict = sql`(${sql.raw(targetColumn)})${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`;
      return this;
    }
    getSQL() {
      return this.dialect.buildInsertQuery(this.config);
    }
    toSQL() {
      const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
      return rest;
    }
    _prepare(name) {
      return tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, undefined, {
          type: "insert",
          tables: extractUsedTable(this.config.table)
        }, this.cacheConfig);
      });
    }
    prepare(name) {
      return this._prepare(name);
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute = (placeholderValues) => {
      return tracer.startActiveSpan("drizzle.operation", () => {
        return this._prepare().execute(placeholderValues, this.authToken);
      });
    };
    getSelectedFields() {
      return this.config.returningFields ? new Proxy(this.config.returningFields, new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })) : undefined;
    }
    $dynamic() {
      return this;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/refresh-materialized-view.js
var PgRefreshMaterializedView;
var init_refresh_materialized_view = __esm(() => {
  init_entity();
  init_query_promise();
  init_tracing();
  PgRefreshMaterializedView = class PgRefreshMaterializedView extends QueryPromise {
    constructor(view, session, dialect) {
      super();
      this.session = session;
      this.dialect = dialect;
      this.config = { view };
    }
    static [entityKind] = "PgRefreshMaterializedView";
    config;
    concurrently() {
      if (this.config.withNoData !== undefined) {
        throw new Error("Cannot use concurrently and withNoData together");
      }
      this.config.concurrently = true;
      return this;
    }
    withNoData() {
      if (this.config.concurrently !== undefined) {
        throw new Error("Cannot use concurrently and withNoData together");
      }
      this.config.withNoData = true;
      return this;
    }
    getSQL() {
      return this.dialect.buildRefreshMaterializedViewQuery(this.config);
    }
    toSQL() {
      const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
      return rest;
    }
    _prepare(name) {
      return tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), undefined, name, true);
      });
    }
    prepare(name) {
      return this._prepare(name);
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute = (placeholderValues) => {
      return tracer.startActiveSpan("drizzle.operation", () => {
        return this._prepare().execute(placeholderValues, this.authToken);
      });
    };
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/update.js
var PgUpdateBuilder, PgUpdateBase;
var init_update = __esm(() => {
  init_entity();
  init_table2();
  init_query_promise();
  init_selection_proxy();
  init_sql();
  init_subquery();
  init_table();
  init_utils();
  init_view_common();
  init_utils3();
  PgUpdateBuilder = class PgUpdateBuilder {
    constructor(table, session, dialect, withList) {
      this.table = table;
      this.session = session;
      this.dialect = dialect;
      this.withList = withList;
    }
    static [entityKind] = "PgUpdateBuilder";
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    set(values) {
      return new PgUpdateBase(this.table, mapUpdateSet(this.table, values), this.session, this.dialect, this.withList).setToken(this.authToken);
    }
  };
  PgUpdateBase = class PgUpdateBase extends QueryPromise {
    constructor(table, set, session, dialect, withList) {
      super();
      this.session = session;
      this.dialect = dialect;
      this.config = { set, table, withList, joins: [] };
      this.tableName = getTableLikeName(table);
      this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
    }
    static [entityKind] = "PgUpdate";
    config;
    tableName;
    joinsNotNullableMap;
    cacheConfig;
    from(source) {
      const src = source;
      const tableName = getTableLikeName(src);
      if (typeof tableName === "string") {
        this.joinsNotNullableMap[tableName] = true;
      }
      this.config.from = src;
      return this;
    }
    getTableLikeFields(table) {
      if (is(table, PgTable)) {
        return table[Table.Symbol.Columns];
      } else if (is(table, Subquery)) {
        return table._.selectedFields;
      }
      return table[ViewBaseConfig].selectedFields;
    }
    createJoin(joinType) {
      return (table, on) => {
        const tableName = getTableLikeName(table);
        if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
          throw new Error(`Alias "${tableName}" is already used in this query`);
        }
        if (typeof on === "function") {
          const from = this.config.from && !is(this.config.from, SQL) ? this.getTableLikeFields(this.config.from) : undefined;
          on = on(new Proxy(this.config.table[Table.Symbol.Columns], new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })), from && new Proxy(from, new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
        }
        this.config.joins.push({ on, table, joinType, alias: tableName });
        if (typeof tableName === "string") {
          switch (joinType) {
            case "left": {
              this.joinsNotNullableMap[tableName] = false;
              break;
            }
            case "right": {
              this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
              this.joinsNotNullableMap[tableName] = true;
              break;
            }
            case "inner": {
              this.joinsNotNullableMap[tableName] = true;
              break;
            }
            case "full": {
              this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false]));
              this.joinsNotNullableMap[tableName] = false;
              break;
            }
          }
        }
        return this;
      };
    }
    leftJoin = this.createJoin("left");
    rightJoin = this.createJoin("right");
    innerJoin = this.createJoin("inner");
    fullJoin = this.createJoin("full");
    where(where) {
      this.config.where = where;
      return this;
    }
    returning(fields) {
      if (!fields) {
        fields = Object.assign({}, this.config.table[Table.Symbol.Columns]);
        if (this.config.from) {
          const tableName = getTableLikeName(this.config.from);
          if (typeof tableName === "string" && this.config.from && !is(this.config.from, SQL)) {
            const fromFields = this.getTableLikeFields(this.config.from);
            fields[tableName] = fromFields;
          }
          for (const join of this.config.joins) {
            const tableName2 = getTableLikeName(join.table);
            if (typeof tableName2 === "string" && !is(join.table, SQL)) {
              const fromFields = this.getTableLikeFields(join.table);
              fields[tableName2] = fromFields;
            }
          }
        }
      }
      this.config.returningFields = fields;
      this.config.returning = orderSelectedFields(fields);
      return this;
    }
    getSQL() {
      return this.dialect.buildUpdateQuery(this.config);
    }
    toSQL() {
      const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
      return rest;
    }
    _prepare(name) {
      const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, undefined, {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }, this.cacheConfig);
      query.joinsNotNullableMap = this.joinsNotNullableMap;
      return query;
    }
    prepare(name) {
      return this._prepare(name);
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute = (placeholderValues) => {
      return this._prepare().execute(placeholderValues, this.authToken);
    };
    getSelectedFields() {
      return this.config.returningFields ? new Proxy(this.config.returningFields, new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })) : undefined;
    }
    $dynamic() {
      return this;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/index.js
var init_query_builders = __esm(() => {
  init_delete();
  init_insert();
  init_query_builder2();
  init_refresh_materialized_view();
  init_select2();
  init_update();
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/count.js
var PgCountBuilder;
var init_count = __esm(() => {
  init_entity();
  init_sql();
  PgCountBuilder = class PgCountBuilder extends SQL {
    constructor(params) {
      super(PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
      this.params = params;
      this.mapWith(Number);
      this.session = params.session;
      this.sql = PgCountBuilder.buildCount(params.source, params.filters);
    }
    sql;
    token;
    static [entityKind] = "PgCountBuilder";
    [Symbol.toStringTag] = "PgCountBuilder";
    session;
    static buildEmbeddedCount(source, filters) {
      return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
    }
    static buildCount(source, filters) {
      return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
    }
    setToken(token) {
      this.token = token;
      return this;
    }
    then(onfulfilled, onrejected) {
      return Promise.resolve(this.session.count(this.sql, this.token)).then(onfulfilled, onrejected);
    }
    catch(onRejected) {
      return this.then(undefined, onRejected);
    }
    finally(onFinally) {
      return this.then((value) => {
        onFinally?.();
        return value;
      }, (reason) => {
        onFinally?.();
        throw reason;
      });
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/query.js
var RelationalQueryBuilder, PgRelationalQuery;
var init_query = __esm(() => {
  init_entity();
  init_query_promise();
  init_relations();
  init_tracing();
  RelationalQueryBuilder = class RelationalQueryBuilder {
    constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
      this.fullSchema = fullSchema;
      this.schema = schema;
      this.tableNamesMap = tableNamesMap;
      this.table = table;
      this.tableConfig = tableConfig;
      this.dialect = dialect;
      this.session = session;
    }
    static [entityKind] = "PgRelationalQueryBuilder";
    findMany(config) {
      return new PgRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? config : {}, "many");
    }
    findFirst(config) {
      return new PgRelationalQuery(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, config ? { ...config, limit: 1 } : { limit: 1 }, "first");
    }
  };
  PgRelationalQuery = class PgRelationalQuery extends QueryPromise {
    constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
      super();
      this.fullSchema = fullSchema;
      this.schema = schema;
      this.tableNamesMap = tableNamesMap;
      this.table = table;
      this.tableConfig = tableConfig;
      this.dialect = dialect;
      this.session = session;
      this.config = config;
      this.mode = mode;
    }
    static [entityKind] = "PgRelationalQuery";
    _prepare(name) {
      return tracer.startActiveSpan("drizzle.prepareQuery", () => {
        const { query, builtQuery } = this._toSQL();
        return this.session.prepareQuery(builtQuery, undefined, name, true, (rawRows, mapColumnValue) => {
          const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue));
          if (this.mode === "first") {
            return rows[0];
          }
          return rows;
        });
      });
    }
    prepare(name) {
      return this._prepare(name);
    }
    _getQuery() {
      return this.dialect.buildRelationalQueryWithoutPK({
        fullSchema: this.fullSchema,
        schema: this.schema,
        tableNamesMap: this.tableNamesMap,
        table: this.table,
        tableConfig: this.tableConfig,
        queryConfig: this.config,
        tableAlias: this.tableConfig.tsName
      });
    }
    getSQL() {
      return this._getQuery().sql;
    }
    _toSQL() {
      const query = this._getQuery();
      const builtQuery = this.dialect.sqlToQuery(query.sql);
      return { query, builtQuery };
    }
    toSQL() {
      return this._toSQL().builtQuery;
    }
    authToken;
    setToken(token) {
      this.authToken = token;
      return this;
    }
    execute() {
      return tracer.startActiveSpan("drizzle.operation", () => {
        return this._prepare().execute(undefined, this.authToken);
      });
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/query-builders/raw.js
var PgRaw;
var init_raw = __esm(() => {
  init_entity();
  init_query_promise();
  PgRaw = class PgRaw extends QueryPromise {
    constructor(execute, sql3, query, mapBatchResult) {
      super();
      this.execute = execute;
      this.sql = sql3;
      this.query = query;
      this.mapBatchResult = mapBatchResult;
    }
    static [entityKind] = "PgRaw";
    getSQL() {
      return this.sql;
    }
    getQuery() {
      return this.query;
    }
    mapResult(result, isFromBatch) {
      return isFromBatch ? this.mapBatchResult(result) : result;
    }
    _prepare() {
      return this;
    }
    isResponseInArrayMode() {
      return false;
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/db.js
var PgDatabase;
var init_db = __esm(() => {
  init_entity();
  init_query_builders();
  init_selection_proxy();
  init_sql();
  init_subquery();
  init_count();
  init_query();
  init_raw();
  init_refresh_materialized_view();
  PgDatabase = class PgDatabase {
    constructor(dialect, session, schema) {
      this.dialect = dialect;
      this.session = session;
      this._ = schema ? {
        schema: schema.schema,
        fullSchema: schema.fullSchema,
        tableNamesMap: schema.tableNamesMap,
        session
      } : {
        schema: undefined,
        fullSchema: {},
        tableNamesMap: {},
        session
      };
      this.query = {};
      if (this._.schema) {
        for (const [tableName, columns] of Object.entries(this._.schema)) {
          this.query[tableName] = new RelationalQueryBuilder(schema.fullSchema, this._.schema, this._.tableNamesMap, schema.fullSchema[tableName], columns, dialect, session);
        }
      }
      this.$cache = { invalidate: async (_params) => {} };
    }
    static [entityKind] = "PgDatabase";
    query;
    $with = (alias, selection) => {
      const self = this;
      const as = (qb) => {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder(self.dialect));
        }
        return new Proxy(new WithSubquery(qb.getSQL(), selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}), alias, true), new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
      };
      return { as };
    };
    $count(source, filters) {
      return new PgCountBuilder({ source, filters, session: this.session });
    }
    $cache;
    with(...queries) {
      const self = this;
      function select3(fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: self.session,
          dialect: self.dialect,
          withList: queries
        });
      }
      function selectDistinct(fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: self.session,
          dialect: self.dialect,
          withList: queries,
          distinct: true
        });
      }
      function selectDistinctOn(on, fields) {
        return new PgSelectBuilder({
          fields: fields ?? undefined,
          session: self.session,
          dialect: self.dialect,
          withList: queries,
          distinct: { on }
        });
      }
      function update2(table) {
        return new PgUpdateBuilder(table, self.session, self.dialect, queries);
      }
      function insert2(table) {
        return new PgInsertBuilder(table, self.session, self.dialect, queries);
      }
      function delete_(table) {
        return new PgDeleteBase(table, self.session, self.dialect, queries);
      }
      return { select: select3, selectDistinct, selectDistinctOn, update: update2, insert: insert2, delete: delete_ };
    }
    select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: this.session,
        dialect: this.dialect
      });
    }
    selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: this.session,
        dialect: this.dialect,
        distinct: true
      });
    }
    selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? undefined,
        session: this.session,
        dialect: this.dialect,
        distinct: { on }
      });
    }
    update(table) {
      return new PgUpdateBuilder(table, this.session, this.dialect);
    }
    insert(table) {
      return new PgInsertBuilder(table, this.session, this.dialect);
    }
    delete(table) {
      return new PgDeleteBase(table, this.session, this.dialect);
    }
    refreshMaterializedView(view) {
      return new PgRefreshMaterializedView(view, this.session, this.dialect);
    }
    authToken;
    execute(query) {
      const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
      const builtQuery = this.dialect.sqlToQuery(sequel);
      const prepared = this.session.prepareQuery(builtQuery, undefined, undefined, false);
      return new PgRaw(() => prepared.execute(undefined, this.authToken), sequel, builtQuery, (result) => prepared.mapResult(result, true));
    }
    transaction(transaction, config) {
      return this.session.transaction(transaction, config);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/alias.js
var init_alias2 = () => {};

// ../../node_modules/drizzle-orm/pg-core/roles.js
var init_roles = () => {};

// ../../node_modules/drizzle-orm/pg-core/sequence.js
var init_sequence = () => {};

// ../../node_modules/drizzle-orm/pg-core/schema.js
var init_schema = () => {};

// ../../node_modules/drizzle-orm/cache/core/cache.js
async function hashQuery(sql3, params) {
  const dataToHash = `${sql3}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder;
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
var Cache, NoopCache;
var init_cache = __esm(() => {
  init_entity();
  Cache = class Cache {
    static [entityKind] = "Cache";
  };
  NoopCache = class NoopCache extends Cache {
    strategy() {
      return "all";
    }
    static [entityKind] = "NoopCache";
    async get(_key) {
      return;
    }
    async put(_hashedQuery, _response, _tables, _config) {}
    async onMutate(_params) {}
  };
});

// ../../node_modules/drizzle-orm/pg-core/session.js
var PgPreparedQuery, PgSession, PgTransaction;
var init_session = __esm(() => {
  init_cache();
  init_entity();
  init_errors();
  init_sql2();
  init_tracing();
  init_db();
  PgPreparedQuery = class PgPreparedQuery {
    constructor(query, cache, queryMetadata, cacheConfig) {
      this.query = query;
      this.cache = cache;
      this.queryMetadata = queryMetadata;
      this.cacheConfig = cacheConfig;
      if (cache && cache.strategy() === "all" && cacheConfig === undefined) {
        this.cacheConfig = { enable: true, autoInvalidate: true };
      }
      if (!this.cacheConfig?.enable) {
        this.cacheConfig = undefined;
      }
    }
    authToken;
    getQuery() {
      return this.query;
    }
    mapResult(response, _isFromBatch) {
      return response;
    }
    setToken(token) {
      this.authToken = token;
      return this;
    }
    static [entityKind] = "PgPreparedQuery";
    joinsNotNullableMap;
    async queryWithCache(queryString, params, query) {
      if (this.cache === undefined || is(this.cache, NoopCache) || this.queryMetadata === undefined) {
        try {
          return await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
      }
      if (this.cacheConfig && !this.cacheConfig.enable) {
        try {
          return await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
      }
      if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
        try {
          const [res] = await Promise.all([
            query(),
            this.cache.onMutate({ tables: this.queryMetadata.tables })
          ]);
          return res;
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
      }
      if (!this.cacheConfig) {
        try {
          return await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
      }
      if (this.queryMetadata.type === "select") {
        const fromCache = await this.cache.get(this.cacheConfig.tag ?? await hashQuery(queryString, params), this.queryMetadata.tables, this.cacheConfig.tag !== undefined, this.cacheConfig.autoInvalidate);
        if (fromCache === undefined) {
          let result;
          try {
            result = await query();
          } catch (e) {
            throw new DrizzleQueryError(queryString, params, e);
          }
          await this.cache.put(this.cacheConfig.tag ?? await hashQuery(queryString, params), result, this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [], this.cacheConfig.tag !== undefined, this.cacheConfig.config);
          return result;
        }
        return fromCache;
      }
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
  };
  PgSession = class PgSession {
    constructor(dialect) {
      this.dialect = dialect;
    }
    static [entityKind] = "PgSession";
    execute(query, token) {
      return tracer.startActiveSpan("drizzle.operation", () => {
        const prepared = tracer.startActiveSpan("drizzle.prepareQuery", () => {
          return this.prepareQuery(this.dialect.sqlToQuery(query), undefined, undefined, false);
        });
        return prepared.setToken(token).execute(undefined, token);
      });
    }
    all(query) {
      return this.prepareQuery(this.dialect.sqlToQuery(query), undefined, undefined, false).all();
    }
    async count(sql22, token) {
      const res = await this.execute(sql22, token);
      return Number(res[0]["count"]);
    }
  };
  PgTransaction = class PgTransaction extends PgDatabase {
    constructor(dialect, session, schema, nestedIndex = 0) {
      super(dialect, session, schema);
      this.schema = schema;
      this.nestedIndex = nestedIndex;
    }
    static [entityKind] = "PgTransaction";
    rollback() {
      throw new TransactionRollbackError;
    }
    getTransactionConfigSQL(config) {
      const chunks = [];
      if (config.isolationLevel) {
        chunks.push(`isolation level ${config.isolationLevel}`);
      }
      if (config.accessMode) {
        chunks.push(config.accessMode);
      }
      if (typeof config.deferrable === "boolean") {
        chunks.push(config.deferrable ? "deferrable" : "not deferrable");
      }
      return sql.raw(chunks.join(" "));
    }
    setTransaction(config) {
      return this.session.execute(sql`set transaction ${this.getTransactionConfigSQL(config)}`);
    }
  };
});

// ../../node_modules/drizzle-orm/pg-core/utils/index.js
var init_utils4 = __esm(() => {
  init_array();
});

// ../../node_modules/drizzle-orm/pg-core/index.js
var init_pg_core = __esm(() => {
  init_alias2();
  init_checks();
  init_columns();
  init_db();
  init_dialect();
  init_foreign_keys();
  init_indexes();
  init_policies();
  init_primary_keys();
  init_query_builders();
  init_roles();
  init_schema();
  init_sequence();
  init_session();
  init_table2();
  init_unique_constraint();
  init_utils3();
  init_utils4();
  init_view_common2();
  init_view();
});

// ../../node_modules/drizzle-orm/index.js
var init_drizzle_orm = __esm(() => {
  init_alias();
  init_column_builder();
  init_column();
  init_entity();
  init_errors();
  init_logger();
  init_query_promise();
  init_relations();
  init_sql2();
  init_subquery();
  init_table();
  init_utils();
  init_view_common();
});

// src/schema/agent.ts
var agentTable;
var init_agent = __esm(() => {
  init_drizzle_orm();
  init_pg_core();
  agentTable = pgTable("agents", {
    id: uuid("id").primaryKey().defaultRandom(),
    enabled: boolean("enabled").default(true).notNull(),
    server_id: uuid("server_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
    name: text("name").notNull(),
    username: text("username"),
    system: text("system").default(""),
    bio: jsonb("bio").$type().default(sql`'[]'::jsonb`),
    messageExamples: jsonb("message_examples").$type().default(sql`'[]'::jsonb`).notNull(),
    postExamples: jsonb("post_examples").$type().default(sql`'[]'::jsonb`).notNull(),
    topics: jsonb("topics").$type().default(sql`'[]'::jsonb`).notNull(),
    adjectives: jsonb("adjectives").$type().default(sql`'[]'::jsonb`).notNull(),
    knowledge: jsonb("knowledge").$type().default(sql`'[]'::jsonb`).notNull(),
    plugins: jsonb("plugins").$type().default(sql`'[]'::jsonb`).notNull(),
    settings: jsonb("settings").$type().default(sql`'{}'::jsonb`).notNull(),
    style: jsonb("style").$type().default(sql`'{}'::jsonb`).notNull()
  });
});

// src/schema/server.ts
var serverTable;
var init_server = __esm(() => {
  init_drizzle_orm();
  init_pg_core();
  serverTable = pgTable("servers", {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull()
  });
});

// src/types.ts
function getDb(adapter) {
  return adapter.db;
}
function getRow(result, index2 = 0) {
  return result.rows[index2];
}

// src/runtime-migrator/storage/migration-tracker.ts
class MigrationTracker {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async ensureSchema() {
    await this.db.execute(sql`CREATE SCHEMA IF NOT EXISTS migrations`);
  }
  async ensureTables() {
    await this.ensureSchema();
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS migrations._migrations (
        id SERIAL PRIMARY KEY,
        plugin_name TEXT NOT NULL,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      )
    `);
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS migrations._journal (
        plugin_name TEXT PRIMARY KEY,
        version TEXT NOT NULL,
        dialect TEXT NOT NULL DEFAULT 'postgresql',
        entries JSONB NOT NULL DEFAULT '[]'
      )
    `);
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS migrations._snapshots (
        id SERIAL PRIMARY KEY,
        plugin_name TEXT NOT NULL,
        idx INTEGER NOT NULL,
        snapshot JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(plugin_name, idx)
      )
    `);
  }
  async getLastMigration(pluginName) {
    const result = await this.db.execute(sql`SELECT id, hash, created_at
          FROM migrations._migrations
          WHERE plugin_name = ${pluginName}
          ORDER BY created_at DESC
          LIMIT 1`);
    return getRow(result) || null;
  }
  async recordMigration(pluginName, hash, createdAt) {
    await this.db.execute(sql`INSERT INTO migrations._migrations (plugin_name, hash, created_at) 
          VALUES (${pluginName}, ${hash}, ${createdAt})`);
  }
}
var init_migration_tracker = __esm(() => {
  init_drizzle_orm();
});

// src/runtime-migrator/storage/journal-storage.ts
class JournalStorage {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async loadJournal(pluginName) {
    const result = await this.db.execute(sql`SELECT version, dialect, entries 
          FROM migrations._journal 
          WHERE plugin_name = ${pluginName}`);
    if (result.rows.length === 0) {
      return null;
    }
    const row = getRow(result);
    return {
      version: row.version,
      dialect: row.dialect,
      entries: row.entries
    };
  }
  async saveJournal(pluginName, journal) {
    await this.db.execute(sql`INSERT INTO migrations._journal (plugin_name, version, dialect, entries)
          VALUES (${pluginName}, ${journal.version}, ${journal.dialect}, ${JSON.stringify(journal.entries)}::jsonb)
          ON CONFLICT (plugin_name) 
          DO UPDATE SET 
            version = EXCLUDED.version,
            dialect = EXCLUDED.dialect,
            entries = EXCLUDED.entries`);
  }
  async addEntry(pluginName, entry) {
    let journal = await this.loadJournal(pluginName);
    if (!journal) {
      journal = {
        version: "7",
        dialect: "postgresql",
        entries: []
      };
    }
    journal.entries.push(entry);
    await this.saveJournal(pluginName, journal);
  }
  async getNextIdx(pluginName) {
    const journal = await this.loadJournal(pluginName);
    if (!journal || journal.entries.length === 0) {
      return 0;
    }
    const lastEntry = journal.entries[journal.entries.length - 1];
    return lastEntry.idx + 1;
  }
  async updateJournal(pluginName, idx, tag, breakpoints = true) {
    const entry = {
      idx,
      version: "7",
      when: Date.now(),
      tag,
      breakpoints
    };
    await this.addEntry(pluginName, entry);
  }
}
var init_journal_storage = __esm(() => {
  init_drizzle_orm();
});

// src/runtime-migrator/storage/snapshot-storage.ts
class SnapshotStorage {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async saveSnapshot(pluginName, idx, snapshot) {
    await this.db.execute(sql`INSERT INTO migrations._snapshots (plugin_name, idx, snapshot)
          VALUES (${pluginName}, ${idx}, ${JSON.stringify(snapshot)}::jsonb)
          ON CONFLICT (plugin_name, idx) 
          DO UPDATE SET 
            snapshot = EXCLUDED.snapshot,
            created_at = NOW()`);
  }
  async loadSnapshot(pluginName, idx) {
    const result = await this.db.execute(sql`SELECT snapshot 
          FROM migrations._snapshots 
          WHERE plugin_name = ${pluginName} AND idx = ${idx}`);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0].snapshot;
  }
  async getLatestSnapshot(pluginName) {
    const result = await this.db.execute(sql`SELECT snapshot 
          FROM migrations._snapshots 
          WHERE plugin_name = ${pluginName}
          ORDER BY idx DESC
          LIMIT 1`);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0].snapshot;
  }
  async getAllSnapshots(pluginName) {
    const result = await this.db.execute(sql`SELECT snapshot 
          FROM migrations._snapshots 
          WHERE plugin_name = ${pluginName}
          ORDER BY idx ASC`);
    return result.rows.map((row) => row.snapshot);
  }
}
var init_snapshot_storage = __esm(() => {
  init_drizzle_orm();
});

// src/runtime-migrator/extension-manager.ts
import { logger as logger9 } from "@elizaos/core";

class ExtensionManager {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async installRequiredExtensions(extensions) {
    for (const extension of extensions) {
      try {
        if (!/^[a-zA-Z0-9_-]+$/.test(extension)) {
          logger9.warn({ src: "plugin:sql", extension }, "Invalid extension name - contains invalid characters");
          continue;
        }
        await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS ${sql.identifier(extension)}`);
        logger9.debug({ src: "plugin:sql", extension }, "Extension installed");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger9.warn({ src: "plugin:sql", extension, error: errorMessage }, "Could not install extension");
      }
    }
  }
}
var init_extension_manager = __esm(() => {
  init_drizzle_orm();
});

// src/runtime-migrator/drizzle-adapters/snapshot-generator.ts
import { createHash } from "crypto";
function escapeSingleQuotes(str) {
  return str.replace(/'/g, "''");
}
function isPgArrayType(sqlType) {
  return sqlType.match(/.*\[\d*\].*|.*\[\].*/g) !== null;
}
function buildArrayString(array2, sqlType) {
  sqlType = sqlType.split("[")[0];
  const values = array2.map((value) => {
    if (typeof value === "number" || typeof value === "bigint") {
      return value.toString();
    } else if (typeof value === "boolean") {
      return value ? "true" : "false";
    } else if (Array.isArray(value)) {
      return buildArrayString(value, sqlType);
    } else if (value instanceof Date) {
      if (sqlType === "date") {
        return `"${value.toISOString().split("T")[0]}"`;
      } else if (sqlType === "timestamp") {
        return `"${value.toISOString().replace("T", " ").slice(0, 23)}"`;
      } else {
        return `"${value.toISOString()}"`;
      }
    } else if (typeof value === "object") {
      return `"${JSON.stringify(value).replaceAll('"', "\\\"")}"`;
    }
    return `"${value}"`;
  }).join(",");
  return `{${values}}`;
}
function extractTablesFromSchema(schema2) {
  const tables = [];
  const exports = Object.values(schema2);
  exports.forEach((t) => {
    if (is(t, PgTable)) {
      tables.push(t);
    }
  });
  return tables;
}
async function generateSnapshot(schema2) {
  const dialect2 = new PgDialect({ casing: undefined });
  const tables = {};
  const schemas = {};
  const enums = {};
  const pgTables = extractTablesFromSchema(schema2);
  for (const table3 of pgTables) {
    const config = getTableConfig(table3);
    const {
      name: tableName,
      columns: columns2,
      indexes: indexes2,
      foreignKeys,
      schema: tableSchema,
      primaryKeys,
      uniqueConstraints,
      checks: checks2
    } = config;
    const columnsObject = {};
    const indexesObject = {};
    const foreignKeysObject = {};
    const primaryKeysObject = {};
    const uniqueConstraintObject = {};
    const checksObject = {};
    columns2.forEach((column2) => {
      const name = column2.name;
      const notNull = column2.notNull;
      const primaryKey2 = column2.primary;
      const sqlType = column2.getSQLType();
      const sqlTypeLowered = sqlType.toLowerCase();
      const columnToSet = {
        name,
        type: sqlType,
        primaryKey: primaryKey2,
        notNull
      };
      if (column2.default !== undefined) {
        if (is(column2.default, SQL)) {
          columnToSet.default = sqlToStr(column2.default, undefined);
        } else {
          if (typeof column2.default === "string") {
            columnToSet.default = `'${escapeSingleQuotes(column2.default)}'`;
          } else {
            if (sqlTypeLowered === "jsonb" || sqlTypeLowered === "json") {
              columnToSet.default = `'${JSON.stringify(column2.default)}'::${sqlTypeLowered}`;
            } else if (column2.default instanceof Date) {
              if (sqlTypeLowered === "date") {
                columnToSet.default = `'${column2.default.toISOString().split("T")[0]}'`;
              } else if (sqlTypeLowered === "timestamp") {
                columnToSet.default = `'${column2.default.toISOString().replace("T", " ").slice(0, 23)}'`;
              } else {
                columnToSet.default = `'${column2.default.toISOString()}'`;
              }
            } else if (isPgArrayType(sqlTypeLowered) && Array.isArray(column2.default)) {
              columnToSet.default = `'${buildArrayString(column2.default, sqlTypeLowered)}'`;
            } else {
              columnToSet.default = column2.default;
            }
          }
        }
      }
      if (column2.isUnique && column2.config?.uniqueName) {
        uniqueConstraintObject[column2.config.uniqueName] = {
          name: column2.config.uniqueName,
          columns: [name],
          nullsNotDistinct: column2.config?.uniqueType === "not distinct"
        };
      }
      columnsObject[name] = columnToSet;
    });
    primaryKeys.forEach((pk) => {
      const columnNames = pk.columns.map((c) => c.name);
      const name = pk.getName();
      primaryKeysObject[name] = {
        name,
        columns: columnNames
      };
    });
    uniqueConstraints?.forEach((unq) => {
      const columnNames = unq.columns.map((c) => c.name);
      const name = unq.name || `${tableName}_${columnNames.join("_")}_unique`;
      uniqueConstraintObject[name] = {
        name,
        columns: columnNames,
        nullsNotDistinct: unq.nullsNotDistinct
      };
    });
    foreignKeys.forEach((fk) => {
      const reference = fk.reference();
      const columnsFrom = reference.columns.map((it) => it.name);
      const columnsTo = reference.foreignColumns.map((it) => it.name);
      const tableTo = getTableConfig(reference.foreignTable).name;
      const schemaTo = getTableConfig(reference.foreignTable).schema || "public";
      const name = fk.getName();
      foreignKeysObject[name] = {
        name,
        tableFrom: tableName,
        schemaFrom: tableSchema,
        tableTo,
        schemaTo,
        columnsFrom,
        columnsTo,
        onDelete: fk.onDelete || "no action",
        onUpdate: fk.onUpdate || "no action"
      };
    });
    indexes2.forEach((idx) => {
      const columns3 = idx.config.columns;
      const indexColumns = columns3.map((col) => {
        if (is(col, SQL)) {
          return {
            expression: dialect2.sqlToQuery(col).sql,
            isExpression: true
          };
        } else {
          const indexCol = {
            expression: col.name,
            isExpression: false,
            asc: col.indexConfig?.order === "asc"
          };
          if (col.indexConfig?.nulls) {
            indexCol.nulls = col.indexConfig.nulls;
          }
          return indexCol;
        }
      });
      const name = idx.config.name || `${tableName}_${indexColumns.map((c) => c.expression).join("_")}_index`;
      indexesObject[name] = {
        name,
        columns: indexColumns,
        isUnique: idx.config.unique || false,
        method: idx.config.method || "btree"
      };
    });
    if (checks2) {
      checks2.forEach((check2) => {
        const checkName = check2.name;
        checksObject[checkName] = {
          name: checkName,
          value: dialect2.sqlToQuery(check2.value).sql
        };
      });
    }
    tables[`${tableSchema || "public"}.${tableName}`] = {
      name: tableName,
      schema: tableSchema || "public",
      columns: columnsObject,
      indexes: indexesObject,
      foreignKeys: foreignKeysObject,
      compositePrimaryKeys: primaryKeysObject,
      uniqueConstraints: uniqueConstraintObject,
      checkConstraints: checksObject
    };
    if (tableSchema && tableSchema !== "public") {
      schemas[tableSchema] = tableSchema;
    }
  }
  const snapshot = {
    version: "7",
    dialect: "postgresql",
    tables,
    schemas,
    enums,
    _meta: {
      schemas: {},
      tables: {},
      columns: {}
    }
  };
  return snapshot;
}
function hashSnapshot(snapshot) {
  const content = JSON.stringify(snapshot);
  return createHash("sha256").update(content).digest("hex");
}
function hasChanges(previousSnapshot, currentSnapshot) {
  if (!previousSnapshot) {
    return Object.keys(currentSnapshot.tables).length > 0;
  }
  const prevHash = hashSnapshot(previousSnapshot);
  const currHash = hashSnapshot(currentSnapshot);
  return prevHash !== currHash;
}
var sqlToStr = (sql4, casing) => {
  return sql4.toQuery({
    escapeName: () => {
      throw new Error("we don't support params for `sql` default values");
    },
    escapeParam: () => {
      throw new Error("we don't support params for `sql` default values");
    },
    escapeString: () => {
      throw new Error("we don't support params for `sql` default values");
    },
    casing
  }).sql;
};
var init_snapshot_generator = __esm(() => {
  init_drizzle_orm();
  init_pg_core();
});

// src/runtime-migrator/drizzle-adapters/diff-calculator.ts
var exports_diff_calculator = {};
__export(exports_diff_calculator, {
  hasDiffChanges: () => hasDiffChanges,
  calculateDiff: () => calculateDiff
});
function normalizeType(type) {
  if (!type)
    return "";
  const normalized = type.toLowerCase().trim();
  if (normalized === "timestamp without time zone" || normalized === "timestamp with time zone") {
    return "timestamp";
  }
  if (normalized === "serial") {
    return "integer";
  }
  if (normalized === "bigserial") {
    return "bigint";
  }
  if (normalized === "smallserial") {
    return "smallint";
  }
  if (normalized.startsWith("numeric") || normalized.startsWith("decimal")) {
    const match = normalized.match(/\((\d+)(?:,\s*(\d+))?\)/);
    if (match) {
      return `numeric(${match[1]}${match[2] ? `,${match[2]}` : ""})`;
    }
    return "numeric";
  }
  if (normalized.startsWith("character varying")) {
    return normalized.replace("character varying", "varchar");
  }
  if (normalized === "text[]" || normalized === "_text") {
    return "text[]";
  }
  return normalized;
}
function isIndexChanged(prevIndex, currIndex) {
  if (prevIndex.isUnique !== currIndex.isUnique)
    return true;
  if (prevIndex.method !== currIndex.method)
    return true;
  if (prevIndex.where !== currIndex.where)
    return true;
  if (prevIndex.concurrently !== currIndex.concurrently)
    return true;
  const prevColumns = prevIndex.columns || [];
  const currColumns = currIndex.columns || [];
  if (prevColumns.length !== currColumns.length)
    return true;
  for (let i = 0;i < prevColumns.length; i++) {
    const prevCol = prevColumns[i];
    const currCol = currColumns[i];
    if (typeof prevCol === "string" && typeof currCol === "string") {
      if (prevCol !== currCol)
        return true;
    } else if (typeof prevCol === "object" && typeof currCol === "object") {
      if (prevCol.expression !== currCol.expression)
        return true;
      if (prevCol.isExpression !== currCol.isExpression)
        return true;
      if (prevCol.asc !== currCol.asc)
        return true;
      if (prevCol.nulls !== currCol.nulls)
        return true;
    } else {
      return true;
    }
  }
  return false;
}
async function calculateDiff(previousSnapshot, currentSnapshot) {
  const diff = {
    tables: {
      created: [],
      deleted: [],
      modified: []
    },
    columns: {
      added: [],
      deleted: [],
      modified: []
    },
    indexes: {
      created: [],
      deleted: [],
      altered: []
    },
    foreignKeys: {
      created: [],
      deleted: [],
      altered: []
    },
    uniqueConstraints: {
      created: [],
      deleted: []
    },
    checkConstraints: {
      created: [],
      deleted: []
    }
  };
  if (!previousSnapshot) {
    diff.tables.created = Object.keys(currentSnapshot.tables);
    for (const tableName in currentSnapshot.tables) {
      const table3 = currentSnapshot.tables[tableName];
      if (table3.indexes) {
        for (const indexName in table3.indexes) {
          diff.indexes.created.push({
            ...table3.indexes[indexName],
            table: tableName
          });
        }
      }
      if (table3.foreignKeys) {
        for (const fkName in table3.foreignKeys) {
          diff.foreignKeys.created.push(table3.foreignKeys[fkName]);
        }
      }
    }
    return diff;
  }
  const prevTables = previousSnapshot.tables || {};
  const currTables = currentSnapshot.tables || {};
  for (const tableName in currTables) {
    if (!(tableName in prevTables)) {
      diff.tables.created.push(tableName);
      const table3 = currTables[tableName];
      if (table3.indexes) {
        for (const indexName in table3.indexes) {
          diff.indexes.created.push({
            ...table3.indexes[indexName],
            table: tableName
          });
        }
      }
      if (table3.uniqueConstraints) {
        for (const uqName in table3.uniqueConstraints) {
          diff.uniqueConstraints.created.push({
            ...table3.uniqueConstraints[uqName],
            table: tableName
          });
        }
      }
      if (table3.checkConstraints) {
        for (const checkName in table3.checkConstraints) {
          diff.checkConstraints.created.push({
            ...table3.checkConstraints[checkName],
            table: tableName
          });
        }
      }
      if (table3.foreignKeys) {
        for (const fkName in table3.foreignKeys) {
          diff.foreignKeys.created.push(table3.foreignKeys[fkName]);
        }
      }
    }
  }
  for (const tableName in prevTables) {
    if (!(tableName in currTables)) {
      diff.tables.deleted.push(tableName);
    }
  }
  for (const tableName in currTables) {
    if (tableName in prevTables) {
      const prevTable = prevTables[tableName];
      const currTable = currTables[tableName];
      const prevTableJson = JSON.stringify({
        columns: prevTable.columns || {},
        indexes: prevTable.indexes || {},
        foreignKeys: prevTable.foreignKeys || {},
        uniqueConstraints: prevTable.uniqueConstraints || {},
        checkConstraints: prevTable.checkConstraints || {}
      });
      const currTableJson = JSON.stringify({
        columns: currTable.columns || {},
        indexes: currTable.indexes || {},
        foreignKeys: currTable.foreignKeys || {},
        uniqueConstraints: currTable.uniqueConstraints || {},
        checkConstraints: currTable.checkConstraints || {}
      });
      if (prevTableJson === currTableJson) {
        continue;
      }
      const prevColumns = prevTable.columns || {};
      const currColumns = currTable.columns || {};
      for (const colName in currColumns) {
        if (!(colName in prevColumns)) {
          diff.columns.added.push({
            table: tableName,
            column: colName,
            definition: currColumns[colName]
          });
        }
      }
      for (const colName in prevColumns) {
        if (!(colName in currColumns)) {
          diff.columns.deleted.push({
            table: tableName,
            column: colName
          });
        }
      }
      for (const colName in currColumns) {
        if (colName in prevColumns) {
          const prevCol = prevColumns[colName];
          const currCol = currColumns[colName];
          const typeChanged = normalizeType(prevCol.type) !== normalizeType(currCol.type);
          const hasChanges2 = typeChanged || prevCol.notNull !== currCol.notNull || prevCol.default !== currCol.default || prevCol.primaryKey !== currCol.primaryKey;
          if (hasChanges2) {
            diff.columns.modified.push({
              table: tableName,
              column: colName,
              changes: {
                from: prevCol,
                to: currCol
              }
            });
          }
        }
      }
      const prevIndexes = prevTable.indexes || {};
      const currIndexes = currTable.indexes || {};
      for (const indexName in currIndexes) {
        if (!(indexName in prevIndexes)) {
          diff.indexes.created.push({
            ...currIndexes[indexName],
            table: tableName
          });
        } else {
          const prevIndex = prevIndexes[indexName];
          const currIndex = currIndexes[indexName];
          const indexChanged = isIndexChanged(prevIndex, currIndex);
          if (indexChanged) {
            diff.indexes.altered.push({
              old: {
                ...prevIndex,
                table: tableName,
                name: indexName
              },
              new: {
                ...currIndex,
                table: tableName,
                name: indexName
              }
            });
          }
        }
      }
      for (const indexName in prevIndexes) {
        if (!(indexName in currIndexes)) {
          diff.indexes.deleted.push({
            name: indexName,
            table: tableName
          });
        }
      }
      const prevUniqueConstraints = prevTable.uniqueConstraints || {};
      const currUniqueConstraints = currTable.uniqueConstraints || {};
      for (const uqName in currUniqueConstraints) {
        if (!(uqName in prevUniqueConstraints)) {
          diff.uniqueConstraints.created.push({
            ...currUniqueConstraints[uqName],
            table: tableName
          });
        }
      }
      for (const uqName in prevUniqueConstraints) {
        if (!(uqName in currUniqueConstraints)) {
          diff.uniqueConstraints.deleted.push({
            name: uqName,
            table: tableName
          });
        }
      }
      const prevCheckConstraints = prevTable.checkConstraints || {};
      const currCheckConstraints = currTable.checkConstraints || {};
      for (const checkName in currCheckConstraints) {
        if (!(checkName in prevCheckConstraints)) {
          diff.checkConstraints.created.push({
            ...currCheckConstraints[checkName],
            table: tableName
          });
        }
      }
      for (const checkName in prevCheckConstraints) {
        if (!(checkName in currCheckConstraints)) {
          diff.checkConstraints.deleted.push({
            name: checkName,
            table: tableName
          });
        }
      }
      const prevFKs = prevTable.foreignKeys || {};
      const currFKs = currTable.foreignKeys || {};
      for (const fkName in currFKs) {
        if (!(fkName in prevFKs)) {
          diff.foreignKeys.created.push(currFKs[fkName]);
        } else {
          const prevFK = prevFKs[fkName];
          const currFK = currFKs[fkName];
          const prevOnDelete = prevFK.onDelete || "no action";
          const currOnDelete = currFK.onDelete || "no action";
          const prevOnUpdate = prevFK.onUpdate || "no action";
          const currOnUpdate = currFK.onUpdate || "no action";
          if (prevOnDelete !== currOnDelete || prevOnUpdate !== currOnUpdate) {
            diff.foreignKeys.altered.push({
              old: prevFK,
              new: currFK
            });
          }
        }
      }
      for (const fkName in prevFKs) {
        if (!(fkName in currFKs)) {
          diff.foreignKeys.deleted.push({
            name: fkName,
            tableFrom: tableName
          });
        }
      }
    }
  }
  return diff;
}
function hasDiffChanges(diff) {
  return diff.tables.created.length > 0 || diff.tables.deleted.length > 0 || diff.tables.modified.length > 0 || diff.columns.added.length > 0 || diff.columns.deleted.length > 0 || diff.columns.modified.length > 0 || diff.indexes.created.length > 0 || diff.indexes.deleted.length > 0 || diff.indexes.altered.length > 0 || diff.foreignKeys.created.length > 0 || diff.foreignKeys.deleted.length > 0 || diff.foreignKeys.altered.length > 0 || diff.uniqueConstraints.created.length > 0 || diff.uniqueConstraints.deleted.length > 0 || diff.checkConstraints.created.length > 0 || diff.checkConstraints.deleted.length > 0;
}

// src/runtime-migrator/drizzle-adapters/sql-generator.ts
import { logger as logger10 } from "@elizaos/core";
function checkForDataLoss(diff) {
  const result = {
    hasDataLoss: false,
    tablesToRemove: [],
    columnsToRemove: [],
    tablesToTruncate: [],
    typeChanges: [],
    warnings: [],
    requiresConfirmation: false
  };
  if (diff.tables.deleted.length > 0) {
    result.hasDataLoss = true;
    result.requiresConfirmation = true;
    result.tablesToRemove = [...diff.tables.deleted];
    for (const table3 of diff.tables.deleted) {
      result.warnings.push(`Table "${table3}" will be dropped with all its data`);
    }
  }
  if (diff.columns.deleted.length > 0) {
    result.hasDataLoss = true;
    result.requiresConfirmation = true;
    for (const col of diff.columns.deleted) {
      result.columnsToRemove.push(`${col.table}.${col.column}`);
      result.warnings.push(`Column "${col.column}" in table "${col.table}" will be dropped`);
    }
  }
  for (const modified of diff.columns.modified) {
    const from = modified.changes.from;
    const to = modified.changes.to;
    if (from.type !== to.type) {
      const isDestructive = checkIfTypeChangeIsDestructive(from.type, to.type);
      if (isDestructive) {
        result.hasDataLoss = true;
        result.requiresConfirmation = true;
        result.typeChanges.push({
          table: modified.table,
          column: modified.column,
          from: from.type,
          to: to.type
        });
        result.tablesToTruncate.push(modified.table);
        result.warnings.push(`Column "${modified.column}" in table "${modified.table}" changes type from "${from.type}" to "${to.type}". ` + `This may require truncating the table to avoid data conversion errors.`);
      }
    }
    if (!from.notNull && to.notNull && !to.default) {
      result.hasDataLoss = true;
      result.requiresConfirmation = true;
      result.warnings.push(`Column "${modified.column}" in table "${modified.table}" is becoming NOT NULL without a default value. ` + `This will fail if the table contains NULL values.`);
    }
  }
  for (const added of diff.columns.added) {
    if (added.definition.notNull && !added.definition.default) {
      result.warnings.push(`Column "${added.column}" is being added to table "${added.table}" as NOT NULL without a default value. ` + `This will fail if the table contains data.`);
    }
  }
  return result;
}
function normalizeType2(type) {
  if (!type)
    return "";
  const normalized = type.toLowerCase().trim();
  if (normalized === "timestamp without time zone" || normalized === "timestamp with time zone" || normalized === "timestamptz") {
    return "timestamp";
  }
  if (normalized === "serial") {
    return "integer";
  }
  if (normalized === "bigserial") {
    return "bigint";
  }
  if (normalized === "smallserial") {
    return "smallint";
  }
  if (normalized.startsWith("numeric") || normalized.startsWith("decimal")) {
    const match = normalized.match(/\((\d+)(?:,\s*(\d+))?\)/);
    if (match) {
      return `numeric(${match[1]}${match[2] ? `,${match[2]}` : ""})`;
    }
    return "numeric";
  }
  if (normalized.startsWith("character varying")) {
    return normalized.replace("character varying", "varchar");
  }
  if (normalized === "text[]" || normalized === "_text") {
    return "text[]";
  }
  return normalized;
}
function checkIfTypeChangeIsDestructive(fromType, toType) {
  const normalizedFrom = normalizeType2(fromType);
  const normalizedTo = normalizeType2(toType);
  if (normalizedFrom === normalizedTo) {
    return false;
  }
  const safeConversions = {
    smallint: ["integer", "bigint", "numeric", "real", "double precision"],
    integer: ["bigint", "numeric", "real", "double precision"],
    bigint: ["numeric"],
    real: ["double precision"],
    varchar: ["text"],
    char: ["varchar", "text"],
    citext: ["text"],
    text: ["citext"],
    uuid: ["text", "varchar"],
    timestamp: ["timestamp"],
    date: ["timestamp"],
    time: ["timetz"]
  };
  const fromBase = normalizedFrom.split("(")[0];
  const toBase = normalizedTo.split("(")[0];
  if (fromBase === toBase) {
    return false;
  }
  const safeTo = safeConversions[fromBase];
  if (safeTo && safeTo.includes(toBase)) {
    return false;
  }
  return true;
}
async function generateMigrationSQL(previousSnapshot, currentSnapshot, diff) {
  const statements = [];
  if (!diff) {
    const { calculateDiff: calculateDiff2 } = await Promise.resolve().then(() => exports_diff_calculator);
    diff = await calculateDiff2(previousSnapshot, currentSnapshot);
  }
  const dataLossCheck = checkForDataLoss(diff);
  if (dataLossCheck.warnings.length > 0) {
    logger10.warn({ src: "plugin:sql", warnings: dataLossCheck.warnings }, "Schema changes may cause data loss");
  }
  const schemasToCreate = new Set;
  for (const tableName of diff.tables.created) {
    const table3 = currentSnapshot.tables[tableName];
    if (table3) {
      const schema2 = table3.schema || "public";
      if (schema2 !== "public") {
        schemasToCreate.add(schema2);
      }
    }
  }
  for (const schema2 of schemasToCreate) {
    statements.push(`CREATE SCHEMA IF NOT EXISTS "${schema2}";`);
  }
  const createTableStatements = [];
  const foreignKeyStatements = [];
  for (const tableName of diff.tables.created) {
    const table3 = currentSnapshot.tables[tableName];
    if (table3) {
      const { tableSQL, fkSQLs } = generateCreateTableSQL(tableName, table3);
      createTableStatements.push(tableSQL);
      foreignKeyStatements.push(...fkSQLs);
    }
  }
  statements.push(...createTableStatements);
  const uniqueFKs = new Set;
  const dedupedFKStatements = [];
  for (const fkSQL of foreignKeyStatements) {
    const match = fkSQL.match(/ADD CONSTRAINT "([^"]+)"/);
    if (match) {
      const constraintName = match[1];
      if (!uniqueFKs.has(constraintName)) {
        uniqueFKs.add(constraintName);
        dedupedFKStatements.push(fkSQL);
      }
    } else {
      dedupedFKStatements.push(fkSQL);
    }
  }
  statements.push(...dedupedFKStatements);
  for (const tableName of diff.tables.deleted) {
    const [schema2, name] = tableName.includes(".") ? tableName.split(".") : ["public", tableName];
    statements.push(`DROP TABLE IF EXISTS "${schema2}"."${name}" CASCADE;`);
  }
  for (const added of diff.columns.added) {
    statements.push(generateAddColumnSQL(added.table, added.column, added.definition));
  }
  for (const deleted of diff.columns.deleted) {
    statements.push(generateDropColumnSQL(deleted.table, deleted.column));
  }
  for (const modified of diff.columns.modified) {
    const alterStatements = generateAlterColumnSQL(modified.table, modified.column, modified.changes);
    statements.push(...alterStatements);
  }
  for (const index2 of diff.indexes.deleted) {
    statements.push(generateDropIndexSQL(index2));
  }
  for (const alteredIndex of diff.indexes.altered) {
    statements.push(generateDropIndexSQL(alteredIndex.old));
  }
  for (const index2 of diff.indexes.created) {
    statements.push(generateCreateIndexSQL(index2));
  }
  for (const alteredIndex of diff.indexes.altered) {
    statements.push(generateCreateIndexSQL(alteredIndex.new));
  }
  for (const constraint of diff.uniqueConstraints.created) {
    const isNewTable = diff.tables.created.some((tableName) => {
      const [schema2, table3] = tableName.includes(".") ? tableName.split(".") : ["public", tableName];
      const constraintTable = constraint.table || "";
      const [constraintSchema, constraintTableName] = constraintTable.includes(".") ? constraintTable.split(".") : ["public", constraintTable];
      return table3 === constraintTableName && schema2 === constraintSchema;
    });
    if (!isNewTable) {
      statements.push(generateCreateUniqueConstraintSQL(constraint));
    }
  }
  for (const constraint of diff.uniqueConstraints.deleted) {
    statements.push(generateDropUniqueConstraintSQL(constraint));
  }
  for (const constraint of diff.checkConstraints.created) {
    const isNewTable = diff.tables.created.some((tableName) => {
      const [schema2, table3] = tableName.includes(".") ? tableName.split(".") : ["public", tableName];
      const constraintTable = constraint.table || "";
      const [constraintSchema, constraintTableName] = constraintTable.includes(".") ? constraintTable.split(".") : ["public", constraintTable];
      return table3 === constraintTableName && schema2 === constraintSchema;
    });
    if (!isNewTable) {
      statements.push(generateCreateCheckConstraintSQL(constraint));
    }
  }
  for (const constraint of diff.checkConstraints.deleted) {
    statements.push(generateDropCheckConstraintSQL(constraint));
  }
  for (const fk of diff.foreignKeys.deleted) {
    statements.push(generateDropForeignKeySQL(fk));
  }
  for (const alteredFK of diff.foreignKeys.altered) {
    statements.push(generateDropForeignKeySQL(alteredFK.old));
  }
  for (const fk of diff.foreignKeys.created) {
    const tableFrom = fk.tableFrom || "";
    const schemaFrom = fk.schemaFrom || "public";
    const isNewTable = diff.tables.created.some((tableName) => {
      const [createdSchema, createdTable] = tableName.includes(".") ? tableName.split(".") : ["public", tableName];
      return createdTable === tableFrom && createdSchema === schemaFrom;
    });
    if (!isNewTable) {
      statements.push(generateCreateForeignKeySQL(fk));
    }
  }
  for (const alteredFK of diff.foreignKeys.altered) {
    statements.push(generateCreateForeignKeySQL(alteredFK.new));
  }
  return statements;
}
function generateCreateTableSQL(fullTableName, table3) {
  const [schema2, tableName] = fullTableName.includes(".") ? fullTableName.split(".") : ["public", fullTableName];
  const columns2 = [];
  const fkSQLs = [];
  for (const [colName, colDef] of Object.entries(table3.columns || {})) {
    columns2.push(generateColumnDefinition(colName, colDef));
  }
  const primaryKeys = table3.compositePrimaryKeys || {};
  for (const [pkName, pkDef] of Object.entries(primaryKeys)) {
    const pk = pkDef;
    if (pk.columns && pk.columns.length > 0) {
      columns2.push(`CONSTRAINT "${pkName}" PRIMARY KEY (${pk.columns.map((c) => `"${c}"`).join(", ")})`);
    }
  }
  const uniqueConstraints = table3.uniqueConstraints || {};
  for (const [uqName, uqDef] of Object.entries(uniqueConstraints)) {
    const uq = uqDef;
    if (uq.columns && uq.columns.length > 0) {
      const uniqueDef = uq.nullsNotDistinct ? `CONSTRAINT "${uqName}" UNIQUE NULLS NOT DISTINCT (${uq.columns.map((c) => `"${c}"`).join(", ")})` : `CONSTRAINT "${uqName}" UNIQUE (${uq.columns.map((c) => `"${c}"`).join(", ")})`;
      columns2.push(uniqueDef);
    }
  }
  const checkConstraints = table3.checkConstraints || {};
  for (const [checkName, checkDef] of Object.entries(checkConstraints)) {
    const check2 = checkDef;
    if (check2.value) {
      columns2.push(`CONSTRAINT "${checkName}" CHECK (${check2.value})`);
    }
  }
  const tableSQL = `CREATE TABLE IF NOT EXISTS "${schema2}"."${tableName}" (
  ${columns2.join(`,
  `)}
);`;
  const foreignKeys = table3.foreignKeys || {};
  for (const [fkName, fkDef] of Object.entries(foreignKeys)) {
    const fk = fkDef;
    const fkSQL = `ALTER TABLE "${schema2}"."${tableName}" ADD CONSTRAINT "${fkName}" FOREIGN KEY (${fk.columnsFrom.map((c) => `"${c}"`).join(", ")}) REFERENCES "${fk.schemaTo || "public"}"."${fk.tableTo}" (${fk.columnsTo.map((c) => `"${c}"`).join(", ")})${fk.onDelete ? ` ON DELETE ${fk.onDelete}` : ""}${fk.onUpdate ? ` ON UPDATE ${fk.onUpdate}` : ""};`;
    fkSQLs.push(fkSQL);
  }
  return { tableSQL, fkSQLs };
}
function generateColumnDefinition(name, def) {
  let sql4 = `"${name}" ${def.type}`;
  if (def.primaryKey && !def.type.includes("SERIAL")) {
    sql4 += " PRIMARY KEY";
  }
  if (def.notNull) {
    sql4 += " NOT NULL";
  }
  if (def.default !== undefined) {
    const defaultValue = formatDefaultValue(def.default, def.type);
    sql4 += ` DEFAULT ${defaultValue}`;
  }
  return sql4;
}
function generateAddColumnSQL(table3, column2, definition) {
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  const tableNameWithSchema = `"${schema2}"."${tableName}"`;
  const parts = [`"${column2}"`];
  parts.push(definition.type);
  if (definition.primaryKey) {
    parts.push("PRIMARY KEY");
  }
  if (definition.default !== undefined) {
    const defaultValue = formatDefaultValue(definition.default, definition.type);
    if (defaultValue) {
      parts.push(`DEFAULT ${defaultValue}`);
    }
  }
  if (definition.generated) {
    parts.push(`GENERATED ALWAYS AS (${definition.generated}) STORED`);
  }
  if (definition.notNull) {
    parts.push("NOT NULL");
  }
  return `ALTER TABLE ${tableNameWithSchema} ADD COLUMN ${parts.join(" ")};`;
}
function generateDropColumnSQL(table3, column2) {
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  const tableNameWithSchema = `"${schema2}"."${tableName}"`;
  return `ALTER TABLE ${tableNameWithSchema} DROP COLUMN "${column2}" CASCADE;`;
}
function generateAlterColumnSQL(table3, column2, changes) {
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  const tableNameWithSchema = `"${schema2}"."${tableName}"`;
  const statements = [];
  if (changes.to?.type !== changes.from?.type) {
    const newType = changes.to?.type || "TEXT";
    const needsUsing = checkIfNeedsUsingClause(changes.from?.type, newType);
    if (needsUsing) {
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" TYPE ${newType} USING "${column2}"::text::${newType};`);
    } else {
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" SET DATA TYPE ${newType};`);
    }
  }
  if (changes.to?.notNull !== changes.from?.notNull) {
    if (changes.to?.notNull) {
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" SET NOT NULL;`);
    } else {
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" DROP NOT NULL;`);
    }
  }
  if (changes.to?.default !== changes.from?.default) {
    if (changes.to?.default !== undefined) {
      const defaultValue = formatDefaultValue(changes.to.default, changes.to?.type);
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" SET DEFAULT ${defaultValue};`);
    } else {
      statements.push(`ALTER TABLE ${tableNameWithSchema} ALTER COLUMN "${column2}" DROP DEFAULT;`);
    }
  }
  return statements;
}
function checkIfNeedsUsingClause(fromType, toType) {
  if (!fromType || !toType)
    return false;
  if (fromType.includes("enum") || toType.includes("enum")) {
    return true;
  }
  const fromBase = fromType.split("(")[0].toLowerCase();
  const toBase = toType.split("(")[0].toLowerCase();
  if ((fromBase === "text" || fromBase === "varchar" || fromBase === "character varying") && (toBase === "jsonb" || toBase === "json")) {
    return true;
  }
  const needsUsingPairs = [
    ["integer", "boolean"],
    ["boolean", "integer"],
    ["text", "integer"],
    ["text", "numeric"],
    ["text", "boolean"],
    ["text", "uuid"],
    ["text", "jsonb"],
    ["text", "json"],
    ["varchar", "integer"],
    ["varchar", "numeric"],
    ["varchar", "boolean"],
    ["varchar", "uuid"],
    ["varchar", "jsonb"],
    ["varchar", "json"],
    ["character varying", "jsonb"],
    ["character varying", "json"]
  ];
  for (const [from, to] of needsUsingPairs) {
    if (fromBase === from && toBase === to || fromBase === to && toBase === from) {
      return true;
    }
  }
  return false;
}
function formatDefaultValue(value, type) {
  if (value === null || value === "NULL") {
    return "NULL";
  }
  if (type && (type.toLowerCase().includes("boolean") || type.toLowerCase() === "bool")) {
    if (value === true || value === "true" || value === "t" || value === 1) {
      return "true";
    }
    if (value === false || value === "false" || value === "f" || value === 0) {
      return "false";
    }
  }
  if (type && type.match(/^(integer|bigint|smallint|numeric|decimal|real|double)/i)) {
    return String(value);
  }
  if (typeof value === "string") {
    if (value.includes("::")) {
      return value;
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value;
    }
    if (value.match(/^\w+\(\)/i) || value.includes("(") && value.includes(")")) {
      return value;
    }
    if (value.toUpperCase().startsWith("CURRENT_")) {
      return value;
    }
    return `'${value.replace(/'/g, "''")}'`;
  }
  return String(value);
}
function generateCreateIndexSQL(index2) {
  const unique2 = index2.isUnique ? "UNIQUE " : "";
  const method = index2.method || "btree";
  const columns2 = index2.columns.map((c) => {
    if (c.isExpression) {
      return c.expression;
    }
    return `"${c.expression}"${c.asc === false ? " DESC" : ""}`;
  }).join(", ");
  const indexName = index2.name.includes(".") ? index2.name.split(".")[1] : index2.name;
  let tableRef;
  if (index2.table && index2.table.includes(".")) {
    const [schema2, table3] = index2.table.split(".");
    tableRef = `"${schema2}"."${table3}"`;
  } else {
    tableRef = `"${index2.table || ""}"`;
  }
  return `CREATE ${unique2}INDEX "${indexName}" ON ${tableRef} USING ${method} (${columns2});`;
}
function generateDropIndexSQL(index2) {
  const indexName = index2.name ? index2.name.includes(".") ? index2.name.split(".")[1] : index2.name : index2;
  return `DROP INDEX IF EXISTS "${indexName}";`;
}
function generateCreateForeignKeySQL(fk) {
  const schemaFrom = fk.schemaFrom || "public";
  const schemaTo = fk.schemaTo || "public";
  const tableFrom = fk.tableFrom;
  const columnsFrom = fk.columnsFrom.map((c) => `"${c}"`).join(", ");
  const columnsTo = fk.columnsTo.map((c) => `"${c}"`).join(", ");
  let sql4 = `ALTER TABLE "${schemaFrom}"."${tableFrom}" ADD CONSTRAINT "${fk.name}" FOREIGN KEY (${columnsFrom}) REFERENCES "${schemaTo}"."${fk.tableTo}" (${columnsTo})`;
  if (fk.onDelete) {
    sql4 += ` ON DELETE ${fk.onDelete}`;
  }
  if (fk.onUpdate) {
    sql4 += ` ON UPDATE ${fk.onUpdate}`;
  }
  return sql4 + ";";
}
function generateDropForeignKeySQL(fk) {
  const [schema2, tableName] = fk.tableFrom ? fk.tableFrom.includes(".") ? fk.tableFrom.split(".") : ["public", fk.tableFrom] : ["public", ""];
  return `ALTER TABLE "${schema2}"."${tableName}" DROP CONSTRAINT "${fk.name}";`;
}
function generateCreateUniqueConstraintSQL(constraint) {
  const table3 = constraint.table || "";
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  const name = constraint.name;
  const columns2 = constraint.columns.map((c) => `"${c}"`).join(", ");
  let sql4 = `ALTER TABLE "${schema2}"."${tableName}" ADD CONSTRAINT "${name}" UNIQUE`;
  if (constraint.nullsNotDistinct) {
    sql4 += ` NULLS NOT DISTINCT`;
  }
  sql4 += ` (${columns2});`;
  return sql4;
}
function generateDropUniqueConstraintSQL(constraint) {
  const table3 = constraint.table || "";
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  return `ALTER TABLE "${schema2}"."${tableName}" DROP CONSTRAINT "${constraint.name}";`;
}
function generateCreateCheckConstraintSQL(constraint) {
  const table3 = constraint.table || "";
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  const name = constraint.name;
  const value = constraint.value;
  return `ALTER TABLE "${schema2}"."${tableName}" ADD CONSTRAINT "${name}" CHECK (${value});`;
}
function generateDropCheckConstraintSQL(constraint) {
  const table3 = constraint.table || "";
  const [schema2, tableName] = table3.includes(".") ? table3.split(".") : ["public", table3];
  return `ALTER TABLE "${schema2}"."${tableName}" DROP CONSTRAINT "${constraint.name}";`;
}
var init_sql_generator = () => {};

// src/runtime-migrator/schema-transformer.ts
import { logger as logger11 } from "@elizaos/core";
function deriveSchemaName(pluginName) {
  let schemaName = pluginName.replace(/^@[^/]+\//, "").replace(/^plugin-/, "").toLowerCase();
  schemaName = normalizeSchemaName(schemaName);
  const reserved = ["public", "pg_catalog", "information_schema", "migrations"];
  if (!schemaName || reserved.includes(schemaName)) {
    schemaName = "plugin_" + normalizeSchemaName(pluginName.toLowerCase());
  }
  if (!/^[a-z]/.test(schemaName)) {
    schemaName = "p_" + schemaName;
  }
  if (schemaName.length > 63) {
    schemaName = schemaName.substring(0, 63);
  }
  return schemaName;
}
function normalizeSchemaName(input) {
  const chars = [];
  let prevWasUnderscore = false;
  for (let i = 0;i < input.length; i++) {
    const char3 = input[i];
    if (/[a-z0-9]/.test(char3)) {
      chars.push(char3);
      prevWasUnderscore = false;
    } else if (!prevWasUnderscore) {
      chars.push("_");
      prevWasUnderscore = true;
    }
  }
  const result = chars.join("");
  let start = 0;
  let end = result.length;
  while (start < end && result[start] === "_") {
    start++;
  }
  while (end > start && result[end - 1] === "_") {
    end--;
  }
  return result.slice(start, end);
}
var init_schema_transformer = () => {};

// src/runtime-migrator/drizzle-adapters/database-introspector.ts
import { logger as logger12 } from "@elizaos/core";

class DatabaseIntrospector {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async introspectSchema(schemaName = "public") {
    logger12.info({ src: "plugin:sql", schemaName }, "Starting database introspection");
    const tables = {};
    const schemas = {};
    const enums = {};
    const allTables = await this.getTables(schemaName);
    for (const tableInfo of allTables) {
      const tableName = tableInfo.table_name;
      const tableSchema = tableInfo.table_schema || "public";
      logger12.debug({ src: "plugin:sql", tableSchema, tableName }, "Introspecting table");
      const columns2 = await this.getColumns(tableSchema, tableName);
      const columnsObject = {};
      const uniqueConstraintObject = {};
      for (const col of columns2) {
        columnsObject[col.column_name] = {
          name: col.column_name,
          type: col.data_type,
          primaryKey: col.is_primary || false,
          notNull: col.is_nullable === "NO",
          default: col.column_default ? this.parseDefault(col.column_default, col.data_type) : undefined
        };
      }
      const indexes2 = await this.getIndexes(tableSchema, tableName);
      const indexesObject = {};
      for (const idx of indexes2) {
        if (!idx.is_primary && !idx.is_unique_constraint) {
          if (idx.columns && Array.isArray(idx.columns) && idx.columns.length > 0) {
            indexesObject[idx.name] = {
              name: idx.name,
              columns: idx.columns.map((col) => ({
                expression: col,
                isExpression: false
              })),
              isUnique: idx.is_unique,
              method: idx.method || "btree"
            };
          }
        }
      }
      const foreignKeys = await this.getForeignKeys(tableSchema, tableName);
      const foreignKeysObject = {};
      for (const fk of foreignKeys) {
        foreignKeysObject[fk.name] = {
          name: fk.name,
          tableFrom: tableName,
          schemaFrom: tableSchema,
          tableTo: fk.foreign_table_name,
          schemaTo: fk.foreign_table_schema || "public",
          columnsFrom: [fk.column_name],
          columnsTo: [fk.foreign_column_name],
          onDelete: fk.delete_rule?.toLowerCase() || "no action",
          onUpdate: fk.update_rule?.toLowerCase() || "no action"
        };
      }
      const primaryKeys = await this.getPrimaryKeys(tableSchema, tableName);
      const primaryKeysObject = {};
      for (const pk of primaryKeys) {
        primaryKeysObject[pk.name] = {
          name: pk.name,
          columns: pk.columns
        };
      }
      const uniqueConstraints = await this.getUniqueConstraints(tableSchema, tableName);
      for (const unq of uniqueConstraints) {
        uniqueConstraintObject[unq.name] = {
          name: unq.name,
          columns: unq.columns,
          nullsNotDistinct: false
        };
      }
      const checkConstraints = await this.getCheckConstraints(tableSchema, tableName);
      const checksObject = {};
      for (const check2 of checkConstraints) {
        checksObject[check2.name] = {
          name: check2.name,
          value: check2.definition
        };
      }
      tables[`${tableSchema}.${tableName}`] = {
        name: tableName,
        schema: tableSchema,
        columns: columnsObject,
        indexes: indexesObject,
        foreignKeys: foreignKeysObject,
        compositePrimaryKeys: primaryKeysObject,
        uniqueConstraints: uniqueConstraintObject,
        checkConstraints: checksObject
      };
      if (tableSchema && tableSchema !== "public") {
        schemas[tableSchema] = tableSchema;
      }
    }
    const enumsResult = await this.getEnums(schemaName);
    for (const enumInfo of enumsResult) {
      const key = `${enumInfo.schema}.${enumInfo.name}`;
      if (!enums[key]) {
        enums[key] = {
          name: enumInfo.name,
          schema: enumInfo.schema,
          values: []
        };
      }
      enums[key].values.push(enumInfo.value);
    }
    logger12.info({ src: "plugin:sql", tableCount: Object.keys(tables).length }, "Database introspection complete");
    return {
      version: "7",
      dialect: "postgresql",
      tables,
      schemas,
      enums,
      _meta: {
        schemas: {},
        tables: {},
        columns: {}
      }
    };
  }
  async getTables(schemaName) {
    const result = await this.db.execute(sql`SELECT 
            table_schema,
            table_name
          FROM information_schema.tables
          WHERE table_schema = ${schemaName}
            AND table_type = 'BASE TABLE'
          ORDER BY table_name`);
    return result.rows;
  }
  async getColumns(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT 
            a.attname AS column_name,
            CASE 
              WHEN a.attnotnull THEN 'NO'
              ELSE 'YES'
            END AS is_nullable,
            CASE 
              WHEN a.atttypid = ANY ('{int,int8,int2}'::regtype[]) 
              AND EXISTS (
                SELECT FROM pg_attrdef ad
                WHERE ad.adrelid = a.attrelid 
                AND ad.adnum = a.attnum 
                AND pg_get_expr(ad.adbin, ad.adrelid) = 'nextval(''' 
                    || pg_get_serial_sequence(a.attrelid::regclass::text, a.attname)::regclass || '''::regclass)'
              )
              THEN CASE a.atttypid
                WHEN 'int'::regtype THEN 'serial'
                WHEN 'int8'::regtype THEN 'bigserial'
                WHEN 'int2'::regtype THEN 'smallserial'
              END
              ELSE format_type(a.atttypid, a.atttypmod)
            END AS data_type,
            pg_get_expr(ad.adbin, ad.adrelid) AS column_default,
            CASE 
              WHEN con.contype = 'p' THEN true
              ELSE false
            END AS is_primary
          FROM pg_attribute a
          JOIN pg_class cls ON cls.oid = a.attrelid
          JOIN pg_namespace ns ON ns.oid = cls.relnamespace
          LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
          LEFT JOIN pg_constraint con ON con.conrelid = a.attrelid 
            AND a.attnum = ANY(con.conkey) 
            AND con.contype = 'p'
          WHERE 
            a.attnum > 0
            AND NOT a.attisdropped
            AND ns.nspname = ${schemaName}
            AND cls.relname = ${tableName}
          ORDER BY a.attnum`);
    return result.rows;
  }
  async getIndexes(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT 
            i.relname AS name,
            idx.indisunique AS is_unique,
            idx.indisprimary AS is_primary,
            con.contype = 'u' AS is_unique_constraint,
            ARRAY(
              SELECT a.attname
              FROM pg_attribute a
              WHERE a.attrelid = idx.indrelid
                AND a.attnum = ANY(idx.indkey::int[])
              ORDER BY a.attnum
            ) AS columns,
            am.amname AS method
          FROM pg_index idx
          JOIN pg_class i ON i.oid = idx.indexrelid
          JOIN pg_class c ON c.oid = idx.indrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
          JOIN pg_am am ON am.oid = i.relam
          LEFT JOIN pg_constraint con ON con.conindid = idx.indexrelid
          WHERE n.nspname = ${schemaName}
            AND c.relname = ${tableName}`);
    return result.rows;
  }
  async getForeignKeys(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT
            con.conname AS name,
            att.attname AS column_name,
            fnsp.nspname AS foreign_table_schema,
            frel.relname AS foreign_table_name,
            fatt.attname AS foreign_column_name,
            CASE con.confupdtype
              WHEN 'a' THEN 'NO ACTION'
              WHEN 'r' THEN 'RESTRICT'
              WHEN 'n' THEN 'SET NULL'
              WHEN 'c' THEN 'CASCADE'
              WHEN 'd' THEN 'SET DEFAULT'
            END AS update_rule,
            CASE con.confdeltype
              WHEN 'a' THEN 'NO ACTION'
              WHEN 'r' THEN 'RESTRICT'
              WHEN 'n' THEN 'SET NULL'
              WHEN 'c' THEN 'CASCADE'
              WHEN 'd' THEN 'SET DEFAULT'
            END AS delete_rule
          FROM pg_catalog.pg_constraint con
          JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
          JOIN pg_catalog.pg_namespace nsp ON nsp.oid = con.connamespace
          LEFT JOIN pg_catalog.pg_attribute att ON att.attnum = ANY (con.conkey)
            AND att.attrelid = con.conrelid
          LEFT JOIN pg_catalog.pg_class frel ON frel.oid = con.confrelid
          LEFT JOIN pg_catalog.pg_namespace fnsp ON fnsp.oid = frel.relnamespace
          LEFT JOIN pg_catalog.pg_attribute fatt ON fatt.attnum = ANY (con.confkey)
            AND fatt.attrelid = con.confrelid
          WHERE con.contype = 'f'
            AND nsp.nspname = ${schemaName}
            AND rel.relname = ${tableName}`);
    return result.rows;
  }
  async getPrimaryKeys(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT 
            con.conname AS name,
            ARRAY(
              SELECT a.attname
              FROM pg_attribute a
              WHERE a.attrelid = con.conrelid
                AND a.attnum = ANY(con.conkey)
              ORDER BY a.attnum
            ) AS columns
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_namespace nsp ON nsp.oid = con.connamespace
          WHERE con.contype = 'p'
            AND nsp.nspname = ${schemaName}
            AND rel.relname = ${tableName}`);
    return result.rows;
  }
  async getUniqueConstraints(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT 
            con.conname AS name,
            ARRAY(
              SELECT a.attname
              FROM pg_attribute a
              WHERE a.attrelid = con.conrelid
                AND a.attnum = ANY(con.conkey)
              ORDER BY a.attnum
            ) AS columns
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_namespace nsp ON nsp.oid = con.connamespace
          WHERE con.contype = 'u'
            AND nsp.nspname = ${schemaName}
            AND rel.relname = ${tableName}`);
    return result.rows;
  }
  async getCheckConstraints(schemaName, tableName) {
    const result = await this.db.execute(sql`SELECT 
            con.conname AS name,
            pg_get_constraintdef(con.oid) AS definition
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_namespace nsp ON nsp.oid = con.connamespace
          WHERE con.contype = 'c'
            AND nsp.nspname = ${schemaName}
            AND rel.relname = ${tableName}`);
    return result.rows;
  }
  async getEnums(schemaName) {
    const result = await this.db.execute(sql`SELECT 
            n.nspname AS schema,
            t.typname AS name,
            e.enumlabel AS value,
            e.enumsortorder AS sort_order
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = ${schemaName}
          ORDER BY schema, name, sort_order`);
    return result.rows;
  }
  parseDefault(defaultValue, dataType) {
    if (!defaultValue)
      return;
    const match = defaultValue.match(/^'(.*)'::/);
    if (match) {
      return `'${match[1]}'`;
    }
    if (defaultValue.includes("nextval(")) {
      return;
    }
    if (dataType === "boolean") {
      if (defaultValue === "true")
        return "true";
      if (defaultValue === "false")
        return "false";
    }
    return defaultValue;
  }
  async hasExistingTables(pluginName) {
    const schemaName = pluginName === "@elizaos/plugin-sql" ? "public" : this.deriveSchemaName(pluginName);
    const result = await this.db.execute(sql`SELECT COUNT(*) AS count
          FROM information_schema.tables
          WHERE table_schema = ${schemaName}
            AND table_type = 'BASE TABLE'`);
    const count2 = parseInt(result.rows[0]?.count || "0", 10);
    return count2 > 0;
  }
  deriveSchemaName(pluginName) {
    return pluginName.replace("@", "").replace("/", "_").replace(/-/g, "_").toLowerCase();
  }
}
var init_database_introspector = __esm(() => {
  init_drizzle_orm();
});

// src/runtime-migrator/runtime-migrator.ts
import { logger as logger13 } from "@elizaos/core";
import { createHash as createHash2 } from "crypto";

class RuntimeMigrator {
  db;
  migrationTracker;
  journalStorage;
  snapshotStorage;
  extensionManager;
  introspector;
  constructor(db2) {
    this.db = db2;
    this.migrationTracker = new MigrationTracker(db2);
    this.journalStorage = new JournalStorage(db2);
    this.snapshotStorage = new SnapshotStorage(db2);
    this.extensionManager = new ExtensionManager(db2);
    this.introspector = new DatabaseIntrospector(db2);
  }
  getExpectedSchemaName(pluginName) {
    if (pluginName === "@elizaos/plugin-sql") {
      return "public";
    }
    return deriveSchemaName(pluginName);
  }
  async ensureSchemasExist(snapshot) {
    const schemasToCreate = new Set;
    for (const table3 of Object.values(snapshot.tables)) {
      const tableData = table3;
      const schema2 = tableData.schema || "public";
      if (schema2 !== "public") {
        schemasToCreate.add(schema2);
      }
    }
    for (const schema2 of Object.keys(snapshot.schemas || {})) {
      if (schema2 !== "public") {
        schemasToCreate.add(schema2);
      }
    }
    for (const schemaName of schemasToCreate) {
      logger13.debug({ src: "plugin:sql", schemaName }, "Ensuring schema exists");
      await this.db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`));
    }
  }
  validateSchemaUsage(pluginName, snapshot) {
    const expectedSchema = this.getExpectedSchemaName(pluginName);
    const isCorePLugin = pluginName === "@elizaos/plugin-sql";
    for (const table3 of Object.values(snapshot.tables)) {
      const tableData = table3;
      const actualSchema = tableData.schema || "public";
      if (!isCorePLugin && actualSchema === "public") {
        logger13.warn({ src: "plugin:sql", pluginName, tableName: tableData.name, expectedSchema }, "Plugin table is using public schema - consider using pgSchema for better isolation");
      }
      if (isCorePLugin && actualSchema !== "public") {
        logger13.warn({
          src: "plugin:sql",
          pluginName: "@elizaos/plugin-sql",
          tableName: tableData.name,
          actualSchema
        }, "Core plugin table should use public schema");
      }
    }
  }
  getAdvisoryLockId(pluginName) {
    const hash = createHash2("sha256").update(pluginName).digest();
    const buffer = hash.slice(0, 8);
    let lockId = BigInt("0x" + buffer.toString("hex"));
    const mask63Bits = 0x7fffffffffffffffn;
    lockId = lockId & mask63Bits;
    if (lockId === 0n) {
      lockId = 1n;
    }
    return lockId;
  }
  validateBigInt(value) {
    const MIN_BIGINT = -9223372036854775808n;
    const MAX_BIGINT = 9223372036854775807n;
    return value >= MIN_BIGINT && value <= MAX_BIGINT;
  }
  isRealPostgresDatabase(connectionUrl) {
    if (!connectionUrl?.trim())
      return false;
    const url = connectionUrl.trim().toLowerCase();
    const nonPgSchemes = ["mysql://", "mysqli://", "mariadb://", "mongodb://", "mongodb+srv://"];
    if (nonPgSchemes.some((s) => url.startsWith(s)))
      return false;
    if (url.includes(":memory:"))
      return false;
    const pgSchemes = [
      "postgres://",
      "postgresql://",
      "postgis://",
      "pgbouncer://",
      "pgpool://",
      "cockroach://",
      "cockroachdb://",
      "redshift://",
      "timescaledb://",
      "yugabyte://"
    ];
    if (pgSchemes.some((s) => url.startsWith(s)))
      return true;
    const excludePatterns = ["pglite", "sqlite"];
    const urlBase = url.split("?")[0];
    if (excludePatterns.some((p) => url.includes(p)))
      return false;
    if (/\.(db|sqlite|sqlite3)$/.test(urlBase))
      return false;
    if (url.includes("localhost") || url.includes("127.0.0.1"))
      return true;
    const connParams = [
      "host=",
      "dbname=",
      "sslmode=",
      "connect_timeout=",
      "application_name=",
      "user=",
      "password=",
      "port=",
      "options=",
      "sslcert=",
      "sslkey=",
      "sslrootcert=",
      "fallback_application_name=",
      "keepalives=",
      "target_session_attrs="
    ];
    if (connParams.some((p) => url.includes(p)))
      return true;
    if (url.includes("@") && (url.includes("postgres") || /:\d{4,5}/.test(url)))
      return true;
    if (/:(5432|5433|5434|6432|8432|9999|25060|26257)\b/.test(url))
      return true;
    const cloudPatterns = [
      "amazonaws.com",
      ".rds.",
      "azure.com",
      "database.azure.com",
      "googleusercontent",
      "cloudsql",
      "supabase",
      "neon.tech",
      "neon.build",
      "railway.app",
      "railway.internal",
      "render.com",
      "onrender.com",
      "heroku",
      "timescale",
      ".tsdb.cloud",
      "cockroachlabs",
      "cockroachdb.cloud",
      ".crdb.io",
      "digitalocean",
      "db.ondigitalocean",
      "do-user-",
      "aiven",
      "crunchydata",
      "elephantsql",
      "yugabyte",
      "scaleway",
      ".rdb.fr-par.scw.cloud",
      "vercel-storage",
      "psdb.cloud",
      "xata.sh",
      "fly.dev",
      "fly.io"
    ];
    if (cloudPatterns.some((p) => url.includes(p)))
      return true;
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/.test(url))
      return true;
    if (/\[[0-9a-f:]+\](:\d{1,5})?/i.test(connectionUrl))
      return true;
    if (/^[a-z0-9_.-]+:\d{1,5}\/[a-z0-9_-]+/i.test(connectionUrl))
      return true;
    logger13.debug({ src: "plugin:sql", urlPreview: url.substring(0, 50) }, "Connection string did not match any PostgreSQL patterns");
    return false;
  }
  async initialize() {
    logger13.info({ src: "plugin:sql" }, "Initializing migration system");
    await this.migrationTracker.ensureTables();
    logger13.info({ src: "plugin:sql" }, "Migration system initialized");
  }
  async migrate(pluginName, schema2, options = {}) {
    const lockId = this.getAdvisoryLockId(pluginName);
    if (!this.validateBigInt(lockId)) {
      throw new Error(`Invalid advisory lock ID generated for plugin ${pluginName}`);
    }
    let lockAcquired = false;
    try {
      logger13.info({ src: "plugin:sql", pluginName }, "Starting migration for plugin");
      await this.initialize();
      const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
      const isRealPostgres = this.isRealPostgresDatabase(postgresUrl);
      if (isRealPostgres) {
        try {
          logger13.debug({ src: "plugin:sql", pluginName }, "Using PostgreSQL advisory locks");
          const lockIdStr = lockId.toString();
          const lockResult = await this.db.execute(sql`SELECT pg_try_advisory_lock(CAST(${lockIdStr} AS bigint)) as acquired`);
          lockAcquired = getRow(lockResult)?.acquired === true;
          if (!lockAcquired) {
            logger13.info({ src: "plugin:sql", pluginName }, "Migration already in progress, waiting for lock");
            await this.db.execute(sql`SELECT pg_advisory_lock(CAST(${lockIdStr} AS bigint))`);
            lockAcquired = true;
            logger13.info({ src: "plugin:sql", pluginName }, "Lock acquired");
          } else {
            logger13.debug({ src: "plugin:sql", pluginName, lockId: lockIdStr }, "Advisory lock acquired");
          }
        } catch (lockError) {
          logger13.warn({
            src: "plugin:sql",
            pluginName,
            error: lockError instanceof Error ? lockError.message : String(lockError)
          }, "Failed to acquire advisory lock, continuing without lock");
          lockAcquired = false;
        }
      } else {
        logger13.debug({ src: "plugin:sql" }, "Development database detected, skipping advisory locks");
      }
      const extensions = isRealPostgres ? ["vector", "fuzzystrmatch", "pgcrypto"] : ["vector", "fuzzystrmatch"];
      await this.extensionManager.installRequiredExtensions(extensions);
      const currentSnapshot = await generateSnapshot(schema2);
      await this.ensureSchemasExist(currentSnapshot);
      this.validateSchemaUsage(pluginName, currentSnapshot);
      const currentHash = hashSnapshot(currentSnapshot);
      const lastMigration = await this.migrationTracker.getLastMigration(pluginName);
      if (lastMigration && lastMigration.hash === currentHash) {
        logger13.info({ src: "plugin:sql", pluginName, hash: currentHash }, "No changes detected, skipping migration");
        return;
      }
      let previousSnapshot = await this.snapshotStorage.getLatestSnapshot(pluginName);
      if (!previousSnapshot && Object.keys(currentSnapshot.tables).length > 0) {
        const hasExistingTables = await this.introspector.hasExistingTables(pluginName);
        if (hasExistingTables) {
          logger13.info({ src: "plugin:sql", pluginName }, "No snapshot found but tables exist in database, introspecting");
          const schemaName = this.getExpectedSchemaName(pluginName);
          const introspectedSnapshot = await this.introspector.introspectSchema(schemaName);
          const expectedTableNames = new Set;
          for (const tableKey of Object.keys(currentSnapshot.tables)) {
            const tableData = currentSnapshot.tables[tableKey];
            const tableName = tableData.name || tableKey.split(".").pop();
            expectedTableNames.add(tableName);
          }
          const filteredTables = {};
          for (const tableKey of Object.keys(introspectedSnapshot.tables)) {
            const tableData = introspectedSnapshot.tables[tableKey];
            const tableName = tableData.name || tableKey.split(".").pop();
            if (expectedTableNames.has(tableName)) {
              filteredTables[tableKey] = tableData;
            } else {
              logger13.debug({ src: "plugin:sql", pluginName, tableName }, "Ignoring table from introspection (not in current schema)");
            }
          }
          const filteredSnapshot = {
            ...introspectedSnapshot,
            tables: filteredTables
          };
          if (Object.keys(filteredSnapshot.tables).length > 0) {
            await this.snapshotStorage.saveSnapshot(pluginName, 0, filteredSnapshot);
            await this.journalStorage.updateJournal(pluginName, 0, `introspected_${Date.now()}`, true);
            const filteredHash = hashSnapshot(filteredSnapshot);
            await this.migrationTracker.recordMigration(pluginName, filteredHash, Date.now());
            logger13.info({ src: "plugin:sql", pluginName }, "Created initial snapshot from existing database");
            previousSnapshot = filteredSnapshot;
          }
        }
      }
      if (!hasChanges(previousSnapshot, currentSnapshot)) {
        logger13.info({ src: "plugin:sql", pluginName }, "No schema changes");
        if (!previousSnapshot && Object.keys(currentSnapshot.tables).length === 0) {
          logger13.info({ src: "plugin:sql", pluginName }, "Recording empty schema");
          await this.migrationTracker.recordMigration(pluginName, currentHash, Date.now());
          const idx = await this.journalStorage.getNextIdx(pluginName);
          const tag = this.generateMigrationTag(idx, pluginName);
          await this.journalStorage.updateJournal(pluginName, idx, tag, true);
          await this.snapshotStorage.saveSnapshot(pluginName, idx, currentSnapshot);
        }
        return;
      }
      const diff = await calculateDiff(previousSnapshot, currentSnapshot);
      if (!hasDiffChanges(diff)) {
        logger13.info({ src: "plugin:sql", pluginName }, "No actionable changes");
        return;
      }
      const dataLossCheck = checkForDataLoss(diff);
      if (dataLossCheck.hasDataLoss) {
        const isProduction = false;
        const allowDestructive = options.force || options.allowDataLoss || process.env.ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS === "true";
        if (!allowDestructive) {
          logger13.error({
            src: "plugin:sql",
            pluginName,
            environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
            warnings: dataLossCheck.warnings
          }, "Destructive migration blocked - set ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS=true or use force option");
          const errorMessage = isProduction ? `Destructive migration blocked in production for ${pluginName}. Set ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS=true or use drizzle-kit.` : `Destructive migration blocked for ${pluginName}. Set ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS=true to proceed.`;
          throw new Error(errorMessage);
        }
        if (dataLossCheck.requiresConfirmation) {
          logger13.warn({ src: "plugin:sql", pluginName, warnings: dataLossCheck.warnings }, "Proceeding with destructive migration");
        }
      }
      const sqlStatements = await generateMigrationSQL(previousSnapshot, currentSnapshot, diff);
      if (sqlStatements.length === 0) {
        logger13.info({ src: "plugin:sql", pluginName }, "No SQL statements to execute");
        return;
      }
      logger13.info({ src: "plugin:sql", pluginName, statementCount: sqlStatements.length }, "Executing SQL statements");
      if (options.verbose) {
        sqlStatements.forEach((stmt, i) => {
          logger13.debug({ src: "plugin:sql", statementIndex: i + 1, statement: stmt }, "SQL statement");
        });
      }
      if (options.dryRun) {
        logger13.info({ src: "plugin:sql", pluginName, statements: sqlStatements }, "DRY RUN mode - not executing statements");
        return;
      }
      await this.executeMigration(pluginName, currentSnapshot, currentHash, sqlStatements);
      logger13.info({ src: "plugin:sql", pluginName }, "Migration completed successfully");
      return;
    } catch (error) {
      logger13.error({
        src: "plugin:sql",
        pluginName,
        error: error instanceof Error ? error.message : String(error)
      }, "Migration failed");
      throw error;
    } finally {
      const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
      const isRealPostgres = this.isRealPostgresDatabase(postgresUrl);
      if (lockAcquired && isRealPostgres) {
        try {
          const lockIdStr = lockId.toString();
          await this.db.execute(sql`SELECT pg_advisory_unlock(CAST(${lockIdStr} AS bigint))`);
          logger13.debug({ src: "plugin:sql", pluginName }, "Advisory lock released");
        } catch (unlockError) {
          logger13.warn({
            src: "plugin:sql",
            pluginName,
            error: unlockError instanceof Error ? unlockError.message : String(unlockError)
          }, "Failed to release advisory lock");
        }
      }
    }
  }
  async executeMigration(pluginName, snapshot, hash, sqlStatements) {
    let transactionStarted = false;
    try {
      await this.db.execute(sql`BEGIN`);
      transactionStarted = true;
      for (const stmt of sqlStatements) {
        logger13.debug({ src: "plugin:sql", statement: stmt }, "Executing SQL statement");
        await this.db.execute(sql.raw(stmt));
      }
      const idx = await this.journalStorage.getNextIdx(pluginName);
      await this.migrationTracker.recordMigration(pluginName, hash, Date.now());
      const tag = this.generateMigrationTag(idx, pluginName);
      await this.journalStorage.updateJournal(pluginName, idx, tag, true);
      await this.snapshotStorage.saveSnapshot(pluginName, idx, snapshot);
      await this.db.execute(sql`COMMIT`);
      logger13.info({ src: "plugin:sql", pluginName, tag }, "Recorded migration");
    } catch (error) {
      if (transactionStarted) {
        try {
          await this.db.execute(sql`ROLLBACK`);
          logger13.error({ src: "plugin:sql", error: error instanceof Error ? error.message : String(error) }, "Migration failed, rolled back");
        } catch (rollbackError) {
          logger13.error({
            src: "plugin:sql",
            error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
          }, "Failed to rollback transaction");
        }
      }
      throw error;
    }
  }
  generateMigrationTag(idx, pluginName) {
    const prefix = idx.toString().padStart(4, "0");
    const timestamp3 = Date.now().toString(36);
    return `${prefix}_${pluginName}_${timestamp3}`;
  }
  async getStatus(pluginName) {
    const lastMigration = await this.migrationTracker.getLastMigration(pluginName);
    const journal = await this.journalStorage.loadJournal(pluginName);
    const snapshots = await this.snapshotStorage.getAllSnapshots(pluginName);
    return {
      hasRun: !!lastMigration,
      lastMigration,
      journal,
      snapshots: snapshots.length
    };
  }
  async reset(pluginName) {
    logger13.warn({ src: "plugin:sql", pluginName }, "Resetting migrations");
    await this.db.execute(sql`DELETE FROM migrations._migrations WHERE plugin_name = ${pluginName}`);
    await this.db.execute(sql`DELETE FROM migrations._journal WHERE plugin_name = ${pluginName}`);
    await this.db.execute(sql`DELETE FROM migrations._snapshots WHERE plugin_name = ${pluginName}`);
    logger13.warn({ src: "plugin:sql", pluginName }, "Reset complete");
  }
  async checkMigration(pluginName, schema2) {
    try {
      logger13.info({ src: "plugin:sql", pluginName }, "Checking migration");
      const currentSnapshot = await generateSnapshot(schema2);
      const previousSnapshot = await this.snapshotStorage.getLatestSnapshot(pluginName);
      if (!hasChanges(previousSnapshot, currentSnapshot)) {
        logger13.info({ src: "plugin:sql", pluginName }, "No changes detected");
        return null;
      }
      const diff = await calculateDiff(previousSnapshot, currentSnapshot);
      const dataLossCheck = checkForDataLoss(diff);
      if (dataLossCheck.hasDataLoss) {
        logger13.warn({ src: "plugin:sql", pluginName }, "Migration would cause data loss");
      } else {
        logger13.info({ src: "plugin:sql", pluginName }, "Migration is safe (no data loss)");
      }
      return dataLossCheck;
    } catch (error) {
      logger13.error({
        src: "plugin:sql",
        pluginName,
        error: error instanceof Error ? error.message : String(error)
      }, "Failed to check migration");
      throw error;
    }
  }
}
var init_runtime_migrator = __esm(() => {
  init_drizzle_orm();
  init_migration_tracker();
  init_journal_storage();
  init_snapshot_storage();
  init_extension_manager();
  init_snapshot_generator();
  init_sql_generator();
  init_schema_transformer();
  init_database_introspector();
});

// src/runtime-migrator/index.ts
var init_runtime_migrator2 = __esm(() => {
  init_runtime_migrator();
});

// src/migrations.ts
import { logger as logger14 } from "@elizaos/core";
async function migrateToEntityRLS(adapter) {
  const db2 = getDb(adapter);
  try {
    await db2.execute(sql`SELECT 1 FROM pg_tables LIMIT 1`);
  } catch {
    logger14.debug("[Migration] ⊘ Not PostgreSQL, skipping PostgreSQL-specific migrations");
    return;
  }
  let schemaAlreadyMigrated = false;
  try {
    const migrationCheck = await db2.execute(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'rooms'
        AND column_name = 'agent_id'
    `);
    if (migrationCheck.rows && migrationCheck.rows.length > 0) {
      schemaAlreadyMigrated = true;
      logger14.debug("[Migration] ⊘ Schema already migrated (snake_case columns exist)");
    }
  } catch {
    logger14.debug("[Migration] → rooms table not found, will be created by RuntimeMigrator");
    return;
  }
  if (schemaAlreadyMigrated) {
    const dataIsolationEnabled = process.env.ENABLE_DATA_ISOLATION === "true";
    if (dataIsolationEnabled) {
      logger14.debug("[Migration] ⊘ Schema already migrated, RLS enabled - nothing to do");
      return;
    }
    logger14.debug("[Migration] → Schema migrated but RLS disabled, cleaning up...");
    try {
      const tablesWithRls = await db2.execute(sql`
        SELECT c.relname as tablename
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relrowsecurity = true
        ORDER BY c.relname
      `);
      if (tablesWithRls.rows && tablesWithRls.rows.length > 0) {
        for (const row of tablesWithRls.rows) {
          const tableName = row.tablename;
          try {
            await db2.execute(sql.raw(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`));
          } catch {}
        }
        logger14.debug(`[Migration] ✓ RLS cleanup completed (${tablesWithRls.rows.length} tables)`);
      } else {
        logger14.debug("[Migration] ⊘ No tables with RLS to clean up");
      }
    } catch {
      logger14.debug("[Migration] ⊘ Could not perform RLS cleanup");
    }
    return;
  }
  logger14.info("[Migration] Starting pre-1.6.5 → 1.6.5+ schema migration...");
  try {
    logger14.debug("[Migration] → Clearing RuntimeMigrator snapshot cache...");
    try {
      await db2.execute(sql`DELETE FROM migrations._snapshots WHERE plugin_name = '@elizaos/plugin-sql'`);
      logger14.debug("[Migration] ✓ Snapshot cache cleared");
    } catch (error) {
      logger14.debug("[Migration] ⊘ No snapshot cache to clear (migrations schema not yet created)");
    }
    logger14.debug("[Migration] → Checking for Row Level Security to disable...");
    try {
      const tablesWithRls = await db2.execute(sql`
        SELECT c.relname as tablename
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relrowsecurity = true
        ORDER BY c.relname
      `);
      if (tablesWithRls.rows && tablesWithRls.rows.length > 0) {
        for (const row of tablesWithRls.rows) {
          const tableName = row.tablename;
          try {
            await db2.execute(sql.raw(`ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY`));
            logger14.debug(`[Migration] ✓ Disabled RLS on ${tableName}`);
          } catch (error) {
            logger14.debug(`[Migration] ⊘ Could not disable RLS on ${tableName}`);
          }
        }
      } else {
        logger14.debug("[Migration] ⊘ No tables with RLS enabled");
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not check RLS (may not have permissions)");
    }
    logger14.debug("[Migration] → Handling serverId/server_id → message_server_id migrations...");
    const tablesToMigrate = ["channels", "worlds", "rooms"];
    for (const tableName of tablesToMigrate) {
      try {
        const columnsResult = await db2.execute(sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ${tableName}
            AND column_name IN ('server_id', 'serverId', 'message_server_id')
          ORDER BY column_name
        `);
        const columns2 = columnsResult.rows || [];
        const serverIdSnake = columns2.find((c) => c.column_name === "server_id");
        const serverIdCamel = columns2.find((c) => c.column_name === "serverId");
        const messageServerId = columns2.find((c) => c.column_name === "message_server_id");
        const serverId = serverIdSnake || serverIdCamel;
        const oldColumnName = serverIdSnake ? "server_id" : "serverId";
        if (serverId && !messageServerId) {
          logger14.debug(`[Migration] → Renaming ${tableName}.${oldColumnName} to message_server_id...`);
          await db2.execute(sql.raw(`ALTER TABLE "${tableName}" RENAME COLUMN "${oldColumnName}" TO "message_server_id"`));
          logger14.debug(`[Migration] ✓ Renamed ${tableName}.${oldColumnName} → message_server_id`);
          if (serverId.data_type === "text") {
            try {
              logger14.debug(`[Migration] → Dropping DEFAULT constraint on ${tableName}.message_server_id...`);
              await db2.execute(sql.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "message_server_id" DROP DEFAULT`));
              logger14.debug(`[Migration] ✓ Dropped DEFAULT constraint`);
            } catch {
              logger14.debug(`[Migration] ⊘ No DEFAULT constraint to drop on ${tableName}.message_server_id`);
            }
            try {
              logger14.debug(`[Migration] → Converting ${tableName}.message_server_id from text to uuid...`);
              await db2.execute(sql.raw(`
                  ALTER TABLE "${tableName}"
                  ALTER COLUMN "message_server_id" TYPE uuid
                  USING CASE
                    WHEN "message_server_id" IS NULL THEN NULL
                    WHEN "message_server_id" = '' THEN NULL
                    WHEN "message_server_id" ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                    THEN "message_server_id"::uuid
                    ELSE md5("message_server_id")::uuid
                  END
                `));
              logger14.debug(`[Migration] ✓ Converted ${tableName}.message_server_id to uuid`);
            } catch (convertError) {
              logger14.warn(`[Migration] ⚠️ Could not convert ${tableName}.message_server_id to uuid: ${convertError}`);
            }
          }
          if (tableName === "channels") {
            const nullCountResult = await db2.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}" WHERE "message_server_id" IS NULL`));
            const nullCount = nullCountResult.rows?.[0]?.count;
            if (nullCount && parseInt(nullCount, 10) > 0) {
              logger14.warn(`[Migration] ⚠️ ${tableName} has ${nullCount} rows with NULL message_server_id - these will be deleted`);
              await db2.execute(sql.raw(`DELETE FROM "${tableName}" WHERE "message_server_id" IS NULL`));
              logger14.debug(`[Migration] ✓ Deleted ${nullCount} rows with NULL message_server_id from ${tableName}`);
            }
            logger14.debug(`[Migration] → Making ${tableName}.message_server_id NOT NULL...`);
            await db2.execute(sql.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "message_server_id" SET NOT NULL`));
            logger14.debug(`[Migration] ✓ Set ${tableName}.message_server_id NOT NULL`);
          }
        } else if (serverId && messageServerId) {
          logger14.debug(`[Migration] → ${tableName} has both columns, dropping ${oldColumnName}...`);
          await db2.execute(sql.raw(`ALTER TABLE "${tableName}" DROP COLUMN "${oldColumnName}" CASCADE`));
          logger14.debug(`[Migration] ✓ Dropped ${tableName}.${oldColumnName}`);
        } else if (!serverId && messageServerId) {
          if (messageServerId.data_type === "text") {
            logger14.debug(`[Migration] → ${tableName}.message_server_id exists but is TEXT, needs UUID conversion...`);
            logger14.debug(`[Migration] → Dropping DEFAULT constraint on ${tableName}.message_server_id...`);
            await db2.execute(sql.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "message_server_id" DROP DEFAULT`));
            logger14.debug(`[Migration] ✓ Dropped DEFAULT constraint`);
            logger14.debug(`[Migration] → Converting ${tableName}.message_server_id from text to uuid (generating UUIDs from text)...`);
            await db2.execute(sql.raw(`
              ALTER TABLE "${tableName}"
              ALTER COLUMN "message_server_id" TYPE uuid
              USING CASE
                WHEN "message_server_id" ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                THEN "message_server_id"::uuid
                ELSE md5("message_server_id")::uuid
              END
            `));
            logger14.debug(`[Migration] ✓ Converted ${tableName}.message_server_id to uuid`);
          } else {
            logger14.debug(`[Migration] ⊘ ${tableName}.message_server_id already UUID, skipping`);
          }
        } else {
          logger14.debug(`[Migration] ⊘ ${tableName} already migrated, skipping`);
        }
      } catch (error) {
        logger14.warn(`[Migration] ⚠️ Error migrating ${tableName}.server_id: ${error}`);
      }
    }
    logger14.debug("[Migration] → Dropping all remaining RLS-managed server_id columns...");
    try {
      const serverIdColumnsResult = await db2.execute(sql`
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'server_id'
          AND table_name NOT IN (
            'servers',              -- server_id is the primary key
            'agents',               -- server_id is in the schema (for RLS)
            'channels',             -- already handled above
            'worlds',               -- already handled above
            'rooms',                -- already handled above
            'server_agents',        -- server_id is part of composite key
            'drizzle_migrations',
            '__drizzle_migrations'
          )
        ORDER BY table_name
      `);
      const tablesToClean = serverIdColumnsResult.rows || [];
      logger14.debug(`[Migration] → Found ${tablesToClean.length} tables with server_id columns`);
      for (const row of tablesToClean) {
        const tableName = row.table_name;
        try {
          await db2.execute(sql.raw(`ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS server_id CASCADE`));
          logger14.debug(`[Migration] ✓ Dropped server_id from ${tableName}`);
        } catch (error) {
          logger14.debug(`[Migration] ⊘ Could not drop server_id from ${tableName}`);
        }
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not drop server_id columns (may not have permissions)");
    }
    logger14.debug("[Migration] → Checking agents.owner_id → server_id rename...");
    try {
      const agentsColumnsResult = await db2.execute(sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'agents'
          AND column_name IN ('owner_id', 'server_id')
        ORDER BY column_name
      `);
      const agentsColumns = agentsColumnsResult.rows || [];
      const hasOwnerId = agentsColumns.some((c) => c.column_name === "owner_id");
      const hasServerId = agentsColumns.some((c) => c.column_name === "server_id");
      if (hasOwnerId && !hasServerId) {
        logger14.debug("[Migration] → Renaming agents.owner_id to server_id...");
        await db2.execute(sql.raw(`ALTER TABLE "agents" RENAME COLUMN "owner_id" TO "server_id"`));
        logger14.debug("[Migration] ✓ Renamed agents.owner_id → server_id");
      } else if (hasOwnerId && hasServerId) {
        logger14.debug("[Migration] → Both owner_id and server_id exist, dropping owner_id...");
        await db2.execute(sql.raw(`ALTER TABLE "agents" DROP COLUMN "owner_id" CASCADE`));
        logger14.debug("[Migration] ✓ Dropped agents.owner_id");
      } else {
        logger14.debug("[Migration] ⊘ agents table already has server_id (or no owner_id), skipping");
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not check/migrate agents.owner_id");
    }
    logger14.debug("[Migration] → Checking for owners → servers data migration...");
    try {
      const ownersTableResult = await db2.execute(sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'owners'
      `);
      if (ownersTableResult.rows && ownersTableResult.rows.length > 0) {
        logger14.debug("[Migration] → Ensuring servers table exists...");
        await db2.execute(sql.raw(`
          CREATE TABLE IF NOT EXISTS "servers" (
            "id" uuid PRIMARY KEY,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL
          )
        `));
        logger14.debug("[Migration] → Migrating owners data to servers...");
        await db2.execute(sql.raw(`
          INSERT INTO "servers" ("id", "created_at", "updated_at")
          SELECT "id", COALESCE("created_at", now()), COALESCE("updated_at", now())
          FROM "owners"
          ON CONFLICT ("id") DO NOTHING
        `));
        logger14.debug("[Migration] ✓ Migrated owners data to servers");
        logger14.debug("[Migration] → Dropping obsolete owners table...");
        await db2.execute(sql.raw(`DROP TABLE IF EXISTS "owners" CASCADE`));
        logger14.debug("[Migration] ✓ Dropped obsolete owners table");
      } else {
        logger14.debug("[Migration] ⊘ owners table not found, skipping");
      }
    } catch (error) {
      logger14.warn(`[Migration] ⚠️ Could not migrate owners → servers: ${error}`);
    }
    logger14.debug("[Migration] → Checking server_agents table rename...");
    try {
      const tablesResult = await db2.execute(sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('server_agents', 'message_server_agents')
        ORDER BY table_name
      `);
      const tables = tablesResult.rows || [];
      const hasServerAgents = tables.some((t) => t.table_name === "server_agents");
      const hasMessageServerAgents = tables.some((t) => t.table_name === "message_server_agents");
      if (hasServerAgents && !hasMessageServerAgents) {
        logger14.debug("[Migration] → Renaming server_agents to message_server_agents...");
        await db2.execute(sql.raw(`ALTER TABLE "server_agents" RENAME TO "message_server_agents"`));
        logger14.debug("[Migration] ✓ Renamed server_agents → message_server_agents");
        logger14.debug("[Migration] → Renaming message_server_agents.server_id to message_server_id...");
        await db2.execute(sql.raw(`ALTER TABLE "message_server_agents" RENAME COLUMN "server_id" TO "message_server_id"`));
        logger14.debug("[Migration] ✓ Renamed message_server_agents.server_id → message_server_id");
      } else if (!hasServerAgents && !hasMessageServerAgents) {
        logger14.debug("[Migration] ⊘ No server_agents table to migrate");
      } else if (hasMessageServerAgents) {
        logger14.debug("[Migration] → Checking message_server_agents columns...");
        const columnsResult = await db2.execute(sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'message_server_agents'
            AND column_name IN ('server_id', 'message_server_id')
          ORDER BY column_name
        `);
        const columns2 = columnsResult.rows || [];
        const hasServerId = columns2.some((c) => c.column_name === "server_id");
        const hasMessageServerId = columns2.some((c) => c.column_name === "message_server_id");
        if (hasServerId && !hasMessageServerId) {
          logger14.debug("[Migration] → Renaming message_server_agents.server_id to message_server_id...");
          await db2.execute(sql.raw(`ALTER TABLE "message_server_agents" RENAME COLUMN "server_id" TO "message_server_id"`));
          logger14.debug("[Migration] ✓ Renamed message_server_agents.server_id → message_server_id");
        } else if (!hasServerId && !hasMessageServerId) {
          logger14.debug("[Migration] → message_server_agents exists without required columns, truncating...");
          await db2.execute(sql`TRUNCATE TABLE message_server_agents CASCADE`);
          logger14.debug("[Migration] ✓ Truncated message_server_agents");
        } else {
          logger14.debug("[Migration] ⊘ message_server_agents already has correct schema");
        }
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not check/migrate server_agents table");
    }
    logger14.debug("[Migration] → Checking channel_participants table...");
    try {
      const columnsResult = await db2.execute(sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'channel_participants'
          AND column_name IN ('user_id', 'entity_id')
        ORDER BY column_name
      `);
      const columns2 = columnsResult.rows || [];
      const hasUserId = columns2.some((c) => c.column_name === "user_id");
      const hasEntityId = columns2.some((c) => c.column_name === "entity_id");
      if (hasUserId && !hasEntityId) {
        logger14.debug("[Migration] → Renaming channel_participants.user_id to entity_id...");
        await db2.execute(sql.raw(`ALTER TABLE "channel_participants" RENAME COLUMN "user_id" TO "entity_id"`));
        logger14.debug("[Migration] ✓ Renamed channel_participants.user_id → entity_id");
      } else if (!hasUserId && !hasEntityId) {
        logger14.debug("[Migration] → channel_participants exists without entity_id or user_id, truncating...");
        await db2.execute(sql`TRUNCATE TABLE channel_participants CASCADE`);
        logger14.debug("[Migration] ✓ Truncated channel_participants");
      } else {
        logger14.debug("[Migration] ⊘ channel_participants already has entity_id column");
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not check/migrate channel_participants");
    }
    logger14.debug("[Migration] → Discovering and dropping all regular indexes...");
    try {
      const indexesResult = await db2.execute(sql`
        SELECT i.relname AS index_name
        FROM pg_index idx
        JOIN pg_class i ON i.oid = idx.indexrelid
        JOIN pg_class c ON c.oid = idx.indrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_constraint con ON con.conindid = idx.indexrelid
        WHERE n.nspname = 'public'
          AND NOT idx.indisprimary  -- Not a primary key
          AND con.contype IS NULL   -- Not a constraint (unique, etc)
        ORDER BY i.relname
      `);
      const indexesToDrop = indexesResult.rows || [];
      logger14.debug(`[Migration] → Found ${indexesToDrop.length} indexes to drop`);
      for (const row of indexesToDrop) {
        const indexName = row.index_name;
        try {
          await db2.execute(sql.raw(`DROP INDEX IF EXISTS "${indexName}"`));
          logger14.debug(`[Migration] ✓ Dropped index ${indexName}`);
        } catch (error) {
          logger14.debug(`[Migration] ⊘ Could not drop index ${indexName}`);
        }
      }
    } catch (error) {
      logger14.debug("[Migration] ⊘ Could not drop indexes (may not have permissions)");
    }
    logger14.debug("[Migration] → Starting camelCase → snake_case column renames...");
    const columnRenames = [
      { table: "rooms", from: "agentId", to: "agent_id" },
      { table: "rooms", from: "worldId", to: "world_id" },
      { table: "rooms", from: "channelId", to: "channel_id" },
      { table: "rooms", from: "createdAt", to: "created_at" },
      { table: "worlds", from: "agentId", to: "agent_id" },
      { table: "worlds", from: "createdAt", to: "created_at" },
      { table: "memories", from: "createdAt", to: "created_at" },
      { table: "memories", from: "entityId", to: "entity_id" },
      { table: "memories", from: "agentId", to: "agent_id" },
      { table: "memories", from: "roomId", to: "room_id" },
      { table: "memories", from: "worldId", to: "world_id" },
      { table: "components", from: "entityId", to: "entity_id" },
      { table: "components", from: "agentId", to: "agent_id" },
      { table: "components", from: "roomId", to: "room_id" },
      { table: "components", from: "worldId", to: "world_id" },
      { table: "components", from: "sourceEntityId", to: "source_entity_id" },
      { table: "components", from: "createdAt", to: "created_at" },
      { table: "participants", from: "entityId", to: "entity_id" },
      { table: "participants", from: "roomId", to: "room_id" },
      { table: "participants", from: "agentId", to: "agent_id" },
      { table: "participants", from: "roomState", to: "room_state" },
      { table: "participants", from: "createdAt", to: "created_at" },
      { table: "relationships", from: "sourceEntityId", to: "source_entity_id" },
      { table: "relationships", from: "targetEntityId", to: "target_entity_id" },
      { table: "relationships", from: "agentId", to: "agent_id" },
      { table: "relationships", from: "createdAt", to: "created_at" },
      { table: "logs", from: "entityId", to: "entity_id" },
      { table: "logs", from: "roomId", to: "room_id" },
      { table: "logs", from: "createdAt", to: "created_at" },
      { table: "tasks", from: "roomId", to: "room_id" },
      { table: "tasks", from: "worldId", to: "world_id" },
      { table: "tasks", from: "entityId", to: "entity_id" },
      { table: "tasks", from: "createdAt", to: "created_at" },
      { table: "tasks", from: "updatedAt", to: "updated_at" },
      { table: "agents", from: "createdAt", to: "created_at" },
      { table: "agents", from: "updatedAt", to: "updated_at" },
      { table: "entities", from: "agentId", to: "agent_id" },
      { table: "entities", from: "createdAt", to: "created_at" },
      { table: "embeddings", from: "memoryId", to: "memory_id" },
      { table: "embeddings", from: "createdAt", to: "created_at" },
      { table: "cache", from: "agentId", to: "agent_id" },
      { table: "cache", from: "createdAt", to: "created_at" },
      { table: "cache", from: "expiresAt", to: "expires_at" }
    ];
    for (const rename of columnRenames) {
      try {
        const tableExistsResult = await db2.execute(sql`
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ${rename.table}
        `);
        if (!tableExistsResult.rows || tableExistsResult.rows.length === 0) {
          continue;
        }
        const columnsResult = await db2.execute(sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ${rename.table}
            AND column_name IN (${rename.from}, ${rename.to})
          ORDER BY column_name
        `);
        const columns2 = columnsResult.rows || [];
        const hasOldColumn = columns2.some((c) => c.column_name === rename.from);
        const hasNewColumn = columns2.some((c) => c.column_name === rename.to);
        if (hasOldColumn && !hasNewColumn) {
          logger14.debug(`[Migration] → Renaming ${rename.table}.${rename.from} to ${rename.to}...`);
          await db2.execute(sql.raw(`ALTER TABLE "${rename.table}" RENAME COLUMN "${rename.from}" TO "${rename.to}"`));
          logger14.debug(`[Migration] ✓ Renamed ${rename.table}.${rename.from} → ${rename.to}`);
        } else if (hasOldColumn && hasNewColumn) {
          logger14.debug(`[Migration] → Both columns exist, dropping ${rename.table}.${rename.from}...`);
          await db2.execute(sql.raw(`ALTER TABLE "${rename.table}" DROP COLUMN "${rename.from}" CASCADE`));
          logger14.debug(`[Migration] ✓ Dropped ${rename.table}.${rename.from}`);
        }
      } catch (error) {
        logger14.debug(`[Migration] ⊘ Could not process ${rename.table}.${rename.from}: ${error}`);
      }
    }
    logger14.debug("[Migration] ✓ Completed camelCase → snake_case column renames");
    logger14.info("[Migration] ✓ Migration complete - pre-1.6.5 → 1.6.5+ schema migration finished");
  } catch (error) {
    logger14.error("[Migration] Migration failed:", String(error));
    throw error;
  }
}
var init_migrations = __esm(() => {
  init_drizzle_orm();
});

// src/rls.ts
import { logger as logger15, validateUuid } from "@elizaos/core";
async function installRLSFunctions(adapter) {
  const db2 = getDb(adapter);
  await db2.execute(sql`
    CREATE TABLE IF NOT EXISTS servers (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION current_server_id() RETURNS UUID AS $$
    DECLARE
      server_id_text TEXT;
    BEGIN
      server_id_text := NULLIF(current_setting('app.server_id', TRUE), '');

      IF server_id_text IS NULL OR server_id_text = '' THEN
        RETURN NULL;
      END IF;

      BEGIN
        RETURN server_id_text::UUID;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
    END;
    $$ LANGUAGE plpgsql STABLE;
  `);
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION add_server_isolation(
      schema_name text,
      table_name text
    ) RETURNS void AS $$
    DECLARE
      full_table_name text;
      column_exists boolean;
      orphaned_count bigint;
    BEGIN
      full_table_name := schema_name || '.' || table_name;

      -- Check if server_id column already exists
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE information_schema.columns.table_schema = schema_name
          AND information_schema.columns.table_name = add_server_isolation.table_name
          AND information_schema.columns.column_name = 'server_id'
      ) INTO column_exists;

      -- Add server_id column if missing (DEFAULT populates it automatically for new rows)
      IF NOT column_exists THEN
        EXECUTE format('ALTER TABLE %I.%I ADD COLUMN server_id UUID DEFAULT current_server_id()', schema_name, table_name);

        -- Backfill existing rows with current server_id
        -- This ensures all existing data belongs to the server instance that is enabling RLS
        EXECUTE format('UPDATE %I.%I SET server_id = current_server_id() WHERE server_id IS NULL', schema_name, table_name);
      ELSE
        -- Column already exists (RLS was previously enabled then disabled)
        -- Restore the DEFAULT clause (may have been removed during uninstallRLS)
        EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN server_id SET DEFAULT current_server_id()', schema_name, table_name);

        -- Only backfill NULL server_id rows, do NOT steal data from other servers
        EXECUTE format('SELECT COUNT(*) FROM %I.%I WHERE server_id IS NULL', schema_name, table_name) INTO orphaned_count;

        IF orphaned_count > 0 THEN
          RAISE NOTICE 'Backfilling % rows with NULL server_id in %.%', orphaned_count, schema_name, table_name;
          EXECUTE format('UPDATE %I.%I SET server_id = current_server_id() WHERE server_id IS NULL', schema_name, table_name);
        END IF;
      END IF;

      -- Create index for efficient server_id filtering
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_server_id ON %I.%I(server_id)', table_name, schema_name, table_name);

      -- Enable RLS on the table
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name, table_name);

      -- FORCE RLS even for table owners (critical for security)
      EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', schema_name, table_name);

      -- Drop existing policy if present
      EXECUTE format('DROP POLICY IF EXISTS server_isolation_policy ON %I.%I', schema_name, table_name);

      -- Create isolation policy: users can only see/modify rows where server_id matches current server instance
      -- No NULL clause - all rows must have a valid server_id (backfilled during column addition)
      EXECUTE format('
        CREATE POLICY server_isolation_policy ON %I.%I
        USING (server_id = current_server_id())
        WITH CHECK (server_id = current_server_id())
      ', schema_name, table_name);
    END;
    $$ LANGUAGE plpgsql;
  `);
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION apply_rls_to_all_tables() RETURNS void AS $$
    DECLARE
      tbl record;
    BEGIN
      FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN (
            'servers',
            'drizzle_migrations',
            '__drizzle_migrations'
          )
      LOOP
        BEGIN
          PERFORM add_server_isolation(tbl.schemaname, tbl.tablename);
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Failed to apply RLS to %.%: %', tbl.schemaname, tbl.tablename, SQLERRM;
        END;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql;
  `);
  logger15.info({ src: "plugin:sql" }, "RLS PostgreSQL functions installed");
  await installEntityRLS(adapter);
}
async function getOrCreateRlsServer(adapter, serverId) {
  const db2 = getDb(adapter);
  await db2.insert(serverTable).values({
    id: serverId
  }).onConflictDoNothing();
  logger15.info({ src: "plugin:sql", serverId: serverId.slice(0, 8) }, "RLS server registered");
  return serverId;
}
async function setServerContext(adapter, serverId) {
  if (!validateUuid(serverId)) {
    throw new Error(`Invalid server ID format: ${serverId}. Must be a valid UUID.`);
  }
  const db2 = getDb(adapter);
  const servers = await db2.select().from(serverTable).where(eq(serverTable.id, serverId));
  if (servers.length === 0) {
    throw new Error(`Server ${serverId} does not exist`);
  }
  logger15.info({ src: "plugin:sql", serverId: serverId.slice(0, 8) }, "RLS context configured");
}
async function assignAgentToServer(adapter, agentId, serverId) {
  if (!agentId || !serverId) {
    logger15.warn(`[Data Isolation] Cannot assign agent to server: invalid agentId (${agentId}) or serverId (${serverId})`);
    return;
  }
  const db2 = getDb(adapter);
  const agents = await db2.select().from(agentTable).where(eq(agentTable.id, agentId));
  if (agents.length > 0) {
    const agent = agents[0];
    const currentServerId = agent.server_id;
    if (currentServerId === serverId) {
      logger15.debug({ src: "plugin:sql", agentName: agent.name }, "Agent already assigned to correct server");
    } else {
      await db2.update(agentTable).set({ server_id: serverId }).where(eq(agentTable.id, agentId));
      if (currentServerId === null) {
        logger15.info({ src: "plugin:sql", agentName: agent.name }, "Agent assigned to server");
      } else {
        logger15.warn({ src: "plugin:sql", agentName: agent.name }, "Agent server changed");
      }
    }
  } else {
    logger15.debug({ src: "plugin:sql", agentId }, "Agent does not exist yet");
  }
}
async function applyRLSToNewTables(adapter) {
  const db2 = getDb(adapter);
  try {
    await db2.execute(sql`SELECT apply_rls_to_all_tables()`);
    logger15.info({ src: "plugin:sql" }, "RLS applied to all tables");
  } catch (error) {
    logger15.warn({ src: "plugin:sql", error: String(error) }, "Failed to apply RLS to some tables");
  }
}
async function uninstallRLS(adapter) {
  const db2 = getDb(adapter);
  try {
    const checkResult = await db2.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'servers'
      ) as rls_enabled
    `);
    const rlsEnabled = checkResult.rows?.[0]?.rls_enabled;
    if (!rlsEnabled) {
      logger15.debug({ src: "plugin:sql" }, "RLS not installed, skipping cleanup");
      return;
    }
    logger15.info({ src: "plugin:sql" }, "Disabling RLS globally (keeping server_id columns for schema compatibility)...");
    try {
      await uninstallEntityRLS(adapter);
    } catch (entityRlsError) {
      logger15.debug({ src: "plugin:sql" }, "Entity RLS cleanup skipped (not installed or already cleaned)");
    }
    await db2.execute(sql`
      CREATE OR REPLACE FUNCTION _temp_disable_rls_on_table(
        p_schema_name text,
        p_table_name text
      ) RETURNS void AS $$
      DECLARE
        policy_rec record;
      BEGIN
        -- Drop all policies on this table
        FOR policy_rec IN
          SELECT policyname
          FROM pg_policies
          WHERE schemaname = p_schema_name AND tablename = p_table_name
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_rec.policyname, p_schema_name, p_table_name);
        END LOOP;

        -- Disable RLS
        EXECUTE format('ALTER TABLE %I.%I NO FORCE ROW LEVEL SECURITY', p_schema_name, p_table_name);
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', p_schema_name, p_table_name);
      END;
      $$ LANGUAGE plpgsql;
    `);
    const tablesResult = await db2.execute(sql`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('drizzle_migrations', '__drizzle_migrations')
    `);
    for (const row of tablesResult.rows || []) {
      const schemaName = row.schemaname;
      const tableName = row.tablename;
      try {
        await db2.execute(sql`SELECT _temp_disable_rls_on_table(${schemaName}, ${tableName})`);
        logger15.debug({ src: "plugin:sql", schemaName, tableName }, "Disabled RLS on table");
      } catch (error) {
        logger15.warn({ src: "plugin:sql", schemaName, tableName, error: String(error) }, "Failed to disable RLS on table");
      }
    }
    await db2.execute(sql`DROP FUNCTION IF EXISTS _temp_disable_rls_on_table(text, text)`);
    logger15.info({ src: "plugin:sql" }, "Keeping server_id values intact (prevents data theft on re-enable)");
    logger15.info({ src: "plugin:sql" }, "Clearing servers table...");
    await db2.execute(sql`TRUNCATE TABLE servers`);
    await db2.execute(sql`DROP FUNCTION IF EXISTS apply_rls_to_all_tables() CASCADE`);
    await db2.execute(sql`DROP FUNCTION IF EXISTS add_server_isolation(text, text) CASCADE`);
    await db2.execute(sql`DROP FUNCTION IF EXISTS current_server_id() CASCADE`);
    logger15.info({ src: "plugin:sql" }, "Dropped all RLS functions");
    logger15.info({ src: "plugin:sql" }, "RLS disabled successfully (server_id columns preserved)");
  } catch (error) {
    logger15.error({ src: "plugin:sql", error: String(error) }, "Failed to disable RLS");
    throw error;
  }
}
async function installEntityRLS(adapter) {
  const db2 = getDb(adapter);
  logger15.info("[Entity RLS] Installing entity RLS functions and policies...");
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION current_entity_id()
    RETURNS UUID AS $$
    DECLARE
      entity_id_text TEXT;
    BEGIN
      -- Read from transaction-local variable
      entity_id_text := NULLIF(current_setting('app.entity_id', TRUE), '');

      IF entity_id_text IS NULL OR entity_id_text = '' THEN
        RETURN NULL;
      END IF;

      BEGIN
        RETURN entity_id_text::UUID;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
    END;
    $$ LANGUAGE plpgsql STABLE;
  `);
  logger15.info("[Entity RLS] Created current_entity_id() function");
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION add_entity_isolation(
      schema_name text,
      table_name text,
      require_entity boolean DEFAULT false
    ) RETURNS void AS $$
    DECLARE
      full_table_name text;
      has_entity_id boolean;
      has_author_id boolean;
      has_channel_id boolean;
      has_room_id boolean;
      entity_column_name text;
      room_column_name text;
    BEGIN
      full_table_name := schema_name || '.' || table_name;

      -- Check which columns exist
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE information_schema.columns.table_schema = schema_name
          AND information_schema.columns.table_name = add_entity_isolation.table_name
          AND information_schema.columns.column_name = 'entity_id'
      ) INTO has_entity_id;

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE information_schema.columns.table_schema = schema_name
          AND information_schema.columns.table_name = add_entity_isolation.table_name
          AND information_schema.columns.column_name = 'author_id'
      ) INTO has_author_id;

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE information_schema.columns.table_schema = schema_name
          AND information_schema.columns.table_name = add_entity_isolation.table_name
          AND information_schema.columns.column_name = 'room_id'
      ) INTO has_room_id;

      -- Skip if no entity-related columns
      IF NOT (has_entity_id OR has_author_id OR has_room_id) THEN
        RAISE NOTICE '[Entity RLS] Skipping %.%: no entity columns found', schema_name, table_name;
        RETURN;
      END IF;

      -- Determine which column to use for entity filtering
      -- Priority: room_id (shared access via participants) > entity_id/author_id (direct access)
      --
      -- SPECIAL CASE: participants table must use direct entity_id to avoid infinite recursion
      IF table_name = 'participants' AND has_entity_id THEN
        entity_column_name := 'entity_id';
        room_column_name := NULL;
      ELSIF has_room_id THEN
        room_column_name := 'room_id';
        entity_column_name := NULL;
      ELSIF has_entity_id THEN
        entity_column_name := 'entity_id';
        room_column_name := NULL;
      ELSIF has_author_id THEN
        entity_column_name := 'author_id';
        room_column_name := NULL;
      ELSE
        entity_column_name := NULL;
        room_column_name := NULL;
      END IF;

      -- Enable RLS on the table
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name, table_name);
      EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', schema_name, table_name);

      -- Drop existing entity policies if present
      EXECUTE format('DROP POLICY IF EXISTS entity_isolation_policy ON %I.%I', schema_name, table_name);

      -- CASE 1: Table has room_id (shared access via participants)
      IF room_column_name IS NOT NULL THEN
        -- Determine the corresponding column name in participants table
        -- If the table has room_id, look for room_id in participants.room_id
        -- participants table uses: entity_id (for participant), room_id (for room)
        -- RESTRICTIVE: Must pass BOTH server RLS AND entity RLS (combined with AND)

        -- Build policy with or without NULL check based on require_entity parameter
        IF require_entity THEN
          -- STRICT MODE: Entity context is REQUIRED (blocks NULL entity_id)
          EXECUTE format('
            CREATE POLICY entity_isolation_policy ON %I.%I
            AS RESTRICTIVE
            USING (
              current_entity_id() IS NOT NULL
              AND %I IN (
                SELECT room_id
                FROM participants
                WHERE entity_id = current_entity_id()
              )
            )
            WITH CHECK (
              current_entity_id() IS NOT NULL
              AND %I IN (
                SELECT room_id
                FROM participants
                WHERE entity_id = current_entity_id()
              )
            )
          ', schema_name, table_name, room_column_name, room_column_name);
          RAISE NOTICE '[Entity RLS] Applied STRICT RESTRICTIVE to %.% (via % → participants.room_id, entity REQUIRED)', schema_name, table_name, room_column_name;
        ELSE
          -- PERMISSIVE MODE: NULL entity_id allows system/admin access
          EXECUTE format('
            CREATE POLICY entity_isolation_policy ON %I.%I
            AS RESTRICTIVE
            USING (
              current_entity_id() IS NULL
              OR %I IN (
                SELECT room_id
                FROM participants
                WHERE entity_id = current_entity_id()
              )
            )
            WITH CHECK (
              current_entity_id() IS NULL
              OR %I IN (
                SELECT room_id
                FROM participants
                WHERE entity_id = current_entity_id()
              )
            )
          ', schema_name, table_name, room_column_name, room_column_name);
          RAISE NOTICE '[Entity RLS] Applied PERMISSIVE RESTRICTIVE to %.% (via % → participants.room_id, NULL allowed)', schema_name, table_name, room_column_name;
        END IF;

      -- CASE 2: Table has direct entity_id or author_id column
      ELSIF entity_column_name IS NOT NULL THEN
        -- RESTRICTIVE: Must pass BOTH server RLS AND entity RLS (combined with AND)

        IF require_entity THEN
          -- STRICT MODE: Entity context is REQUIRED
          EXECUTE format('
            CREATE POLICY entity_isolation_policy ON %I.%I
            AS RESTRICTIVE
            USING (
              current_entity_id() IS NOT NULL
              AND %I = current_entity_id()
            )
            WITH CHECK (
              current_entity_id() IS NOT NULL
              AND %I = current_entity_id()
            )
          ', schema_name, table_name, entity_column_name, entity_column_name);
          RAISE NOTICE '[Entity RLS] Applied STRICT RESTRICTIVE to %.% (direct column: %, entity REQUIRED)', schema_name, table_name, entity_column_name;
        ELSE
          -- PERMISSIVE MODE: NULL entity_id allows system/admin access
          EXECUTE format('
            CREATE POLICY entity_isolation_policy ON %I.%I
            AS RESTRICTIVE
            USING (
              current_entity_id() IS NULL
              OR %I = current_entity_id()
            )
            WITH CHECK (
              current_entity_id() IS NULL
              OR %I = current_entity_id()
            )
          ', schema_name, table_name, entity_column_name, entity_column_name);
          RAISE NOTICE '[Entity RLS] Applied PERMISSIVE RESTRICTIVE to %.% (direct column: %, NULL allowed)', schema_name, table_name, entity_column_name;
        END IF;
      END IF;

      -- Create indexes for efficient entity filtering
      IF room_column_name IS NOT NULL THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_room ON %I.%I(%I)',
          table_name, schema_name, table_name, room_column_name);
      END IF;

      IF entity_column_name IS NOT NULL THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_entity ON %I.%I(%I)',
          table_name, schema_name, table_name, entity_column_name);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);
  logger15.info("[Entity RLS] Created add_entity_isolation() function");
  await db2.execute(sql`
    CREATE OR REPLACE FUNCTION apply_entity_rls_to_all_tables() RETURNS void AS $$
    DECLARE
      tbl record;
      require_entity_for_table boolean;
    BEGIN
      FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN (
            'servers',              -- Server RLS table
            'users',                -- Authentication table (no entity isolation needed)
            'entity_mappings',      -- Mapping table (no entity isolation needed)
            'drizzle_migrations',   -- Migration tracking
            '__drizzle_migrations'  -- Migration tracking
          )
      LOOP
        BEGIN
          -- Apply STRICT mode (require_entity=true) to sensitive user-facing tables
          -- These tables MUST have entity context set to access data
          -- STRICT tables: memories, logs, components, tasks (user data requiring isolation)
          -- NOTE: Excluded tables:
          --   - 'participants': Adding participants is a privileged operation during initialization
          IF tbl.tablename IN ('memories', 'logs', 'components', 'tasks') THEN
            require_entity_for_table := true;
          ELSE
            -- PERMISSIVE mode (require_entity=false) for system/privileged tables
            -- This includes: participants, rooms, channels, entities, etc.
            require_entity_for_table := false;
          END IF;

          PERFORM add_entity_isolation(tbl.schemaname, tbl.tablename, require_entity_for_table);
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING '[Entity RLS] Failed to apply to %.%: %', tbl.schemaname, tbl.tablename, SQLERRM;
        END;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql;
  `);
  logger15.info("[Entity RLS] Created apply_entity_rls_to_all_tables() function");
  logger15.info("[Entity RLS] Entity RLS functions installed successfully");
}
async function applyEntityRLSToAllTables(adapter) {
  const db2 = getDb(adapter);
  try {
    await db2.execute(sql`SELECT apply_entity_rls_to_all_tables()`);
    logger15.info("[Entity RLS] Applied entity RLS to all eligible tables");
  } catch (error) {
    logger15.warn("[Entity RLS] Failed to apply entity RLS to some tables:", String(error));
  }
}
async function uninstallEntityRLS(adapter) {
  const db2 = getDb(adapter);
  logger15.info("[Entity RLS] Removing entity RLS policies and functions...");
  try {
    const tablesResult = await db2.execute(sql`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('drizzle_migrations', '__drizzle_migrations')
    `);
    for (const row of tablesResult.rows || []) {
      const schemaName = row.schemaname;
      const tableName = row.tablename;
      try {
        await db2.execute(sql.raw(`DROP POLICY IF EXISTS entity_isolation_policy ON "${schemaName}"."${tableName}"`));
        logger15.debug(`[Entity RLS] Dropped entity_isolation_policy from ${schemaName}.${tableName}`);
      } catch (error) {
        logger15.debug(`[Entity RLS] No entity policy on ${schemaName}.${tableName}`);
      }
    }
    await db2.execute(sql`DROP FUNCTION IF EXISTS apply_entity_rls_to_all_tables() CASCADE`);
    await db2.execute(sql`DROP FUNCTION IF EXISTS add_entity_isolation(text, text) CASCADE`);
    await db2.execute(sql`DROP FUNCTION IF EXISTS current_entity_id() CASCADE`);
    logger15.info("[Entity RLS] Entity RLS functions and policies removed successfully");
  } catch (error) {
    logger15.error("[Entity RLS] Failed to remove entity RLS:", String(error));
    throw error;
  }
}
var init_rls = __esm(() => {
  init_drizzle_orm();
  init_server();
  init_agent();
});

// src/migration-service.ts
var exports_migration_service = {};
__export(exports_migration_service, {
  DatabaseMigrationService: () => DatabaseMigrationService
});
import { logger as logger16 } from "@elizaos/core";

class DatabaseMigrationService {
  db = null;
  registeredSchemas = new Map;
  migrator = null;
  constructor() {}
  async initializeWithDatabase(db2) {
    this.db = db2;
    const adapterWrapper = { db: db2 };
    await migrateToEntityRLS(adapterWrapper);
    this.migrator = new RuntimeMigrator(db2);
    await this.migrator.initialize();
    logger16.info({ src: "plugin:sql" }, "DatabaseMigrationService initialized");
  }
  discoverAndRegisterPluginSchemas(plugins) {
    for (const plugin of plugins) {
      const pluginWithSchema = plugin;
      if (pluginWithSchema.schema) {
        this.registeredSchemas.set(plugin.name, pluginWithSchema.schema);
      }
    }
    logger16.info({
      src: "plugin:sql",
      schemasDiscovered: this.registeredSchemas.size,
      totalPlugins: plugins.length
    }, "Plugin schemas discovered");
  }
  registerSchema(pluginName, schema2) {
    this.registeredSchemas.set(pluginName, schema2);
    logger16.debug({ src: "plugin:sql", pluginName }, "Schema registered");
  }
  async runAllPluginMigrations(options) {
    if (!this.db || !this.migrator) {
      throw new Error("Database or migrator not initialized in DatabaseMigrationService");
    }
    const isProduction = false;
    const migrationOptions = {
      verbose: options?.verbose ?? !isProduction,
      force: options?.force ?? false,
      dryRun: options?.dryRun ?? false
    };
    logger16.info({
      src: "plugin:sql",
      environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
      pluginCount: this.registeredSchemas.size,
      dryRun: migrationOptions.dryRun
    }, "Starting migrations");
    let successCount = 0;
    let failureCount = 0;
    const errors2 = [];
    for (const [pluginName, schema2] of this.registeredSchemas) {
      try {
        await this.migrator.migrate(pluginName, schema2, migrationOptions);
        successCount++;
        logger16.info({ src: "plugin:sql", pluginName }, "Migration completed");
      } catch (error) {
        failureCount++;
        const errorMessage = error.message;
        errors2.push({ pluginName, error });
        if (errorMessage.includes("Destructive migration blocked")) {
          logger16.error({ src: "plugin:sql", pluginName }, "Migration blocked - destructive changes detected. Set ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS=true or use force option");
        } else {
          logger16.error({ src: "plugin:sql", pluginName, error: errorMessage }, "Migration failed");
        }
      }
    }
    if (failureCount === 0) {
      logger16.info({ src: "plugin:sql", successCount }, "All migrations completed successfully");
      const dataIsolationEnabled = process.env.ENABLE_DATA_ISOLATION === "true";
      if (dataIsolationEnabled) {
        try {
          logger16.info({ src: "plugin:sql" }, "Re-applying Row Level Security...");
          const adapterWrapper = { db: this.db };
          await installRLSFunctions(adapterWrapper);
          await applyRLSToNewTables(adapterWrapper);
          await applyEntityRLSToAllTables(adapterWrapper);
          logger16.info({ src: "plugin:sql" }, "RLS re-applied successfully");
        } catch (rlsError) {
          const errorMsg = rlsError instanceof Error ? rlsError.message : String(rlsError);
          logger16.warn({ src: "plugin:sql", error: errorMsg }, "Failed to re-apply RLS (this is OK if server_id columns are not yet in schemas)");
        }
      } else {
        logger16.info({ src: "plugin:sql" }, "Skipping RLS re-application (ENABLE_DATA_ISOLATION is not true)");
      }
    } else {
      logger16.error({ src: "plugin:sql", failureCount, successCount }, "Some migrations failed");
      const errorSummary = errors2.map((e) => `${e.pluginName}: ${e.error.message}`).join(`
  `);
      throw new Error(`${failureCount} migration(s) failed:
  ${errorSummary}`);
    }
  }
  getMigrator() {
    return this.migrator;
  }
}
var init_migration_service = __esm(() => {
  init_runtime_migrator2();
  init_migrations();
  init_rls();
});

// ../../node_modules/ws/lib/constants.js
var require_constants = __commonJS((exports, module) => {
  var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
  var hasBlob = typeof Blob !== "undefined";
  if (hasBlob)
    BINARY_TYPES.push("blob");
  module.exports = {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    hasBlob,
    kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
    kListener: Symbol("kListener"),
    kStatusCode: Symbol("status-code"),
    kWebSocket: Symbol("websocket"),
    NOOP: () => {}
  };
});

// ../../node_modules/node-gyp-build/node-gyp-build.js
var require_node_gyp_build = __commonJS((exports, module) => {
  var fs = __require("fs");
  var path = __require("path");
  var os2 = __require("os");
  var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
  var vars = process.config && process.config.variables || {};
  var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
  var abi = process.versions.modules;
  var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
  var arch = process.env.npm_config_arch || os2.arch();
  var platform = process.env.npm_config_platform || os2.platform();
  var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
  var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
  var uv = (process.versions.uv || "").split(".")[0];
  module.exports = load;
  function load(dir) {
    return runtimeRequire(load.resolve(dir));
  }
  load.resolve = load.path = function(dir) {
    dir = path.resolve(dir || ".");
    try {
      var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
      if (process.env[name + "_PREBUILD"])
        dir = process.env[name + "_PREBUILD"];
    } catch (err) {}
    if (!prebuildsOnly) {
      var release = getFirst(path.join(dir, "build/Release"), matchBuild);
      if (release)
        return release;
      var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
      if (debug)
        return debug;
    }
    var prebuild = resolve(dir);
    if (prebuild)
      return prebuild;
    var nearby = resolve(path.dirname(process.execPath));
    if (nearby)
      return nearby;
    var target = [
      "platform=" + platform,
      "arch=" + arch,
      "runtime=" + runtime,
      "abi=" + abi,
      "uv=" + uv,
      armv ? "armv=" + armv : "",
      "libc=" + libc,
      "node=" + process.versions.node,
      process.versions.electron ? "electron=" + process.versions.electron : "",
      typeof __webpack_require__ === "function" ? "webpack=true" : ""
    ].filter(Boolean).join(" ");
    throw new Error("No native build was found for " + target + `
    loaded from: ` + dir + `
`);
    function resolve(dir2) {
      var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
      var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
      if (!tuple)
        return;
      var prebuilds = path.join(dir2, "prebuilds", tuple.name);
      var parsed = readdirSync(prebuilds).map(parseTags);
      var candidates = parsed.filter(matchTags(runtime, abi));
      var winner = candidates.sort(compareTags(runtime))[0];
      if (winner)
        return path.join(prebuilds, winner.file);
    }
  };
  function readdirSync(dir) {
    try {
      return fs.readdirSync(dir);
    } catch (err) {
      return [];
    }
  }
  function getFirst(dir, filter) {
    var files = readdirSync(dir).filter(filter);
    return files[0] && path.join(dir, files[0]);
  }
  function matchBuild(name) {
    return /\.node$/.test(name);
  }
  function parseTuple(name) {
    var arr = name.split("-");
    if (arr.length !== 2)
      return;
    var platform2 = arr[0];
    var architectures = arr[1].split("+");
    if (!platform2)
      return;
    if (!architectures.length)
      return;
    if (!architectures.every(Boolean))
      return;
    return { name, platform: platform2, architectures };
  }
  function matchTuple(platform2, arch2) {
    return function(tuple) {
      if (tuple == null)
        return false;
      if (tuple.platform !== platform2)
        return false;
      return tuple.architectures.includes(arch2);
    };
  }
  function compareTuples(a2, b2) {
    return a2.architectures.length - b2.architectures.length;
  }
  function parseTags(file) {
    var arr = file.split(".");
    var extension = arr.pop();
    var tags = { file, specificity: 0 };
    if (extension !== "node")
      return;
    for (var i = 0;i < arr.length; i++) {
      var tag = arr[i];
      if (tag === "node" || tag === "electron" || tag === "node-webkit") {
        tags.runtime = tag;
      } else if (tag === "napi") {
        tags.napi = true;
      } else if (tag.slice(0, 3) === "abi") {
        tags.abi = tag.slice(3);
      } else if (tag.slice(0, 2) === "uv") {
        tags.uv = tag.slice(2);
      } else if (tag.slice(0, 4) === "armv") {
        tags.armv = tag.slice(4);
      } else if (tag === "glibc" || tag === "musl") {
        tags.libc = tag;
      } else {
        continue;
      }
      tags.specificity++;
    }
    return tags;
  }
  function matchTags(runtime2, abi2) {
    return function(tags) {
      if (tags == null)
        return false;
      if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags))
        return false;
      if (tags.abi && tags.abi !== abi2 && !tags.napi)
        return false;
      if (tags.uv && tags.uv !== uv)
        return false;
      if (tags.armv && tags.armv !== armv)
        return false;
      if (tags.libc && tags.libc !== libc)
        return false;
      return true;
    };
  }
  function runtimeAgnostic(tags) {
    return tags.runtime === "node" && tags.napi;
  }
  function compareTags(runtime2) {
    return function(a2, b2) {
      if (a2.runtime !== b2.runtime) {
        return a2.runtime === runtime2 ? -1 : 1;
      } else if (a2.abi !== b2.abi) {
        return a2.abi ? -1 : 1;
      } else if (a2.specificity !== b2.specificity) {
        return a2.specificity > b2.specificity ? -1 : 1;
      } else {
        return 0;
      }
    };
  }
  function isNwjs() {
    return !!(process.versions && process.versions.nw);
  }
  function isElectron() {
    if (process.versions && process.versions.electron)
      return true;
    if (process.env.ELECTRON_RUN_AS_NODE)
      return true;
    return typeof window !== "undefined" && window.process && window.process.type === "renderer";
  }
  function isAlpine(platform2) {
    return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
  }
  load.parseTags = parseTags;
  load.matchTags = matchTags;
  load.compareTags = compareTags;
  load.parseTuple = parseTuple;
  load.matchTuple = matchTuple;
  load.compareTuples = compareTuples;
});

// ../../node_modules/node-gyp-build/index.js
var require_node_gyp_build2 = __commonJS((exports, module) => {
  var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
  if (typeof runtimeRequire.addon === "function") {
    module.exports = runtimeRequire.addon.bind(runtimeRequire);
  } else {
    module.exports = require_node_gyp_build();
  }
});

// ../../node_modules/bufferutil/fallback.js
var require_fallback = __commonJS((exports, module) => {
  var mask = (source, mask2, output, offset, length) => {
    for (var i = 0;i < length; i++) {
      output[offset + i] = source[i] ^ mask2[i & 3];
    }
  };
  var unmask = (buffer, mask2) => {
    const length = buffer.length;
    for (var i = 0;i < length; i++) {
      buffer[i] ^= mask2[i & 3];
    }
  };
  module.exports = { mask, unmask };
});

// ../../node_modules/bufferutil/index.js
var require_bufferutil = __commonJS((exports, module) => {
  var __dirname = "/home/runner/work/eliza/eliza/node_modules/bufferutil";
  try {
    module.exports = require_node_gyp_build2()(__dirname);
  } catch (e) {
    module.exports = require_fallback();
  }
});

// ../../node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS((exports, module) => {
  var { EMPTY_BUFFER } = require_constants();
  var FastBuffer = Buffer[Symbol.species];
  function concat(list, totalLength) {
    if (list.length === 0)
      return EMPTY_BUFFER;
    if (list.length === 1)
      return list[0];
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (let i = 0;i < list.length; i++) {
      const buf = list[i];
      target.set(buf, offset);
      offset += buf.length;
    }
    if (offset < totalLength) {
      return new FastBuffer(target.buffer, target.byteOffset, offset);
    }
    return target;
  }
  function _mask(source, mask, output, offset, length) {
    for (let i = 0;i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  }
  function _unmask(buffer, mask) {
    for (let i = 0;i < buffer.length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  }
  function toArrayBuffer(buf) {
    if (buf.length === buf.buffer.byteLength) {
      return buf.buffer;
    }
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
  }
  function toBuffer(data) {
    toBuffer.readOnly = true;
    if (Buffer.isBuffer(data))
      return data;
    let buf;
    if (data instanceof ArrayBuffer) {
      buf = new FastBuffer(data);
    } else if (ArrayBuffer.isView(data)) {
      buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buf = Buffer.from(data);
      toBuffer.readOnly = false;
    }
    return buf;
  }
  module.exports = {
    concat,
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask: _unmask
  };
  if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
      const bufferUtil = require_bufferutil();
      module.exports.mask = function(source, mask, output, offset, length) {
        if (length < 48)
          _mask(source, mask, output, offset, length);
        else
          bufferUtil.mask(source, mask, output, offset, length);
      };
      module.exports.unmask = function(buffer, mask) {
        if (buffer.length < 32)
          _unmask(buffer, mask);
        else
          bufferUtil.unmask(buffer, mask);
      };
    } catch (e) {}
  }
});

// ../../node_modules/ws/lib/limiter.js
var require_limiter = __commonJS((exports, module) => {
  var kDone = Symbol("kDone");
  var kRun = Symbol("kRun");

  class Limiter {
    constructor(concurrency) {
      this[kDone] = () => {
        this.pending--;
        this[kRun]();
      };
      this.concurrency = concurrency || Infinity;
      this.jobs = [];
      this.pending = 0;
    }
    add(job) {
      this.jobs.push(job);
      this[kRun]();
    }
    [kRun]() {
      if (this.pending === this.concurrency)
        return;
      if (this.jobs.length) {
        const job = this.jobs.shift();
        this.pending++;
        job(this[kDone]);
      }
    }
  }
  module.exports = Limiter;
});

// ../../node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS((exports, module) => {
  var zlib = __require("zlib");
  var bufferUtil = require_buffer_util();
  var Limiter = require_limiter();
  var { kStatusCode } = require_constants();
  var FastBuffer = Buffer[Symbol.species];
  var TRAILER = Buffer.from([0, 0, 255, 255]);
  var kPerMessageDeflate = Symbol("permessage-deflate");
  var kTotalLength = Symbol("total-length");
  var kCallback = Symbol("callback");
  var kBuffers = Symbol("buffers");
  var kError = Symbol("error");
  var zlibLimiter;

  class PerMessageDeflate {
    constructor(options, isServer, maxPayload) {
      this._maxPayload = maxPayload | 0;
      this._options = options || {};
      this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
      this._isServer = !!isServer;
      this._deflate = null;
      this._inflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter(concurrency);
      }
    }
    static get extensionName() {
      return "permessage-deflate";
    }
    offer() {
      const params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    }
    accept(configurations) {
      configurations = this.normalizeParams(configurations);
      this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
      return this.params;
    }
    cleanup() {
      if (this._inflate) {
        this._inflate.close();
        this._inflate = null;
      }
      if (this._deflate) {
        const callback = this._deflate[kCallback];
        this._deflate.close();
        this._deflate = null;
        if (callback) {
          callback(new Error("The deflate stream was closed while data was being processed"));
        }
      }
    }
    acceptAsServer(offers) {
      const opts = this._options;
      const accepted = offers.find((params) => {
        if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
          return false;
        }
        return true;
      });
      if (!accepted) {
        throw new Error("None of the extension offers can be accepted");
      }
      if (opts.serverNoContextTakeover) {
        accepted.server_no_context_takeover = true;
      }
      if (opts.clientNoContextTakeover) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof opts.serverMaxWindowBits === "number") {
        accepted.server_max_window_bits = opts.serverMaxWindowBits;
      }
      if (typeof opts.clientMaxWindowBits === "number") {
        accepted.client_max_window_bits = opts.clientMaxWindowBits;
      } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
        delete accepted.client_max_window_bits;
      }
      return accepted;
    }
    acceptAsClient(response) {
      const params = response[0];
      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Unexpected parameter "client_no_context_takeover"');
      }
      if (!params.client_max_window_bits) {
        if (typeof this._options.clientMaxWindowBits === "number") {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        }
      } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
        throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
      }
      return params;
    }
    normalizeParams(configurations) {
      configurations.forEach((params) => {
        Object.keys(params).forEach((key) => {
          let value = params[key];
          if (value.length > 1) {
            throw new Error(`Parameter "${key}" must have only a single value`);
          }
          value = value[0];
          if (key === "client_max_window_bits") {
            if (value !== true) {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (!this._isServer) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else if (key === "server_max_window_bits") {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
            value = num;
          } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
            if (value !== true) {
              throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
            }
          } else {
            throw new Error(`Unknown parameter "${key}"`);
          }
          params[key] = value;
        });
      });
      return configurations;
    }
    decompress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._decompress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    compress(data, fin, callback) {
      zlibLimiter.add((done) => {
        this._compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? "client" : "server";
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._inflate = zlib.createInflateRaw({
          ...this._options.zlibInflateOptions,
          windowBits
        });
        this._inflate[kPerMessageDeflate] = this;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate.on("error", inflateOnError);
        this._inflate.on("data", inflateOnData);
      }
      this._inflate[kCallback] = callback;
      this._inflate.write(data);
      if (fin)
        this._inflate.write(TRAILER);
      this._inflate.flush(() => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
        if (this._inflate._readableState.endEmitted) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._inflate.reset();
          }
        }
        callback(null, data2);
      });
    }
    _compress(data, fin, callback) {
      const endpoint = this._isServer ? "server" : "client";
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._deflate = zlib.createDeflateRaw({
          ...this._options.zlibDeflateOptions,
          windowBits
        });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on("data", deflateOnData);
      }
      this._deflate[kCallback] = callback;
      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
        if (!this._deflate) {
          return;
        }
        let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        if (fin) {
          data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
        }
        this._deflate[kCallback] = null;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._deflate.reset();
        }
        callback(null, data2);
      });
    }
  }
  module.exports = PerMessageDeflate;
  function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;
    if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
      this[kBuffers].push(chunk);
      return;
    }
    this[kError] = new RangeError("Max payload size exceeded");
    this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
    this[kError][kStatusCode] = 1009;
    this.removeListener("data", inflateOnData);
    this.reset();
  }
  function inflateOnError(err) {
    this[kPerMessageDeflate]._inflate = null;
    if (this[kError]) {
      this[kCallback](this[kError]);
      return;
    }
    err[kStatusCode] = 1007;
    this[kCallback](err);
  }
});

// ../../node_modules/utf-8-validate/fallback.js
var require_fallback2 = __commonJS((exports, module) => {
  function isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  module.exports = isValidUTF8;
});

// ../../node_modules/utf-8-validate/index.js
var require_utf_8_validate = __commonJS((exports, module) => {
  var __dirname = "/home/runner/work/eliza/eliza/node_modules/utf-8-validate";
  try {
    module.exports = require_node_gyp_build2()(__dirname);
  } catch (e) {
    module.exports = require_fallback2();
  }
});

// ../../node_modules/ws/lib/validation.js
var require_validation = __commonJS((exports, module) => {
  var { isUtf8 } = __require("buffer");
  var { hasBlob } = require_constants();
  var tokenChars = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0
  ];
  function isValidStatusCode(code) {
    return code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3000 && code <= 4999;
  }
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  function isBlob(value) {
    return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
  }
  module.exports = {
    isBlob,
    isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars
  };
  if (isUtf8) {
    module.exports.isValidUTF8 = function(buf) {
      return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
    };
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8 = require_utf_8_validate();
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
      };
    } catch (e) {}
  }
});

// ../../node_modules/ws/lib/receiver.js
var require_receiver = __commonJS((exports, module) => {
  var { Writable } = __require("stream");
  var PerMessageDeflate = require_permessage_deflate();
  var {
    BINARY_TYPES,
    EMPTY_BUFFER,
    kStatusCode,
    kWebSocket
  } = require_constants();
  var { concat, toArrayBuffer, unmask } = require_buffer_util();
  var { isValidStatusCode, isValidUTF8 } = require_validation();
  var FastBuffer = Buffer[Symbol.species];
  var GET_INFO = 0;
  var GET_PAYLOAD_LENGTH_16 = 1;
  var GET_PAYLOAD_LENGTH_64 = 2;
  var GET_MASK = 3;
  var GET_DATA = 4;
  var INFLATING = 5;
  var DEFER_EVENT = 6;

  class Receiver extends Writable {
    constructor(options = {}) {
      super();
      this._allowSynchronousEvents = options.allowSynchronousEvents !== undefined ? options.allowSynchronousEvents : true;
      this._binaryType = options.binaryType || BINARY_TYPES[0];
      this._extensions = options.extensions || {};
      this._isServer = !!options.isServer;
      this._maxPayload = options.maxPayload | 0;
      this._skipUTF8Validation = !!options.skipUTF8Validation;
      this[kWebSocket] = undefined;
      this._bufferedBytes = 0;
      this._buffers = [];
      this._compressed = false;
      this._payloadLength = 0;
      this._mask = undefined;
      this._fragmented = 0;
      this._masked = false;
      this._fin = false;
      this._opcode = 0;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragments = [];
      this._errored = false;
      this._loop = false;
      this._state = GET_INFO;
    }
    _write(chunk, encoding, cb) {
      if (this._opcode === 8 && this._state == GET_INFO)
        return cb();
      this._bufferedBytes += chunk.length;
      this._buffers.push(chunk);
      this.startLoop(cb);
    }
    consume(n) {
      this._bufferedBytes -= n;
      if (n === this._buffers[0].length)
        return this._buffers.shift();
      if (n < this._buffers[0].length) {
        const buf = this._buffers[0];
        this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        return new FastBuffer(buf.buffer, buf.byteOffset, n);
      }
      const dst = Buffer.allocUnsafe(n);
      do {
        const buf = this._buffers[0];
        const offset = dst.length - n;
        if (n >= buf.length) {
          dst.set(this._buffers.shift(), offset);
        } else {
          dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
          this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
        }
        n -= buf.length;
      } while (n > 0);
      return dst;
    }
    startLoop(cb) {
      this._loop = true;
      do {
        switch (this._state) {
          case GET_INFO:
            this.getInfo(cb);
            break;
          case GET_PAYLOAD_LENGTH_16:
            this.getPayloadLength16(cb);
            break;
          case GET_PAYLOAD_LENGTH_64:
            this.getPayloadLength64(cb);
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            this.getData(cb);
            break;
          case INFLATING:
          case DEFER_EVENT:
            this._loop = false;
            return;
        }
      } while (this._loop);
      if (!this._errored)
        cb();
    }
    getInfo(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      const buf = this.consume(2);
      if ((buf[0] & 48) !== 0) {
        const error = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        cb(error);
        return;
      }
      const compressed = (buf[0] & 64) === 64;
      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        cb(error);
        return;
      }
      this._fin = (buf[0] & 128) === 128;
      this._opcode = buf[0] & 15;
      this._payloadLength = buf[1] & 127;
      if (this._opcode === 0) {
        if (compressed) {
          const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          cb(error);
          return;
        }
        if (!this._fragmented) {
          const error = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          cb(error);
          return;
        }
        this._opcode = this._fragmented;
      } else if (this._opcode === 1 || this._opcode === 2) {
        if (this._fragmented) {
          const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          cb(error);
          return;
        }
        this._compressed = compressed;
      } else if (this._opcode > 7 && this._opcode < 11) {
        if (!this._fin) {
          const error = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          cb(error);
          return;
        }
        if (compressed) {
          const error = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          cb(error);
          return;
        }
        if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
          const error = this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          cb(error);
          return;
        }
      } else {
        const error = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        cb(error);
        return;
      }
      if (!this._fin && !this._fragmented)
        this._fragmented = this._opcode;
      this._masked = (buf[1] & 128) === 128;
      if (this._isServer) {
        if (!this._masked) {
          const error = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          cb(error);
          return;
        }
      } else if (this._masked) {
        const error = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        cb(error);
        return;
      }
      if (this._payloadLength === 126)
        this._state = GET_PAYLOAD_LENGTH_16;
      else if (this._payloadLength === 127)
        this._state = GET_PAYLOAD_LENGTH_64;
      else
        this.haveLength(cb);
    }
    getPayloadLength16(cb) {
      if (this._bufferedBytes < 2) {
        this._loop = false;
        return;
      }
      this._payloadLength = this.consume(2).readUInt16BE(0);
      this.haveLength(cb);
    }
    getPayloadLength64(cb) {
      if (this._bufferedBytes < 8) {
        this._loop = false;
        return;
      }
      const buf = this.consume(8);
      const num = buf.readUInt32BE(0);
      if (num > Math.pow(2, 53 - 32) - 1) {
        const error = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        cb(error);
        return;
      }
      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
      this.haveLength(cb);
    }
    haveLength(cb) {
      if (this._payloadLength && this._opcode < 8) {
        this._totalPayloadLength += this._payloadLength;
        if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          cb(error);
          return;
        }
      }
      if (this._masked)
        this._state = GET_MASK;
      else
        this._state = GET_DATA;
    }
    getMask() {
      if (this._bufferedBytes < 4) {
        this._loop = false;
        return;
      }
      this._mask = this.consume(4);
      this._state = GET_DATA;
    }
    getData(cb) {
      let data = EMPTY_BUFFER;
      if (this._payloadLength) {
        if (this._bufferedBytes < this._payloadLength) {
          this._loop = false;
          return;
        }
        data = this.consume(this._payloadLength);
        if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
          unmask(data, this._mask);
        }
      }
      if (this._opcode > 7) {
        this.controlMessage(data, cb);
        return;
      }
      if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data, cb);
        return;
      }
      if (data.length) {
        this._messageLength = this._totalPayloadLength;
        this._fragments.push(data);
      }
      this.dataMessage(cb);
    }
    decompress(data, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      perMessageDeflate.decompress(data, this._fin, (err, buf) => {
        if (err)
          return cb(err);
        if (buf.length) {
          this._messageLength += buf.length;
          if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
            cb(error);
            return;
          }
          this._fragments.push(buf);
        }
        this.dataMessage(cb);
        if (this._state === GET_INFO)
          this.startLoop(cb);
      });
    }
    dataMessage(cb) {
      if (!this._fin) {
        this._state = GET_INFO;
        return;
      }
      const messageLength = this._messageLength;
      const fragments = this._fragments;
      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];
      if (this._opcode === 2) {
        let data;
        if (this._binaryType === "nodebuffer") {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === "arraybuffer") {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else if (this._binaryType === "blob") {
          data = new Blob(fragments);
        } else {
          data = fragments;
        }
        if (this._allowSynchronousEvents) {
          this.emit("message", data, true);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", data, true);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      } else {
        const buf = concat(fragments, messageLength);
        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
          cb(error);
          return;
        }
        if (this._state === INFLATING || this._allowSynchronousEvents) {
          this.emit("message", buf, false);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit("message", buf, false);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
    }
    controlMessage(data, cb) {
      if (this._opcode === 8) {
        if (data.length === 0) {
          this._loop = false;
          this.emit("conclude", 1005, EMPTY_BUFFER);
          this.end();
        } else {
          const code = data.readUInt16BE(0);
          if (!isValidStatusCode(code)) {
            const error = this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            cb(error);
            return;
          }
          const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            cb(error);
            return;
          }
          this._loop = false;
          this.emit("conclude", code, buf);
          this.end();
        }
        this._state = GET_INFO;
        return;
      }
      if (this._allowSynchronousEvents) {
        this.emit(this._opcode === 9 ? "ping" : "pong", data);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
    createError(ErrorCtor, message, prefix, statusCode, errorCode) {
      this._loop = false;
      this._errored = true;
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, this.createError);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
  module.exports = Receiver;
});

// ../../node_modules/ws/lib/sender.js
var require_sender = __commonJS((exports, module) => {
  var { Duplex } = __require("stream");
  var { randomFillSync } = __require("crypto");
  var PerMessageDeflate = require_permessage_deflate();
  var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
  var { isBlob, isValidStatusCode } = require_validation();
  var { mask: applyMask, toBuffer } = require_buffer_util();
  var kByteLength = Symbol("kByteLength");
  var maskBuffer = Buffer.alloc(4);
  var RANDOM_POOL_SIZE = 8 * 1024;
  var randomPool;
  var randomPoolPointer = RANDOM_POOL_SIZE;
  var DEFAULT = 0;
  var DEFLATING = 1;
  var GET_BLOB_DATA = 2;

  class Sender {
    constructor(socket, extensions, generateMask) {
      this._extensions = extensions || {};
      if (generateMask) {
        this._generateMask = generateMask;
        this._maskBuffer = Buffer.alloc(4);
      }
      this._socket = socket;
      this._firstFragment = true;
      this._compress = false;
      this._bufferedBytes = 0;
      this._queue = [];
      this._state = DEFAULT;
      this.onerror = NOOP;
      this[kWebSocket] = undefined;
    }
    static frame(data, options) {
      let mask;
      let merge = false;
      let offset = 2;
      let skipMasking = false;
      if (options.mask) {
        mask = options.maskBuffer || maskBuffer;
        if (options.generateMask) {
          options.generateMask(mask);
        } else {
          if (randomPoolPointer === RANDOM_POOL_SIZE) {
            if (randomPool === undefined) {
              randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
            }
            randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
            randomPoolPointer = 0;
          }
          mask[0] = randomPool[randomPoolPointer++];
          mask[1] = randomPool[randomPoolPointer++];
          mask[2] = randomPool[randomPoolPointer++];
          mask[3] = randomPool[randomPoolPointer++];
        }
        skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
        offset = 6;
      }
      let dataLength;
      if (typeof data === "string") {
        if ((!options.mask || skipMasking) && options[kByteLength] !== undefined) {
          dataLength = options[kByteLength];
        } else {
          data = Buffer.from(data);
          dataLength = data.length;
        }
      } else {
        dataLength = data.length;
        merge = options.mask && options.readOnly && !skipMasking;
      }
      let payloadLength = dataLength;
      if (dataLength >= 65536) {
        offset += 8;
        payloadLength = 127;
      } else if (dataLength > 125) {
        offset += 2;
        payloadLength = 126;
      }
      const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
      target[0] = options.fin ? options.opcode | 128 : options.opcode;
      if (options.rsv1)
        target[0] |= 64;
      target[1] = payloadLength;
      if (payloadLength === 126) {
        target.writeUInt16BE(dataLength, 2);
      } else if (payloadLength === 127) {
        target[2] = target[3] = 0;
        target.writeUIntBE(dataLength, 4, 6);
      }
      if (!options.mask)
        return [target, data];
      target[1] |= 128;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];
      if (skipMasking)
        return [target, data];
      if (merge) {
        applyMask(data, mask, target, offset, dataLength);
        return [target];
      }
      applyMask(data, mask, data, 0, dataLength);
      return [target, data];
    }
    close(code, data, mask, cb) {
      let buf;
      if (code === undefined) {
        buf = EMPTY_BUFFER;
      } else if (typeof code !== "number" || !isValidStatusCode(code)) {
        throw new TypeError("First argument must be a valid error code number");
      } else if (data === undefined || !data.length) {
        buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(code, 0);
      } else {
        const length = Buffer.byteLength(data);
        if (length > 123) {
          throw new RangeError("The message must not be greater than 123 bytes");
        }
        buf = Buffer.allocUnsafe(2 + length);
        buf.writeUInt16BE(code, 0);
        if (typeof data === "string") {
          buf.write(data, 2);
        } else {
          buf.set(data, 2);
        }
      }
      const options = {
        [kByteLength]: buf.length,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 8,
        readOnly: false,
        rsv1: false
      };
      if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, buf, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(buf, options), cb);
      }
    }
    ping(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 9,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    pong(data, mask, cb) {
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (byteLength > 125) {
        throw new RangeError("The data size must not be greater than 125 bytes");
      }
      const options = {
        [kByteLength]: byteLength,
        fin: true,
        generateMask: this._generateMask,
        mask,
        maskBuffer: this._maskBuffer,
        opcode: 10,
        readOnly,
        rsv1: false
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, false, options, cb]);
        } else {
          this.getBlobData(data, false, options, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, false, options, cb]);
      } else {
        this.sendFrame(Sender.frame(data, options), cb);
      }
    }
    send(data, options, cb) {
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      let opcode = options.binary ? 2 : 1;
      let rsv1 = options.compress;
      let byteLength;
      let readOnly;
      if (typeof data === "string") {
        byteLength = Buffer.byteLength(data);
        readOnly = false;
      } else if (isBlob(data)) {
        byteLength = data.size;
        readOnly = false;
      } else {
        data = toBuffer(data);
        byteLength = data.length;
        readOnly = toBuffer.readOnly;
      }
      if (this._firstFragment) {
        this._firstFragment = false;
        if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
          rsv1 = byteLength >= perMessageDeflate._threshold;
        }
        this._compress = rsv1;
      } else {
        rsv1 = false;
        opcode = 0;
      }
      if (options.fin)
        this._firstFragment = true;
      const opts = {
        [kByteLength]: byteLength,
        fin: options.fin,
        generateMask: this._generateMask,
        mask: options.mask,
        maskBuffer: this._maskBuffer,
        opcode,
        readOnly,
        rsv1
      };
      if (isBlob(data)) {
        if (this._state !== DEFAULT) {
          this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
        } else {
          this.getBlobData(data, this._compress, opts, cb);
        }
      } else if (this._state !== DEFAULT) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    }
    getBlobData(blob, compress, options, cb) {
      this._bufferedBytes += options[kByteLength];
      this._state = GET_BLOB_DATA;
      blob.arrayBuffer().then((arrayBuffer) => {
        if (this._socket.destroyed) {
          const err = new Error("The socket was closed while the blob was being read");
          process.nextTick(callCallbacks, this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        const data = toBuffer(arrayBuffer);
        if (!compress) {
          this._state = DEFAULT;
          this.sendFrame(Sender.frame(data, options), cb);
          this.dequeue();
        } else {
          this.dispatch(data, compress, options, cb);
        }
      }).catch((err) => {
        process.nextTick(onError, this, err, cb);
      });
    }
    dispatch(data, compress, options, cb) {
      if (!compress) {
        this.sendFrame(Sender.frame(data, options), cb);
        return;
      }
      const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
      this._bufferedBytes += options[kByteLength];
      this._state = DEFLATING;
      perMessageDeflate.compress(data, options.fin, (_, buf) => {
        if (this._socket.destroyed) {
          const err = new Error("The socket was closed while data was being compressed");
          callCallbacks(this, err, cb);
          return;
        }
        this._bufferedBytes -= options[kByteLength];
        this._state = DEFAULT;
        options.readOnly = false;
        this.sendFrame(Sender.frame(buf, options), cb);
        this.dequeue();
      });
    }
    dequeue() {
      while (this._state === DEFAULT && this._queue.length) {
        const params = this._queue.shift();
        this._bufferedBytes -= params[3][kByteLength];
        Reflect.apply(params[0], this, params.slice(1));
      }
    }
    enqueue(params) {
      this._bufferedBytes += params[3][kByteLength];
      this._queue.push(params);
    }
    sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.cork();
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
        this._socket.uncork();
      } else {
        this._socket.write(list[0], cb);
      }
    }
  }
  module.exports = Sender;
  function callCallbacks(sender, err, cb) {
    if (typeof cb === "function")
      cb(err);
    for (let i = 0;i < sender._queue.length; i++) {
      const params = sender._queue[i];
      const callback = params[params.length - 1];
      if (typeof callback === "function")
        callback(err);
    }
  }
  function onError(sender, err, cb) {
    callCallbacks(sender, err, cb);
    sender.onerror(err);
  }
});

// ../../node_modules/ws/lib/event-target.js
var require_event_target = __commonJS((exports, module) => {
  var { kForOnEventAttribute, kListener } = require_constants();
  var kCode = Symbol("kCode");
  var kData = Symbol("kData");
  var kError = Symbol("kError");
  var kMessage = Symbol("kMessage");
  var kReason = Symbol("kReason");
  var kTarget = Symbol("kTarget");
  var kType = Symbol("kType");
  var kWasClean = Symbol("kWasClean");

  class Event {
    constructor(type) {
      this[kTarget] = null;
      this[kType] = type;
    }
    get target() {
      return this[kTarget];
    }
    get type() {
      return this[kType];
    }
  }
  Object.defineProperty(Event.prototype, "target", { enumerable: true });
  Object.defineProperty(Event.prototype, "type", { enumerable: true });

  class CloseEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kCode] = options.code === undefined ? 0 : options.code;
      this[kReason] = options.reason === undefined ? "" : options.reason;
      this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
    }
    get code() {
      return this[kCode];
    }
    get reason() {
      return this[kReason];
    }
    get wasClean() {
      return this[kWasClean];
    }
  }
  Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
  Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });

  class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kError] = options.error === undefined ? null : options.error;
      this[kMessage] = options.message === undefined ? "" : options.message;
    }
    get error() {
      return this[kError];
    }
    get message() {
      return this[kMessage];
    }
  }
  Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
  Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });

  class MessageEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this[kData] = options.data === undefined ? null : options.data;
    }
    get data() {
      return this[kData];
    }
  }
  Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
  var EventTarget = {
    addEventListener(type, handler, options = {}) {
      for (const listener of this.listeners(type)) {
        if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          return;
        }
      }
      let wrapper;
      if (type === "message") {
        wrapper = function onMessage(data, isBinary) {
          const event = new MessageEvent("message", {
            data: isBinary ? data : data.toString()
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "close") {
        wrapper = function onClose(code, message) {
          const event = new CloseEvent("close", {
            code,
            reason: message.toString(),
            wasClean: this._closeFrameReceived && this._closeFrameSent
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "error") {
        wrapper = function onError(error) {
          const event = new ErrorEvent("error", {
            error,
            message: error.message
          });
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else if (type === "open") {
        wrapper = function onOpen() {
          const event = new Event("open");
          event[kTarget] = this;
          callListener(handler, this, event);
        };
      } else {
        return;
      }
      wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
      wrapper[kListener] = handler;
      if (options.once) {
        this.once(type, wrapper);
      } else {
        this.on(type, wrapper);
      }
    },
    removeEventListener(type, handler) {
      for (const listener of this.listeners(type)) {
        if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
          this.removeListener(type, listener);
          break;
        }
      }
    }
  };
  module.exports = {
    CloseEvent,
    ErrorEvent,
    Event,
    EventTarget,
    MessageEvent
  };
  function callListener(listener, thisArg, event) {
    if (typeof listener === "object" && listener.handleEvent) {
      listener.handleEvent.call(listener, event);
    } else {
      listener.call(thisArg, event);
    }
  }
});

// ../../node_modules/ws/lib/extension.js
var require_extension = __commonJS((exports, module) => {
  var { tokenChars } = require_validation();
  function push(dest, name, elem) {
    if (dest[name] === undefined)
      dest[name] = [elem];
    else
      dest[name].push(elem);
  }
  function parse(header) {
    const offers = Object.create(null);
    let params = Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let code = -1;
    let end = -1;
    let i = 0;
    for (;i < header.length; i++) {
      code = header.charCodeAt(i);
      if (extensionName === undefined) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const name = header.slice(start, end);
          if (code === 44) {
            push(offers, name, params);
            params = Object.create(null);
          } else {
            extensionName = name;
          }
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (paramName === undefined) {
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (code === 32 || code === 9) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          push(params, header.slice(start, end), true);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = undefined;
          }
          start = end = -1;
        } else if (code === 61 && start !== -1 && end === -1) {
          paramName = header.slice(start, i);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (isEscaping) {
          if (tokenChars[code] !== 1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (start === -1)
            start = i;
          else if (!mustUnescape)
            mustUnescape = true;
          isEscaping = false;
        } else if (inQuotes) {
          if (tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 34 && start !== -1) {
            inQuotes = false;
            end = i;
          } else if (code === 92) {
            isEscaping = true;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
          inQuotes = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (start !== -1 && (code === 32 || code === 9)) {
          if (end === -1)
            end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          let value = header.slice(start, end);
          if (mustUnescape) {
            value = value.replace(/\\/g, "");
            mustUnescape = false;
          }
          push(params, paramName, value);
          if (code === 44) {
            push(offers, extensionName, params);
            params = Object.create(null);
            extensionName = undefined;
          }
          paramName = undefined;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
    if (start === -1 || inQuotes || code === 32 || code === 9) {
      throw new SyntaxError("Unexpected end of input");
    }
    if (end === -1)
      end = i;
    const token = header.slice(start, end);
    if (extensionName === undefined) {
      push(offers, token, params);
    } else {
      if (paramName === undefined) {
        push(params, token, true);
      } else if (mustUnescape) {
        push(params, paramName, token.replace(/\\/g, ""));
      } else {
        push(params, paramName, token);
      }
      push(offers, extensionName, params);
    }
    return offers;
  }
  function format(extensions) {
    return Object.keys(extensions).map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations))
        configurations = [configurations];
      return configurations.map((params) => {
        return [extension].concat(Object.keys(params).map((k) => {
          let values = params[k];
          if (!Array.isArray(values))
            values = [values];
          return values.map((v2) => v2 === true ? k : `${k}=${v2}`).join("; ");
        })).join("; ");
      }).join(", ");
    }).join(", ");
  }
  module.exports = { format, parse };
});

// ../../node_modules/ws/lib/websocket.js
var require_websocket = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var https = __require("https");
  var http = __require("http");
  var net = __require("net");
  var tls = __require("tls");
  var { randomBytes, createHash: createHash3 } = __require("crypto");
  var { Duplex, Readable } = __require("stream");
  var { URL: URL2 } = __require("url");
  var PerMessageDeflate = require_permessage_deflate();
  var Receiver = require_receiver();
  var Sender = require_sender();
  var { isBlob } = require_validation();
  var {
    BINARY_TYPES,
    CLOSE_TIMEOUT,
    EMPTY_BUFFER,
    GUID,
    kForOnEventAttribute,
    kListener,
    kStatusCode,
    kWebSocket,
    NOOP
  } = require_constants();
  var {
    EventTarget: { addEventListener, removeEventListener }
  } = require_event_target();
  var { format, parse } = require_extension();
  var { toBuffer } = require_buffer_util();
  var kAborted = Symbol("kAborted");
  var protocolVersions = [8, 13];
  var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
  var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

  class WebSocket2 extends EventEmitter {
    constructor(address, protocols, options) {
      super();
      this._binaryType = BINARY_TYPES[0];
      this._closeCode = 1006;
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = EMPTY_BUFFER;
      this._closeTimer = null;
      this._errorEmitted = false;
      this._extensions = {};
      this._paused = false;
      this._protocol = "";
      this._readyState = WebSocket2.CONNECTING;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      if (address !== null) {
        this._bufferedAmount = 0;
        this._isServer = false;
        this._redirects = 0;
        if (protocols === undefined) {
          protocols = [];
        } else if (!Array.isArray(protocols)) {
          if (typeof protocols === "object" && protocols !== null) {
            options = protocols;
            protocols = [];
          } else {
            protocols = [protocols];
          }
        }
        initAsClient(this, address, protocols, options);
      } else {
        this._autoPong = options.autoPong;
        this._closeTimeout = options.closeTimeout;
        this._isServer = true;
      }
    }
    get binaryType() {
      return this._binaryType;
    }
    set binaryType(type) {
      if (!BINARY_TYPES.includes(type))
        return;
      this._binaryType = type;
      if (this._receiver)
        this._receiver._binaryType = type;
    }
    get bufferedAmount() {
      if (!this._socket)
        return this._bufferedAmount;
      return this._socket._writableState.length + this._sender._bufferedBytes;
    }
    get extensions() {
      return Object.keys(this._extensions).join();
    }
    get isPaused() {
      return this._paused;
    }
    get onclose() {
      return null;
    }
    get onerror() {
      return null;
    }
    get onopen() {
      return null;
    }
    get onmessage() {
      return null;
    }
    get protocol() {
      return this._protocol;
    }
    get readyState() {
      return this._readyState;
    }
    get url() {
      return this._url;
    }
    setSocket(socket, head, options) {
      const receiver = new Receiver({
        allowSynchronousEvents: options.allowSynchronousEvents,
        binaryType: this.binaryType,
        extensions: this._extensions,
        isServer: this._isServer,
        maxPayload: options.maxPayload,
        skipUTF8Validation: options.skipUTF8Validation
      });
      const sender = new Sender(socket, this._extensions, options.generateMask);
      this._receiver = receiver;
      this._sender = sender;
      this._socket = socket;
      receiver[kWebSocket] = this;
      sender[kWebSocket] = this;
      socket[kWebSocket] = this;
      receiver.on("conclude", receiverOnConclude);
      receiver.on("drain", receiverOnDrain);
      receiver.on("error", receiverOnError);
      receiver.on("message", receiverOnMessage);
      receiver.on("ping", receiverOnPing);
      receiver.on("pong", receiverOnPong);
      sender.onerror = senderOnError;
      if (socket.setTimeout)
        socket.setTimeout(0);
      if (socket.setNoDelay)
        socket.setNoDelay();
      if (head.length > 0)
        socket.unshift(head);
      socket.on("close", socketOnClose);
      socket.on("data", socketOnData);
      socket.on("end", socketOnEnd);
      socket.on("error", socketOnError);
      this._readyState = WebSocket2.OPEN;
      this.emit("open");
    }
    emitClose() {
      if (!this._socket) {
        this._readyState = WebSocket2.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
        return;
      }
      if (this._extensions[PerMessageDeflate.extensionName]) {
        this._extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this._receiver.removeAllListeners();
      this._readyState = WebSocket2.CLOSED;
      this.emit("close", this._closeCode, this._closeMessage);
    }
    close(code, data) {
      if (this.readyState === WebSocket2.CLOSED)
        return;
      if (this.readyState === WebSocket2.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this.readyState === WebSocket2.CLOSING) {
        if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
          this._socket.end();
        }
        return;
      }
      this._readyState = WebSocket2.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err)
          return;
        this._closeFrameSent = true;
        if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
          this._socket.end();
        }
      });
      setCloseTimer(this);
    }
    pause() {
      if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
        return;
      }
      this._paused = true;
      this._socket.pause();
    }
    ping(data, mask, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.ping(data || EMPTY_BUFFER, mask, cb);
    }
    pong(data, mask, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof data === "function") {
        cb = data;
        data = mask = undefined;
      } else if (typeof mask === "function") {
        cb = mask;
        mask = undefined;
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.pong(data || EMPTY_BUFFER, mask, cb);
    }
    resume() {
      if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
        return;
      }
      this._paused = false;
      if (!this._receiver._writableState.needDrain)
        this._socket.resume();
    }
    send(data, options, cb) {
      if (this.readyState === WebSocket2.CONNECTING) {
        throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
      }
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (typeof data === "number")
        data = data.toString();
      if (this.readyState !== WebSocket2.OPEN) {
        sendAfterClose(this, data, cb);
        return;
      }
      const opts = {
        binary: typeof data !== "string",
        mask: !this._isServer,
        compress: true,
        fin: true,
        ...options
      };
      if (!this._extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }
      this._sender.send(data || EMPTY_BUFFER, opts, cb);
    }
    terminate() {
      if (this.readyState === WebSocket2.CLOSED)
        return;
      if (this.readyState === WebSocket2.CONNECTING) {
        const msg = "WebSocket was closed before the connection was established";
        abortHandshake(this, this._req, msg);
        return;
      }
      if (this._socket) {
        this._readyState = WebSocket2.CLOSING;
        this._socket.destroy();
      }
    }
  }
  Object.defineProperty(WebSocket2, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
    enumerable: true,
    value: readyStates.indexOf("CONNECTING")
  });
  Object.defineProperty(WebSocket2, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket2.prototype, "OPEN", {
    enumerable: true,
    value: readyStates.indexOf("OPEN")
  });
  Object.defineProperty(WebSocket2, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket2.prototype, "CLOSING", {
    enumerable: true,
    value: readyStates.indexOf("CLOSING")
  });
  Object.defineProperty(WebSocket2, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  Object.defineProperty(WebSocket2.prototype, "CLOSED", {
    enumerable: true,
    value: readyStates.indexOf("CLOSED")
  });
  [
    "binaryType",
    "bufferedAmount",
    "extensions",
    "isPaused",
    "protocol",
    "readyState",
    "url"
  ].forEach((property) => {
    Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
  });
  ["open", "error", "close", "message"].forEach((method) => {
    Object.defineProperty(WebSocket2.prototype, `on${method}`, {
      enumerable: true,
      get() {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute])
            return listener[kListener];
        }
        return null;
      },
      set(handler) {
        for (const listener of this.listeners(method)) {
          if (listener[kForOnEventAttribute]) {
            this.removeListener(method, listener);
            break;
          }
        }
        if (typeof handler !== "function")
          return;
        this.addEventListener(method, handler, {
          [kForOnEventAttribute]: true
        });
      }
    });
  });
  WebSocket2.prototype.addEventListener = addEventListener;
  WebSocket2.prototype.removeEventListener = removeEventListener;
  module.exports = WebSocket2;
  function initAsClient(websocket, address, protocols, options) {
    const opts = {
      allowSynchronousEvents: true,
      autoPong: true,
      closeTimeout: CLOSE_TIMEOUT,
      protocolVersion: protocolVersions[1],
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: true,
      followRedirects: false,
      maxRedirects: 10,
      ...options,
      socketPath: undefined,
      hostname: undefined,
      protocol: undefined,
      timeout: undefined,
      method: "GET",
      host: undefined,
      path: undefined,
      port: undefined
    };
    websocket._autoPong = opts.autoPong;
    websocket._closeTimeout = opts.closeTimeout;
    if (!protocolVersions.includes(opts.protocolVersion)) {
      throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} ` + `(supported versions: ${protocolVersions.join(", ")})`);
    }
    let parsedUrl;
    if (address instanceof URL2) {
      parsedUrl = address;
    } else {
      try {
        parsedUrl = new URL2(address);
      } catch (e) {
        throw new SyntaxError(`Invalid URL: ${address}`);
      }
    }
    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "ws:";
    } else if (parsedUrl.protocol === "https:") {
      parsedUrl.protocol = "wss:";
    }
    websocket._url = parsedUrl.href;
    const isSecure = parsedUrl.protocol === "wss:";
    const isIpcUrl = parsedUrl.protocol === "ws+unix:";
    let invalidUrlMessage;
    if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
      invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", ` + '"http:", "https:", or "ws+unix:"';
    } else if (isIpcUrl && !parsedUrl.pathname) {
      invalidUrlMessage = "The URL's pathname is empty";
    } else if (parsedUrl.hash) {
      invalidUrlMessage = "The URL contains a fragment identifier";
    }
    if (invalidUrlMessage) {
      const err = new SyntaxError(invalidUrlMessage);
      if (websocket._redirects === 0) {
        throw err;
      } else {
        emitErrorAndClose(websocket, err);
        return;
      }
    }
    const defaultPort = isSecure ? 443 : 80;
    const key = randomBytes(16).toString("base64");
    const request = isSecure ? https.request : http.request;
    const protocolSet = new Set;
    let perMessageDeflate;
    opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
    opts.defaultPort = opts.defaultPort || defaultPort;
    opts.port = parsedUrl.port || defaultPort;
    opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
    opts.headers = {
      ...opts.headers,
      "Sec-WebSocket-Version": opts.protocolVersion,
      "Sec-WebSocket-Key": key,
      Connection: "Upgrade",
      Upgrade: "websocket"
    };
    opts.path = parsedUrl.pathname + parsedUrl.search;
    opts.timeout = opts.handshakeTimeout;
    if (opts.perMessageDeflate) {
      perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
      opts.headers["Sec-WebSocket-Extensions"] = format({
        [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
      });
    }
    if (protocols.length) {
      for (const protocol of protocols) {
        if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
          throw new SyntaxError("An invalid or duplicated subprotocol was specified");
        }
        protocolSet.add(protocol);
      }
      opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
    }
    if (opts.origin) {
      if (opts.protocolVersion < 13) {
        opts.headers["Sec-WebSocket-Origin"] = opts.origin;
      } else {
        opts.headers.Origin = opts.origin;
      }
    }
    if (parsedUrl.username || parsedUrl.password) {
      opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
    }
    if (isIpcUrl) {
      const parts = opts.path.split(":");
      opts.socketPath = parts[0];
      opts.path = parts[1];
    }
    let req;
    if (opts.followRedirects) {
      if (websocket._redirects === 0) {
        websocket._originalIpc = isIpcUrl;
        websocket._originalSecure = isSecure;
        websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
        const headers = options && options.headers;
        options = { ...options, headers: {} };
        if (headers) {
          for (const [key2, value] of Object.entries(headers)) {
            options.headers[key2.toLowerCase()] = value;
          }
        }
      } else if (websocket.listenerCount("redirect") === 0) {
        const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
        if (!isSameHost || websocket._originalSecure && !isSecure) {
          delete opts.headers.authorization;
          delete opts.headers.cookie;
          if (!isSameHost)
            delete opts.headers.host;
          opts.auth = undefined;
        }
      }
      if (opts.auth && !options.headers.authorization) {
        options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
      }
      req = websocket._req = request(opts);
      if (websocket._redirects) {
        websocket.emit("redirect", websocket.url, req);
      }
    } else {
      req = websocket._req = request(opts);
    }
    if (opts.timeout) {
      req.on("timeout", () => {
        abortHandshake(websocket, req, "Opening handshake has timed out");
      });
    }
    req.on("error", (err) => {
      if (req === null || req[kAborted])
        return;
      req = websocket._req = null;
      emitErrorAndClose(websocket, err);
    });
    req.on("response", (res) => {
      const location = res.headers.location;
      const statusCode = res.statusCode;
      if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
        if (++websocket._redirects > opts.maxRedirects) {
          abortHandshake(websocket, req, "Maximum redirects exceeded");
          return;
        }
        req.abort();
        let addr;
        try {
          addr = new URL2(location, address);
        } catch (e) {
          const err = new SyntaxError(`Invalid URL: ${location}`);
          emitErrorAndClose(websocket, err);
          return;
        }
        initAsClient(websocket, addr, protocols, options);
      } else if (!websocket.emit("unexpected-response", req, res)) {
        abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
      }
    });
    req.on("upgrade", (res, socket, head) => {
      websocket.emit("upgrade", res);
      if (websocket.readyState !== WebSocket2.CONNECTING)
        return;
      req = websocket._req = null;
      const upgrade = res.headers.upgrade;
      if (upgrade === undefined || upgrade.toLowerCase() !== "websocket") {
        abortHandshake(websocket, socket, "Invalid Upgrade header");
        return;
      }
      const digest = createHash3("sha1").update(key + GUID).digest("base64");
      if (res.headers["sec-websocket-accept"] !== digest) {
        abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
        return;
      }
      const serverProt = res.headers["sec-websocket-protocol"];
      let protError;
      if (serverProt !== undefined) {
        if (!protocolSet.size) {
          protError = "Server sent a subprotocol but none was requested";
        } else if (!protocolSet.has(serverProt)) {
          protError = "Server sent an invalid subprotocol";
        }
      } else if (protocolSet.size) {
        protError = "Server sent no subprotocol";
      }
      if (protError) {
        abortHandshake(websocket, socket, protError);
        return;
      }
      if (serverProt)
        websocket._protocol = serverProt;
      const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
      if (secWebSocketExtensions !== undefined) {
        if (!perMessageDeflate) {
          const message = "Server sent a Sec-WebSocket-Extensions header but no extension " + "was requested";
          abortHandshake(websocket, socket, message);
          return;
        }
        let extensions;
        try {
          extensions = parse(secWebSocketExtensions);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket, socket, message);
          return;
        }
        const extensionNames = Object.keys(extensions);
        if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
          const message = "Server indicated an extension that was not requested";
          abortHandshake(websocket, socket, message);
          return;
        }
        try {
          perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Extensions header";
          abortHandshake(websocket, socket, message);
          return;
        }
        websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
      }
      websocket.setSocket(socket, head, {
        allowSynchronousEvents: opts.allowSynchronousEvents,
        generateMask: opts.generateMask,
        maxPayload: opts.maxPayload,
        skipUTF8Validation: opts.skipUTF8Validation
      });
    });
    if (opts.finishRequest) {
      opts.finishRequest(req, websocket);
    } else {
      req.end();
    }
  }
  function emitErrorAndClose(websocket, err) {
    websocket._readyState = WebSocket2.CLOSING;
    websocket._errorEmitted = true;
    websocket.emit("error", err);
    websocket.emitClose();
  }
  function netConnect(options) {
    options.path = options.socketPath;
    return net.connect(options);
  }
  function tlsConnect(options) {
    options.path = undefined;
    if (!options.servername && options.servername !== "") {
      options.servername = net.isIP(options.host) ? "" : options.host;
    }
    return tls.connect(options);
  }
  function abortHandshake(websocket, stream, message) {
    websocket._readyState = WebSocket2.CLOSING;
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshake);
    if (stream.setHeader) {
      stream[kAborted] = true;
      stream.abort();
      if (stream.socket && !stream.socket.destroyed) {
        stream.socket.destroy();
      }
      process.nextTick(emitErrorAndClose, websocket, err);
    } else {
      stream.destroy(err);
      stream.once("error", websocket.emit.bind(websocket, "error"));
      stream.once("close", websocket.emitClose.bind(websocket));
    }
  }
  function sendAfterClose(websocket, data, cb) {
    if (data) {
      const length = isBlob(data) ? data.size : toBuffer(data).length;
      if (websocket._socket)
        websocket._sender._bufferedBytes += length;
      else
        websocket._bufferedAmount += length;
    }
    if (cb) {
      const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} ` + `(${readyStates[websocket.readyState]})`);
      process.nextTick(cb, err);
    }
  }
  function receiverOnConclude(code, reason) {
    const websocket = this[kWebSocket];
    websocket._closeFrameReceived = true;
    websocket._closeMessage = reason;
    websocket._closeCode = code;
    if (websocket._socket[kWebSocket] === undefined)
      return;
    websocket._socket.removeListener("data", socketOnData);
    process.nextTick(resume, websocket._socket);
    if (code === 1005)
      websocket.close();
    else
      websocket.close(code, reason);
  }
  function receiverOnDrain() {
    const websocket = this[kWebSocket];
    if (!websocket.isPaused)
      websocket._socket.resume();
  }
  function receiverOnError(err) {
    const websocket = this[kWebSocket];
    if (websocket._socket[kWebSocket] !== undefined) {
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      websocket.close(err[kStatusCode]);
    }
    if (!websocket._errorEmitted) {
      websocket._errorEmitted = true;
      websocket.emit("error", err);
    }
  }
  function receiverOnFinish() {
    this[kWebSocket].emitClose();
  }
  function receiverOnMessage(data, isBinary) {
    this[kWebSocket].emit("message", data, isBinary);
  }
  function receiverOnPing(data) {
    const websocket = this[kWebSocket];
    if (websocket._autoPong)
      websocket.pong(data, !this._isServer, NOOP);
    websocket.emit("ping", data);
  }
  function receiverOnPong(data) {
    this[kWebSocket].emit("pong", data);
  }
  function resume(stream) {
    stream.resume();
  }
  function senderOnError(err) {
    const websocket = this[kWebSocket];
    if (websocket.readyState === WebSocket2.CLOSED)
      return;
    if (websocket.readyState === WebSocket2.OPEN) {
      websocket._readyState = WebSocket2.CLOSING;
      setCloseTimer(websocket);
    }
    this._socket.end();
    if (!websocket._errorEmitted) {
      websocket._errorEmitted = true;
      websocket.emit("error", err);
    }
  }
  function setCloseTimer(websocket) {
    websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), websocket._closeTimeout);
  }
  function socketOnClose() {
    const websocket = this[kWebSocket];
    this.removeListener("close", socketOnClose);
    this.removeListener("data", socketOnData);
    this.removeListener("end", socketOnEnd);
    websocket._readyState = WebSocket2.CLOSING;
    if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
      const chunk = this.read(this._readableState.length);
      websocket._receiver.write(chunk);
    }
    websocket._receiver.end();
    this[kWebSocket] = undefined;
    clearTimeout(websocket._closeTimer);
    if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
      websocket.emitClose();
    } else {
      websocket._receiver.on("error", receiverOnFinish);
      websocket._receiver.on("finish", receiverOnFinish);
    }
  }
  function socketOnData(chunk) {
    if (!this[kWebSocket]._receiver.write(chunk)) {
      this.pause();
    }
  }
  function socketOnEnd() {
    const websocket = this[kWebSocket];
    websocket._readyState = WebSocket2.CLOSING;
    websocket._receiver.end();
    this.end();
  }
  function socketOnError() {
    const websocket = this[kWebSocket];
    this.removeListener("error", socketOnError);
    this.on("error", NOOP);
    if (websocket) {
      websocket._readyState = WebSocket2.CLOSING;
      this.destroy();
    }
  }
});

// ../../node_modules/ws/lib/stream.js
var require_stream = __commonJS((exports, module) => {
  var WebSocket2 = require_websocket();
  var { Duplex } = __require("stream");
  function emitClose(stream) {
    stream.emit("close");
  }
  function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished) {
      this.destroy();
    }
  }
  function duplexOnError(err) {
    this.removeListener("error", duplexOnError);
    this.destroy();
    if (this.listenerCount("error") === 0) {
      this.emit("error", err);
    }
  }
  function createWebSocketStream(ws, options) {
    let terminateOnDestroy = true;
    const duplex = new Duplex({
      ...options,
      autoDestroy: false,
      emitClose: false,
      objectMode: false,
      writableObjectMode: false
    });
    ws.on("message", function message(msg, isBinary) {
      const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
      if (!duplex.push(data))
        ws.pause();
    });
    ws.once("error", function error(err) {
      if (duplex.destroyed)
        return;
      terminateOnDestroy = false;
      duplex.destroy(err);
    });
    ws.once("close", function close() {
      if (duplex.destroyed)
        return;
      duplex.push(null);
    });
    duplex._destroy = function(err, callback) {
      if (ws.readyState === ws.CLOSED) {
        callback(err);
        process.nextTick(emitClose, duplex);
        return;
      }
      let called = false;
      ws.once("error", function error(err2) {
        called = true;
        callback(err2);
      });
      ws.once("close", function close() {
        if (!called)
          callback(err);
        process.nextTick(emitClose, duplex);
      });
      if (terminateOnDestroy)
        ws.terminate();
    };
    duplex._final = function(callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._final(callback);
        });
        return;
      }
      if (ws._socket === null)
        return;
      if (ws._socket._writableState.finished) {
        callback();
        if (duplex._readableState.endEmitted)
          duplex.destroy();
      } else {
        ws._socket.once("finish", function finish() {
          callback();
        });
        ws.close();
      }
    };
    duplex._read = function() {
      if (ws.isPaused)
        ws.resume();
    };
    duplex._write = function(chunk, encoding, callback) {
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          duplex._write(chunk, encoding, callback);
        });
        return;
      }
      ws.send(chunk, callback);
    };
    duplex.on("end", duplexOnEnd);
    duplex.on("error", duplexOnError);
    return duplex;
  }
  module.exports = createWebSocketStream;
});

// ../../node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS((exports, module) => {
  var { tokenChars } = require_validation();
  function parse(header) {
    const protocols = new Set;
    let start = -1;
    let end = -1;
    let i = 0;
    for (i;i < header.length; i++) {
      const code = header.charCodeAt(i);
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1)
          start = i;
      } else if (i !== 0 && (code === 32 || code === 9)) {
        if (end === -1 && start !== -1)
          end = i;
      } else if (code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1)
          end = i;
        const protocol2 = header.slice(start, end);
        if (protocols.has(protocol2)) {
          throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
        }
        protocols.add(protocol2);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
    if (start === -1 || end !== -1) {
      throw new SyntaxError("Unexpected end of input");
    }
    const protocol = header.slice(start, i);
    if (protocols.has(protocol)) {
      throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
    }
    protocols.add(protocol);
    return protocols;
  }
  module.exports = { parse };
});

// ../../node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var http = __require("http");
  var { Duplex } = __require("stream");
  var { createHash: createHash3 } = __require("crypto");
  var extension = require_extension();
  var PerMessageDeflate = require_permessage_deflate();
  var subprotocol = require_subprotocol();
  var WebSocket2 = require_websocket();
  var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
  var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
  var RUNNING = 0;
  var CLOSING = 1;
  var CLOSED = 2;

  class WebSocketServer extends EventEmitter {
    constructor(options, callback) {
      super();
      options = {
        allowSynchronousEvents: true,
        autoPong: true,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: false,
        handleProtocols: null,
        clientTracking: true,
        closeTimeout: CLOSE_TIMEOUT,
        verifyClient: null,
        noServer: false,
        backlog: null,
        server: null,
        host: null,
        path: null,
        port: null,
        WebSocket: WebSocket2,
        ...options
      };
      if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
        throw new TypeError('One and only one of the "port", "server", or "noServer" options ' + "must be specified");
      }
      if (options.port != null) {
        this._server = http.createServer((req, res) => {
          const body = http.STATUS_CODES[426];
          res.writeHead(426, {
            "Content-Length": body.length,
            "Content-Type": "text/plain"
          });
          res.end(body);
        });
        this._server.listen(options.port, options.host, options.backlog, callback);
      } else if (options.server) {
        this._server = options.server;
      }
      if (this._server) {
        const emitConnection = this.emit.bind(this, "connection");
        this._removeListeners = addListeners(this._server, {
          listening: this.emit.bind(this, "listening"),
          error: this.emit.bind(this, "error"),
          upgrade: (req, socket, head) => {
            this.handleUpgrade(req, socket, head, emitConnection);
          }
        });
      }
      if (options.perMessageDeflate === true)
        options.perMessageDeflate = {};
      if (options.clientTracking) {
        this.clients = new Set;
        this._shouldEmitClose = false;
      }
      this.options = options;
      this._state = RUNNING;
    }
    address() {
      if (this.options.noServer) {
        throw new Error('The server is operating in "noServer" mode');
      }
      if (!this._server)
        return null;
      return this._server.address();
    }
    close(cb) {
      if (this._state === CLOSED) {
        if (cb) {
          this.once("close", () => {
            cb(new Error("The server is not running"));
          });
        }
        process.nextTick(emitClose, this);
        return;
      }
      if (cb)
        this.once("close", cb);
      if (this._state === CLOSING)
        return;
      this._state = CLOSING;
      if (this.options.noServer || this.options.server) {
        if (this._server) {
          this._removeListeners();
          this._removeListeners = this._server = null;
        }
        if (this.clients) {
          if (!this.clients.size) {
            process.nextTick(emitClose, this);
          } else {
            this._shouldEmitClose = true;
          }
        } else {
          process.nextTick(emitClose, this);
        }
      } else {
        const server = this._server;
        this._removeListeners();
        this._removeListeners = this._server = null;
        server.close(() => {
          emitClose(this);
        });
      }
    }
    shouldHandle(req) {
      if (this.options.path) {
        const index2 = req.url.indexOf("?");
        const pathname = index2 !== -1 ? req.url.slice(0, index2) : req.url;
        if (pathname !== this.options.path)
          return false;
      }
      return true;
    }
    handleUpgrade(req, socket, head, cb) {
      socket.on("error", socketOnError);
      const key = req.headers["sec-websocket-key"];
      const upgrade = req.headers.upgrade;
      const version2 = +req.headers["sec-websocket-version"];
      if (req.method !== "GET") {
        const message = "Invalid HTTP method";
        abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
        return;
      }
      if (upgrade === undefined || upgrade.toLowerCase() !== "websocket") {
        const message = "Invalid Upgrade header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (key === undefined || !keyRegex.test(key)) {
        const message = "Missing or invalid Sec-WebSocket-Key header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
      if (version2 !== 13 && version2 !== 8) {
        const message = "Missing or invalid Sec-WebSocket-Version header";
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
          "Sec-WebSocket-Version": "13, 8"
        });
        return;
      }
      if (!this.shouldHandle(req)) {
        abortHandshake(socket, 400);
        return;
      }
      const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
      let protocols = new Set;
      if (secWebSocketProtocol !== undefined) {
        try {
          protocols = subprotocol.parse(secWebSocketProtocol);
        } catch (err) {
          const message = "Invalid Sec-WebSocket-Protocol header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
      const extensions = {};
      if (this.options.perMessageDeflate && secWebSocketExtensions !== undefined) {
        const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
        try {
          const offers = extension.parse(secWebSocketExtensions);
          if (offers[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
            extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
      }
      if (this.options.verifyClient) {
        const info = {
          origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
          secure: !!(req.socket.authorized || req.socket.encrypted),
          req
        };
        if (this.options.verifyClient.length === 2) {
          this.options.verifyClient(info, (verified, code, message, headers) => {
            if (!verified) {
              return abortHandshake(socket, code || 401, message, headers);
            }
            this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
          });
          return;
        }
        if (!this.options.verifyClient(info))
          return abortHandshake(socket, 401);
      }
      this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
    }
    completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
      if (!socket.readable || !socket.writable)
        return socket.destroy();
      if (socket[kWebSocket]) {
        throw new Error("server.handleUpgrade() was called more than once with the same " + "socket, possibly due to a misconfiguration");
      }
      if (this._state > RUNNING)
        return abortHandshake(socket, 503);
      const digest = createHash3("sha1").update(key + GUID).digest("base64");
      const headers = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${digest}`
      ];
      const ws = new this.options.WebSocket(null, undefined, this.options);
      if (protocols.size) {
        const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
        if (protocol) {
          headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
          ws._protocol = protocol;
        }
      }
      if (extensions[PerMessageDeflate.extensionName]) {
        const params = extensions[PerMessageDeflate.extensionName].params;
        const value = extension.format({
          [PerMessageDeflate.extensionName]: [params]
        });
        headers.push(`Sec-WebSocket-Extensions: ${value}`);
        ws._extensions = extensions;
      }
      this.emit("headers", headers, req);
      socket.write(headers.concat(`\r
`).join(`\r
`));
      socket.removeListener("error", socketOnError);
      ws.setSocket(socket, head, {
        allowSynchronousEvents: this.options.allowSynchronousEvents,
        maxPayload: this.options.maxPayload,
        skipUTF8Validation: this.options.skipUTF8Validation
      });
      if (this.clients) {
        this.clients.add(ws);
        ws.on("close", () => {
          this.clients.delete(ws);
          if (this._shouldEmitClose && !this.clients.size) {
            process.nextTick(emitClose, this);
          }
        });
      }
      cb(ws, req);
    }
  }
  module.exports = WebSocketServer;
  function addListeners(server, map) {
    for (const event of Object.keys(map))
      server.on(event, map[event]);
    return function removeListeners() {
      for (const event of Object.keys(map)) {
        server.removeListener(event, map[event]);
      }
    };
  }
  function emitClose(server) {
    server._state = CLOSED;
    server.emit("close");
  }
  function socketOnError() {
    this.destroy();
  }
  function abortHandshake(socket, code, message, headers) {
    message = message || http.STATUS_CODES[code];
    headers = {
      Connection: "close",
      "Content-Type": "text/html",
      "Content-Length": Buffer.byteLength(message),
      ...headers
    };
    socket.once("finish", socket.destroy);
    socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join(`\r
`) + `\r
\r
` + message);
  }
  function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
    if (server.listenerCount("wsClientError")) {
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
      server.emit("wsClientError", err, socket, req);
    } else {
      abortHandshake(socket, code, message, headers);
    }
  }
});

// src/index.node.ts
import { logger as logger23, stringToUuid } from "@elizaos/core";
import { mkdirSync } from "node:fs";

// src/pglite/adapter.ts
import { logger as logger18 } from "@elizaos/core";

// ../../node_modules/drizzle-orm/pglite/driver.js
init_entity();
init_logger();
init_db();
init_dialect();
init_relations();
init_utils();
import { PGlite } from "@electric-sql/pglite";

// ../../node_modules/drizzle-orm/pglite/session.js
init_entity();
init_logger();
init_pg_core();
init_session();
init_sql();
init_utils();
init_cache();
import { types } from "@electric-sql/pglite";

class PglitePreparedQuery extends PgPreparedQuery {
  constructor(client, queryString, params, logger, cache, queryMetadata, cacheConfig, fields, name, _isResponseInArrayMode, customResultMapper) {
    super({ sql: queryString, params }, cache, queryMetadata, cacheConfig);
    this.client = client;
    this.queryString = queryString;
    this.params = params;
    this.logger = logger;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
    this.rawQueryConfig = {
      rowMode: "object",
      parsers: {
        [types.TIMESTAMP]: (value) => value,
        [types.TIMESTAMPTZ]: (value) => value,
        [types.INTERVAL]: (value) => value,
        [types.DATE]: (value) => value,
        [1231]: (value) => value,
        [1115]: (value) => value,
        [1185]: (value) => value,
        [1187]: (value) => value,
        [1182]: (value) => value
      }
    };
    this.queryConfig = {
      rowMode: "array",
      parsers: {
        [types.TIMESTAMP]: (value) => value,
        [types.TIMESTAMPTZ]: (value) => value,
        [types.INTERVAL]: (value) => value,
        [types.DATE]: (value) => value,
        [1231]: (value) => value,
        [1115]: (value) => value,
        [1185]: (value) => value,
        [1187]: (value) => value,
        [1182]: (value) => value
      }
    };
  }
  static [entityKind] = "PglitePreparedQuery";
  rawQueryConfig;
  queryConfig;
  async execute(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.queryString, params);
    const { fields, client, queryConfig, joinsNotNullableMap, customResultMapper, queryString, rawQueryConfig } = this;
    if (!fields && !customResultMapper) {
      return this.queryWithCache(queryString, params, async () => {
        return await client.query(queryString, params, rawQueryConfig);
      });
    }
    const result = await this.queryWithCache(queryString, params, async () => {
      return await client.query(queryString, params, queryConfig);
    });
    return customResultMapper ? customResultMapper(result.rows) : result.rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
  }
  all(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.queryString, params);
    return this.queryWithCache(this.queryString, params, async () => {
      return await this.client.query(this.queryString, params, this.rawQueryConfig);
    }).then((result) => result.rows);
  }
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
}

class PgliteSession extends PgSession {
  constructor(client, dialect2, schema2, options = {}) {
    super(dialect2);
    this.client = client;
    this.schema = schema2;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger;
    this.cache = options.cache ?? new NoopCache;
  }
  static [entityKind] = "PgliteSession";
  logger;
  cache;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return new PglitePreparedQuery(this.client, query.sql, query.params, this.logger, this.cache, queryMetadata, cacheConfig, fields, name, isResponseInArrayMode, customResultMapper);
  }
  async transaction(transaction, config) {
    return this.client.transaction(async (client) => {
      const session2 = new PgliteSession(client, this.dialect, this.schema, this.options);
      const tx = new PgliteTransaction(this.dialect, session2, this.schema);
      if (config) {
        await tx.setTransaction(config);
      }
      return transaction(tx);
    });
  }
  async count(sql22) {
    const res = await this.execute(sql22);
    return Number(res["rows"][0]["count"]);
  }
}

class PgliteTransaction extends PgTransaction {
  static [entityKind] = "PgliteTransaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new PgliteTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
}

// ../../node_modules/drizzle-orm/pglite/driver.js
class PgliteDriver {
  constructor(client, dialect2, options = {}) {
    this.client = client;
    this.dialect = dialect2;
    this.options = options;
  }
  static [entityKind] = "PgliteDriver";
  createSession(schema2) {
    return new PgliteSession(this.client, this.dialect, schema2, {
      logger: this.options.logger,
      cache: this.options.cache
    });
  }
}

class PgliteDatabase extends PgDatabase {
  static [entityKind] = "PgliteDatabase";
}
function construct(client, config = {}) {
  const dialect2 = new PgDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger;
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema2;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
    schema2 = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new PgliteDriver(client, dialect2, { logger, cache: config.cache });
  const session2 = driver.createSession(schema2);
  const db2 = new PgliteDatabase(dialect2, session2, schema2);
  db2.$client = client;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
function drizzle(...params) {
  if (params[0] === undefined || typeof params[0] === "string") {
    const instance = new PGlite(params[0]);
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client)
      return construct(client, drizzleConfig);
    if (typeof connection === "object") {
      const { dataDir, ...options } = connection;
      const instance2 = new PGlite(dataDir, options);
      return construct(instance2, drizzleConfig);
    }
    const instance = new PGlite(connection);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));

// src/base.ts
init_drizzle_orm();
import {
  DatabaseAdapter,
  logger as logger17
} from "@elizaos/core";

// src/schema/embedding.ts
init_drizzle_orm();
init_pg_core();
import { VECTOR_DIMS } from "@elizaos/core";

// src/schema/memory.ts
init_drizzle_orm();
init_pg_core();
init_agent();

// src/schema/entity.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var entityTable = pgTable("entities", {
  id: uuid("id").notNull().primaryKey(),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, {
    onDelete: "cascade"
  }),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  names: text("names").array().default(sql`'{}'::text[]`).notNull(),
  metadata: jsonb("metadata").$type().default(sql`'{}'::jsonb`).notNull()
}, (table3) => {
  return {
    idAgentIdUnique: unique("id_agent_id_unique").on(table3.id, table3.agentId)
  };
});

// src/schema/room.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var roomTable = pgTable("rooms", {
  id: uuid("id").notNull().primaryKey().default(sql`gen_random_uuid()`),
  agentId: uuid("agent_id").references(() => agentTable.id, {
    onDelete: "cascade"
  }),
  source: text("source").notNull(),
  type: text("type").notNull(),
  messageServerId: uuid("message_server_id"),
  worldId: uuid("world_id"),
  name: text("name"),
  metadata: jsonb("metadata").$type(),
  channelId: text("channel_id"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});

// src/schema/memory.ts
var memoryTable = pgTable("memories", {
  id: uuid("id").primaryKey().notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  content: jsonb("content").$type().notNull(),
  entityId: uuid("entity_id").references(() => entityTable.id, {
    onDelete: "cascade"
  }),
  agentId: uuid("agent_id").references(() => agentTable.id, {
    onDelete: "cascade"
  }).notNull(),
  roomId: uuid("room_id").references(() => roomTable.id, {
    onDelete: "cascade"
  }),
  worldId: uuid("world_id"),
  unique: boolean("unique").default(true).notNull(),
  metadata: jsonb("metadata").$type().default({}).notNull()
}, (table3) => [
  index("idx_memories_type_room").on(table3.type, table3.roomId),
  index("idx_memories_world_id").on(table3.worldId),
  foreignKey({
    name: "fk_room",
    columns: [table3.roomId],
    foreignColumns: [roomTable.id]
  }).onDelete("cascade"),
  foreignKey({
    name: "fk_user",
    columns: [table3.entityId],
    foreignColumns: [entityTable.id]
  }).onDelete("cascade"),
  foreignKey({
    name: "fk_agent",
    columns: [table3.agentId],
    foreignColumns: [agentTable.id]
  }).onDelete("cascade"),
  index("idx_memories_metadata_type").on(sql`((metadata->>'type'))`),
  index("idx_memories_document_id").on(sql`((metadata->>'documentId'))`),
  index("idx_fragments_order").on(sql`((metadata->>'documentId'))`, sql`((metadata->>'position'))`),
  check("fragment_metadata_check", sql`
            CASE 
                WHEN metadata->>'type' = 'fragment' THEN
                    metadata ? 'documentId' AND 
                    metadata ? 'position'
                ELSE true
            END
        `),
  check("document_metadata_check", sql`
            CASE 
                WHEN metadata->>'type' = 'document' THEN
                    metadata ? 'timestamp'
                ELSE true
            END
        `)
]);
var memoryRelations = relations(memoryTable, ({ one }) => ({
  embedding: one(embeddingTable)
}));

// src/schema/embedding.ts
var DIMENSION_MAP = {
  [VECTOR_DIMS.SMALL]: "dim384",
  [VECTOR_DIMS.MEDIUM]: "dim512",
  [VECTOR_DIMS.LARGE]: "dim768",
  [VECTOR_DIMS.XL]: "dim1024",
  [VECTOR_DIMS.XXL]: "dim1536",
  [VECTOR_DIMS.XXXL]: "dim3072"
};
var embeddingTable = pgTable("embeddings", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  memoryId: uuid("memory_id").references(() => memoryTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  dim384: vector("dim_384", { dimensions: VECTOR_DIMS.SMALL }),
  dim512: vector("dim_512", { dimensions: VECTOR_DIMS.MEDIUM }),
  dim768: vector("dim_768", { dimensions: VECTOR_DIMS.LARGE }),
  dim1024: vector("dim_1024", { dimensions: VECTOR_DIMS.XL }),
  dim1536: vector("dim_1536", { dimensions: VECTOR_DIMS.XXL }),
  dim3072: vector("dim_3072", { dimensions: VECTOR_DIMS.XXXL })
}, (table3) => [
  check("embedding_source_check", sql`"memory_id" IS NOT NULL`),
  index("idx_embedding_memory").on(table3.memoryId),
  foreignKey({
    name: "fk_embedding_memory",
    columns: [table3.memoryId],
    foreignColumns: [memoryTable.id]
  }).onDelete("cascade")
]);

// src/schema/index.ts
init_agent();
var exports_schema = {};
__export(exports_schema, {
  worldTable: () => worldTable,
  taskTable: () => taskTable,
  serverTable: () => serverTable,
  roomTable: () => roomTable,
  relationshipTable: () => relationshipTable,
  participantTable: () => participantTable,
  messageTable: () => messageTable,
  messageServerTable: () => messageServerTable,
  messageServerAgentsTable: () => messageServerAgentsTable,
  memoryTable: () => memoryTable,
  logTable: () => logTable,
  entityTable: () => entityTable,
  embeddingTable: () => embeddingTable,
  componentTable: () => componentTable,
  channelTable: () => channelTable,
  channelParticipantsTable: () => channelParticipantsTable,
  cacheTable: () => cacheTable,
  agentTable: () => agentTable
});

// src/schema/cache.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var cacheTable = pgTable("cache", {
  key: text("key").notNull(),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, { onDelete: "cascade" }),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
}, (table3) => [primaryKey({ columns: [table3.key, table3.agentId] })]);
// src/schema/component.ts
init_drizzle_orm();
init_pg_core();
init_agent();

// src/schema/world.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var worldTable = pgTable("worlds", {
  id: uuid("id").notNull().primaryKey().default(sql`gen_random_uuid()`),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  metadata: jsonb("metadata").$type(),
  messageServerId: uuid("message_server_id"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});

// src/schema/component.ts
var componentTable = pgTable("components", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`).notNull(),
  entityId: uuid("entity_id").references(() => entityTable.id, { onDelete: "cascade" }).notNull(),
  agentId: uuid("agent_id").references(() => agentTable.id, { onDelete: "cascade" }).notNull(),
  roomId: uuid("room_id").references(() => roomTable.id, { onDelete: "cascade" }).notNull(),
  worldId: uuid("world_id").references(() => worldTable.id, { onDelete: "cascade" }),
  sourceEntityId: uuid("source_entity_id").references(() => entityTable.id, {
    onDelete: "cascade"
  }),
  type: text("type").notNull(),
  data: jsonb("data").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});
// src/schema/log.ts
init_drizzle_orm();
init_pg_core();
var logTable = pgTable("logs", {
  id: uuid("id").defaultRandom().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  entityId: uuid("entity_id").notNull().references(() => entityTable.id, { onDelete: "cascade" }),
  body: jsonb("body").notNull(),
  type: text("type").notNull(),
  roomId: uuid("room_id").notNull().references(() => roomTable.id, { onDelete: "cascade" })
}, (table3) => [
  foreignKey({
    name: "fk_room",
    columns: [table3.roomId],
    foreignColumns: [roomTable.id]
  }).onDelete("cascade"),
  foreignKey({
    name: "fk_user",
    columns: [table3.entityId],
    foreignColumns: [entityTable.id]
  }).onDelete("cascade")
]);

// src/schema/index.ts
init_server();

// src/schema/participant.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var participantTable = pgTable("participants", {
  id: uuid("id").notNull().primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  entityId: uuid("entity_id").references(() => entityTable.id, {
    onDelete: "cascade"
  }),
  roomId: uuid("room_id").references(() => roomTable.id, {
    onDelete: "cascade"
  }),
  agentId: uuid("agent_id").references(() => agentTable.id, {
    onDelete: "cascade"
  }),
  roomState: text("room_state")
}, (table3) => [
  index("idx_participants_user").on(table3.entityId),
  index("idx_participants_room").on(table3.roomId),
  foreignKey({
    name: "fk_room",
    columns: [table3.roomId],
    foreignColumns: [roomTable.id]
  }).onDelete("cascade"),
  foreignKey({
    name: "fk_user",
    columns: [table3.entityId],
    foreignColumns: [entityTable.id]
  }).onDelete("cascade")
]);
// src/schema/relationship.ts
init_drizzle_orm();
init_pg_core();
init_agent();
var relationshipTable = pgTable("relationships", {
  id: uuid("id").notNull().primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  sourceEntityId: uuid("source_entity_id").notNull().references(() => entityTable.id, { onDelete: "cascade" }),
  targetEntityId: uuid("target_entity_id").notNull().references(() => entityTable.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, { onDelete: "cascade" }),
  tags: text("tags").array(),
  metadata: jsonb("metadata").$type()
}, (table3) => [
  index("idx_relationships_users").on(table3.sourceEntityId, table3.targetEntityId),
  unique("unique_relationship").on(table3.sourceEntityId, table3.targetEntityId, table3.agentId),
  foreignKey({
    name: "fk_user_a",
    columns: [table3.sourceEntityId],
    foreignColumns: [entityTable.id]
  }).onDelete("cascade"),
  foreignKey({
    name: "fk_user_b",
    columns: [table3.targetEntityId],
    foreignColumns: [entityTable.id]
  }).onDelete("cascade")
]);
// src/schema/tasks.ts
init_pg_core();
init_drizzle_orm();
init_agent();
var taskTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  roomId: uuid("room_id"),
  worldId: uuid("world_id"),
  entityId: uuid("entity_id"),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, { onDelete: "cascade" }),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  metadata: jsonb("metadata").$type().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
// src/schema/messageServer.ts
init_pg_core();
init_drizzle_orm();
var messageServerTable = pgTable("message_servers", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id"),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull()
});
// src/schema/channel.ts
init_pg_core();
init_drizzle_orm();
var channelTable = pgTable("channels", {
  id: text("id").primaryKey(),
  messageServerId: uuid("message_server_id").notNull().references(() => messageServerTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  sourceType: text("source_type"),
  sourceId: text("source_id"),
  topic: text("topic"),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull()
});
// src/schema/message.ts
init_pg_core();
init_drizzle_orm();
var messageTable = pgTable("central_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => channelTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  rawMessage: jsonb("raw_message"),
  inReplyToRootMessageId: text("in_reply_to_root_message_id").references(() => messageTable.id, {
    onDelete: "set null"
  }),
  sourceType: text("source_type"),
  sourceId: text("source_id"),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull()
});
// src/schema/channelParticipant.ts
init_pg_core();
var channelParticipantsTable = pgTable("channel_participants", {
  channelId: text("channel_id").notNull().references(() => channelTable.id, { onDelete: "cascade" }),
  entityId: text("entity_id").notNull()
}, (table3) => [primaryKey({ columns: [table3.channelId, table3.entityId] })]);
// src/schema/messageServerAgent.ts
init_pg_core();
init_agent();
var messageServerAgentsTable = pgTable("message_server_agents", {
  messageServerId: uuid("message_server_id").notNull().references(() => messageServerTable.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agentTable.id, { onDelete: "cascade" })
}, (table3) => [primaryKey({ columns: [table3.messageServerId, table3.agentId] })]);
// src/utils.ts
function sanitizeJsonObject(value, seen = new WeakSet) {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").replace(/\\(?!["\\/bfnrtu])/g, "\\\\").replace(/\\u(?![0-9a-fA-F]{4})/g, "\\\\u");
  }
  if (typeof value === "object") {
    if (seen.has(value)) {
      return null;
    } else {
      seen.add(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeJsonObject(item, seen));
    } else {
      const result = {};
      for (const [key, val] of Object.entries(value)) {
        const sanitizedKey = typeof key === "string" ? key.replace(/\u0000/g, "").replace(/\\u(?![0-9a-fA-F]{4})/g, "\\\\u") : key;
        result[sanitizedKey] = sanitizeJsonObject(val, seen);
      }
      return result;
    }
  }
  return value;
}

// src/stores/agent.store.ts
init_drizzle_orm();
import { logger as logger2 } from "@elizaos/core";
class AgentStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async get(agentId) {
    return this.ctx.withRetry(async () => {
      const rows = await this.db.select().from(agentTable).where(eq(agentTable.id, agentId)).limit(1);
      if (rows.length === 0)
        return null;
      const row = rows[0];
      return {
        ...row,
        username: row.username || "",
        id: row.id,
        system: !row.system ? undefined : row.system,
        bio: !row.bio ? "" : row.bio,
        createdAt: row.createdAt.getTime(),
        updatedAt: row.updatedAt.getTime(),
        settings: row.settings
      };
    }, "AgentStore.get");
  }
  async getAll() {
    const result = await this.ctx.withRetry(async () => {
      const rows = await this.db.select({
        id: agentTable.id,
        name: agentTable.name,
        bio: agentTable.bio
      }).from(agentTable);
      return rows.map((row) => ({
        ...row,
        id: row.id,
        bio: row.bio === null ? "" : row.bio
      }));
    }, "AgentStore.getAll");
    return result || [];
  }
  async create(agent) {
    return this.ctx.withRetry(async () => {
      try {
        if (agent.id) {
          const existing = await this.db.select({ id: agentTable.id }).from(agentTable).where(eq(agentTable.id, agent.id)).limit(1);
          if (existing.length > 0) {
            logger2.warn({ src: "plugin:sql", agentId: agent.id }, "Attempted to create agent with duplicate ID");
            return false;
          }
        }
        await this.db.transaction(async (tx) => {
          await tx.insert(agentTable).values({
            ...agent,
            createdAt: new Date(agent.createdAt || Date.now()),
            updatedAt: new Date(agent.updatedAt || Date.now())
          });
        });
        return true;
      } catch (error) {
        logger2.error({
          src: "plugin:sql",
          agentId: agent.id,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to create agent");
        return false;
      }
    }, "AgentStore.create");
  }
  async update(agentId, agent) {
    return this.ctx.withRetry(async () => {
      try {
        if (!agentId) {
          throw new Error("Agent ID is required for update");
        }
        await this.db.transaction(async (tx) => {
          if (agent?.settings) {
            agent.settings = await this.mergeSettings(tx, agentId, agent.settings);
          }
          const updateData = { ...agent };
          if (updateData.createdAt) {
            if (typeof updateData.createdAt === "number") {
              updateData.createdAt = new Date(updateData.createdAt);
            } else {
              delete updateData.createdAt;
            }
          }
          if (updateData.updatedAt) {
            if (typeof updateData.updatedAt === "number") {
              updateData.updatedAt = new Date(updateData.updatedAt);
            } else {
              updateData.updatedAt = new Date;
            }
          } else {
            updateData.updatedAt = new Date;
          }
          await tx.update(agentTable).set(updateData).where(eq(agentTable.id, agentId));
        });
        return true;
      } catch (error) {
        logger2.error({
          src: "plugin:sql",
          agentId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to update agent");
        return false;
      }
    }, "AgentStore.update");
  }
  async delete(agentId) {
    return this.ctx.withRetry(async () => {
      try {
        const result = await this.db.delete(agentTable).where(eq(agentTable.id, agentId)).returning();
        if (result.length === 0) {
          logger2.warn({ src: "plugin:sql", agentId }, "Agent not found for deletion");
          return false;
        }
        return true;
      } catch (error) {
        logger2.error({
          src: "plugin:sql",
          agentId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to delete agent");
        throw error;
      }
    }, "AgentStore.delete");
  }
  async count() {
    return this.ctx.withRetry(async () => {
      try {
        const result = await this.db.select({ count: count() }).from(agentTable);
        return result[0]?.count || 0;
      } catch (error) {
        logger2.error({ src: "plugin:sql", error: error instanceof Error ? error.message : String(error) }, "Failed to count agents");
        return 0;
      }
    }, "AgentStore.count");
  }
  async deleteAll() {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.delete(agentTable);
      } catch (error) {
        logger2.error({ src: "plugin:sql", error: error instanceof Error ? error.message : String(error) }, "Failed to clean up agent table");
        throw error;
      }
    }, "AgentStore.deleteAll");
  }
  async mergeSettings(tx, agentId, updatedSettings) {
    const currentAgent = await tx.select({ settings: agentTable.settings }).from(agentTable).where(eq(agentTable.id, agentId)).limit(1);
    const currentSettings = currentAgent.length > 0 && currentAgent[0].settings ? currentAgent[0].settings : {};
    const deepMerge = (target, source) => {
      if (source === null)
        return;
      if (Array.isArray(source) || typeof source !== "object")
        return source;
      const output = typeof target === "object" && target !== null && !Array.isArray(target) ? { ...target } : {};
      for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        if (sourceValue === null) {
          delete output[key];
        } else if (typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
          const nested = deepMerge(output[key], sourceValue);
          if (nested === undefined)
            delete output[key];
          else
            output[key] = nested;
        } else {
          output[key] = sourceValue;
        }
      }
      if (Object.keys(output).length === 0) {
        if (!(typeof source === "object" && source !== null && Object.keys(source).length === 0)) {
          return;
        }
      }
      return output;
    };
    const finalSettings = deepMerge(currentSettings, updatedSettings);
    return finalSettings ?? {};
  }
}

// src/stores/memory.store.ts
init_drizzle_orm();
import { logger as logger3 } from "@elizaos/core";
import { v4 } from "uuid";
class MemoryStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async get(params) {
    const { entityId, agentId, roomId, worldId, tableName, unique: unique2, start, end, offset } = params;
    if (!tableName)
      throw new Error("tableName is required");
    if (offset !== undefined && offset < 0) {
      throw new Error("offset must be a non-negative number");
    }
    return this.ctx.withIsolationContext(entityId ?? null, async (tx) => {
      const conditions2 = [eq(memoryTable.type, tableName)];
      if (start)
        conditions2.push(gte(memoryTable.createdAt, new Date(start)));
      if (roomId)
        conditions2.push(eq(memoryTable.roomId, roomId));
      if (worldId)
        conditions2.push(eq(memoryTable.worldId, worldId));
      if (end)
        conditions2.push(lte(memoryTable.createdAt, new Date(end)));
      if (unique2)
        conditions2.push(eq(memoryTable.unique, true));
      if (agentId)
        conditions2.push(eq(memoryTable.agentId, agentId));
      const baseQuery = tx.select({
        memory: {
          id: memoryTable.id,
          type: memoryTable.type,
          createdAt: memoryTable.createdAt,
          content: memoryTable.content,
          entityId: memoryTable.entityId,
          agentId: memoryTable.agentId,
          roomId: memoryTable.roomId,
          unique: memoryTable.unique,
          metadata: memoryTable.metadata
        },
        embedding: embeddingTable[this.ctx.getEmbeddingDimension()]
      }).from(memoryTable).leftJoin(embeddingTable, eq(embeddingTable.memoryId, memoryTable.id)).where(and(...conditions2)).orderBy(desc(memoryTable.createdAt), desc(memoryTable.id));
      const rows = await (async () => {
        if (params.count && offset !== undefined && offset > 0) {
          return baseQuery.limit(params.count).offset(offset);
        } else if (params.count) {
          return baseQuery.limit(params.count);
        } else if (offset !== undefined && offset > 0) {
          return baseQuery.offset(offset);
        }
        return baseQuery;
      })();
      return rows.map((row) => ({
        id: row.memory.id,
        type: row.memory.type,
        createdAt: row.memory.createdAt.getTime(),
        content: typeof row.memory.content === "string" ? JSON.parse(row.memory.content) : row.memory.content,
        entityId: row.memory.entityId,
        agentId: row.memory.agentId,
        roomId: row.memory.roomId,
        unique: row.memory.unique,
        metadata: row.memory.metadata,
        embedding: row.embedding ? Array.from(row.embedding) : undefined
      }));
    });
  }
  async getByRoomIds(params) {
    return this.ctx.withRetry(async () => {
      if (params.roomIds.length === 0)
        return [];
      const conditions2 = [
        eq(memoryTable.type, params.tableName),
        inArray(memoryTable.roomId, params.roomIds),
        eq(memoryTable.agentId, this.ctx.agentId)
      ];
      const query = this.db.select({
        id: memoryTable.id,
        type: memoryTable.type,
        createdAt: memoryTable.createdAt,
        content: memoryTable.content,
        entityId: memoryTable.entityId,
        agentId: memoryTable.agentId,
        roomId: memoryTable.roomId,
        unique: memoryTable.unique,
        metadata: memoryTable.metadata
      }).from(memoryTable).where(and(...conditions2)).orderBy(desc(memoryTable.createdAt), desc(memoryTable.id));
      const rows = params.limit ? await query.limit(params.limit) : await query;
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.getTime(),
        content: typeof row.content === "string" ? JSON.parse(row.content) : row.content,
        entityId: row.entityId,
        agentId: row.agentId,
        roomId: row.roomId,
        unique: row.unique,
        metadata: row.metadata
      }));
    }, "MemoryStore.getByRoomIds");
  }
  async getById(id) {
    return this.ctx.withRetry(async () => {
      const memoryResult = await this.db.select().from(memoryTable).where(eq(memoryTable.id, id)).limit(1);
      if (memoryResult.length === 0)
        return null;
      const memory = memoryResult[0];
      let embedding;
      try {
        const embeddingCol = this.ctx.getEmbeddingDimension();
        const embeddingResult = await this.db.select({ embedding: embeddingTable[embeddingCol] }).from(embeddingTable).where(eq(embeddingTable.memoryId, id)).limit(1);
        embedding = embeddingResult[0]?.embedding ?? undefined;
      } catch {
        embedding = undefined;
      }
      return {
        id: memory.id,
        createdAt: memory.createdAt.getTime(),
        content: typeof memory.content === "string" ? JSON.parse(memory.content) : memory.content,
        entityId: memory.entityId,
        agentId: memory.agentId,
        roomId: memory.roomId,
        unique: memory.unique,
        metadata: memory.metadata,
        embedding
      };
    }, "MemoryStore.getById");
  }
  async getByIds(memoryIds, tableName) {
    return this.ctx.withRetry(async () => {
      if (memoryIds.length === 0)
        return [];
      const conditions2 = [inArray(memoryTable.id, memoryIds)];
      if (tableName)
        conditions2.push(eq(memoryTable.type, tableName));
      const rows = await this.db.select({
        memory: memoryTable,
        embedding: embeddingTable[this.ctx.getEmbeddingDimension()]
      }).from(memoryTable).leftJoin(embeddingTable, eq(embeddingTable.memoryId, memoryTable.id)).where(and(...conditions2)).orderBy(desc(memoryTable.createdAt), desc(memoryTable.id));
      return rows.map((row) => ({
        id: row.memory.id,
        createdAt: row.memory.createdAt.getTime(),
        content: typeof row.memory.content === "string" ? JSON.parse(row.memory.content) : row.memory.content,
        entityId: row.memory.entityId,
        agentId: row.memory.agentId,
        roomId: row.memory.roomId,
        unique: row.memory.unique,
        metadata: row.memory.metadata,
        embedding: row.embedding ?? undefined
      }));
    }, "MemoryStore.getByIds");
  }
  async searchByEmbedding(embedding, params) {
    return this.ctx.withRetry(async () => {
      const cleanVector = embedding.map((n) => Number.isFinite(n) ? Number(n.toFixed(6)) : 0);
      const similarity = sql`1 - (${cosineDistance(embeddingTable[this.ctx.getEmbeddingDimension()], cleanVector)})`;
      const conditions2 = [
        eq(memoryTable.type, params.tableName),
        eq(memoryTable.agentId, this.ctx.agentId)
      ];
      if (params.unique)
        conditions2.push(eq(memoryTable.unique, true));
      if (params.roomId)
        conditions2.push(eq(memoryTable.roomId, params.roomId));
      if (params.worldId)
        conditions2.push(eq(memoryTable.worldId, params.worldId));
      if (params.entityId)
        conditions2.push(eq(memoryTable.entityId, params.entityId));
      if (params.match_threshold)
        conditions2.push(gte(similarity, params.match_threshold));
      const results = await this.db.select({
        memory: memoryTable,
        similarity,
        embedding: embeddingTable[this.ctx.getEmbeddingDimension()]
      }).from(embeddingTable).innerJoin(memoryTable, eq(memoryTable.id, embeddingTable.memoryId)).where(and(...conditions2)).orderBy(desc(similarity)).limit(params.count ?? 10);
      return results.map((row) => ({
        id: row.memory.id,
        type: row.memory.type,
        createdAt: row.memory.createdAt.getTime(),
        content: typeof row.memory.content === "string" ? JSON.parse(row.memory.content) : row.memory.content,
        entityId: row.memory.entityId,
        agentId: row.memory.agentId,
        roomId: row.memory.roomId,
        worldId: row.memory.worldId,
        unique: row.memory.unique,
        metadata: row.memory.metadata,
        embedding: row.embedding ?? undefined,
        similarity: row.similarity
      }));
    }, "MemoryStore.searchByEmbedding");
  }
  async create(memory, tableName) {
    const memoryId = memory.id ?? v4();
    if (memory.unique === undefined) {
      memory.unique = true;
      if (memory.embedding && Array.isArray(memory.embedding)) {
        const similarMemories = await this.searchByEmbedding(memory.embedding, {
          tableName,
          roomId: memory.roomId,
          worldId: memory.worldId,
          entityId: memory.entityId,
          match_threshold: 0.95,
          count: 1
        });
        memory.unique = similarMemories.length === 0;
      }
    }
    const contentToInsert = typeof memory.content === "string" ? memory.content : JSON.stringify(memory.content ?? {});
    const metadataToInsert = typeof memory.metadata === "string" ? memory.metadata : JSON.stringify(memory.metadata ?? {});
    await this.ctx.withIsolationContext(memory.entityId, async (tx) => {
      const inserted = await tx.insert(memoryTable).values([
        {
          id: memoryId,
          type: tableName,
          content: sql`${contentToInsert}::jsonb`,
          metadata: sql`${metadataToInsert}::jsonb`,
          entityId: memory.entityId,
          roomId: memory.roomId,
          worldId: memory.worldId,
          agentId: memory.agentId || this.ctx.agentId,
          unique: memory.unique,
          createdAt: memory.createdAt ? new Date(memory.createdAt) : new Date
        }
      ]).onConflictDoNothing().returning();
      if (inserted.length > 0 && memory.embedding && Array.isArray(memory.embedding)) {
        await this.upsertEmbedding(tx, memoryId, memory.embedding);
      }
    });
    return memoryId;
  }
  async update(memory) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.transaction(async (tx) => {
          if (memory.content) {
            const contentToUpdate = typeof memory.content === "string" ? memory.content : JSON.stringify(memory.content ?? {});
            const metadataToUpdate = typeof memory.metadata === "string" ? memory.metadata : JSON.stringify(memory.metadata ?? {});
            await tx.update(memoryTable).set({
              content: sql`${contentToUpdate}::jsonb`,
              ...memory.metadata && { metadata: sql`${metadataToUpdate}::jsonb` }
            }).where(eq(memoryTable.id, memory.id));
          } else if (memory.metadata) {
            const metadataToUpdate = typeof memory.metadata === "string" ? memory.metadata : JSON.stringify(memory.metadata ?? {});
            await tx.update(memoryTable).set({ metadata: sql`${metadataToUpdate}::jsonb` }).where(eq(memoryTable.id, memory.id));
          }
          if (memory.embedding && Array.isArray(memory.embedding)) {
            await this.upsertEmbedding(tx, memory.id, memory.embedding);
          }
        });
        return true;
      } catch (error) {
        logger3.error({
          src: "plugin:sql",
          memoryId: memory.id,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to update memory");
        return false;
      }
    }, "MemoryStore.update");
  }
  async delete(memoryId) {
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        await this.deleteFragments(tx, memoryId);
        await tx.delete(embeddingTable).where(eq(embeddingTable.memoryId, memoryId));
        await tx.delete(memoryTable).where(eq(memoryTable.id, memoryId));
      });
    }, "MemoryStore.delete");
  }
  async deleteMany(memoryIds) {
    if (memoryIds.length === 0)
      return;
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        const BATCH_SIZE = 100;
        for (let i = 0;i < memoryIds.length; i += BATCH_SIZE) {
          const batch = memoryIds.slice(i, i + BATCH_SIZE);
          await Promise.all(batch.map((id) => this.deleteFragments(tx, id)));
          await tx.delete(embeddingTable).where(inArray(embeddingTable.memoryId, batch));
          await tx.delete(memoryTable).where(inArray(memoryTable.id, batch));
        }
      });
    }, "MemoryStore.deleteMany");
  }
  async deleteAllByRoom(roomId, tableName) {
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        const rows = await tx.select({ id: memoryTable.id }).from(memoryTable).where(and(eq(memoryTable.roomId, roomId), eq(memoryTable.type, tableName)));
        const ids = rows.map((r) => r.id);
        if (ids.length === 0)
          return;
        await Promise.all(ids.map(async (memoryId) => {
          await this.deleteFragments(tx, memoryId);
          await tx.delete(embeddingTable).where(eq(embeddingTable.memoryId, memoryId));
        }));
        await tx.delete(memoryTable).where(and(eq(memoryTable.roomId, roomId), eq(memoryTable.type, tableName)));
      });
    }, "MemoryStore.deleteAllByRoom");
  }
  async count(roomId, unique2 = true, tableName = "") {
    if (!tableName)
      throw new Error("tableName is required");
    return this.ctx.withRetry(async () => {
      const conditions2 = [eq(memoryTable.roomId, roomId), eq(memoryTable.type, tableName)];
      if (unique2)
        conditions2.push(eq(memoryTable.unique, true));
      const result = await this.db.select({ count: sql`count(*)` }).from(memoryTable).where(and(...conditions2));
      return Number(result[0]?.count ?? 0);
    }, "MemoryStore.count");
  }
  async upsertEmbedding(tx, memoryId, embedding) {
    const cleanVector = embedding.map((n) => Number.isFinite(n) ? Number(n.toFixed(6)) : 0);
    const existingEmbedding = await tx.select({ id: embeddingTable.id }).from(embeddingTable).where(eq(embeddingTable.memoryId, memoryId)).limit(1);
    if (existingEmbedding.length > 0) {
      const updateValues = {};
      updateValues[this.ctx.getEmbeddingDimension()] = cleanVector;
      await tx.update(embeddingTable).set(updateValues).where(eq(embeddingTable.memoryId, memoryId));
    } else {
      const embeddingValues = { id: v4(), memoryId };
      embeddingValues[this.ctx.getEmbeddingDimension()] = cleanVector;
      await tx.insert(embeddingTable).values([embeddingValues]);
    }
  }
  async deleteFragments(tx, documentId) {
    const fragments = await tx.select({ id: memoryTable.id }).from(memoryTable).where(and(eq(memoryTable.agentId, this.ctx.agentId), sql`${memoryTable.metadata}->>'documentId' = ${documentId}`));
    if (fragments.length > 0) {
      const fragmentIds = fragments.map((f) => f.id);
      await tx.delete(embeddingTable).where(inArray(embeddingTable.memoryId, fragmentIds));
      await tx.delete(memoryTable).where(inArray(memoryTable.id, fragmentIds));
    }
  }
}

// src/stores/room.store.ts
init_drizzle_orm();
import { v4 as v42 } from "uuid";
class RoomStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async getByIds(roomIds) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({
        id: roomTable.id,
        name: roomTable.name,
        channelId: roomTable.channelId,
        agentId: roomTable.agentId,
        messageServerId: roomTable.messageServerId,
        worldId: roomTable.worldId,
        type: roomTable.type,
        source: roomTable.source,
        metadata: roomTable.metadata
      }).from(roomTable).where(and(inArray(roomTable.id, roomIds), eq(roomTable.agentId, this.ctx.agentId)));
      return result.map((room) => ({
        ...room,
        id: room.id,
        name: room.name ?? undefined,
        agentId: room.agentId,
        messageServerId: room.messageServerId,
        serverId: room.messageServerId,
        worldId: room.worldId,
        channelId: room.channelId,
        type: room.type,
        metadata: room.metadata
      }));
    }, "RoomStore.getByIds");
  }
  async getByWorld(worldId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(roomTable).where(eq(roomTable.worldId, worldId));
      return result.map((room) => ({
        ...room,
        id: room.id,
        name: room.name ?? undefined,
        agentId: room.agentId,
        messageServerId: room.messageServerId,
        serverId: room.messageServerId,
        worldId: room.worldId,
        channelId: room.channelId,
        type: room.type,
        metadata: room.metadata
      }));
    }, "RoomStore.getByWorld");
  }
  async update(room) {
    return this.ctx.withRetry(async () => {
      await this.db.update(roomTable).set({ ...room, agentId: this.ctx.agentId }).where(eq(roomTable.id, room.id));
    }, "RoomStore.update");
  }
  async create(rooms) {
    return this.ctx.withRetry(async () => {
      const roomsWithIds = rooms.map((room) => ({
        ...room,
        agentId: this.ctx.agentId,
        id: room.id || v42()
      }));
      await this.db.insert(roomTable).values(roomsWithIds).onConflictDoNothing();
      return roomsWithIds.map((r) => r.id);
    }, "RoomStore.create");
  }
  async delete(roomId) {
    if (!roomId)
      throw new Error("Room ID is required");
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        await tx.delete(roomTable).where(eq(roomTable.id, roomId));
      });
    }, "RoomStore.delete");
  }
  async deleteByWorld(worldId) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(roomTable).where(eq(roomTable.worldId, worldId));
    }, "RoomStore.deleteByWorld");
  }
}

// src/stores/participant.store.ts
init_drizzle_orm();
import { logger as logger4 } from "@elizaos/core";
class ParticipantStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async getRoomsForEntity(entityId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({ roomId: participantTable.roomId }).from(participantTable).innerJoin(roomTable, eq(participantTable.roomId, roomTable.id)).where(and(eq(participantTable.entityId, entityId), eq(roomTable.agentId, this.ctx.agentId)));
      return result.map((row) => row.roomId);
    }, "ParticipantStore.getRoomsForEntity");
  }
  async getRoomsForEntities(entityIds) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.selectDistinct({ roomId: participantTable.roomId }).from(participantTable).innerJoin(roomTable, eq(participantTable.roomId, roomTable.id)).where(and(inArray(participantTable.entityId, entityIds), eq(roomTable.agentId, this.ctx.agentId)));
      return result.map((row) => row.roomId);
    }, "ParticipantStore.getRoomsForEntities");
  }
  async add(entityId, roomId) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.insert(participantTable).values({
          entityId,
          roomId,
          agentId: this.ctx.agentId
        }).onConflictDoNothing();
        return true;
      } catch (error) {
        logger4.error({
          src: "plugin:sql",
          entityId,
          roomId,
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to add participant to room");
        return false;
      }
    }, "ParticipantStore.add");
  }
  async addMany(entityIds, roomId) {
    return this.ctx.withRetry(async () => {
      try {
        const values = entityIds.map((id) => ({
          entityId: id,
          roomId,
          agentId: this.ctx.agentId
        }));
        await this.db.insert(participantTable).values(values).onConflictDoNothing().execute();
        return true;
      } catch (error) {
        logger4.error({
          src: "plugin:sql",
          roomId,
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to add participants to room");
        return false;
      }
    }, "ParticipantStore.addMany");
  }
  async remove(entityId, roomId) {
    return this.ctx.withRetry(async () => {
      try {
        const result = await this.db.transaction(async (tx) => {
          return await tx.delete(participantTable).where(and(eq(participantTable.entityId, entityId), eq(participantTable.roomId, roomId))).returning();
        });
        return result.length > 0;
      } catch (error) {
        logger4.error({
          src: "plugin:sql",
          entityId,
          roomId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to remove participant from room");
        return false;
      }
    }, "ParticipantStore.remove");
  }
  async getForRoom(roomId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({ entityId: participantTable.entityId }).from(participantTable).where(eq(participantTable.roomId, roomId));
      return result.map((row) => row.entityId);
    }, "ParticipantStore.getForRoom");
  }
  async isParticipant(roomId, entityId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(participantTable).where(and(eq(participantTable.roomId, roomId), eq(participantTable.entityId, entityId))).limit(1);
      return result.length > 0;
    }, "ParticipantStore.isParticipant");
  }
  async getUserState(roomId, entityId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({ roomState: participantTable.roomState }).from(participantTable).where(and(eq(participantTable.roomId, roomId), eq(participantTable.entityId, entityId), eq(participantTable.agentId, this.ctx.agentId))).limit(1);
      return result[0]?.roomState ?? null;
    }, "ParticipantStore.getUserState");
  }
  async setUserState(roomId, entityId, state) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.transaction(async (tx) => {
          await tx.update(participantTable).set({ roomState: state }).where(and(eq(participantTable.roomId, roomId), eq(participantTable.entityId, entityId), eq(participantTable.agentId, this.ctx.agentId)));
        });
      } catch (error) {
        logger4.error({
          src: "plugin:sql",
          roomId,
          entityId,
          state,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to set participant follow state");
        throw error;
      }
    }, "ParticipantStore.setUserState");
  }
  async getByEntity(entityId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({
        id: participantTable.id,
        entityId: participantTable.entityId,
        roomId: participantTable.roomId
      }).from(participantTable).where(eq(participantTable.entityId, entityId));
      return result.map((row) => ({
        id: row.id,
        entityId: row.entityId,
        roomId: row.roomId
      }));
    }, "ParticipantStore.getByEntity");
  }
}

// src/stores/entity.store.ts
init_drizzle_orm();
import { logger as logger5 } from "@elizaos/core";
class EntityStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async getByIds(entityIds) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select({
        entity: entityTable,
        components: componentTable
      }).from(entityTable).leftJoin(componentTable, eq(componentTable.entityId, entityTable.id)).where(inArray(entityTable.id, entityIds));
      if (result.length === 0)
        return [];
      const entities = {};
      const entityComponents = {};
      for (const e of result) {
        const key = e.entity.id;
        entities[key] = e.entity;
        if (entityComponents[key] === undefined)
          entityComponents[key] = [];
        if (e.components) {
          const componentsArray = Array.isArray(e.components) ? e.components : [e.components];
          entityComponents[key] = [...entityComponents[key], ...componentsArray];
        }
      }
      for (const k of Object.keys(entityComponents)) {
        entities[k].components = entityComponents[k];
      }
      return Object.values(entities);
    }, "EntityStore.getByIds");
  }
  async getForRoom(roomId, includeComponents) {
    return this.ctx.withRetry(async () => {
      const query = this.db.select({
        entity: entityTable,
        ...includeComponents && { components: componentTable }
      }).from(participantTable).leftJoin(entityTable, and(eq(participantTable.entityId, entityTable.id), eq(entityTable.agentId, this.ctx.agentId)));
      if (includeComponents) {
        query.leftJoin(componentTable, eq(componentTable.entityId, entityTable.id));
      }
      const result = await query.where(eq(participantTable.roomId, roomId));
      const entitiesByIdMap = new Map;
      for (const row of result) {
        if (!row.entity)
          continue;
        const entityId = row.entity.id;
        if (!entitiesByIdMap.has(entityId)) {
          const entity2 = {
            ...row.entity,
            id: entityId,
            agentId: row.entity.agentId,
            metadata: row.entity.metadata,
            components: includeComponents ? [] : undefined
          };
          entitiesByIdMap.set(entityId, entity2);
        }
        if (includeComponents && row.components) {
          const entity2 = entitiesByIdMap.get(entityId);
          if (entity2) {
            if (!entity2.components)
              entity2.components = [];
            entity2.components.push(row.components);
          }
        }
      }
      return Array.from(entitiesByIdMap.values());
    }, "EntityStore.getForRoom");
  }
  async create(entities) {
    return this.ctx.withRetry(async () => {
      try {
        return await this.db.transaction(async (tx) => {
          const normalizedEntities = entities.map((entity2) => ({
            ...entity2,
            names: this.normalizeNames(entity2.names),
            metadata: entity2.metadata || {}
          }));
          await tx.insert(entityTable).values(normalizedEntities).onConflictDoNothing();
          return true;
        });
      } catch (error) {
        logger5.error({
          src: "plugin:sql",
          entityId: entities[0]?.id,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to create entities");
        return false;
      }
    }, "EntityStore.create");
  }
  async ensureExists(entity2) {
    if (!entity2.id) {
      logger5.error({ src: "plugin:sql" }, "Entity ID is required for ensureExists");
      return false;
    }
    try {
      const existingEntities = await this.getByIds([entity2.id]);
      if (!existingEntities || !existingEntities.length) {
        return await this.create([entity2]);
      }
      return true;
    } catch (error) {
      logger5.error({
        src: "plugin:sql",
        entityId: entity2.id,
        error: error instanceof Error ? error.message : String(error)
      }, "Failed to ensure entity exists");
      return false;
    }
  }
  async update(entity2) {
    if (!entity2.id)
      throw new Error("Entity ID is required for update");
    return this.ctx.withRetry(async () => {
      const normalizedEntity = {
        ...entity2,
        names: this.normalizeNames(entity2.names),
        metadata: entity2.metadata || {}
      };
      await this.db.update(entityTable).set(normalizedEntity).where(eq(entityTable.id, entity2.id));
    }, "EntityStore.update");
  }
  async delete(entityId) {
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        await tx.delete(componentTable).where(or(eq(componentTable.entityId, entityId), eq(componentTable.sourceEntityId, entityId)));
        await tx.delete(entityTable).where(eq(entityTable.id, entityId));
      });
    }, "EntityStore.delete");
  }
  async getByNames(params) {
    return this.ctx.withRetry(async () => {
      const { names, agentId } = params;
      const nameConditions = names.map((name) => sql`${name} = ANY(${entityTable.names})`);
      const query = sql`
        SELECT * FROM ${entityTable}
        WHERE ${entityTable.agentId} = ${agentId}
        AND (${sql.join(nameConditions, sql` OR `)})
      `;
      const result = await this.db.execute(query);
      return result.rows.map((row) => ({
        id: row.id,
        agentId: row.agentId,
        names: Array.isArray(row.names) ? row.names : [],
        metadata: row.metadata || {}
      }));
    }, "EntityStore.getByNames");
  }
  async searchByName(params) {
    return this.ctx.withRetry(async () => {
      const { query, agentId, limit = 10 } = params;
      if (!query || query.trim() === "") {
        const result2 = await this.db.select().from(entityTable).where(eq(entityTable.agentId, agentId)).limit(limit);
        return result2.map((row) => ({
          id: row.id,
          agentId: row.agentId,
          names: Array.isArray(row.names) ? row.names : [],
          metadata: row.metadata || {}
        }));
      }
      const searchQuery = sql`
        SELECT * FROM ${entityTable}
        WHERE ${entityTable.agentId} = ${agentId}
        AND EXISTS (
          SELECT 1 FROM unnest(${entityTable.names}) AS name
          WHERE LOWER(name) LIKE LOWER(${"%" + query + "%"})
        )
        LIMIT ${limit}
      `;
      const result = await this.db.execute(searchQuery);
      return result.rows.map((row) => ({
        id: row.id,
        agentId: row.agentId,
        names: Array.isArray(row.names) ? row.names : [],
        metadata: row.metadata || {}
      }));
    }, "EntityStore.searchByName");
  }
  normalizeNames(names) {
    if (names == null)
      return [];
    if (typeof names === "string")
      return [names];
    if (Array.isArray(names))
      return names.map(String);
    if (names instanceof Set)
      return Array.from(names).map(String);
    if (typeof names === "object" && typeof names[Symbol.iterator] === "function") {
      return Array.from(names).map(String);
    }
    return [String(names)];
  }
}

// src/stores/component.store.ts
init_drizzle_orm();
class ComponentStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async get(entityId, type, worldId, sourceEntityId) {
    return this.ctx.withRetry(async () => {
      const conditions2 = [eq(componentTable.entityId, entityId), eq(componentTable.type, type)];
      if (worldId)
        conditions2.push(eq(componentTable.worldId, worldId));
      if (sourceEntityId)
        conditions2.push(eq(componentTable.sourceEntityId, sourceEntityId));
      const result = await this.db.select().from(componentTable).where(and(...conditions2));
      if (result.length === 0)
        return null;
      const component = result[0];
      return {
        ...component,
        id: component.id,
        entityId: component.entityId,
        agentId: component.agentId,
        roomId: component.roomId,
        worldId: component.worldId ?? "",
        sourceEntityId: component.sourceEntityId ?? "",
        data: component.data,
        createdAt: component.createdAt.getTime()
      };
    }, "ComponentStore.get");
  }
  async getAll(entityId, worldId, sourceEntityId) {
    return this.ctx.withRetry(async () => {
      const conditions2 = [eq(componentTable.entityId, entityId)];
      if (worldId)
        conditions2.push(eq(componentTable.worldId, worldId));
      if (sourceEntityId)
        conditions2.push(eq(componentTable.sourceEntityId, sourceEntityId));
      const result = await this.db.select({
        id: componentTable.id,
        entityId: componentTable.entityId,
        type: componentTable.type,
        data: componentTable.data,
        worldId: componentTable.worldId,
        agentId: componentTable.agentId,
        roomId: componentTable.roomId,
        sourceEntityId: componentTable.sourceEntityId,
        createdAt: componentTable.createdAt
      }).from(componentTable).where(and(...conditions2));
      if (result.length === 0)
        return [];
      return result.map((component) => ({
        ...component,
        id: component.id,
        entityId: component.entityId,
        agentId: component.agentId,
        roomId: component.roomId,
        worldId: component.worldId ?? "",
        sourceEntityId: component.sourceEntityId ?? "",
        data: component.data,
        createdAt: component.createdAt.getTime()
      }));
    }, "ComponentStore.getAll");
  }
  async create(component) {
    return this.ctx.withRetry(async () => {
      await this.db.insert(componentTable).values({
        ...component,
        createdAt: new Date
      });
      return true;
    }, "ComponentStore.create");
  }
  async update(component) {
    return this.ctx.withRetry(async () => {
      const { createdAt, ...updateData } = component;
      await this.db.update(componentTable).set(updateData).where(eq(componentTable.id, component.id));
    }, "ComponentStore.update");
  }
  async delete(componentId) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(componentTable).where(eq(componentTable.id, componentId));
    }, "ComponentStore.delete");
  }
}

// src/stores/relationship.store.ts
init_drizzle_orm();
import { logger as logger6 } from "@elizaos/core";
import { v4 as v43 } from "uuid";
class RelationshipStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async create(params) {
    return this.ctx.withRetry(async () => {
      const id = v43();
      const saveParams = {
        id,
        sourceEntityId: params.sourceEntityId,
        targetEntityId: params.targetEntityId,
        agentId: this.ctx.agentId,
        tags: params.tags || [],
        metadata: params.metadata || {}
      };
      try {
        await this.db.insert(relationshipTable).values(saveParams);
        return true;
      } catch (error) {
        logger6.error({
          src: "plugin:sql",
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error),
          saveParams
        }, "Error creating relationship");
        return false;
      }
    }, "RelationshipStore.create");
  }
  async update(relationship) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.update(relationshipTable).set({
          tags: relationship.tags || [],
          metadata: relationship.metadata || {}
        }).where(eq(relationshipTable.id, relationship.id));
      } catch (error) {
        logger6.error({
          src: "plugin:sql",
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error),
          relationshipId: relationship.id
        }, "Error updating relationship");
        throw error;
      }
    }, "RelationshipStore.update");
  }
  async get(params) {
    return this.ctx.withRetry(async () => {
      const { sourceEntityId, targetEntityId } = params;
      const result = await this.db.select().from(relationshipTable).where(and(eq(relationshipTable.sourceEntityId, sourceEntityId), eq(relationshipTable.targetEntityId, targetEntityId)));
      if (result.length === 0)
        return null;
      const relationship = result[0];
      return {
        ...relationship,
        id: relationship.id,
        sourceEntityId: relationship.sourceEntityId,
        targetEntityId: relationship.targetEntityId,
        agentId: relationship.agentId,
        tags: relationship.tags ?? [],
        metadata: relationship.metadata ?? {},
        createdAt: relationship.createdAt.toISOString()
      };
    }, "RelationshipStore.get");
  }
  async getAll(params) {
    return this.ctx.withRetry(async () => {
      const { entityId, tags } = params;
      let query;
      if (tags && tags.length > 0) {
        query = sql`
          SELECT * FROM ${relationshipTable}
          WHERE (${relationshipTable.sourceEntityId} = ${entityId} OR ${relationshipTable.targetEntityId} = ${entityId})
          AND ${relationshipTable.tags} && CAST(ARRAY[${sql.join(tags, sql`, `)}] AS text[])
        `;
      } else {
        query = sql`
          SELECT * FROM ${relationshipTable}
          WHERE ${relationshipTable.sourceEntityId} = ${entityId} OR ${relationshipTable.targetEntityId} = ${entityId}
        `;
      }
      const result = await this.db.execute(query);
      return result.rows.map((relationship) => ({
        ...relationship,
        id: relationship.id,
        sourceEntityId: relationship.source_entity_id || relationship.sourceEntityId,
        targetEntityId: relationship.target_entity_id || relationship.targetEntityId,
        agentId: relationship.agent_id || relationship.agentId,
        tags: Array.isArray(relationship.tags) ? relationship.tags : [],
        metadata: relationship.metadata ?? {},
        createdAt: relationship.created_at || relationship.createdAt ? (relationship.created_at || relationship.createdAt) instanceof Date ? (relationship.created_at || relationship.createdAt).toISOString() : new Date(relationship.created_at || relationship.createdAt).toISOString() : new Date().toISOString()
      }));
    }, "RelationshipStore.getAll");
  }
}

// src/stores/cache.store.ts
init_drizzle_orm();
import { logger as logger7 } from "@elizaos/core";
class CacheStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async get(key) {
    return this.ctx.withRetry(async () => {
      try {
        const result = await this.db.select({ value: cacheTable.value }).from(cacheTable).where(and(eq(cacheTable.agentId, this.ctx.agentId), eq(cacheTable.key, key))).limit(1);
        if (result && result.length > 0 && result[0]) {
          return result[0].value;
        }
        return;
      } catch (error) {
        logger7.error({
          src: "plugin:sql",
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error),
          key
        }, "Error fetching cache");
        return;
      }
    }, "CacheStore.get");
  }
  async set(key, value) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.insert(cacheTable).values({
          key,
          agentId: this.ctx.agentId,
          value
        }).onConflictDoUpdate({
          target: [cacheTable.key, cacheTable.agentId],
          set: { value }
        });
        return true;
      } catch (error) {
        logger7.error({
          src: "plugin:sql",
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error),
          key
        }, "Error setting cache");
        return false;
      }
    }, "CacheStore.set");
  }
  async delete(key) {
    return this.ctx.withRetry(async () => {
      try {
        await this.db.transaction(async (tx) => {
          await tx.delete(cacheTable).where(and(eq(cacheTable.agentId, this.ctx.agentId), eq(cacheTable.key, key)));
        });
        return true;
      } catch (error) {
        logger7.error({
          src: "plugin:sql",
          agentId: this.ctx.agentId,
          error: error instanceof Error ? error.message : String(error),
          key
        }, "Error deleting cache");
        return false;
      }
    }, "CacheStore.delete");
  }
}

// src/stores/world.store.ts
init_drizzle_orm();
import { v4 as v44 } from "uuid";
class WorldStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async create(world) {
    return this.ctx.withRetry(async () => {
      const newWorldId = world.id || v44();
      await this.db.insert(worldTable).values({
        ...world,
        id: newWorldId,
        name: world.name || ""
      }).onConflictDoNothing();
      return newWorldId;
    }, "WorldStore.create");
  }
  async get(id) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(worldTable).where(eq(worldTable.id, id));
      return result.length > 0 ? result[0] : null;
    }, "WorldStore.get");
  }
  async getAll() {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(worldTable).where(eq(worldTable.agentId, this.ctx.agentId));
      return result;
    }, "WorldStore.getAll");
  }
  async update(world) {
    return this.ctx.withRetry(async () => {
      await this.db.update(worldTable).set(world).where(eq(worldTable.id, world.id));
    }, "WorldStore.update");
  }
  async remove(id) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(worldTable).where(eq(worldTable.id, id));
    }, "WorldStore.remove");
  }
}

// src/stores/task.store.ts
init_drizzle_orm();
class TaskStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async create(task) {
    if (!task.worldId)
      throw new Error("worldId is required");
    return this.ctx.withRetry(async () => {
      const now = new Date;
      const metadata = task.metadata || {};
      const values = {
        id: task.id,
        name: task.name,
        description: task.description,
        roomId: task.roomId,
        worldId: task.worldId,
        tags: task.tags,
        metadata,
        createdAt: now,
        updatedAt: now,
        agentId: this.ctx.agentId
      };
      const result = await this.db.insert(taskTable).values(values).returning();
      return result[0].id;
    }, "TaskStore.create");
  }
  async getAll(params) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(taskTable).where(and(eq(taskTable.agentId, this.ctx.agentId), ...params.roomId ? [eq(taskTable.roomId, params.roomId)] : [], ...params.tags && params.tags.length > 0 ? [
        sql`${taskTable.tags} @> ARRAY[${sql.join(params.tags.map((t) => sql`${t}`), sql`, `)}]::text[]`
      ] : []));
      return result.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        roomId: row.roomId,
        worldId: row.worldId,
        tags: row.tags || [],
        metadata: row.metadata
      }));
    }, "TaskStore.getAll");
  }
  async getByName(name) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(taskTable).where(and(eq(taskTable.name, name), eq(taskTable.agentId, this.ctx.agentId)));
      return result.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        roomId: row.roomId,
        worldId: row.worldId,
        tags: row.tags || [],
        metadata: row.metadata || {}
      }));
    }, "TaskStore.getByName");
  }
  async get(id) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(taskTable).where(and(eq(taskTable.id, id), eq(taskTable.agentId, this.ctx.agentId))).limit(1);
      if (result.length === 0)
        return null;
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        roomId: row.roomId,
        worldId: row.worldId,
        tags: row.tags || [],
        metadata: row.metadata || {}
      };
    }, "TaskStore.get");
  }
  async update(id, task) {
    return this.ctx.withRetry(async () => {
      const updateValues = {};
      if (task.name !== undefined)
        updateValues.name = task.name;
      if (task.description !== undefined)
        updateValues.description = task.description;
      if (task.roomId !== undefined)
        updateValues.roomId = task.roomId;
      if (task.worldId !== undefined)
        updateValues.worldId = task.worldId;
      if (task.tags !== undefined)
        updateValues.tags = task.tags;
      const dbUpdateValues = {
        ...updateValues,
        updatedAt: new Date
      };
      if (task.metadata !== undefined) {
        dbUpdateValues.metadata = task.metadata;
      }
      await this.db.update(taskTable).set(dbUpdateValues).where(and(eq(taskTable.id, id), eq(taskTable.agentId, this.ctx.agentId)));
    }, "TaskStore.update");
  }
  async delete(id) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(taskTable).where(and(eq(taskTable.id, id), eq(taskTable.agentId, this.ctx.agentId)));
    }, "TaskStore.delete");
  }
}

// src/stores/log.store.ts
init_drizzle_orm();
import { logger as logger8 } from "@elizaos/core";
class LogStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  async create(params) {
    try {
      const sanitizedBody = sanitizeJsonObject(params.body);
      const jsonString = JSON.stringify(sanitizedBody);
      await this.ctx.withIsolationContext(params.entityId, async (tx) => {
        await tx.insert(logTable).values({
          body: sql`${jsonString}::jsonb`,
          entityId: params.entityId,
          roomId: params.roomId,
          type: params.type
        });
      });
    } catch (error) {
      logger8.error({
        src: "plugin:sql",
        type: params.type,
        roomId: params.roomId,
        entityId: params.entityId,
        error: error instanceof Error ? error.message : String(error)
      }, "Failed to create log entry");
      throw error;
    }
  }
  async getMany(params) {
    const { entityId, roomId, type, count: count2, offset } = params;
    return this.ctx.withIsolationContext(entityId ?? null, async (tx) => {
      const result = await tx.select().from(logTable).where(and(roomId ? eq(logTable.roomId, roomId) : undefined, type ? eq(logTable.type, type) : undefined)).orderBy(desc(logTable.createdAt)).limit(count2 ?? 10).offset(offset ?? 0);
      return result.map((log) => ({
        ...log,
        id: log.id,
        entityId: log.entityId,
        roomId: log.roomId,
        type: log.type,
        body: log.body,
        createdAt: new Date(log.createdAt)
      }));
    });
  }
  async getAgentRunSummaries(agentId, params = {}) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const fromDate = typeof params.from === "number" ? new Date(params.from) : undefined;
    const toDate = typeof params.to === "number" ? new Date(params.to) : undefined;
    return this.ctx.withIsolationContext(params.entityId ?? null, async (tx) => {
      const runMap = new Map;
      const conditions2 = [
        eq(logTable.type, "run_event"),
        sql`${logTable.body} ? 'runId'`,
        eq(roomTable.agentId, agentId)
      ];
      if (params.roomId) {
        conditions2.push(eq(logTable.roomId, params.roomId));
      }
      if (fromDate) {
        conditions2.push(gte(logTable.createdAt, fromDate));
      }
      if (toDate) {
        conditions2.push(lte(logTable.createdAt, toDate));
      }
      const whereClause = and(...conditions2);
      const eventLimit = Math.max(limit * 20, 200);
      const runEventRows = await tx.select({
        runId: sql`(${logTable.body} ->> 'runId')`,
        status: sql`(${logTable.body} ->> 'status')`,
        messageId: sql`(${logTable.body} ->> 'messageId')`,
        rawBody: logTable.body,
        createdAt: logTable.createdAt,
        roomId: logTable.roomId,
        entityId: logTable.entityId
      }).from(logTable).innerJoin(roomTable, eq(roomTable.id, logTable.roomId)).where(whereClause).orderBy(desc(logTable.createdAt)).limit(eventLimit);
      for (const row of runEventRows) {
        const runId = row.runId;
        if (!runId)
          continue;
        const summary = runMap.get(runId) ?? {
          runId,
          status: "started",
          startedAt: null,
          endedAt: null,
          durationMs: null,
          messageId: undefined,
          roomId: undefined,
          entityId: undefined,
          metadata: {}
        };
        if (!summary.messageId && row.messageId) {
          summary.messageId = row.messageId;
        }
        if (!summary.roomId && row.roomId) {
          summary.roomId = row.roomId;
        }
        if (!summary.entityId && row.entityId) {
          summary.entityId = row.entityId;
        }
        const body = row.rawBody;
        if (body && typeof body === "object") {
          if (!summary.roomId && typeof body.roomId === "string") {
            summary.roomId = body.roomId;
          }
          if (!summary.entityId && typeof body.entityId === "string") {
            summary.entityId = body.entityId;
          }
          if (!summary.messageId && typeof body.messageId === "string") {
            summary.messageId = body.messageId;
          }
          if (!summary.metadata || Object.keys(summary.metadata).length === 0) {
            const metadata = body.metadata ?? undefined;
            summary.metadata = metadata ? { ...metadata } : {};
          }
        }
        const createdAt = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
        const timestamp3 = createdAt.getTime();
        const eventStatus = row.status ?? body?.status;
        if (eventStatus === "started") {
          summary.startedAt = summary.startedAt === null ? timestamp3 : Math.min(summary.startedAt, timestamp3);
        } else if (eventStatus === "completed" || eventStatus === "timeout" || eventStatus === "error") {
          summary.status = eventStatus;
          summary.endedAt = timestamp3;
          if (summary.startedAt !== null) {
            summary.durationMs = Math.max(timestamp3 - summary.startedAt, 0);
          }
        }
        runMap.set(runId, summary);
      }
      let runs = Array.from(runMap.values());
      if (params.status && params.status !== "all") {
        runs = runs.filter((run) => run.status === params.status);
      }
      runs.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));
      const total = runs.length;
      const limitedRuns = runs.slice(0, limit);
      const hasMore = total > limit;
      const runCounts = new Map;
      for (const run of limitedRuns) {
        runCounts.set(run.runId, { actions: 0, modelCalls: 0, errors: 0, evaluators: 0 });
      }
      const runIds = limitedRuns.map((run) => run.runId).filter(Boolean);
      if (runIds.length > 0) {
        const db2 = this.ctx.getDb();
        const runIdArray = sql`array[${sql.join(runIds.map((id) => sql`${id}`), sql`, `)}]::text[]`;
        const actionSummary = await db2.execute(sql`
          SELECT
            body->>'runId' as "runId",
            COUNT(*)::int as "actions",
            SUM(CASE WHEN COALESCE(body->'result'->>'success', 'true') = 'false' THEN 1 ELSE 0 END)::int as "errors",
            SUM(COALESCE((body->>'promptCount')::int, 0))::int as "modelCalls"
          FROM ${logTable}
          WHERE type = 'action'
            AND body->>'runId' = ANY(${runIdArray})
          GROUP BY body->>'runId'
        `);
        const actionRows = actionSummary.rows ?? [];
        for (const row of actionRows) {
          const counts = runCounts.get(row.runId);
          if (!counts)
            continue;
          counts.actions += Number(row.actions ?? 0);
          counts.errors += Number(row.errors ?? 0);
          counts.modelCalls += Number(row.modelCalls ?? 0);
        }
        const evaluatorSummary = await db2.execute(sql`
          SELECT
            body->>'runId' as "runId",
            COUNT(*)::int as "evaluators"
          FROM ${logTable}
          WHERE type = 'evaluator'
            AND body->>'runId' = ANY(${runIdArray})
          GROUP BY body->>'runId'
        `);
        const evaluatorRows = evaluatorSummary.rows ?? [];
        for (const row of evaluatorRows) {
          const counts = runCounts.get(row.runId);
          if (!counts)
            continue;
          counts.evaluators += Number(row.evaluators ?? 0);
        }
        const genericSummary = await db2.execute(sql`
          SELECT
            body->>'runId' as "runId",
            COUNT(*) FILTER (WHERE type LIKE 'useModel:%')::int as "modelLogs",
            COUNT(*) FILTER (WHERE type = 'embedding_event' AND body->>'status' = 'failed')::int as "embeddingErrors"
          FROM ${logTable}
          WHERE (type LIKE 'useModel:%' OR type = 'embedding_event')
            AND body->>'runId' = ANY(${runIdArray})
          GROUP BY body->>'runId'
        `);
        const genericRows = genericSummary.rows ?? [];
        for (const row of genericRows) {
          const counts = runCounts.get(row.runId);
          if (!counts)
            continue;
          counts.modelCalls += Number(row.modelLogs ?? 0);
          counts.errors += Number(row.embeddingErrors ?? 0);
        }
      }
      for (const run of limitedRuns) {
        run.counts = runCounts.get(run.runId) ?? {
          actions: 0,
          modelCalls: 0,
          errors: 0,
          evaluators: 0
        };
      }
      return {
        runs: limitedRuns,
        total,
        hasMore
      };
    });
  }
  async delete(logId) {
    return this.ctx.withRetry(async () => {
      await this.ctx.getDb().delete(logTable).where(eq(logTable.id, logId));
    }, "LogStore.delete");
  }
}

// src/stores/messaging.store.ts
init_drizzle_orm();
import { ChannelType } from "@elizaos/core";
import { v4 as v45 } from "uuid";
class MessagingStore {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  get db() {
    return this.ctx.getDb();
  }
  async createMessageServer(data) {
    return this.ctx.withRetry(async () => {
      const newId = data.id || v45();
      const now = new Date;
      const serverToInsert = {
        id: newId,
        name: data.name,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        metadata: data.metadata,
        createdAt: now,
        updatedAt: now
      };
      await this.db.insert(messageServerTable).values(serverToInsert).onConflictDoNothing();
      if (data.id) {
        const existing = await this.db.select().from(messageServerTable).where(eq(messageServerTable.id, data.id)).limit(1);
        if (existing.length > 0) {
          return {
            id: existing[0].id,
            name: existing[0].name,
            sourceType: existing[0].sourceType,
            sourceId: existing[0].sourceId || undefined,
            metadata: existing[0].metadata || undefined,
            createdAt: existing[0].createdAt,
            updatedAt: existing[0].updatedAt
          };
        }
      }
      return serverToInsert;
    }, "MessagingStore.createMessageServer");
  }
  async getMessageServers() {
    const result = await this.ctx.withRetry(async () => {
      const results = await this.db.select().from(messageServerTable);
      return results.map((r) => ({
        id: r.id,
        name: r.name,
        sourceType: r.sourceType,
        sourceId: r.sourceId || undefined,
        metadata: r.metadata || undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
    }, "MessagingStore.getMessageServers");
    return result || [];
  }
  async getMessageServerById(serverId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.select().from(messageServerTable).where(eq(messageServerTable.id, serverId)).limit(1);
      return results.length > 0 ? {
        id: results[0].id,
        name: results[0].name,
        sourceType: results[0].sourceType,
        sourceId: results[0].sourceId || undefined,
        metadata: results[0].metadata || undefined,
        createdAt: results[0].createdAt,
        updatedAt: results[0].updatedAt
      } : null;
    }, "MessagingStore.getMessageServerById");
  }
  async getMessageServerByRlsServerId(rlsServerId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.execute(sql`
        SELECT id, name, source_type, source_id, metadata, created_at, updated_at
        FROM message_servers
        WHERE server_id = ${rlsServerId}
        LIMIT 1
      `);
      const rows = results.rows || results;
      if (rows.length === 0)
        return null;
      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        sourceType: row.source_type,
        sourceId: row.source_id || undefined,
        metadata: row.metadata || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    }, "MessagingStore.getMessageServerByRlsServerId");
  }
  async addAgentToMessageServer(messageServerId, agentId) {
    return this.ctx.withRetry(async () => {
      await this.db.insert(messageServerAgentsTable).values({
        messageServerId,
        agentId
      }).onConflictDoNothing();
    }, "MessagingStore.addAgentToMessageServer");
  }
  async getAgentsForMessageServer(messageServerId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.select({ agentId: messageServerAgentsTable.agentId }).from(messageServerAgentsTable).where(eq(messageServerAgentsTable.messageServerId, messageServerId));
      return results.map((r) => r.agentId);
    }, "MessagingStore.getAgentsForMessageServer");
  }
  async removeAgentFromMessageServer(messageServerId, agentId) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(messageServerAgentsTable).where(and(eq(messageServerAgentsTable.messageServerId, messageServerId), eq(messageServerAgentsTable.agentId, agentId)));
    }, "MessagingStore.removeAgentFromMessageServer");
  }
  async createChannel(data, participantIds) {
    return this.ctx.withRetry(async () => {
      const newId = data.id || v45();
      const now = new Date;
      const channelToInsert = {
        id: newId,
        messageServerId: data.messageServerId,
        name: data.name,
        type: data.type,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        topic: data.topic,
        metadata: data.metadata,
        createdAt: now,
        updatedAt: now
      };
      await this.db.insert(channelTable).values(channelToInsert).onConflictDoNothing();
      if (participantIds && participantIds.length > 0) {
        const participantValues = participantIds.map((entityId) => ({
          channelId: newId,
          entityId
        }));
        await this.db.insert(channelParticipantsTable).values(participantValues).onConflictDoNothing();
      }
      return channelToInsert;
    }, "MessagingStore.createChannel");
  }
  async getChannelsForMessageServer(messageServerId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.select().from(channelTable).where(eq(channelTable.messageServerId, messageServerId));
      return results.map((r) => ({
        id: r.id,
        messageServerId: r.messageServerId,
        name: r.name,
        type: r.type,
        sourceType: r.sourceType || undefined,
        sourceId: r.sourceId || undefined,
        topic: r.topic || undefined,
        metadata: r.metadata || undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
    }, "MessagingStore.getChannelsForMessageServer");
  }
  async getChannelDetails(channelId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.select().from(channelTable).where(eq(channelTable.id, channelId)).limit(1);
      return results.length > 0 ? {
        id: results[0].id,
        messageServerId: results[0].messageServerId,
        name: results[0].name,
        type: results[0].type,
        sourceType: results[0].sourceType || undefined,
        sourceId: results[0].sourceId || undefined,
        topic: results[0].topic || undefined,
        metadata: results[0].metadata || undefined,
        createdAt: results[0].createdAt,
        updatedAt: results[0].updatedAt
      } : null;
    }, "MessagingStore.getChannelDetails");
  }
  async updateChannel(channelId, updates) {
    return this.ctx.withRetry(async () => {
      const now = new Date;
      await this.db.transaction(async (tx) => {
        const updateData = { updatedAt: now };
        if (updates.name !== undefined)
          updateData.name = updates.name;
        if (updates.metadata !== undefined)
          updateData.metadata = updates.metadata;
        await tx.update(channelTable).set(updateData).where(eq(channelTable.id, channelId));
        if (updates.participantCentralUserIds !== undefined) {
          await tx.delete(channelParticipantsTable).where(eq(channelParticipantsTable.channelId, channelId));
          if (updates.participantCentralUserIds.length > 0) {
            const participantValues = updates.participantCentralUserIds.map((entityId) => ({
              channelId,
              entityId
            }));
            await tx.insert(channelParticipantsTable).values(participantValues).onConflictDoNothing();
          }
        }
      });
      const updatedChannel = await this.getChannelDetails(channelId);
      if (!updatedChannel) {
        throw new Error(`Channel ${channelId} not found after update`);
      }
      return updatedChannel;
    }, "MessagingStore.updateChannel");
  }
  async deleteChannel(channelId) {
    return this.ctx.withRetry(async () => {
      await this.db.transaction(async (tx) => {
        await tx.delete(messageTable).where(eq(messageTable.channelId, channelId));
        await tx.delete(channelParticipantsTable).where(eq(channelParticipantsTable.channelId, channelId));
        await tx.delete(channelTable).where(eq(channelTable.id, channelId));
      });
    }, "MessagingStore.deleteChannel");
  }
  async findOrCreateDmChannel(user1Id, user2Id, messageServerId) {
    return this.ctx.withRetry(async () => {
      const ids = [user1Id, user2Id].sort();
      const dmChannelName = `DM-${ids[0]}-${ids[1]}`;
      const existingChannels = await this.db.select().from(channelTable).where(and(eq(channelTable.type, ChannelType.DM), eq(channelTable.name, dmChannelName), eq(channelTable.messageServerId, messageServerId))).limit(1);
      if (existingChannels.length > 0) {
        return {
          id: existingChannels[0].id,
          messageServerId: existingChannels[0].messageServerId,
          name: existingChannels[0].name,
          type: existingChannels[0].type,
          sourceType: existingChannels[0].sourceType || undefined,
          sourceId: existingChannels[0].sourceId || undefined,
          topic: existingChannels[0].topic || undefined,
          metadata: existingChannels[0].metadata || undefined,
          createdAt: existingChannels[0].createdAt,
          updatedAt: existingChannels[0].updatedAt
        };
      }
      return this.createChannel({
        messageServerId,
        name: dmChannelName,
        type: ChannelType.DM,
        metadata: { user1: ids[0], user2: ids[1] }
      }, ids);
    }, "MessagingStore.findOrCreateDmChannel");
  }
  async addChannelParticipants(channelId, entityIds) {
    return this.ctx.withRetry(async () => {
      if (!entityIds || entityIds.length === 0)
        return;
      const participantValues = entityIds.map((entityId) => ({
        channelId,
        entityId
      }));
      await this.db.insert(channelParticipantsTable).values(participantValues).onConflictDoNothing();
    }, "MessagingStore.addChannelParticipants");
  }
  async getChannelParticipants(channelId) {
    return this.ctx.withRetry(async () => {
      const results = await this.db.select({ entityId: channelParticipantsTable.entityId }).from(channelParticipantsTable).where(eq(channelParticipantsTable.channelId, channelId));
      return results.map((r) => r.entityId);
    }, "MessagingStore.getChannelParticipants");
  }
  async isChannelParticipant(channelId, entityId) {
    return this.ctx.withRetry(async () => {
      const result = await this.db.select().from(channelParticipantsTable).where(and(eq(channelParticipantsTable.channelId, channelId), eq(channelParticipantsTable.entityId, entityId))).limit(1);
      return result.length > 0;
    }, "MessagingStore.isChannelParticipant");
  }
  async createMessage(data) {
    return this.ctx.withRetry(async () => {
      const newId = data.messageId || v45();
      const now = new Date;
      const messageToInsert = {
        id: newId,
        channelId: data.channelId,
        authorId: data.authorId,
        content: data.content,
        rawMessage: data.rawMessage,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        metadata: data.metadata,
        inReplyToRootMessageId: data.inReplyToRootMessageId,
        createdAt: now,
        updatedAt: now
      };
      await this.db.insert(messageTable).values(messageToInsert);
      return messageToInsert;
    }, "MessagingStore.createMessage");
  }
  async getMessageById(id) {
    return this.ctx.withRetry(async () => {
      const rows = await this.db.select().from(messageTable).where(eq(messageTable.id, id)).limit(1);
      if (!rows || rows.length === 0)
        return null;
      const r = rows[0];
      return {
        id: r.id,
        channelId: r.channelId,
        authorId: r.authorId,
        content: r.content,
        rawMessage: r.rawMessage || undefined,
        sourceType: r.sourceType || undefined,
        sourceId: r.sourceId || undefined,
        metadata: r.metadata || undefined,
        inReplyToRootMessageId: r.inReplyToRootMessageId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    }, "MessagingStore.getMessageById");
  }
  async updateMessage(id, patch) {
    return this.ctx.withRetry(async () => {
      const existing = await this.getMessageById(id);
      if (!existing)
        return null;
      const updatedAt = new Date;
      const next = {
        content: patch.content ?? existing.content,
        rawMessage: patch.rawMessage ?? existing.rawMessage,
        sourceType: patch.sourceType ?? existing.sourceType,
        sourceId: patch.sourceId ?? existing.sourceId,
        metadata: patch.metadata ?? existing.metadata,
        inReplyToRootMessageId: patch.inReplyToRootMessageId ?? existing.inReplyToRootMessageId,
        updatedAt
      };
      await this.db.update(messageTable).set(next).where(eq(messageTable.id, id));
      return {
        ...existing,
        ...next
      };
    }, "MessagingStore.updateMessage");
  }
  async getMessagesForChannel(channelId, limit = 50, beforeTimestamp) {
    return this.ctx.withRetry(async () => {
      const conditions2 = [eq(messageTable.channelId, channelId)];
      if (beforeTimestamp) {
        conditions2.push(lt(messageTable.createdAt, beforeTimestamp));
      }
      const query = this.db.select().from(messageTable).where(and(...conditions2)).orderBy(desc(messageTable.createdAt)).limit(limit);
      const results = await query;
      return results.map((r) => ({
        id: r.id,
        channelId: r.channelId,
        authorId: r.authorId,
        content: r.content,
        rawMessage: r.rawMessage || undefined,
        sourceType: r.sourceType || undefined,
        sourceId: r.sourceId || undefined,
        metadata: r.metadata || undefined,
        inReplyToRootMessageId: r.inReplyToRootMessageId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
    }, "MessagingStore.getMessagesForChannel");
  }
  async deleteMessage(messageId) {
    return this.ctx.withRetry(async () => {
      await this.db.delete(messageTable).where(eq(messageTable.id, messageId));
    }, "MessagingStore.deleteMessage");
  }
}

// src/base.ts
class BaseDrizzleAdapter extends DatabaseAdapter {
  maxRetries = 3;
  baseDelay = 1000;
  maxDelay = 1e4;
  jitterMax = 1000;
  embeddingDimension = DIMENSION_MAP[384];
  migrationService;
  agentStore;
  memoryStore;
  roomStore;
  participantStore;
  entityStore;
  componentStore;
  relationshipStore;
  cacheStore;
  worldStore;
  taskStore;
  logStore;
  messagingStore;
  async initialize() {
    await this.init();
  }
  async runPluginMigrations(plugins, options) {
    if (!this.migrationService) {
      const { DatabaseMigrationService: DatabaseMigrationService2 } = await Promise.resolve().then(() => (init_migration_service(), exports_migration_service));
      this.migrationService = new DatabaseMigrationService2;
      await this.migrationService.initializeWithDatabase(this.db);
    }
    for (const plugin of plugins) {
      if (plugin.schema) {
        this.migrationService.registerSchema(plugin.name, plugin.schema);
      }
    }
    await this.migrationService.runAllPluginMigrations(options);
  }
  getDatabase() {
    return this.db;
  }
  agentId;
  constructor(agentId) {
    super();
    this.agentId = agentId;
  }
  initStores() {
    const ctx = {
      getDb: () => this.db,
      withRetry: (operation, _context) => this.withRetry(operation),
      withIsolationContext: (entityId, callback) => this.withIsolationContext(entityId, callback),
      agentId: this.agentId,
      getEmbeddingDimension: () => this.embeddingDimension
    };
    this.agentStore = new AgentStore(ctx);
    this.memoryStore = new MemoryStore(ctx);
    this.roomStore = new RoomStore(ctx);
    this.participantStore = new ParticipantStore(ctx);
    this.entityStore = new EntityStore(ctx);
    this.componentStore = new ComponentStore(ctx);
    this.relationshipStore = new RelationshipStore(ctx);
    this.cacheStore = new CacheStore(ctx);
    this.worldStore = new WorldStore(ctx);
    this.taskStore = new TaskStore(ctx);
    this.logStore = new LogStore(ctx);
    this.messagingStore = new MessagingStore(ctx);
  }
  async withRetry(operation) {
    let lastError = new Error("Unknown error");
    for (let attempt = 1;attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const backoffDelay = Math.min(this.baseDelay * 2 ** (attempt - 1), this.maxDelay);
          const jitter = Math.random() * this.jitterMax;
          const delay = backoffDelay + jitter;
          logger17.warn({
            src: "plugin:sql",
            attempt,
            maxRetries: this.maxRetries,
            error: error instanceof Error ? error.message : String(error)
          }, "Database operation failed, retrying");
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          logger17.error({
            src: "plugin:sql",
            totalAttempts: attempt,
            error: error instanceof Error ? error.message : String(error)
          }, "Max retry attempts reached");
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
    }
    throw lastError;
  }
  async ensureEmbeddingDimension(dimension) {
    return this.withDatabase(async () => {
      const existingMemory = await this.db.select().from(memoryTable).innerJoin(embeddingTable, eq(embeddingTable.memoryId, memoryTable.id)).where(eq(memoryTable.agentId, this.agentId)).limit(1);
      if (existingMemory.length > 0) {
        const joinedResult = existingMemory[0];
        Object.entries(DIMENSION_MAP).find(([_, colName]) => {
          const embeddingCol = colName;
          return joinedResult.embeddings[embeddingCol] !== null;
        });
      }
      this.embeddingDimension = DIMENSION_MAP[dimension];
    });
  }
  async getAgent(agentId) {
    return this.withDatabase(() => this.agentStore.get(agentId));
  }
  async getAgents() {
    return this.withDatabase(() => this.agentStore.getAll());
  }
  async createAgent(agent) {
    return this.withDatabase(() => this.agentStore.create(agent));
  }
  async updateAgent(agentId, agent) {
    return this.withDatabase(() => this.agentStore.update(agentId, agent));
  }
  async deleteAgent(agentId) {
    return this.withDatabase(() => this.agentStore.delete(agentId));
  }
  async countAgents() {
    return this.withDatabase(() => this.agentStore.count());
  }
  async cleanupAgents() {
    return this.withDatabase(() => this.agentStore.deleteAll());
  }
  async getEntitiesByIds(entityIds) {
    return this.withDatabase(() => this.entityStore.getByIds(entityIds));
  }
  async getEntitiesForRoom(roomId, includeComponents) {
    return this.withDatabase(() => this.entityStore.getForRoom(roomId, includeComponents));
  }
  async createEntities(entities) {
    return this.withDatabase(() => this.entityStore.create(entities));
  }
  async ensureEntityExists(entity2) {
    return this.entityStore.ensureExists(entity2);
  }
  async updateEntity(entity2) {
    return this.withDatabase(() => this.entityStore.update(entity2));
  }
  async deleteEntity(entityId) {
    return this.withDatabase(() => this.entityStore.delete(entityId));
  }
  async getEntitiesByNames(params) {
    return this.withDatabase(() => this.entityStore.getByNames(params));
  }
  async searchEntitiesByName(params) {
    return this.withDatabase(() => this.entityStore.searchByName(params));
  }
  async getComponent(entityId, type, worldId, sourceEntityId) {
    return this.withDatabase(() => this.componentStore.get(entityId, type, worldId, sourceEntityId));
  }
  async getComponents(entityId, worldId, sourceEntityId) {
    return this.withDatabase(() => this.componentStore.getAll(entityId, worldId, sourceEntityId));
  }
  async createComponent(component) {
    return this.withDatabase(() => this.componentStore.create(component));
  }
  async updateComponent(component) {
    return this.withDatabase(() => this.componentStore.update(component));
  }
  async deleteComponent(componentId) {
    return this.withDatabase(() => this.componentStore.delete(componentId));
  }
  async getMemories(params) {
    return this.withDatabase(() => this.memoryStore.get(params));
  }
  async getMemoriesByRoomIds(params) {
    return this.withDatabase(() => this.memoryStore.getByRoomIds(params));
  }
  async getMemoryById(id) {
    return this.withDatabase(() => this.memoryStore.getById(id));
  }
  async getMemoriesByIds(memoryIds, tableName) {
    return this.withDatabase(() => this.memoryStore.getByIds(memoryIds, tableName));
  }
  async getCachedEmbeddings(opts) {
    return this.withDatabase(async () => {
      try {
        const results = await this.db.execute(sql`
                    WITH content_text AS (
                        SELECT
                            m.id,
                            COALESCE(
                                m.content->>${opts.query_field_sub_name},
                                ''
                            ) as content_text
                        FROM memories m
                        WHERE m.type = ${opts.query_table_name}
                            AND m.content->>${opts.query_field_sub_name} IS NOT NULL
                    ),
                    embedded_text AS (
                        SELECT
                            ct.content_text,
                            COALESCE(
                                e.dim_384,
                                e.dim_512,
                                e.dim_768,
                                e.dim_1024,
                                e.dim_1536,
                                e.dim_3072
                            ) as embedding
                        FROM content_text ct
                        LEFT JOIN embeddings e ON e.memory_id = ct.id
                        WHERE e.memory_id IS NOT NULL
                    )
                    SELECT
                        embedding,
                        levenshtein(${opts.query_input}, content_text) as levenshtein_score
                    FROM embedded_text
                    WHERE levenshtein(${opts.query_input}, content_text) <= ${opts.query_threshold}
                    ORDER BY levenshtein_score
                    LIMIT ${opts.query_match_count}
                `);
        return results.rows.map((row) => ({
          embedding: Array.isArray(row.embedding) ? row.embedding : typeof row.embedding === "string" ? JSON.parse(row.embedding) : [],
          levenshtein_score: Number(row.levenshtein_score)
        })).filter((row) => Array.isArray(row.embedding));
      } catch (error) {
        logger17.error({
          src: "plugin:sql",
          tableName: opts.query_table_name,
          fieldName: opts.query_field_name,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to get cached embeddings");
        if (error instanceof Error && error.message === "levenshtein argument exceeds maximum length of 255 characters") {
          return [];
        }
        throw error;
      }
    });
  }
  async log(params) {
    return this.withDatabase(async () => {
      try {
        const sanitizedBody = sanitizeJsonObject(params.body);
        const jsonString = JSON.stringify(sanitizedBody);
        await this.withIsolationContext(params.entityId, async (tx) => {
          await tx.insert(logTable).values({
            body: sql`${jsonString}::jsonb`,
            entityId: params.entityId,
            roomId: params.roomId,
            type: params.type
          });
        });
      } catch (error) {
        logger17.error({
          src: "plugin:sql",
          type: params.type,
          roomId: params.roomId,
          entityId: params.entityId,
          error: error instanceof Error ? error.message : String(error)
        }, "Failed to create log entry");
        throw error;
      }
    });
  }
  async getLogs(params) {
    return this.logStore.getMany(params);
  }
  async getAgentRunSummaries(params = {}) {
    return this.logStore.getAgentRunSummaries(this.agentId, params);
  }
  async deleteLog(logId) {
    return this.withDatabase(() => this.logStore.delete(logId));
  }
  async searchMemories(params) {
    return await this.searchMemoriesByEmbedding(params.embedding, {
      match_threshold: params.match_threshold,
      count: params.count,
      roomId: params.roomId,
      worldId: params.worldId,
      entityId: params.entityId,
      unique: params.unique,
      tableName: params.tableName
    });
  }
  async searchMemoriesByEmbedding(embedding, params) {
    return this.withDatabase(() => this.memoryStore.searchByEmbedding(embedding, params));
  }
  async createMemory(memory, tableName) {
    return this.withDatabase(() => this.memoryStore.create(memory, tableName));
  }
  async updateMemory(memory) {
    return this.withDatabase(() => this.memoryStore.update(memory));
  }
  async deleteMemory(memoryId) {
    return this.withDatabase(() => this.memoryStore.delete(memoryId));
  }
  async deleteManyMemories(memoryIds) {
    return this.withDatabase(() => this.memoryStore.deleteMany(memoryIds));
  }
  async deleteAllMemories(roomId, tableName) {
    return this.withDatabase(() => this.memoryStore.deleteAllByRoom(roomId, tableName));
  }
  async countMemories(roomId, unique2 = true, tableName = "") {
    return this.withDatabase(() => this.memoryStore.count(roomId, unique2, tableName));
  }
  async getRoomsByIds(roomIds) {
    return this.withDatabase(() => this.roomStore.getByIds(roomIds));
  }
  async getRoomsByWorld(worldId) {
    return this.withDatabase(() => this.roomStore.getByWorld(worldId));
  }
  async updateRoom(room) {
    return this.withDatabase(() => this.roomStore.update(room));
  }
  async createRooms(rooms) {
    return this.withDatabase(() => this.roomStore.create(rooms));
  }
  async deleteRoom(roomId) {
    return this.withDatabase(() => this.roomStore.delete(roomId));
  }
  async getRoomsForParticipant(entityId) {
    return this.withDatabase(() => this.participantStore.getRoomsForEntity(entityId));
  }
  async getRoomsForParticipants(entityIds) {
    return this.withDatabase(() => this.participantStore.getRoomsForEntities(entityIds));
  }
  async addParticipant(entityId, roomId) {
    return this.withDatabase(() => this.participantStore.add(entityId, roomId));
  }
  async addParticipantsRoom(entityIds, roomId) {
    return this.withDatabase(() => this.participantStore.addMany(entityIds, roomId));
  }
  async removeParticipant(entityId, roomId) {
    return this.withDatabase(() => this.participantStore.remove(entityId, roomId));
  }
  async getParticipantsForEntity(entityId) {
    return this.withDatabase(async () => {
      const result = await this.participantStore.getByEntity(entityId);
      const entities = await this.getEntitiesByIds([entityId]);
      if (!entities || !entities.length) {
        return [];
      }
      return result.map((row) => ({
        id: row.id,
        entity: entities[0]
      }));
    });
  }
  async getParticipantsForRoom(roomId) {
    return this.withDatabase(() => this.participantStore.getForRoom(roomId));
  }
  async isRoomParticipant(roomId, entityId) {
    return this.withDatabase(() => this.participantStore.isParticipant(roomId, entityId));
  }
  async getParticipantUserState(roomId, entityId) {
    return this.withDatabase(() => this.participantStore.getUserState(roomId, entityId));
  }
  async setParticipantUserState(roomId, entityId, state) {
    return this.withDatabase(() => this.participantStore.setUserState(roomId, entityId, state));
  }
  async createRelationship(params) {
    return this.withDatabase(() => this.relationshipStore.create(params));
  }
  async updateRelationship(relationship) {
    return this.withDatabase(() => this.relationshipStore.update(relationship));
  }
  async getRelationship(params) {
    return this.withDatabase(() => this.relationshipStore.get(params));
  }
  async getRelationships(params) {
    return this.withDatabase(() => this.relationshipStore.getAll(params));
  }
  async getCache(key) {
    return this.withDatabase(() => this.cacheStore.get(key));
  }
  async setCache(key, value) {
    return this.withDatabase(() => this.cacheStore.set(key, value));
  }
  async deleteCache(key) {
    return this.withDatabase(() => this.cacheStore.delete(key));
  }
  async createWorld(world) {
    return this.withDatabase(() => this.worldStore.create(world));
  }
  async getWorld(id) {
    return this.withDatabase(() => this.worldStore.get(id));
  }
  async getAllWorlds() {
    return this.withDatabase(() => this.worldStore.getAll());
  }
  async updateWorld(world) {
    return this.withDatabase(() => this.worldStore.update(world));
  }
  async removeWorld(id) {
    return this.withDatabase(() => this.worldStore.remove(id));
  }
  async createTask(task) {
    return this.withDatabase(() => this.taskStore.create(task));
  }
  async getTasks(params) {
    return this.withDatabase(() => this.taskStore.getAll(params));
  }
  async getTasksByName(name) {
    return this.withDatabase(() => this.taskStore.getByName(name));
  }
  async getTask(id) {
    return this.withDatabase(() => this.taskStore.get(id));
  }
  async updateTask(id, task) {
    return this.withDatabase(() => this.taskStore.update(id, task));
  }
  async deleteTask(id) {
    return this.withDatabase(() => this.taskStore.delete(id));
  }
  async getMemoriesByWorldId(params) {
    return this.withDatabase(async () => {
      const rooms = await this.db.select({ id: roomTable.id }).from(roomTable).where(and(eq(roomTable.worldId, params.worldId), eq(roomTable.agentId, this.agentId)));
      if (rooms.length === 0) {
        return [];
      }
      const roomIds = rooms.map((room) => room.id);
      const memories = await this.getMemoriesByRoomIds({
        roomIds,
        tableName: params.tableName || "messages",
        limit: params.count
      });
      return memories;
    });
  }
  async deleteRoomsByWorldId(worldId) {
    return this.withDatabase(async () => {
      const rooms = await this.db.select({ id: roomTable.id }).from(roomTable).where(and(eq(roomTable.worldId, worldId), eq(roomTable.agentId, this.agentId)));
      if (rooms.length === 0) {
        return;
      }
      const roomIds = rooms.map((room) => room.id);
      if (roomIds.length > 0) {
        await this.db.delete(logTable).where(inArray(logTable.roomId, roomIds));
        await this.db.delete(participantTable).where(inArray(participantTable.roomId, roomIds));
        const memoriesInRooms = await this.db.select({ id: memoryTable.id }).from(memoryTable).where(inArray(memoryTable.roomId, roomIds));
        const memoryIdsInRooms = memoriesInRooms.map((m) => m.id);
        if (memoryIdsInRooms.length > 0) {
          await this.db.delete(embeddingTable).where(inArray(embeddingTable.memoryId, memoryIdsInRooms));
          await this.db.delete(memoryTable).where(inArray(memoryTable.id, memoryIdsInRooms));
        }
        await this.db.delete(roomTable).where(inArray(roomTable.id, roomIds));
        logger17.debug({
          src: "plugin:sql",
          worldId,
          roomsDeleted: roomIds.length,
          memoriesDeleted: memoryIdsInRooms.length
        }, "World cleanup completed");
      }
    });
  }
  async createMessageServer(data) {
    return this.messagingStore.createMessageServer(data);
  }
  async getMessageServers() {
    return this.messagingStore.getMessageServers();
  }
  async getMessageServerById(serverId) {
    return this.messagingStore.getMessageServerById(serverId);
  }
  async getMessageServerByRlsServerId(rlsServerId) {
    return this.messagingStore.getMessageServerByRlsServerId(rlsServerId);
  }
  async addAgentToMessageServer(messageServerId, agentId) {
    return this.messagingStore.addAgentToMessageServer(messageServerId, agentId);
  }
  async getAgentsForMessageServer(messageServerId) {
    return this.messagingStore.getAgentsForMessageServer(messageServerId);
  }
  async removeAgentFromMessageServer(messageServerId, agentId) {
    return this.messagingStore.removeAgentFromMessageServer(messageServerId, agentId);
  }
  async createChannel(data, participantIds) {
    return this.messagingStore.createChannel(data, participantIds);
  }
  async getChannelsForMessageServer(messageServerId) {
    return this.messagingStore.getChannelsForMessageServer(messageServerId);
  }
  async getChannelDetails(channelId) {
    return this.messagingStore.getChannelDetails(channelId);
  }
  async updateChannel(channelId, updates) {
    return this.messagingStore.updateChannel(channelId, updates);
  }
  async deleteChannel(channelId) {
    return this.messagingStore.deleteChannel(channelId);
  }
  async findOrCreateDmChannel(user1Id, user2Id, messageServerId) {
    return this.messagingStore.findOrCreateDmChannel(user1Id, user2Id, messageServerId);
  }
  async addChannelParticipants(channelId, entityIds) {
    return this.messagingStore.addChannelParticipants(channelId, entityIds);
  }
  async getChannelParticipants(channelId) {
    return this.messagingStore.getChannelParticipants(channelId);
  }
  async isChannelParticipant(channelId, entityId) {
    return this.messagingStore.isChannelParticipant(channelId, entityId);
  }
  async createMessage(data) {
    return this.messagingStore.createMessage(data);
  }
  async getMessageById(id) {
    return this.messagingStore.getMessageById(id);
  }
  async updateMessage(id, patch) {
    return this.messagingStore.updateMessage(id, patch);
  }
  async getMessagesForChannel(channelId, limit = 50, beforeTimestamp) {
    return this.messagingStore.getMessagesForChannel(channelId, limit, beforeTimestamp);
  }
  async deleteMessage(messageId) {
    return this.messagingStore.deleteMessage(messageId);
  }
}

// src/pglite/adapter.ts
class PgliteDatabaseAdapter extends BaseDrizzleAdapter {
  manager;
  embeddingDimension = DIMENSION_MAP[384];
  constructor(agentId, manager) {
    super(agentId);
    this.manager = manager;
    this.db = drizzle(this.manager.getConnection());
    this.initStores();
  }
  async withIsolationContext(_entityId, callback) {
    return callback(this.db);
  }
  async getEntityByIds(entityIds) {
    return this.getEntitiesByIds(entityIds);
  }
  async getMemoriesByServerId(_params) {
    logger18.warn({ src: "plugin:sql" }, "getMemoriesByServerId called but not implemented");
    return [];
  }
  async ensureAgentExists(agent) {
    const existingAgent = await this.getAgent(this.agentId);
    if (existingAgent) {
      return existingAgent;
    }
    const newAgent = {
      id: this.agentId,
      name: agent.name || "Unknown Agent",
      username: agent.username,
      bio: agent.bio || "An AI agent",
      createdAt: agent.createdAt || Date.now(),
      updatedAt: agent.updatedAt || Date.now()
    };
    await this.createAgent(newAgent);
    const createdAgent = await this.getAgent(this.agentId);
    if (!createdAgent) {
      throw new Error("Failed to create agent");
    }
    return createdAgent;
  }
  async withDatabase(operation) {
    if (this.manager.isShuttingDown()) {
      const error = new Error("Database is shutting down - operation rejected");
      logger18.warn({ src: "plugin:sql", error: error.message }, "Database operation rejected during shutdown");
      throw error;
    }
    return operation();
  }
  async init() {
    logger18.debug({ src: "plugin:sql" }, "PGliteDatabaseAdapter initialized");
  }
  async isReady() {
    return !this.manager.isShuttingDown();
  }
  async close() {
    await this.manager.close();
  }
  async getConnection() {
    return this.manager.getConnection();
  }
}

// src/pglite/manager.ts
import { PGlite as PGlite2 } from "@electric-sql/pglite";
import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";
import { vector as vector4 } from "@electric-sql/pglite/vector";

class PGliteClientManager {
  client;
  shuttingDown = false;
  constructor(options) {
    this.client = new PGlite2({
      ...options,
      extensions: {
        vector: vector4,
        fuzzystrmatch
      }
    });
    this.setupShutdownHandlers();
  }
  getConnection() {
    return this.client;
  }
  isShuttingDown() {
    return this.shuttingDown;
  }
  async initialize() {}
  async close() {
    this.shuttingDown = true;
    if (this.client) {
      try {
        await this.client.close();
      } catch {}
    }
  }
  setupShutdownHandlers() {}
}

// src/pg/adapter.ts
import { logger as logger19 } from "@elizaos/core";
class PgDatabaseAdapter extends BaseDrizzleAdapter {
  embeddingDimension = DIMENSION_MAP[384];
  manager;
  constructor(agentId, manager, _schema) {
    super(agentId);
    this.manager = manager;
    this.db = manager.getDatabase();
    this.initStores();
  }
  getManager() {
    return this.manager;
  }
  async withIsolationContext(entityId, callback) {
    return await this.manager.withIsolationContext(entityId, callback);
  }
  async getEntityByIds(entityIds) {
    return this.getEntitiesByIds(entityIds);
  }
  async getMemoriesByServerId(_params) {
    logger19.warn({ src: "plugin:sql" }, "getMemoriesByServerId called but not implemented");
    return [];
  }
  async ensureAgentExists(agent) {
    const existingAgent = await this.getAgent(this.agentId);
    if (existingAgent) {
      return existingAgent;
    }
    const newAgent = {
      id: this.agentId,
      name: agent.name || "Unknown Agent",
      username: agent.username,
      bio: agent.bio || "An AI agent",
      createdAt: agent.createdAt || Date.now(),
      updatedAt: agent.updatedAt || Date.now()
    };
    await this.createAgent(newAgent);
    const createdAgent = await this.getAgent(this.agentId);
    if (!createdAgent) {
      throw new Error("Failed to create agent");
    }
    return createdAgent;
  }
  async withDatabase(operation) {
    return await this.withRetry(async () => {
      return await operation();
    });
  }
  async init() {
    logger19.debug({ src: "plugin:sql" }, "PgDatabaseAdapter initialized");
  }
  async isReady() {
    return this.manager.testConnection();
  }
  async close() {
    await this.manager.close();
  }
  async getConnection() {
    return this.manager.getConnection();
  }
}

// ../../node_modules/drizzle-orm/node-postgres/driver.js
init_entity();
init_logger();
init_db();
init_dialect();
init_relations();
init_utils();
import pg2 from "pg";

// ../../node_modules/drizzle-orm/node-postgres/session.js
import pg from "pg";
init_entity();
init_logger();
init_pg_core();
init_session();
init_sql();
init_tracing();
init_utils();
var { Pool, types: types3 } = pg;

class NodePgPreparedQuery extends PgPreparedQuery {
  constructor(client, queryString, params, logger20, cache, queryMetadata, cacheConfig, fields, name, _isResponseInArrayMode, customResultMapper) {
    super({ sql: queryString, params }, cache, queryMetadata, cacheConfig);
    this.client = client;
    this.queryString = queryString;
    this.params = params;
    this.logger = logger20;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
    this.rawQueryConfig = {
      name,
      text: queryString,
      types: {
        getTypeParser: (typeId, format) => {
          if (typeId === types3.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === types3.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === types3.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === types3.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return types3.getTypeParser(typeId, format);
        }
      }
    };
    this.queryConfig = {
      name,
      text: queryString,
      rowMode: "array",
      types: {
        getTypeParser: (typeId, format) => {
          if (typeId === types3.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === types3.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === types3.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === types3.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return types3.getTypeParser(typeId, format);
        }
      }
    };
  }
  static [entityKind] = "NodePgPreparedQuery";
  rawQueryConfig;
  queryConfig;
  async execute(placeholderValues = {}) {
    return tracer.startActiveSpan("drizzle.execute", async () => {
      const params = fillPlaceholders(this.params, placeholderValues);
      this.logger.logQuery(this.rawQueryConfig.text, params);
      const { fields, rawQueryConfig: rawQuery, client, queryConfig: query, joinsNotNullableMap, customResultMapper } = this;
      if (!fields && !customResultMapper) {
        return tracer.startActiveSpan("drizzle.driver.execute", async (span) => {
          span?.setAttributes({
            "drizzle.query.name": rawQuery.name,
            "drizzle.query.text": rawQuery.text,
            "drizzle.query.params": JSON.stringify(params)
          });
          return this.queryWithCache(rawQuery.text, params, async () => {
            return await client.query(rawQuery, params);
          });
        });
      }
      const result = await tracer.startActiveSpan("drizzle.driver.execute", (span) => {
        span?.setAttributes({
          "drizzle.query.name": query.name,
          "drizzle.query.text": query.text,
          "drizzle.query.params": JSON.stringify(params)
        });
        return this.queryWithCache(query.text, params, async () => {
          return await client.query(query, params);
        });
      });
      return tracer.startActiveSpan("drizzle.mapResponse", () => {
        return customResultMapper ? customResultMapper(result.rows) : result.rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
      });
    });
  }
  all(placeholderValues = {}) {
    return tracer.startActiveSpan("drizzle.execute", () => {
      const params = fillPlaceholders(this.params, placeholderValues);
      this.logger.logQuery(this.rawQueryConfig.text, params);
      return tracer.startActiveSpan("drizzle.driver.execute", (span) => {
        span?.setAttributes({
          "drizzle.query.name": this.rawQueryConfig.name,
          "drizzle.query.text": this.rawQueryConfig.text,
          "drizzle.query.params": JSON.stringify(params)
        });
        return this.queryWithCache(this.rawQueryConfig.text, params, async () => {
          return this.client.query(this.rawQueryConfig, params);
        }).then((result) => result.rows);
      });
    });
  }
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
}

class NodePgSession extends PgSession {
  constructor(client, dialect2, schema2, options = {}) {
    super(dialect2);
    this.client = client;
    this.schema = schema2;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger;
    this.cache = options.cache ?? new NoopCache;
  }
  static [entityKind] = "NodePgSession";
  logger;
  cache;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return new NodePgPreparedQuery(this.client, query.sql, query.params, this.logger, this.cache, queryMetadata, cacheConfig, fields, name, isResponseInArrayMode, customResultMapper);
  }
  async transaction(transaction, config) {
    const isPool = this.client instanceof Pool || Object.getPrototypeOf(this.client).constructor.name.includes("Pool");
    const session2 = isPool ? new NodePgSession(await this.client.connect(), this.dialect, this.schema, this.options) : this;
    const tx = new NodePgTransaction(this.dialect, session2, this.schema);
    await tx.execute(sql`begin${config ? sql` ${tx.getTransactionConfigSQL(config)}` : undefined}`);
    try {
      const result = await transaction(tx);
      await tx.execute(sql`commit`);
      return result;
    } catch (error) {
      await tx.execute(sql`rollback`);
      throw error;
    } finally {
      if (isPool)
        session2.client.release();
    }
  }
  async count(sql22) {
    const res = await this.execute(sql22);
    return Number(res["rows"][0]["count"]);
  }
}

class NodePgTransaction extends PgTransaction {
  static [entityKind] = "NodePgTransaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new NodePgTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
}

// ../../node_modules/drizzle-orm/node-postgres/driver.js
class NodePgDriver {
  constructor(client, dialect2, options = {}) {
    this.client = client;
    this.dialect = dialect2;
    this.options = options;
  }
  static [entityKind] = "NodePgDriver";
  createSession(schema2) {
    return new NodePgSession(this.client, this.dialect, schema2, {
      logger: this.options.logger,
      cache: this.options.cache
    });
  }
}

class NodePgDatabase extends PgDatabase {
  static [entityKind] = "NodePgDatabase";
}
function construct2(client, config = {}) {
  const dialect2 = new PgDialect({ casing: config.casing });
  let logger20;
  if (config.logger === true) {
    logger20 = new DefaultLogger;
  } else if (config.logger !== false) {
    logger20 = config.logger;
  }
  let schema2;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
    schema2 = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new NodePgDriver(client, dialect2, { logger: logger20, cache: config.cache });
  const session2 = driver.createSession(schema2);
  const db2 = new NodePgDatabase(dialect2, session2, schema2);
  db2.$client = client;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
function drizzle2(...params) {
  if (typeof params[0] === "string") {
    const instance = new pg2.Pool({
      connectionString: params[0]
    });
    return construct2(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client)
      return construct2(client, drizzleConfig);
    const instance = typeof connection === "string" ? new pg2.Pool({
      connectionString: connection
    }) : new pg2.Pool(connection);
    return construct2(instance, drizzleConfig);
  }
  return construct2(params[0], params[1]);
}
((drizzle22) => {
  function mock(config) {
    return construct2({}, config);
  }
  drizzle22.mock = mock;
})(drizzle2 || (drizzle2 = {}));

// src/pg/manager.ts
init_drizzle_orm();
import { Pool as Pool2 } from "pg";
import { logger as logger20, validateUuid as validateUuid2 } from "@elizaos/core";

class PostgresConnectionManager {
  pool;
  db;
  _closed = false;
  connectionString;
  rlsServerId;
  constructor(connectionString, rlsServerId) {
    this.connectionString = connectionString;
    this.rlsServerId = rlsServerId;
    const poolConfig = {
      connectionString,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 1e4
    };
    this.pool = new Pool2(poolConfig);
    this.pool.on("error", (err) => {
      logger20.warn({ src: "plugin:sql", error: err?.message || String(err) }, "Pool client error (connection will be replaced)");
    });
    this.db = drizzle2(this.pool, { casing: "snake_case" });
  }
  getDatabase() {
    return this.db;
  }
  getConnection() {
    return this.pool;
  }
  async getClient() {
    return this.pool.connect();
  }
  async testConnection() {
    let client = null;
    try {
      client = await this.pool.connect();
      await client.query("SELECT 1");
      return true;
    } catch (error) {
      logger20.error({ src: "plugin:sql", error: error instanceof Error ? error.message : String(error) }, "Failed to connect to the database");
      return false;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async withIsolationContext(entityId, callback) {
    const dataIsolationEnabled = process.env.ENABLE_DATA_ISOLATION === "true";
    return await this.db.transaction(async (tx) => {
      if (dataIsolationEnabled) {
        if (this.rlsServerId) {
          await tx.execute(sql`SELECT set_config('app.server_id', ${this.rlsServerId}, true)`);
        }
        if (entityId) {
          if (!validateUuid2(entityId)) {
            throw new Error(`Invalid UUID format for entity context: ${entityId}`);
          }
          await tx.execute(sql`SELECT set_config('app.entity_id', ${entityId}, true)`);
        }
      }
      return await callback(tx);
    });
  }
  async close() {
    if (this._closed)
      return;
    this._closed = true;
    await this.pool.end();
  }
  isClosed() {
    return this._closed;
  }
  getConnectionString() {
    return this.connectionString;
  }
  getRlsServerId() {
    return this.rlsServerId;
  }
}

// src/neon/adapter.ts
import { logger as logger21 } from "@elizaos/core";
class NeonDatabaseAdapter extends BaseDrizzleAdapter {
  embeddingDimension = DIMENSION_MAP[384];
  manager;
  constructor(agentId, manager, _schema) {
    super(agentId);
    this.manager = manager;
    this.db = manager.getDatabase();
    this.initStores();
  }
  getManager() {
    return this.manager;
  }
  async withIsolationContext(entityId, callback) {
    return await this.manager.withIsolationContext(entityId, callback);
  }
  async getEntityByIds(entityIds) {
    return this.getEntitiesByIds(entityIds);
  }
  async getMemoriesByServerId(_params) {
    logger21.warn({ src: "plugin:sql:neon" }, "getMemoriesByServerId called but not implemented");
    return [];
  }
  async ensureAgentExists(agent) {
    const existingAgent = await this.getAgent(this.agentId);
    if (existingAgent) {
      return existingAgent;
    }
    const newAgent = {
      id: this.agentId,
      name: agent.name || "Unknown Agent",
      username: agent.username,
      bio: agent.bio || "An AI agent",
      createdAt: agent.createdAt || Date.now(),
      updatedAt: agent.updatedAt || Date.now()
    };
    await this.createAgent(newAgent);
    const createdAgent = await this.getAgent(this.agentId);
    if (!createdAgent) {
      throw new Error("Failed to create agent");
    }
    return createdAgent;
  }
  async withDatabase(operation) {
    return await this.withRetry(async () => {
      return await operation();
    });
  }
  async init() {
    logger21.debug({ src: "plugin:sql:neon" }, "NeonDatabaseAdapter initialized");
  }
  async isReady() {
    return this.manager.testConnection();
  }
  async close() {
    await this.manager.close();
  }
  async getConnection() {
    return this.manager.getConnection();
  }
}

// ../../node_modules/@neondatabase/serverless/index.mjs
var So = Object.create;
var Ie = Object.defineProperty;
var Eo = Object.getOwnPropertyDescriptor;
var Ao = Object.getOwnPropertyNames;
var Co = Object.getPrototypeOf;
var _o = Object.prototype.hasOwnProperty;
var Io = (r, e, t) => (e in r) ? Ie(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t;
var a = (r, e) => Ie(r, "name", { value: e, configurable: true });
var G = (r, e) => () => (r && (e = r(r = 0)), e);
var T = (r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports);
var ie = (r, e) => {
  for (var t in e)
    Ie(r, t, {
      get: e[t],
      enumerable: true
    });
};
var Dn = (r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function")
    for (let i of Ao(e))
      !_o.call(r, i) && i !== t && Ie(r, i, { get: () => e[i], enumerable: !(n = Eo(e, i)) || n.enumerable });
  return r;
};
var Se = (r, e, t) => (t = r != null ? So(Co(r)) : {}, Dn(e || !r || !r.__esModule ? Ie(t, "default", { value: r, enumerable: true }) : t, r));
var O = (r) => Dn(Ie({}, "__esModule", { value: true }), r);
var E = (r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t);
var Qn = T((lt2) => {
  p();
  lt2.byteLength = Po;
  lt2.toByteArray = Ro;
  lt2.fromByteArray = ko;
  var ae = [], te = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (Ee = 0, On = qt.length;Ee < On; ++Ee)
    ae[Ee] = qt[Ee], te[qt.charCodeAt(Ee)] = Ee;
  var Ee, On;
  te[45] = 62;
  te[95] = 63;
  function qn(r) {
    var e = r.length;
    if (e % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  a(qn, "getLens");
  function Po(r) {
    var e = qn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  a(Po, "byteLength");
  function Bo(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  a(Bo, "_byteLength");
  function Ro(r) {
    var e, t = qn(r), n = t[0], i = t[1], s = new To(Bo(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
    for (c = 0;c < u; c += 4)
      e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i === 2 && (e = te[r.charCodeAt(c)] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = te[r.charCodeAt(c)] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  a(Ro, "toByteArray");
  function Lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  a(Lo, "tripletToBase64");
  function Fo(r, e, t) {
    for (var n, i = [], s = e;s < t; s += 3)
      n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(Lo(n));
    return i.join("");
  }
  a(Fo, "encodeChunk");
  function ko(r) {
    for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n;o < u; o += s)
      i.push(Fo(r, o, o + s > u ? u : o + s));
    return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
  }
  a(ko, "fromByteArray");
});
var Nn = T((Qt) => {
  p();
  Qt.read = function(r, e, t, n, i) {
    var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i - 1 : 0, g = t ? -1 : 1, A = r[e + y];
    for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u;f > 0; s = s * 256 + r[e + y], y += g, f -= 8)
      ;
    for (o = s & (1 << -f) - 1, s >>= -f, f += n;f > 0; o = o * 256 + r[e + y], y += g, f -= 8)
      ;
    if (s === 0)
      s = 1 - l;
    else {
      if (s === c)
        return o ? NaN : (A ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - l;
    }
    return (A ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Qt.write = function(r, e, t, n, i, s) {
    var o, u, c, l = s * 8 - i - 1, f = (1 << l) - 1, y = f >> 1, g = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i), o = 0));i >= 8; r[t + A] = u & 255, A += C, u /= 256, i -= 8)
      ;
    for (o = o << i | u, l += i;l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8)
      ;
    r[t + A - C] |= D * 128;
  };
});
var ii = T((Re) => {
  p();
  var Nt = Qn(), Pe = Nn(), Wn = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  Re.Buffer = h;
  Re.SlowBuffer = Qo;
  Re.INSPECT_MAX_BYTES = 50;
  var ft = 2147483647;
  Re.kMaxLength = ft;
  h.TYPED_ARRAY_SUPPORT = Mo();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Mo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return false;
    }
  }
  a(Mo, "typedArraySupport");
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
    if (h.isBuffer(this))
      return this.buffer;
  }, "get") });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
    if (h.isBuffer(this))
      return this.byteOffset;
  }, "get") });
  function he(r) {
    if (r > ft)
      throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(r);
    return Object.setPrototypeOf(e, h.prototype), e;
  }
  a(he, "createBuffer");
  function h(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string")
        throw new TypeError('The "string" argument must be of type string. Received type number');
      return $t(r);
    }
    return Gn(r, e, t);
  }
  a(h, "Buffer");
  h.poolSize = 8192;
  function Gn(r, e, t) {
    if (typeof r == "string")
      return Do(r, e);
    if (ArrayBuffer.isView(r))
      return Oo(r);
    if (r == null)
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(r.buffer, SharedArrayBuffer)))
      return jt(r, e, t);
    if (typeof r == "number")
      throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r)
      return h.from(n, e, t);
    let i = qo(r);
    if (i)
      return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function")
      return h.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  a(Gn, "from");
  h.from = function(r, e, t) {
    return Gn(r, e, t);
  };
  Object.setPrototypeOf(h.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(h, Uint8Array);
  function Vn(r) {
    if (typeof r != "number")
      throw new TypeError('"size" argument must be of type number');
    if (r < 0)
      throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  a(Vn, "assertSize");
  function Uo(r, e, t) {
    return Vn(r), r <= 0 ? he(r) : e !== undefined ? typeof t == "string" ? he(r).fill(e, t) : he(r).fill(e) : he(r);
  }
  a(Uo, "alloc");
  h.alloc = function(r, e, t) {
    return Uo(r, e, t);
  };
  function $t(r) {
    return Vn(r), he(r < 0 ? 0 : Gt(r) | 0);
  }
  a($t, "allocUnsafe");
  h.allocUnsafe = function(r) {
    return $t(r);
  };
  h.allocUnsafeSlow = function(r) {
    return $t(r);
  };
  function Do(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e))
      throw new TypeError("Unknown encoding: " + e);
    let t = zn(r, e) | 0, n = he(t), i = n.write(r, e);
    return i !== t && (n = n.slice(0, i)), n;
  }
  a(Do, "fromString");
  function Wt(r) {
    let e = r.length < 0 ? 0 : Gt(r.length) | 0, t = he(e);
    for (let n = 0;n < e; n += 1)
      t[n] = r[n] & 255;
    return t;
  }
  a(Wt, "fromArrayLike");
  function Oo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return jt(e.buffer, e.byteOffset, e.byteLength);
    }
    return Wt(r);
  }
  a(Oo, "fromArrayView");
  function jt(r, e, t) {
    if (e < 0 || r.byteLength < e)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === undefined && t === undefined ? n = new Uint8Array(r) : t === undefined ? n = new Uint8Array(r, e) : n = new Uint8Array(r, e, t), Object.setPrototypeOf(n, h.prototype), n;
  }
  a(jt, "fromArrayBuffer");
  function qo(r) {
    if (h.isBuffer(r)) {
      let e = Gt(r.length) | 0, t = he(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== undefined)
      return typeof r.length != "number" || zt(r.length) ? he(0) : Wt(r);
    if (r.type === "Buffer" && Array.isArray(r.data))
      return Wt(r.data);
  }
  a(qo, "fromObject");
  function Gt(r) {
    if (r >= ft)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ft.toString(16) + " bytes");
    return r | 0;
  }
  a(Gt, "checked");
  function Qo(r) {
    return +r != r && (r = 0), h.alloc(+r);
  }
  a(Qo, "SlowBuffer");
  h.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== h.prototype;
  }, "isBuffer");
  h.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t))
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (e === t)
      return 0;
    let n = e.length, i = t.length;
    for (let s = 0, o = Math.min(n, i);s < o; ++s)
      if (e[s] !== t[s]) {
        n = e[s], i = t[s];
        break;
      }
    return n < i ? -1 : i < n ? 1 : 0;
  }, "compare");
  h.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  h.concat = a(function(e, t) {
    if (!Array.isArray(e))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (e.length === 0)
      return h.alloc(0);
    let n;
    if (t === undefined)
      for (t = 0, n = 0;n < e.length; ++n)
        t += e[n].length;
    let i = h.allocUnsafe(t), s = 0;
    for (n = 0;n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array))
        s + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
      else if (h.isBuffer(o))
        o.copy(i, s);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i;
  }, "concat");
  function zn(r, e) {
    if (h.isBuffer(r))
      return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer))
      return r.byteLength;
    if (typeof r != "string")
      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r);
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0)
      return 0;
    let i = false;
    for (;; )
      switch (e) {
        case "ascii":
        case "latin1":
        case "binary":
          return t;
        case "utf8":
        case "utf-8":
          return Ht(r).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return t * 2;
        case "hex":
          return t >>> 1;
        case "base64":
          return ni(r).length;
        default:
          if (i)
            return n ? -1 : Ht(r).length;
          e = ("" + e).toLowerCase(), i = true;
      }
  }
  a(zn, "byteLength");
  h.byteLength = zn;
  function No(r, e, t) {
    let n = false;
    if ((e === undefined || e < 0) && (e = 0), e > this.length || ((t === undefined || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e))
      return "";
    for (r || (r = "utf8");; )
      switch (r) {
        case "hex":
          return Zo(this, e, t);
        case "utf8":
        case "utf-8":
          return Yn(this, e, t);
        case "ascii":
          return Ko(this, e, t);
        case "latin1":
        case "binary":
          return Yo(this, e, t);
        case "base64":
          return Vo(this, e, t);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Jo(this, e, t);
        default:
          if (n)
            throw new TypeError("Unknown encoding: " + r);
          r = (r + "").toLowerCase(), n = true;
      }
  }
  a(No, "slowToString");
  h.prototype._isBuffer = true;
  function Ae(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  a(Ae, "swap");
  h.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0;t < e; t += 2)
      Ae(this, t, t + 1);
    return this;
  }, "swap16");
  h.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0;t < e; t += 4)
      Ae(this, t, t + 3), Ae(this, t + 1, t + 2);
    return this;
  }, "swap32");
  h.prototype.swap64 = a(function() {
    let e = this.length;
    if (e % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let t = 0;t < e; t += 8)
      Ae(this, t, t + 7), Ae(this, t + 1, t + 6), Ae(this, t + 2, t + 5), Ae(this, t + 3, t + 4);
    return this;
  }, "swap64");
  h.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Yn(this, 0, e) : No.apply(this, arguments);
  }, "toString");
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = a(function(e) {
    if (!h.isBuffer(e))
      throw new TypeError("Argument must be a Buffer");
    return this === e ? true : h.compare(this, e) === 0;
  }, "equals");
  h.prototype.inspect = a(function() {
    let e = "", t = Re.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Wn && (h.prototype[Wn] = h.prototype.inspect);
  h.prototype.compare = a(function(e, t, n, i, s) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e))
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === undefined && (t = 0), n === undefined && (n = e ? e.length : 0), i === undefined && (i = 0), s === undefined && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length)
      throw new RangeError("out of range index");
    if (i >= s && t >= n)
      return 0;
    if (i >= s)
      return -1;
    if (t >= n)
      return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e)
      return 0;
    let o = s - i, u = n - t, c = Math.min(o, u), l = this.slice(i, s), f = e.slice(t, n);
    for (let y = 0;y < c; ++y)
      if (l[y] !== f[y]) {
        o = l[y], u = f[y];
        break;
      }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Kn(r, e, t, n, i) {
    if (r.length === 0)
      return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, zt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i)
        return -1;
      t = r.length - 1;
    } else if (t < 0)
      if (i)
        t = 0;
      else
        return -1;
    if (typeof e == "string" && (e = h.from(e, n)), h.isBuffer(e))
      return e.length === 0 ? -1 : jn(r, e, t, n, i);
    if (typeof e == "number")
      return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : jn(r, [e], t, n, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  a(Kn, "bidirectionalIndexOf");
  function jn(r, e, t, n, i) {
    let s = 1, o = r.length, u = e.length;
    if (n !== undefined && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2)
        return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(f, y) {
      return s === 1 ? f[y] : f.readUInt16BE(y * s);
    }
    a(c, "read");
    let l;
    if (i) {
      let f = -1;
      for (l = t;l < o; l++)
        if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
          if (f === -1 && (f = l), l - f + 1 === u)
            return f * s;
        } else
          f !== -1 && (l -= l - f), f = -1;
    } else
      for (t + u > o && (t = o - u), l = t;l >= 0; l--) {
        let f = true;
        for (let y = 0;y < u; y++)
          if (c(r, l + y) !== c(e, y)) {
            f = false;
            break;
          }
        if (f)
          return l;
      }
    return -1;
  }
  a(jn, "arrayIndexOf");
  h.prototype.includes = a(function(e, t, n) {
    return this.indexOf(e, t, n) !== -1;
  }, "includes");
  h.prototype.indexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, true);
  }, "indexOf");
  h.prototype.lastIndexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, false);
  }, "lastIndexOf");
  function Wo(r, e, t, n) {
    t = Number(t) || 0;
    let i = r.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0;o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (zt(u))
        return o;
      r[t + o] = u;
    }
    return o;
  }
  a(Wo, "hexWrite");
  function jo(r, e, t, n) {
    return ht(Ht(e, r.length - t), r, t, n);
  }
  a(jo, "utf8Write");
  function Ho(r, e, t, n) {
    return ht(ra(e), r, t, n);
  }
  a(Ho, "asciiWrite");
  function $o(r, e, t, n) {
    return ht(ni(e), r, t, n);
  }
  a($o, "base64Write");
  function Go(r, e, t, n) {
    return ht(na(e, r.length - t), r, t, n);
  }
  a(Go, "ucs2Write");
  h.prototype.write = a(function(e, t, n, i) {
    if (t === undefined)
      i = "utf8", n = this.length, t = 0;
    else if (n === undefined && typeof t == "string")
      i = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === undefined && (i = "utf8")) : (i = n, n = undefined);
    else
      throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === undefined || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let o = false;
    for (;; )
      switch (i) {
        case "hex":
          return Wo(this, e, t, n);
        case "utf8":
        case "utf-8":
          return jo(this, e, t, n);
        case "ascii":
        case "latin1":
        case "binary":
          return Ho(this, e, t, n);
        case "base64":
          return $o(this, e, t, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Go(this, e, t, n);
        default:
          if (o)
            throw new TypeError("Unknown encoding: " + i);
          i = ("" + i).toLowerCase(), o = true;
      }
  }, "write");
  h.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Vo(r, e, t) {
    return e === 0 && t === r.length ? Nt.fromByteArray(r) : Nt.fromByteArray(r.slice(e, t));
  }
  a(Vo, "base64Slice");
  function Yn(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i = e;
    for (;i < t; ) {
      let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i + u <= t) {
        let c, l, f, y;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
            break;
          case 3:
            c = r[i + 1], l = r[i + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            c = r[i + 1], l = r[i + 2], f = r[i + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
    }
    return zo(n);
  }
  a(Yn, "utf8Slice");
  var Hn = 4096;
  function zo(r) {
    let e = r.length;
    if (e <= Hn)
      return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (;n < e; )
      t += String.fromCharCode.apply(String, r.slice(n, n += Hn));
    return t;
  }
  a(zo, "decodeCodePointsArray");
  function Ko(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e;i < t; ++i)
      n += String.fromCharCode(r[i] & 127);
    return n;
  }
  a(Ko, "asciiSlice");
  function Yo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e;i < t; ++i)
      n += String.fromCharCode(r[i]);
    return n;
  }
  a(Yo, "latin1Slice");
  function Zo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let s = e;s < t; ++s)
      i += ia[r[s]];
    return i;
  }
  a(Zo, "hexSlice");
  function Jo(r, e, t) {
    let n = r.slice(e, t), i = "";
    for (let s = 0;s < n.length - 1; s += 2)
      i += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i;
  }
  a(Jo, "utf16leSlice");
  h.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === undefined ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i = this.subarray(e, t);
    return Object.setPrototypeOf(i, h.prototype), i;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0)
      throw new RangeError("offset is not uint");
    if (r + e > t)
      throw new RangeError("Trying to access beyond buffer length");
  }
  a(q, "checkOffset");
  h.prototype.readUintLE = h.prototype.readUIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e], s = 1, o = 0;
    for (;++o < t && (s *= 256); )
      i += this[e + o] * s;
    return i;
  }, "readUIntLE");
  h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e + --t], s = 1;
    for (;t > 0 && (s *= 256); )
      i += this[e + --t] * s;
    return i;
  }, "readUIntBE");
  h.prototype.readUint8 = h.prototype.readUInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e];
  }, "readUInt8");
  h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  h.prototype.readBigUInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === undefined || n === undefined) && je(e, this.length - 8);
    let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  h.prototype.readBigUInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === undefined || n === undefined) && je(e, this.length - 8);
    let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(i) << BigInt(32)) + BigInt(s);
  }, "readBigUInt64BE"));
  h.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e], s = 1, o = 0;
    for (;++o < t && (s *= 256); )
      i += this[e + o] * s;
    return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
  }, "readIntLE");
  h.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = t, s = 1, o = this[e + --i];
    for (;i > 0 && (s *= 256); )
      o += this[e + --i] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  h.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  h.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  h.prototype.readInt16BE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e + 1] | this[e] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16BE");
  h.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  h.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  h.prototype.readBigInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === undefined || n === undefined) && je(e, this.length - 8);
    let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  h.prototype.readBigInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === undefined || n === undefined) && je(e, this.length - 8);
    let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n);
  }, "readBigInt64BE"));
  h.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, true, 23, 4);
  }, "readFloatLE");
  h.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  h.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  h.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, false, 52, 8);
  }, "readDoubleBE");
  function V(r, e, t, n, i, s) {
    if (!h.isBuffer(r))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < s)
      throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length)
      throw new RangeError("Index out of range");
  }
  a(V, "checkInt");
  h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = 1, o = 0;
    for (this[t] = e & 255;++o < n && (s *= 256); )
      this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255;--s >= 0 && (o *= 256); )
      this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Zn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  a(Zn, "wrtBigUInt64LE");
  function Jn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  a(Jn, "wrtBigUInt64BE");
  h.prototype.writeBigUInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64LE"));
  h.prototype.writeBigUInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64BE"));
  h.prototype.writeIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255;++s < n && (o *= 256); )
      e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  h.prototype.writeIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255;--s >= 0 && (o *= 256); )
      e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  h.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  h.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  h.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  h.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  h.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  h.prototype.writeBigInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  h.prototype.writeBigInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64BE"));
  function Xn(r, e, t, n, i, s) {
    if (t + n > r.length)
      throw new RangeError("Index out of range");
    if (t < 0)
      throw new RangeError("Index out of range");
  }
  a(Xn, "checkIEEE754");
  function ei(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 4, 340282346638528860000000000000000000000, -340282346638528860000000000000000000000), Pe.write(r, e, t, n, 23, 4), t + 4;
  }
  a(ei, "writeFloat");
  h.prototype.writeFloatLE = a(function(e, t, n) {
    return ei(this, e, t, true, n);
  }, "writeFloatLE");
  h.prototype.writeFloatBE = a(function(e, t, n) {
    return ei(this, e, t, false, n);
  }, "writeFloatBE");
  function ti(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 8, 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000), Pe.write(r, e, t, n, 52, 8), t + 8;
  }
  a(ti, "writeDouble");
  h.prototype.writeDoubleLE = a(function(e, t, n) {
    return ti(this, e, t, true, n);
  }, "writeDoubleLE");
  h.prototype.writeDoubleBE = a(function(e, t, n) {
    return ti(this, e, t, false, n);
  }, "writeDoubleBE");
  h.prototype.copy = a(function(e, t, n, i) {
    if (!h.isBuffer(e))
      throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0)
      return 0;
    if (t < 0)
      throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length)
      throw new RangeError("Index out of range");
    if (i < 0)
      throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
    let s = i - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
  }, "copy");
  h.prototype.fill = a(function(e, t, n, i) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== undefined && typeof i != "string")
        throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !h.isEncoding(i))
        throw new TypeError("Unknown encoding: " + i);
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (e = o);
      }
    } else
      typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n)
      throw new RangeError("Out of range index");
    if (n <= t)
      return this;
    t = t >>> 0, n = n === undefined ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number")
      for (s = t;s < n; ++s)
        this[s] = e;
    else {
      let o = h.isBuffer(e) ? e : h.from(e, i), u = o.length;
      if (u === 0)
        throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (s = 0;s < n - t; ++s)
        this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Te = {};
  function Vt(r, e, t) {
    var n;
    Te[r] = (n = class extends t {
      constructor() {
        super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(this, "code", { configurable: true, enumerable: true, value: s, writable: true });
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  a(Vt, "E");
  Vt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vt("ERR_INVALID_ARG_TYPE", function(r, e) {
    return `The "${r}" argument must be of type number. Received type ${typeof e}`;
  }, TypeError);
  Vt("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = $n(String(t)) : typeof t == "bigint" && (i = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = $n(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
  }, RangeError);
  function $n(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (;t >= n + 4; t -= 3)
      e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  a($n, "addNumericalSeparator");
  function Xo(r, e, t) {
    Be(e, "offset"), (r[e] === undefined || r[e + t] === undefined) && je(e, r.length - (t + 1));
  }
  a(Xo, "checkBounds");
  function ri(r, e, t, n, i, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Te.ERR_OUT_OF_RANGE("value", u, r);
    }
    Xo(n, i, s);
  }
  a(ri, "checkIntBI");
  function Be(r, e) {
    if (typeof r != "number")
      throw new Te.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  a(Be, "validateNumber");
  function je(r, e, t) {
    throw Math.floor(r) !== r ? (Be(r, t), new Te.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Te.ERR_BUFFER_OUT_OF_BOUNDS : new Te.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  a(je, "boundsError");
  var ea = /[^+/0-9A-Za-z-_]/g;
  function ta(r) {
    if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2)
      return "";
    for (;r.length % 4 !== 0; )
      r = r + "=";
    return r;
  }
  a(ta, "base64clean");
  function Ht(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i = null, s = [];
    for (let o = 0;o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(239, 191, 189), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else
        i && (e -= 3) > -1 && s.push(239, 191, 189);
      if (i = null, t < 128) {
        if ((e -= 1) < 0)
          break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0)
          break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0)
          break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0)
          break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else
        throw new Error("Invalid code point");
    }
    return s;
  }
  a(Ht, "utf8ToBytes");
  function ra(r) {
    let e = [];
    for (let t = 0;t < r.length; ++t)
      e.push(r.charCodeAt(t) & 255);
    return e;
  }
  a(ra, "asciiToBytes");
  function na(r, e) {
    let t, n, i, s = [];
    for (let o = 0;o < r.length && !((e -= 2) < 0); ++o)
      t = r.charCodeAt(o), n = t >> 8, i = t % 256, s.push(i), s.push(n);
    return s;
  }
  a(na, "utf16leToBytes");
  function ni(r) {
    return Nt.toByteArray(ta(r));
  }
  a(ni, "base64ToBytes");
  function ht(r, e, t, n) {
    let i;
    for (i = 0;i < n && !(i + t >= e.length || i >= r.length); ++i)
      e[i + t] = r[i];
    return i;
  }
  a(ht, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  a(ue, "isInstance");
  function zt(r) {
    return r !== r;
  }
  a(zt, "numberIsNaN");
  var ia = function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0;t < 16; ++t) {
      let n = t * 16;
      for (let i = 0;i < 16; ++i)
        e[n + i] = r[t] + r[i];
    }
    return e;
  }();
  function we(r) {
    return typeof BigInt > "u" ? sa : r;
  }
  a(we, "defineBigIntMethod");
  function sa() {
    throw new Error("BigInt not supported");
  }
  a(sa, "BufferBigIntNotDefined");
});
var b;
var v;
var x;
var d;
var m;
var p = G(() => {
  b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : ii().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {});
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var ge = T((Rl, Kt) => {
  p();
  var Le = typeof Reflect == "object" ? Reflect : null, si = Le && typeof Le.apply == "function" ? Le.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), pt;
  Le && typeof Le.ownKeys == "function" ? pt = Le.ownKeys : Object.getOwnPropertySymbols ? pt = a(function(e) {
    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : pt = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function oa(r) {
    console && console.warn && console.warn(r);
  }
  a(oa, "ProcessEmitWarning");
  var ai = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function B() {
    B.init.call(this);
  }
  a(B, "EventEmitter");
  Kt.exports = B;
  Kt.exports.once = la;
  B.EventEmitter = B;
  B.prototype._events = undefined;
  B.prototype._eventsCount = 0;
  B.prototype._maxListeners = undefined;
  var oi = 10;
  function dt(r) {
    if (typeof r != "function")
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  a(dt, "checkListener");
  Object.defineProperty(B, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return oi;
  }, "get"), set: a(function(r) {
    if (typeof r != "number" || r < 0 || ai(r))
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
    oi = r;
  }, "set") });
  B.init = function() {
    (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || undefined;
  };
  B.prototype.setMaxListeners = a(function(e) {
    if (typeof e != "number" || e < 0 || ai(e))
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
    return this._maxListeners = e, this;
  }, "setMaxListeners");
  function ui(r) {
    return r._maxListeners === undefined ? B.defaultMaxListeners : r._maxListeners;
  }
  a(ui, "_getMaxListeners");
  B.prototype.getMaxListeners = a(function() {
    return ui(this);
  }, "getMaxListeners");
  B.prototype.emit = a(function(e) {
    for (var t = [], n = 1;n < arguments.length; n++)
      t.push(arguments[n]);
    var i = e === "error", s = this._events;
    if (s !== undefined)
      i = i && s.error === undefined;
    else if (!i)
      return false;
    if (i) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error)
        throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === undefined)
      return false;
    if (typeof c == "function")
      si(c, this, t);
    else
      for (var l = c.length, f = pi(c, l), n = 0;n < l; ++n)
        si(f[n], this, t);
    return true;
  }, "emit");
  function ci(r, e, t, n) {
    var i, s, o;
    if (dt(t), s = r._events, s === undefined ? (s = r._events = Object.create(null), r._eventsCount = 0) : (s.newListener !== undefined && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === undefined)
      o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = ui(r), i > 0 && o.length > i && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
    }
    return r;
  }
  a(ci, "_addListener");
  B.prototype.addListener = a(function(e, t) {
    return ci(this, e, t, false);
  }, "addListener");
  B.prototype.on = B.prototype.addListener;
  B.prototype.prependListener = a(function(e, t) {
    return ci(this, e, t, true);
  }, "prependListener");
  function aa() {
    if (!this.fired)
      return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  a(aa, "onceWrapper");
  function li(r, e, t) {
    var n = {
      fired: false,
      wrapFn: undefined,
      target: r,
      type: e,
      listener: t
    }, i = aa.bind(n);
    return i.listener = t, n.wrapFn = i, i;
  }
  a(li, "_onceWrap");
  B.prototype.once = a(function(e, t) {
    return dt(t), this.on(e, li(this, e, t)), this;
  }, "once");
  B.prototype.prependOnceListener = a(function(e, t) {
    return dt(t), this.prependListener(e, li(this, e, t)), this;
  }, "prependOnceListener");
  B.prototype.removeListener = a(function(e, t) {
    var n, i, s, o, u;
    if (dt(t), i = this._events, i === undefined)
      return this;
    if (n = i[e], n === undefined)
      return this;
    if (n === t || n.listener === t)
      --this._eventsCount === 0 ? this._events = Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
    else if (typeof n != "function") {
      for (s = -1, o = n.length - 1;o >= 0; o--)
        if (n[o] === t || n[o].listener === t) {
          u = n[o].listener, s = o;
          break;
        }
      if (s < 0)
        return this;
      s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== undefined && this.emit("removeListener", e, u || t);
    }
    return this;
  }, "removeListener");
  B.prototype.off = B.prototype.removeListener;
  B.prototype.removeAllListeners = a(function(e) {
    var t, n, i;
    if (n = this._events, n === undefined)
      return this;
    if (n.removeListener === undefined)
      return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : n[e] !== undefined && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i = 0;i < s.length; ++i)
        o = s[i], o !== "removeListener" && this.removeAllListeners(o);
      return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function")
      this.removeListener(e, t);
    else if (t !== undefined)
      for (i = t.length - 1;i >= 0; i--)
        this.removeListener(e, t[i]);
    return this;
  }, "removeAllListeners");
  function fi(r, e, t) {
    var n = r._events;
    if (n === undefined)
      return [];
    var i = n[e];
    return i === undefined ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? ca(i) : pi(i, i.length);
  }
  a(fi, "_listeners");
  B.prototype.listeners = a(function(e) {
    return fi(this, e, true);
  }, "listeners");
  B.prototype.rawListeners = a(function(e) {
    return fi(this, e, false);
  }, "rawListeners");
  B.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : hi.call(r, e);
  };
  B.prototype.listenerCount = hi;
  function hi(r) {
    var e = this._events;
    if (e !== undefined) {
      var t = e[r];
      if (typeof t == "function")
        return 1;
      if (t !== undefined)
        return t.length;
    }
    return 0;
  }
  a(hi, "listenerCount");
  B.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? pt(this._events) : [];
  }, "eventNames");
  function pi(r, e) {
    for (var t = new Array(e), n = 0;n < e; ++n)
      t[n] = r[n];
    return t;
  }
  a(pi, "arrayClone");
  function ua(r, e) {
    for (;e + 1 < r.length; e++)
      r[e] = r[e + 1];
    r.pop();
  }
  a(ua, "spliceOne");
  function ca(r) {
    for (var e = new Array(r.length), t = 0;t < e.length; ++t)
      e[t] = r[t].listener || r[t];
    return e;
  }
  a(ca, "unwrapListeners");
  function la(r, e) {
    return new Promise(function(t, n) {
      function i(o) {
        r.removeListener(e, s), n(o);
      }
      a(i, "errorListener");
      function s() {
        typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
      }
      a(s, "resolver"), di(r, e, s, { once: true }), e !== "error" && fa(r, i, { once: true });
    });
  }
  a(la, "once");
  function fa(r, e, t) {
    typeof r.on == "function" && di(r, "error", e, t);
  }
  a(fa, "addErrorHandlerIfEventEmitter");
  function di(r, e, t, n) {
    if (typeof r.on == "function")
      n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function")
      r.addEventListener(e, a(function i(s) {
        n.once && r.removeEventListener(e, i), t(s);
      }, "wrapListener"));
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  a(di, "eventTargetAgnosticAddListener");
});
var wi = {};
ie(wi, { Socket: () => ce, isIP: () => ha });
function ha(r) {
  return 0;
}
var mi;
var yi;
var S;
var ce;
var Fe = G(() => {
  p();
  mi = Se(ge(), 1);
  a(ha, "isIP");
  yi = /^[^.]+\./, S = class S2 extends mi.EventEmitter {
    constructor() {
      super(...arguments);
      E(this, "opts", {});
      E(this, "connecting", false);
      E(this, "pending", true);
      E(this, "writable", true);
      E(this, "encrypted", false);
      E(this, "authorized", false);
      E(this, "destroyed", false);
      E(this, "ws", null);
      E(this, "writeBuffer");
      E(this, "tlsState", 0);
      E(this, "tlsRead");
      E(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      S2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      S2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      S2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      S2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return S2.opts.wsProxy ?? S2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      S2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? S2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      S2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? S2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      S2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      S2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return S2.opts.disableSNI ?? S2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      S2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? S2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get disableWarningInBrowsers() {
      return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
    }
    static set disableWarningInBrowsers(t) {
      S2.opts.disableWarningInBrowsers = t;
    }
    get disableWarningInBrowsers() {
      return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
    }
    set disableWarningInBrowsers(t) {
      this.opts.disableWarningInBrowsers = t;
    }
    static get pipelineConnect() {
      return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      S2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? S2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return S2.opts.subtls ?? S2.defaults.subtls;
    }
    static set subtls(t) {
      S2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? S2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      S2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? S2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return S2.opts.rootCerts ?? S2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      S2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? S2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i = this.wsProxy;
      if (i === undefined)
        throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i) {
      this.connecting = true, i && this.once("connect", i);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, l = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
          this.emit("error", f), this.emit("close");
        }), c.addEventListener("message", (f) => {
          if (this.tlsState === 0) {
            let y = d.from(f.data);
            this.emit("data", y);
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), l ? s() : c.addEventListener("open", s);
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== undefined)
          this.ws = new this.webSocketConstructor(l), o(this.ws);
        else
          try {
            this.ws = new WebSocket(l), o(this.ws);
          } catch {
            this.ws = new __unstable_WebSocket(l), o(this.ws);
          }
      } catch (c) {
        let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(f, { headers: { Upgrade: "websocket" } }).then((y) => {
          if (this.ws = y.webSocket, this.ws == null)
            throw c;
          this.ws.accept(), o(this.ws, true);
        }).catch((y) => {
          this.emit("error", new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === undefined)
        throw new Error("For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information.");
      this.tlsState = 1;
      let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : undefined });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (;; ) {
        let t = await this.tlsRead();
        if (t === undefined)
          break;
        {
          let n = d.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws && this.ws.send(t);
        return;
      }
      if (this.writeBuffer === undefined)
        this.writeBuffer = t, setTimeout(() => {
          this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = undefined;
        }, 0);
      else {
        let n = new Uint8Array(this.writeBuffer.length + t.length);
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i = (s) => {}) {
      return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(t, n, i);
      }) : (this.tlsWrite(t), i()), true);
    }
    end(t = d.alloc(0), n = "utf8", i = () => {}) {
      return this.write(t, n, () => {
        this.ws.close(), i();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(S, "Socket"), E(S, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t, n, i) => {
      let s;
      return i?.jwtAuth ? s = t.replace(yi, "apiauth.") : s = t.replace(yi, "api."), "https://" + s + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: undefined,
    webSocketConstructor: undefined,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: undefined,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false,
    disableWarningInBrowsers: false
  }), E(S, "opts", {});
  ce = S;
});
var gi = {};
ie(gi, { parse: () => Yt });
function Yt(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(t.length), { username: i, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(n);
  s = decodeURIComponent(s), i = decodeURIComponent(i), l = decodeURIComponent(l);
  let A = i + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
  return {
    href: r,
    protocol: t,
    auth: A,
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: l,
    search: f,
    query: C,
    hash: g
  };
}
var Zt = G(() => {
  p();
  a(Yt, "parse");
});
var tr = T((Ai) => {
  p();
  Ai.parse = function(r, e) {
    return new er(r, e).parse();
  };
  var vt = class vt2 {
    constructor(e, t) {
      this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(e);
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[")
        for (;!this.isEof(); ) {
          var e = this.nextCharacter();
          if (e.value === "=")
            break;
        }
    }
    parse(e) {
      var t, n, i;
      for (this.consumeDimensions();!this.isEof(); )
        if (t = this.nextCharacter(), t.value === "{" && !i)
          this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(true)), this.position += n.position - 2);
        else if (t.value === "}" && !i) {
          if (this.dimension--, !this.dimension && (this.newEntry(), e))
            return this.entries;
        } else
          t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
      if (this.dimension !== 0)
        throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(vt, "ArrayParser");
  var er = vt;
  function Ca(r) {
    return r;
  }
  a(Ca, "identity");
});
var rr = T((Zl, Ci) => {
  p();
  var _a = tr();
  Ci.exports = { create: a(function(r, e) {
    return { parse: a(function() {
      return _a.parse(r, e);
    }, "parse") };
  }, "create") };
});
var Ti = T((ef, Ii) => {
  p();
  var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ba = /^-?infinity$/;
  Ii.exports = a(function(e) {
    if (Ba.test(e))
      return Number(e.replace("i", "I"));
    var t = Ia.exec(e);
    if (!t)
      return Ra(e) || null;
    var n = !!t[8], i = parseInt(t[1], 10);
    n && (i = _i(i));
    var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(t[4], 10), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
    f = f ? 1000 * parseFloat(f) : 0;
    var y, g = La(e);
    return g != null ? (y = new Date(Date.UTC(i, s, o, u, c, l, f)), nr(i) && y.setUTCFullYear(i), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i, s, o, u, c, l, f), nr(i) && y.setFullYear(i)), y;
  }, "parseDate");
  function Ra(r) {
    var e = Ta.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = _i(t));
      var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
      return nr(t) && o.setFullYear(t), o;
    }
  }
  a(Ra, "getDate");
  function La(r) {
    if (r.endsWith("+00"))
      return 0;
    var e = Pa.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z")
        return 0;
      var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(e[3] || 0, 10) * 60 + parseInt(e[4] || 0, 10);
      return i * n * 1000;
    }
  }
  a(La, "timeZoneOffset");
  function _i(r) {
    return -(r - 1);
  }
  a(_i, "bcYearToNegativeYear");
  function nr(r) {
    return r >= 0 && r < 100;
  }
  a(nr, "is0To99");
});
var Bi = T((nf, Pi) => {
  p();
  Pi.exports = ka;
  var Fa = Object.prototype.hasOwnProperty;
  function ka(r) {
    for (var e = 1;e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t)
        Fa.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }
  a(ka, "extend");
});
var Fi = T((af, Li) => {
  p();
  var Ma = Bi();
  Li.exports = ke;
  function ke(r) {
    if (!(this instanceof ke))
      return new ke(r);
    Ma(this, Va(r));
  }
  a(ke, "PostgresInterval");
  var Ua = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "years"
  ];
  ke.prototype.toPostgres = function() {
    var r = Ua.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, "")), t + " " + e;
    }, this).join(" ");
  };
  var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
  ke.prototype.toISOString = ke.prototype.toISO = function() {
    var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1000).toFixed(6).replace(/0+$/, "")), i + Da[n];
    }
  };
  var ir = "([+-]?\\d+)", Qa = ir + "\\s+years?", Na = ir + "\\s+mons?", Wa = ir + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), Ri = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
  function Ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(e, 10) / 1000;
  }
  a(Ga, "parseMilliseconds");
  function Va(r) {
    if (!r)
      return {};
    var e = Ha.exec(r), t = e[8] === "-";
    return Object.keys(Ri).reduce(function(n, i) {
      var s = Ri[i], o = e[s];
      return !o || (o = i === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i) && (o *= -1), n[i] = o), n;
    }, {});
  }
  a(Va, "parse");
});
var Mi = T((lf, ki) => {
  p();
  ki.exports = a(function(e) {
    if (/^\\x/.test(e))
      return new d(e.substr(2), "hex");
    for (var t = "", n = 0;n < e.length; )
      if (e[n] !== "\\")
        t += e[n], ++n;
      else if (/[0-7]{3}/.test(e.substr(n + 1, 3)))
        t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
      else {
        for (var i = 1;n + i < e.length && e[n + i] === "\\"; )
          i++;
        for (var s = 0;s < Math.floor(i / 2); ++s)
          t += "\\";
        n += Math.floor(i / 2) * 2;
      }
    return new d(t, "binary");
  }, "parseBytea");
});
var Wi = T((pf, Ni) => {
  p();
  var Ve = tr(), ze = rr(), xt = Ti(), Di = Fi(), Oi = Mi();
  function St(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  a(St, "allowNull");
  function qi(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  a(qi, "parseBool");
  function za(r) {
    return r ? Ve.parse(r, qi) : null;
  }
  a(za, "parseBoolArray");
  function Ka(r) {
    return parseInt(r, 10);
  }
  a(Ka, "parseBaseTenInt");
  function sr(r) {
    return r ? Ve.parse(r, St(Ka)) : null;
  }
  a(sr, "parseIntegerArray");
  function Ya(r) {
    return r ? Ve.parse(r, St(function(e) {
      return Qi(e).trim();
    })) : null;
  }
  a(Ya, "parseBigIntegerArray");
  var Za = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = cr(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), or2 = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r);
    return e.parse();
  }, "parseStringArray"), ar = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = xt(t)), t;
    });
    return e.parse();
  }, "parseDateArray"), Ja = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = Di(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), Xa = a(function(r) {
    return r ? Ve.parse(r, St(Oi)) : null;
  }, "parseByteAArray"), ur = a(function(r) {
    return parseInt(r, 10);
  }, "parseInteger"), Qi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), Ui = a(function(r) {
    return r ? Ve.parse(r, St(JSON.parse)) : null;
  }, "parseJsonArray"), cr = a(function(r) {
    return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(r[1]) });
  }, "parsePoint"), eu = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(")
      return null;
    for (var e = "(", t = "", n = false, i = 2;i < r.length - 1; i++) {
      if (n || (e += r[i]), r[i] === ")") {
        n = true;
        continue;
      } else if (!n)
        continue;
      r[i] !== "," && (t += r[i]);
    }
    var s = cr(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), tu = a(function(r) {
    r(20, Qi), r(21, ur), r(23, ur), r(26, ur), r(700, parseFloat), r(701, parseFloat), r(16, qi), r(1082, xt), r(1114, xt), r(1184, xt), r(600, cr), r(651, re), r(718, eu), r(1000, za), r(1001, Xa), r(1005, sr), r(1007, sr), r(1028, sr), r(1016, Ya), r(1017, Za), r(1021, or2), r(1022, or2), r(1231, or2), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(1115, ar), r(1182, ar), r(1185, ar), r(1186, Di), r(1187, Ja), r(17, Oi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Ui), r(3807, Ui), r(3907, re), r(2951, re), r(791, re), r(1183, re), r(1270, re);
  }, "init");
  Ni.exports = { init: tu };
});
var Hi = T((mf, ji) => {
  p();
  var z = 1e6;
  function ru(r) {
    var e = r.readInt32BE(0), t = r.readUInt32BE(4), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i = "", s, o, u, c, l, f;
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
        return n + u + i;
      for (c = "", l = 6 - u.length, f = 0;f < l; f++)
        c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
        return n + u + i;
      for (c = "", l = 6 - u.length, f = 0;f < l; f++)
        c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
        return n + u + i;
      for (c = "", l = 6 - u.length, f = 0;f < l; f++)
        c += "0";
      i = c + u + i;
    }
    return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i;
  }
  a(ru, "readInt8");
  ji.exports = ru;
});
var Ki = T((bf, zi) => {
  p();
  var nu = Hi(), L = a(function(r, e, t, n, i) {
    t = t || 0, n = n || false, i = i || function(A, C, D) {
      return A * Math.pow(2, D) + C;
    };
    var s = t >> 3, o = a(function(A) {
      return n ? ~A & 255 : A;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var l = 0;
    t % 8 + e >= 8 && (l = i(0, o(r[s]) & u, c));
    for (var f = e + t >> 3, y = s + 1;y < f; y++)
      l = i(l, o(r[y]), 8);
    var g = (e + t) % 8;
    return g > 0 && (l = i(l, o(r[f]) >> 8 - g, g)), l;
  }, "parseBits"), Vi = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i = L(r, 1), s = L(r, t, 1);
    if (s === 0)
      return 0;
    var o = 1, u = a(function(l, f, y) {
      l === 0 && (l = 1);
      for (var g = 1;g <= y; g++)
        o /= 2, (f & 1 << y - g) > 0 && (l += o);
      return l;
    }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
    return s == Math.pow(2, t + 1) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), iu = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
  }, "parseInt16"), $i = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 31, 1, true) + 1) : L(r, 31, 1);
  }, "parseInt32"), su = a(function(r) {
    return Vi(r, 23, 8);
  }, "parseFloat32"), ou = a(function(r) {
    return Vi(r, 52, 11);
  }, "parseFloat64"), au = a(function(r) {
    var e = L(r, 16, 32);
    if (e == 49152)
      return NaN;
    for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i = [], s = L(r, 16), o = 0;o < s; o++)
      n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, L(r, 16, 48));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Gi = a(function(r, e) {
    var t = L(e, 1), n = L(e, 63, 1), i = new Date((t === 0 ? 1 : -1) * n / 1000 + 946684800000);
    return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 60000), i.usec = n % 1000, i.getMicroSeconds = function() {
      return this.usec;
    }, i.setMicroSeconds = function(s) {
      this.usec = s;
    }, i.getUTCMicroSeconds = function() {
      return this.usec;
    }, i;
  }, "parseDate"), Ke = a(function(r) {
    for (var e = L(r, 32), t = L(r, 32, 32), n = L(r, 32, 64), i = 96, s = [], o = 0;o < e; o++)
      s[o] = L(r, 32, i), i += 32, i += 32;
    var u = a(function(l) {
      var f = L(r, 32, i);
      if (i += 32, f == 4294967295)
        return null;
      var y;
      if (l == 23 || l == 20)
        return y = L(r, f * 8, i), i += f * 8, y;
      if (l == 25)
        return y = r.toString(this.encoding, i >> 3, (i += f << 3) >> 3), y;
      console.log("ERROR: ElementType not implemented: " + l);
    }, "parseElement"), c = a(function(l, f) {
      var y = [], g;
      if (l.length > 1) {
        var A = l.shift();
        for (g = 0;g < A; g++)
          y[g] = c(l, f);
        l.unshift(A);
      } else
        for (g = 0;g < l[0]; g++)
          y[g] = u(f);
      return y;
    }, "parse");
    return c(s, n);
  }, "parseArray"), uu = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), cu = a(function(r) {
    return r === null ? null : L(r, 8) > 0;
  }, "parseBool"), lu = a(function(r) {
    r(20, nu), r(21, iu), r(23, $i), r(26, $i), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Gi.bind(null, false)), r(1184, Gi.bind(null, true)), r(1000, Ke), r(1007, Ke), r(1016, Ke), r(1008, Ke), r(1009, Ke), r(25, uu);
  }, "init");
  zi.exports = { init: lu };
});
var Zi = T((Sf, Yi) => {
  p();
  Yi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = T((Ze) => {
  p();
  var fu = Wi(), hu = Ki(), pu = rr(), du = Zi();
  Ze.getTypeParser = yu;
  Ze.setTypeParser = mu;
  Ze.arrayParser = pu;
  Ze.builtins = du;
  var Ye = { text: {}, binary: {} };
  function Ji(r) {
    return String(r);
  }
  a(Ji, "noParse");
  function yu(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Ji;
  }
  a(yu, "getTypeParser");
  function mu(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  a(mu, "setTypeParser");
  fu.init(function(r, e) {
    Ye.text[r] = e;
  });
  hu.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var At = T((If, Xi) => {
  p();
  var wu = Je();
  function Et(r) {
    this._types = r || wu, this.text = {}, this.binary = {};
  }
  a(Et, "TypeOverrides");
  Et.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  Et.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  Et.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Xi.exports = Et;
});
function Xe(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
    for (let R = 0, j = 0;R < 16; R++, j += 4)
      A[R] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
    for (let R = 16;R < 64; R++) {
      let j = g(A[R - 15], 7) ^ g(A[R - 15], 18) ^ A[R - 15] >>> 3, le = g(A[R - 2], 17) ^ g(A[R - 2], 19) ^ A[R - 2] >>> 10;
      A[R] = A[R - 16] + j + A[R - 7] + le | 0;
    }
    let I = e, w = t, Z = n, W = i, J = s, X = o, se = u, oe = c;
    for (let R = 0;R < 64; R++) {
      let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), le = J & X ^ ~J & se, de = oe + j + le + y[R] + A[R] | 0, We = g(I, 2) ^ g(I, 13) ^ g(I, 22), fe = I & w ^ I & Z ^ w & Z, _e = We + fe | 0;
      oe = se, se = X, X = J, J = W + de | 0, W = Z, Z = w, w = I, I = de + _e | 0;
    }
    e = e + I | 0, t = t + w | 0, n = n + Z | 0, i = i + W | 0, s = s + J | 0, o = o + X | 0, u = u + se | 0, c = c + oe | 0, f = 0;
  }, "process"), Y = a((I) => {
    typeof I == "string" && (I = new TextEncoder().encode(I));
    for (let w = 0;w < I.length; w++)
      C[f++] = I[w], f === 64 && D();
    l += I.length;
  }, "add"), P = a(() => {
    if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
      for (;f < 64; )
        C[f++] = 0;
      D();
    }
    for (;f < 58; )
      C[f++] = 0;
    let I = l * 8;
    C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
    let w = new Uint8Array(32);
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === undefined ? { add: Y, digest: P } : (Y(r), P());
}
var es = G(() => {
  p();
  a(Xe, "sha256");
});
var U;
var et;
var ts = G(() => {
  p();
  U = class U2 {
    constructor() {
      E(this, "_dataLength", 0);
      E(this, "_bufferLength", 0);
      E(this, "_state", new Int32Array(4));
      E(this, "_buffer", new ArrayBuffer(68));
      E(this, "_buffer8");
      E(this, "_buffer32");
      this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(e).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let { hexChars: t, hexOut: n } = U2, i, s, o, u;
      for (u = 0;u < 4; u += 1)
        for (s = u * 8, i = e[u], o = 0;o < 8; o += 2)
          n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(i & 15), i >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i = e[1], s = e[2], o = e[3];
      n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
      for (o = 0;o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128)
          t[i++] = s;
        else if (s < 2048)
          t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
        else if (s < 55296 || s > 56319)
          t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111)
            throw new Error("Unicode standard supports code points up to U+10FFFF");
          t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        }
        i >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (;; ) {
        for (s = Math.min(e.length - o, 64 - i);s--; )
          t[i++] = e.charCodeAt(o++);
        if (i < 64)
          break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (;; ) {
        for (s = Math.min(e.length - o, 64 - i);s--; )
          t[i++] = e[o++];
        if (i < 64)
          break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let { buffer: t, state: n } = e, i = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0;s < t.length; s += 1)
        this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i), i.set(U2.buffer32Identity)), o <= 4294967295)
        i[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null)
          return;
        let c = parseInt(u[2], 16), l = parseInt(u[1], 16) || 0;
        i[14] = c, i[15] = l;
      }
      return U2._md5cycle(this._state, i), e ? this._state : U2._hex(this._state);
    }
  };
  a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U);
  et = U;
});
var lr = {};
ie(lr, { createHash: () => bu, createHmac: () => vu, randomBytes: () => gu });
function gu(r) {
  return crypto.getRandomValues(d.alloc(r));
}
function bu(r) {
  if (r === "sha256")
    return { update: a(function(e) {
      return { digest: a(function() {
        return d.from(Xe(e));
      }, "digest") };
    }, "update") };
  if (r === "md5")
    return { update: a(function(e) {
      return {
        digest: a(function() {
          return typeof e == "string" ? et.hashStr(e) : et.hashByteArray(e);
        }, "digest")
      };
    }, "update") };
  throw new Error(`Hash type '${r}' not supported`);
}
function vu(r, e) {
  if (r !== "sha256")
    throw new Error(`Only sha256 is supported (requested: '${r}')`);
  return { update: a(function(t) {
    return { digest: a(function() {
      typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(t));
      let n = e.length;
      if (n > 64)
        e = Xe(e);
      else if (n < 64) {
        let c = new Uint8Array(64);
        c.set(e), e = c;
      }
      let i = new Uint8Array(64), s = new Uint8Array(64);
      for (let c = 0;c < 64; c++)
        i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
      let o = new Uint8Array(t.length + 64);
      o.set(i, 0), o.set(t, 64);
      let u = new Uint8Array(96);
      return u.set(s, 0), u.set(Xe(o), 64), d.from(Xe(u));
    }, "digest") };
  }, "update") };
}
var fr = G(() => {
  p();
  es();
  ts();
  a(gu, "randomBytes");
  a(bu, "createHash");
  a(vu, "createHmac");
});
var tt = T((Qf, hr) => {
  p();
  hr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: undefined,
    password: null,
    connectionString: undefined,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 30000,
    client_encoding: "",
    ssl: false,
    application_name: undefined,
    fallback_application_name: undefined,
    options: undefined,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), xu = Me.getTypeParser(20, "text"), Su = Me.getTypeParser(1016, "text");
  hr.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(23, "text") : xu), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : Su);
  });
});
var rt = T((Wf, ns) => {
  p();
  var Eu = (fr(), O(lr)), Au = tt();
  function Cu(r) {
    var e = r.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    return '"' + e + '"';
  }
  a(Cu, "escapeElement");
  function rs(r) {
    for (var e = "{", t = 0;t < r.length; t++)
      t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + rs(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
    return e = e + "}", e;
  }
  a(rs, "arrayString");
  var Ct = a(function(r, e) {
    if (r == null)
      return null;
    if (r instanceof d)
      return r;
    if (ArrayBuffer.isView(r)) {
      var t = d.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? rs(r) : typeof r == "object" ? _u(r, e) : r.toString();
  }, "prepareValue");
  function _u(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1)
        throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), Ct(r.toPostgres(Ct), e);
    }
    return JSON.stringify(r);
  }
  a(_u, "prepareObject");
  function N(r, e) {
    for (r = "" + r;r.length < e; )
      r = "0" + r;
    return r;
  }
  a(N, "pad");
  function Iu(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(r.getHours(), 2) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
    return e < 0 ? (i += "-", e *= -1) : i += "+", i += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i += " BC"), i;
  }
  a(Iu, "dateToString");
  function Tu(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(r.getUTCMilliseconds(), 3);
    return n += "+00:00", t && (n += " BC"), n;
  }
  a(Tu, "dateToStringUTC");
  function Pu(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  a(Pu, "normalizeQueryConfig");
  var pr = a(function(r) {
    return Eu.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Bu = a(function(r, e, t) {
    var n = pr(e + r), i = pr(d.concat([d.from(n), t]));
    return "md5" + i;
  }, "postgresMd5PasswordHash");
  ns.exports = {
    prepareValue: a(function(e) {
      return Ct(e);
    }, "prepareValueWrapper"),
    normalizeQueryConfig: Pu,
    postgresMd5PasswordHash: Bu,
    md5: pr
  };
});
var nt = {};
ie(nt, { default: () => ku });
var ku;
var it = G(() => {
  p();
  ku = {};
});
var ds = T((th, ps) => {
  p();
  var yr = (fr(), O(lr));
  function Mu(r) {
    if (r.indexOf("SCRAM-SHA-256") === -1)
      throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = yr.randomBytes(18).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  a(Mu, "startSession");
  function Uu(r, e, t) {
    if (r.message !== "SASLInitialResponse")
      throw new Error("SASL: Last message was not SASLInitialResponse");
    if (typeof e != "string")
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    if (typeof t != "string")
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = qu(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length)
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i = d.from(n.salt, "base64"), s = Wu(e, i, n.iteration), o = Ue(s, "Client Key"), u = Nu(o), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = Ue(u, y), A = hs(o, g), C = A.toString("base64"), D = Ue(s, "Server Key"), Y = Ue(D, y);
    r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
  }
  a(Uu, "continueSession");
  function Du(r, e) {
    if (r.message !== "SASLResponse")
      throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string")
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = Qu(e);
    if (t !== r.serverSignature)
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  a(Du, "finalizeSession");
  function Ou(r) {
    if (typeof r != "string")
      throw new TypeError("SASL: text must be a string");
    return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  a(Ou, "isPrintableChars");
  function ls(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  a(ls, "isBase64");
  function fs(r) {
    if (typeof r != "string")
      throw new TypeError("SASL: attribute pairs text must be a string");
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e))
        throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  a(fs, "parseAttributePairs");
  function qu(r) {
    let e = fs(r), t = e.get("r");
    if (t) {
      if (!Ou(t))
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ls(n))
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i = e.get("i");
    if (i) {
      if (!/^[1-9][0-9]*$/.test(i))
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  a(qu, "parseServerFirstMessage");
  function Qu(r) {
    let t = fs(r).get("v");
    if (t) {
      if (!ls(t))
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    return { serverSignature: t };
  }
  a(Qu, "parseServerFinalMessage");
  function hs(r, e) {
    if (!d.isBuffer(r))
      throw new TypeError("first argument must be a Buffer");
    if (!d.isBuffer(e))
      throw new TypeError("second argument must be a Buffer");
    if (r.length !== e.length)
      throw new Error("Buffer lengths must match");
    if (r.length === 0)
      throw new Error("Buffers cannot be empty");
    return d.from(r.map((t, n) => r[n] ^ e[n]));
  }
  a(hs, "xorBuffers");
  function Nu(r) {
    return yr.createHash("sha256").update(r).digest();
  }
  a(Nu, "sha256");
  function Ue(r, e) {
    return yr.createHmac("sha256", r).update(e).digest();
  }
  a(Ue, "hmacSha256");
  function Wu(r, e, t) {
    for (var n = Ue(r, d.concat([e, d.from([0, 0, 0, 1])])), i = n, s = 0;s < t - 1; s++)
      n = Ue(r, n), i = hs(i, n);
    return i;
  }
  a(Wu, "Hi");
  ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
});
var mr = {};
ie(mr, { join: () => ju });
function ju(...r) {
  return r.join("/");
}
var wr = G(() => {
  p();
  a(ju, "join");
});
var gr = {};
ie(gr, { stat: () => Hu });
function Hu(r, e) {
  e(new Error("No filesystem"));
}
var br = G(() => {
  p();
  a(Hu, "stat");
});
var vr = {};
ie(vr, { default: () => $u });
var $u;
var xr = G(() => {
  p();
  $u = {};
});
var ys = {};
ie(ys, { StringDecoder: () => Sr });
var Er;
var Sr;
var ms = G(() => {
  p();
  Er = class Er2 {
    constructor(e) {
      E(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(Er, "StringDecoder");
  Sr = Er;
});
var vs = T((fh, bs) => {
  p();
  var { Transform: Gu } = (xr(), O(vr)), { StringDecoder: Vu } = (ms(), O(ys)), ve = Symbol("last"), It = Symbol("decoder");
  function zu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[It].write(r).split(this.matcher), n.length === 1)
        return t();
      n.shift(), this.overflow = false;
    } else
      this[ve] += this[It].write(r), n = this[ve].split(this.matcher);
    this[ve] = n.pop();
    for (let i = 0;i < n.length; i++)
      try {
        gs(this, this.mapper(n[i]));
      } catch (s) {
        return t(s);
      }
    if (this.overflow = this[ve].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error("maximum buffer reached"));
      return;
    }
    t();
  }
  a(zu, "transform");
  function Ku(r) {
    if (this[ve] += this[It].end(), this[ve])
      try {
        gs(this, this.mapper(this[ve]));
      } catch (e) {
        return r(e);
      }
    r();
  }
  a(Ku, "flush");
  function gs(r, e) {
    e !== undefined && r.push(e);
  }
  a(gs, "push");
  function ws(r) {
    return r;
  }
  a(ws, "noop");
  function Yu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
    let n = new Gu(t);
    return n[ve] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
      this._writableState.errorEmitted = false, s(i);
    }, n;
  }
  a(Yu, "split");
  bs.exports = Yu;
});
var Es = T((dh, pe) => {
  p();
  var xs = (wr(), O(mr)), Zu = (xr(), O(vr)).Stream, Ju = vs(), Ss = (it(), O(nt)), Xu = 5432, Tt = m.platform === "win32", st = m.stderr, ec = 56, tc = 7, rc = 61440, nc = 32768;
  function ic(r) {
    return (r & rc) == nc;
  }
  a(ic, "isRegFile");
  var De = ["host", "port", "database", "user", "password"], Ar = De.length, sc = De[Ar - 1];
  function Cr() {
    var r = st instanceof Zu && st.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      st.write(Ss.format.apply(Ss, e));
    }
  }
  a(Cr, "warn");
  Object.defineProperty(pe.exports, "isWin", { get: a(function() {
    return Tt;
  }, "get"), set: a(function(r) {
    Tt = r;
  }, "set") });
  pe.exports.warnTo = function(r) {
    var e = st;
    return st = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec | tc) ? (Cr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Cr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var oc = pe.exports.match = function(r, e) {
    return De.slice(0, -1).reduce(function(t, n, i) {
      return i == 1 && Number(r[n] || Xu) === Number(e[n]) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i = e.pipe(Ju());
    function s(c) {
      var l = ac(c);
      l && uc(l) && oc(r, l) && (n = l[sc], i.end());
    }
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), Cr("WARNING: error on reading file: %s", c), t(undefined);
    }, "onErr");
    e.on("error", u), i.on("data", s).on("end", o).on("error", u);
  };
  var ac = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/))
      return null;
    for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(function(f, y, g) {
      var A = r.substring(y, g);
      Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[De[f]] = A;
    }, "addToObj"), l = 0;l < r.length - 1; l += 1) {
      if (e = r.charAt(l + 1), t = r.charAt(l), u = n == Ar - 1, u) {
        c(n, i);
        break;
      }
      l >= 0 && e == ":" && t !== "\\" && (c(n, i, l + 1), i = l + 2, n += 1);
    }
    return o = Object.keys(o).length === Ar ? o : null, o;
  }, uc = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0;t < De.length; t += 1) {
      var n = e[t], i = r[De[t]] || "", s = n(i);
      if (!s)
        return false;
    }
    return true;
  };
});
var Cs = T((gh, _r) => {
  p();
  var wh = (wr(), O(mr)), As = (br(), O(gr)), Pt = Es();
  _r.exports = function(r, e) {
    var t = Pt.getFileName();
    As.stat(t, function(n, i) {
      if (n || !Pt.usePgPass(i, t))
        return e(undefined);
      var s = As.createReadStream(t);
      Pt.getPassword(r, s, e);
    });
  };
  _r.exports.warnTo = Pt.warnTo;
});
var _s = {};
ie(_s, { default: () => cc });
var cc;
var Is = G(() => {
  p();
  cc = {};
});
var Ps = T((xh, Ts) => {
  p();
  var lc = (Zt(), O(gi)), Ir = (br(), O(gr));
  function Tr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
    for (var n in t)
      Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i = (e.auth || ":").split(":");
    if (t.user = i[0], t.password = i.splice(1).join(":"), t.port = e.port, e.protocol == "socket:")
      return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(0) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Ir.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Ir.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Ir.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  a(Tr, "parse");
  Ts.exports = Tr;
  Tr.parse = Tr;
});
var Bt = T((Ah, Ls) => {
  p();
  var fc = (Is(), O(_s)), Rs = tt(), Bs = Ps().parse, H = a(function(r, e, t) {
    return t === undefined ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Rs[r];
  }, "val"), hc = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return Rs.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(function(r) {
    return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }, "quoteParamValue"), ne2 = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Oe(n));
  }, "add"), Br = class Br2 {
    constructor(e) {
      e = typeof e == "string" ? Bs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Bs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === undefined && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: H("password", e)
      }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === undefined ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1000), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1000));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne2(t, this, "user"), ne2(t, this, "password"), ne2(t, this, "port"), ne2(t, this, "application_name"), ne2(t, this, "fallback_application_name"), ne2(t, this, "connect_timeout"), ne2(t, this, "options");
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne2(t, n, "sslmode"), ne2(t, n, "sslca"), ne2(t, n, "sslkey"), ne2(t, n, "sslcert"), ne2(t, n, "sslrootcert"), this.database && t.push("dbname=" + Oe(this.database)), this.replication && t.push("replication=" + Oe(this.replication)), this.host && t.push("host=" + Oe(this.host)), this.isDomainSocket)
        return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Oe(this.client_encoding)), fc.lookup(this.host, function(i, s) {
        return i ? e(i, null) : (t.push("hostaddr=" + Oe(s)), e(null, t.join(" ")));
      });
    }
  };
  a(Br, "ConnectionParameters");
  var Pr = Br;
  Ls.exports = Pr;
});
var Ms = T((Ih, ks) => {
  p();
  var pc = Je(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Lr = class Lr2 {
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = undefined, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(t[2], 10), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(e.length), n = 0, i = e.length;n < i; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i = e.length;n < i; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](s) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0;t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(Lr, "Result");
  var Rr = Lr;
  ks.exports = Rr;
});
var qs = T((Bh, Os) => {
  p();
  var { EventEmitter: dc } = ge(), Us = Ms(), Ds = rt(), kr = class kr2 extends dc {
    constructor(e, t, n) {
      super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(e.fields);
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(e), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback)
        return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError)
        return this.handleError(this._canceledDueToError, e);
      if (this.callback)
        try {
          this.callback(null, this._results);
        } catch (t) {
          m.nextTick(() => {
            throw t;
          });
        }
      this.emit("end", this._results);
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string")
        return new Error("A query must have either text or a name. Supplying neither is unsupported.");
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {}
  };
  a(kr, "Query");
  var Fr = kr;
  Os.exports = Fr;
});
var ln = T((_) => {
  p();
  Object.defineProperty(_, "__esModule", { value: true });
  _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = undefined;
  _.parseComplete = { name: "parseComplete", length: 5 };
  _.bindComplete = { name: "bindComplete", length: 5 };
  _.closeComplete = { name: "closeComplete", length: 5 };
  _.noData = { name: "noData", length: 5 };
  _.portalSuspended = { name: "portalSuspended", length: 5 };
  _.replicationStart = { name: "replicationStart", length: 4 };
  _.emptyQuery = { name: "emptyQuery", length: 4 };
  _.copyDone = { name: "copyDone", length: 4 };
  var Kr = class Kr2 extends Error {
    constructor(e, t, n) {
      super(e), this.length = t, this.name = n;
    }
  };
  a(Kr, "DatabaseError");
  var Mr = Kr;
  _.DatabaseError = Mr;
  var Yr = class Yr2 {
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Yr, "CopyDataMessage");
  var Ur = Yr;
  _.CopyDataMessage = Ur;
  var Zr = class Zr2 {
    constructor(e, t, n, i) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
    }
  };
  a(Zr, "CopyResponse");
  var Dr = Zr;
  _.CopyResponse = Dr;
  var Jr = class Jr2 {
    constructor(e, t, n, i, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Jr, "Field");
  var Or = Jr;
  _.Field = Or;
  var Xr = class Xr2 {
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
    }
  };
  a(Xr, "RowDescriptionMessage");
  var qr = Xr;
  _.RowDescriptionMessage = qr;
  var en = class en2 {
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(en, "ParameterDescriptionMessage");
  var Qr = en;
  _.ParameterDescriptionMessage = Qr;
  var tn = class tn2 {
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(tn, "ParameterStatusMessage");
  var Nr = tn;
  _.ParameterStatusMessage = Nr;
  var rn = class rn2 {
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(rn, "AuthenticationMD5Password");
  var Wr = rn;
  _.AuthenticationMD5Password = Wr;
  var nn = class nn2 {
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(nn, "BackendKeyDataMessage");
  var jr = nn;
  _.BackendKeyDataMessage = jr;
  var sn = class sn2 {
    constructor(e, t, n, i) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
    }
  };
  a(sn, "NotificationResponseMessage");
  var Hr = sn;
  _.NotificationResponseMessage = Hr;
  var on = class on2 {
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a(on, "ReadyForQueryMessage");
  var $r = on;
  _.ReadyForQueryMessage = $r;
  var an = class an2 {
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(an, "CommandCompleteMessage");
  var Gr = an;
  _.CommandCompleteMessage = Gr;
  var un = class un2 {
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(un, "DataRowMessage");
  var Vr = un;
  _.DataRowMessage = Vr;
  var cn = class cn2 {
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(cn, "NoticeMessage");
  var zr = cn;
  _.NoticeMessage = zr;
});
var Qs = T((Rt) => {
  p();
  Object.defineProperty(Rt, "__esModule", { value: true });
  Rt.Writer = undefined;
  var hn = class hn2 {
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
    }
    ensure(e) {
      if (this.buffer.length - this.offset < e) {
        let n = this.buffer, i = n.length + (n.length >> 1) + e;
        this.buffer = d.allocUnsafe(i), n.copy(this.buffer);
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e)
        this.ensure(1);
      else {
        let t = d.byteLength(e);
        this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      let t = d.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(e.length), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      let t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
    }
  };
  a(hn, "Writer");
  var fn = hn;
  Rt.Writer = fn;
});
var Ws = T((Ft) => {
  p();
  Object.defineProperty(Ft, "__esModule", { value: true });
  Ft.serialize = undefined;
  var pn = Qs(), F = new pn.Writer, yc = a((r) => {
    F.addInt16(3).addInt16(0);
    for (let n of Object.keys(r))
      F.addCString(n).addCString(r[n]);
    F.addCString("client_encoding").addCString("UTF8");
    let e = F.addCString("").flush(), t = e.length + 4;
    return new pn.Writer().addInt32(t).add(e).flush();
  }, "startup"), mc = a(() => {
    let r = d.allocUnsafe(8);
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), wc = a((r) => F.addCString(r).flush(112), "password"), gc = a(function(r, e) {
    return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
  }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
    return F.addString(r).flush(112);
  }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || Ns, n = t.length, i = F.addCString(e).addCString(r.text).addInt16(n);
    for (let s = 0;s < n; s++)
      i.addInt32(t[s]);
    return F.flush(80);
  }, "parse"), qe = new pn.Writer, Sc = a(function(r, e) {
    for (let t = 0;t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (F.addInt16(0), qe.addInt32(-1)) : n instanceof d ? (F.addInt16(1), qe.addInt32(n.length), qe.add(n)) : (F.addInt16(0), qe.addInt32(d.byteLength(n)), qe.addString(n));
    }
  }, "writeValues"), Ec = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || Ns, s = i.length;
    return F.addCString(e).addCString(t), F.addInt16(s), Sc(i, r.valueMapper), F.addInt16(s), F.add(qe.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
  }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
    if (!r || !r.portal && !r.rows)
      return Ac;
    let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i);
    return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), _c = a((r, e) => {
    let t = d.allocUnsafe(16);
    return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(5678, 6), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
  }, "cancel"), dn = a((r, e) => {
    let n = 4 + d.byteLength(e) + 1, i = d.allocUnsafe(1 + n);
    return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
  }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? dn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Bc = a((r) => {
    let e = `${r.type}${r.name || ""}`;
    return dn(67, e);
  }, "close"), Rc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => dn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
    startup: yc,
    password: wc,
    requestSsl: mc,
    sendSASLInitialResponseMessage: gc,
    sendSCRAMClientFinalMessage: bc,
    query: vc,
    parse: xc,
    bind: Ec,
    execute: Cc,
    describe: Pc,
    close: Bc,
    flush: a(() => Fc, "flush"),
    sync: a(() => kc, "sync"),
    end: a(() => Mc, "end"),
    copyData: Rc,
    copyDone: a(() => Uc, "copyDone"),
    copyFail: Lc,
    cancel: _c
  };
  Ft.serialize = Dc;
});
var js = T((kt) => {
  p();
  Object.defineProperty(kt, "__esModule", { value: true });
  kt.BufferReader = undefined;
  var Oc = d.allocUnsafe(0), mn = class mn2 {
    constructor(e = 0) {
      this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(this.offset);
      return this.offset += 4, e;
    }
    uint32() {
      let e = this.buffer.readUInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (;this.buffer[t++] !== 0; )
        ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(mn, "BufferReader");
  var yn = mn;
  kt.BufferReader = yn;
});
var Gs = T((Mt) => {
  p();
  Object.defineProperty(Mt, "__esModule", { value: true });
  Mt.Parser = undefined;
  var k = ln(), qc = js(), wn = 1, Qc = 4, Hs = wn + Qc, $s = d.allocUnsafe(0), bn = class bn2 {
    constructor(e) {
      if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader, e?.mode === "binary")
        throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
      for (;i + Hs <= n; ) {
        let s = this.buffer[i], o = this.buffer.readUInt32BE(i + wn), u = wn + o;
        if (u + i <= n) {
          let c = this.handlePacket(i + Hs, s, o, this.buffer);
          t(c), i += u;
        } else
          break;
      }
      i === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength)
            i = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (;t >= s; )
              s *= 2;
            i = d.allocUnsafe(s);
          }
          this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else
        this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i) {
      switch (t) {
        case 50:
          return k.bindComplete;
        case 49:
          return k.parseComplete;
        case 51:
          return k.closeComplete;
        case 110:
          return k.noData;
        case 115:
          return k.portalSuspended;
        case 99:
          return k.copyDone;
        case 87:
          return k.replicationStart;
        case 73:
          return k.emptyQuery;
        case 68:
          return this.parseDataRowMessage(e, n, i);
        case 67:
          return this.parseCommandCompleteMessage(e, n, i);
        case 90:
          return this.parseReadyForQueryMessage(e, n, i);
        case 65:
          return this.parseNotificationMessage(e, n, i);
        case 82:
          return this.parseAuthenticationResponse(e, n, i);
        case 83:
          return this.parseParameterStatusMessage(e, n, i);
        case 75:
          return this.parseBackendKeyData(e, n, i);
        case 69:
          return this.parseErrorMessage(e, n, i, "error");
        case 78:
          return this.parseErrorMessage(e, n, i, "notice");
        case 84:
          return this.parseRowDescriptionMessage(e, n, i);
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i);
        case 71:
          return this.parseCopyInMessage(e, n, i);
        case 72:
          return this.parseCopyOutMessage(e, n, i);
        case 100:
          return this.parseCopyData(e, n, i);
        default:
          return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.string(1);
      return new k.ReadyForQueryMessage(t, i);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring();
      return new k.CommandCompleteMessage(t, i);
    }
    parseCopyData(e, t, n) {
      let i = n.slice(e, e + (t - 4));
      return new k.CopyDataMessage(t, i);
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyInResponse");
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i, s, o);
      for (let c = 0;c < o; c++)
        u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new k.NotificationResponseMessage(t, i, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new k.RowDescriptionMessage(t, i);
      for (let o = 0;o < i; o++)
        s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new k.Field(e, t, n, i, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i);
      for (let o = 0;o < i; o++)
        s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new Array(i);
      for (let o = 0;o < i; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new k.DataRowMessage(t, s);
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring(), s = this.reader.cstring();
      return new k.ParameterStatusMessage(t, i, s);
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.int32();
      return new k.BackendKeyDataMessage(t, i, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let o = this.reader.bytes(4);
            return new k.AuthenticationMD5Password(t, o);
          }
          break;
        case 10:
          {
            s.name = "authenticationSASL", s.mechanisms = [];
            let o;
            do
              o = this.reader.cstring(), o && s.mechanisms.push(o);
            while (o);
          }
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (;o !== "\x00"; )
        s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(bn, "Parser");
  var gn = bn;
  Mt.Parser = gn;
});
var vn = T((xe) => {
  p();
  Object.defineProperty(xe, "__esModule", { value: true });
  xe.DatabaseError = xe.serialize = xe.parse = undefined;
  var Nc = ln();
  Object.defineProperty(xe, "DatabaseError", { enumerable: true, get: a(function() {
    return Nc.DatabaseError;
  }, "get") });
  var Wc = Ws();
  Object.defineProperty(xe, "serialize", {
    enumerable: true,
    get: a(function() {
      return Wc.serialize;
    }, "get")
  });
  var jc = Gs();
  function Hc(r, e) {
    let t = new jc.Parser;
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  a(Hc, "parse");
  xe.parse = Hc;
});
var Vs = {};
ie(Vs, { connect: () => $c });
function $c({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
var zs = G(() => {
  p();
  a($c, "connect");
});
var En = T((Xh, Zs) => {
  p();
  var Ks = (Fe(), O(wi)), Gc = ge().EventEmitter, { parse: Vc, serialize: Q } = vn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), Sn = class Sn2 extends Gc {
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new Ks.Socket, this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
      });
      let i = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl)
        return this.attachListeners(this.stream);
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (zs(), O(Vs));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(c, n.ssl), ("key" in n.ssl) && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (l) {
          return n.emit("error", l);
        }
        n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on("end", () => {
        this.emit("end");
      }), Vc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(e, t));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(e));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(e));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Ys);
    }
    sync() {
      this._ending = true, this._send(Ys), this._send(zc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(Kc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(Sn, "Connection");
  var xn = Sn;
  Zs.exports = xn;
});
var eo = T((np, Xs) => {
  p();
  var Yc = ge().EventEmitter, rp = (it(), O(nt)), Zc = rt(), An = ds(), Jc = Cs(), Xc = At(), el = Bt(), Js = qs(), tl = tt(), rl = En(), Cn = class Cn2 extends Yc {
    constructor(e) {
      super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a((n) => {
        m.nextTick(() => {
          n.handleError(e, this.connection);
        });
      }, "enqueueError");
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(() => {
          e(i);
        });
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(n), n.once("end", () => {
        let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i) => {
          i ? n(i) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(this)), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
        if (n !== undefined) {
          if (typeof n != "string") {
            t.emit("error", new TypeError("Password must be a string"));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else
          this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : Jc(this.connectionParameters, (n) => {
        n !== undefined && (this.connectionParameters.password = this.password = n), e();
      });
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(() => {
        let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
        this.connection.password(t);
      });
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = An.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
      });
    }
    _handleAuthSASLContinue(e) {
      An.continueSession(this.saslSession, this.password, e.data), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
    _handleAuthSASLFinal(e) {
      An.finalizeSession(this.saslSession, e.data), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback)
          return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting)
        return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting)
        return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(e);
        return;
      }
      this.activeQuery = null, t.handleError(e, this.connection);
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(e);
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(e, this.connection);
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(e.processID, e.secretKey);
        });
      } else
        e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(/"/g, '""') + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i = 0;i < e.length; i++) {
        var s = e[i];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true)
        if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
          this.readyForQuery = false, this.hasExecuted = true;
          let e = this.activeQuery.submit(this.connection);
          e && m.nextTick(() => {
            this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
          });
        } else
          this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i, s, o, u, c;
      if (e == null)
        throw new TypeError("Client was passed a null or undefined query");
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Js(e, t, n), i.callback || (s = new this._Promise((l, f) => {
        i.callback = (y, g) => y ? f(y) : l(g);
      }))), o && (c = i.callback, u = setTimeout(() => {
        var l = new Error("Query read timeout");
        m.nextTick(() => {
          i.handleError(l, this.connection);
        }), c(l), i.callback = () => {};
        var f = this.queryQueue.indexOf(i);
        f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
      }, o), i.callback = (l, f) => {
        clearTimeout(u), c(l, f);
      }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i.handleError(new Error("Client was closed and is not queryable"), this.connection);
      }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(() => {
        i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
      }), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting)
        if (e)
          e();
        else
          return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e)
        this.connection.once("end", e);
      else
        return new this._Promise((t) => {
          this.connection.once("end", t);
        });
    }
  };
  a(Cn, "Client");
  var Ut = Cn;
  Ut.Query = Js;
  Xs.exports = Ut;
});
var io = T((op, no) => {
  p();
  var nl = ge().EventEmitter, to = a(function() {}, "NOOP"), ro = a((r, e) => {
    let t = r.findIndex(e);
    return t === -1 ? undefined : r.splice(t, 1)[0];
  }, "removeWhere"), Tn = class Tn2 {
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(Tn, "IdleItem");
  var _n = Tn, Pn = class Pn2 {
    constructor(e) {
      this.callback = e;
    }
  };
  a(Pn, "PendingItem");
  var Qe = Pn;
  function il() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  a(il, "throwOnDoubleRelease");
  function Dt(r, e) {
    if (e)
      return { callback: e, result: undefined };
    let t, n, i = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(o), o;
    });
    return { callback: i, result: s };
  }
  a(Dt, "promisify");
  function sl(r, e) {
    return a(function t(n) {
      n.client = e, e.removeListener("error", t), e.on("error", () => {
        r.log("additional client error after disconnection due to error", n);
      }), r._remove(e), r.emit("error", n, e);
    }, "idleListener");
  }
  a(sl, "makeIdleListener");
  var Bn = class Bn2 extends nl {
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: e.password
      }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {}, this.Client = this.options.Client || t || ot().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = new WeakSet, this._pendingQueue = [], this._endCallback = undefined, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _isAboveMin() {
      return this._clients.length > this.options.min;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
          this._remove(t.client);
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull())
        return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(t.timeoutId);
        let n = t.client;
        n.ref && n.ref();
        let i = t.idleListener;
        return this._acquireClient(n, e, i, false);
      }
      if (!this._isFull())
        return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = ro(this._idle, (n) => n.client === e);
      t !== undefined && clearTimeout(t.timeoutId), this._clients = this._clients.filter((n) => n !== e), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i) : this.Promise.reject(i);
      }
      let t = Dt(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis)
          return this._pendingQueue.push(new Qe(t.callback)), n;
        let i = a((u, c, l) => {
          clearTimeout(o), t.callback(u, c, l);
        }, "queueCallback"), s = new Qe(i), o = setTimeout(() => {
          ro(this._pendingQueue, (u) => u.callback === i), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return o.unref && o.unref(), this._pendingQueue.push(s), n;
      }
      return this.newClient(new Qe(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(t);
      let n = sl(this, t);
      this.log("checking client timeout");
      let i, s = false;
      this.options.connectionTimeoutMillis && (i = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i && clearTimeout(i), t.on("error", n), o)
          this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, undefined, to);
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(t, new Qe((l, f, y) => y()), n, false);
            }, this.options.maxLifetimeSeconds * 1000);
            u.unref(), t.once("end", () => clearTimeout(u));
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i) {
      i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
        if (s)
          return e.release(s), t.callback(s, undefined, to);
        t.callback(undefined, e, e.release);
      }) : t.callback(undefined, e, e.release);
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i) => {
        n && il(), n = true, this._release(e, t, i);
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new _n(e, t, s)), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = Dt(this.Promise, e);
        return v(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = undefined);
      let i = Dt(this.Promise, n);
      return n = i.callback, this.connect((s, o) => {
        if (s)
          return n(s);
        let u = false, c = a((l) => {
          u || (u = true, o.release(l), n(l));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (l, f) => {
            if (this.log("query dispatched"), o.removeListener("error", c), !u)
              return u = true, o.release(l), l ? n(l) : n(undefined, f);
          });
        } catch (l) {
          return o.release(l), n(l);
        }
      }), i.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = Dt(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Bn, "Pool");
  var In = Bn;
  no.exports = In;
});
var so = {};
ie(so, { default: () => ol });
var ol;
var oo = G(() => {
  p();
  ol = {};
});
var ao = T((lp, al) => {
  al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
    async: "2.6.4",
    bluebird: "3.5.2",
    co: "4.6.0",
    "pg-copy-streams": "0.3.0"
  }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var lo = T((fp, co) => {
  p();
  var uo = ge().EventEmitter, ul = (it(), O(nt)), Rn = rt(), Ne = co.exports = function(r, e, t) {
    uo.call(this), r = Rn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  ul.inherits(Ne, uo);
  var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Ne.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e)
      for (var t in e) {
        var n = cl[t] || t;
        r[n] = e[t];
      }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  Ne.prototype.then = function(r, e) {
    return this._getPromise().then(r, e);
  };
  Ne.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  Ne.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once("error", e);
    }.bind(this)), this._promise);
  };
  Ne.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(function(s, o, u) {
      if (r.native.arrayMode = false, v(function() {
        e.emit("_done");
      }), s)
        return e.handleError(s);
      e._emitRowEvents && (u.length > 1 ? o.forEach((c, l) => {
        c.forEach((f) => {
          e.emit("row", f, u[l]);
        });
      }) : o.forEach(function(c) {
        e.emit("row", c, u);
      })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
    }, "after");
    if (m.domain && (t = m.domain.bind(t)), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(Rn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(this.name, this.text, n.length, function(s) {
        return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
      });
    } else if (this.values) {
      if (!Array.isArray(this.values)) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i = this.values.map(Rn.prepareValue);
      r.native.query(this.text, i, t);
    } else
      r.native.query(this.text, t);
  };
});
var yo = T((yp, po) => {
  p();
  var ll = (oo(), O(so)), fl = At(), dp = ao(), fo = ge().EventEmitter, hl = (it(), O(nt)), pl = Bt(), ho = lo(), K = po.exports = function(r) {
    fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new pl(r);
    this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  K.Query = ho;
  hl.inherits(K, fo);
  K.prototype._errorAllQueries = function(r) {
    let e = a((t) => {
      m.nextTick(() => {
        t.native = this.native, t.handleError(r);
      });
    }, "enqueueError");
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  K.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t)
        return r(t);
      e.native.connect(n, function(i) {
        if (i)
          return e.native.end(), r(i);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  K.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise((e, t) => {
      this._connect((n) => {
        n ? t(n) : e();
      });
    });
  };
  K.prototype.query = function(r, e, t) {
    var n, i, s, o, u;
    if (r == null)
      throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function")
      s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
      let c, l;
      i = new this._Promise((f, y) => {
        c = f, l = y;
      }), n.callback = (f, y) => f ? l(f) : c(y);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error("Query read timeout");
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {};
      var l = this._queryQueue.indexOf(n);
      l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, l) => {
      clearTimeout(o), u(c, l);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client was closed and is not queryable"));
    }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client has encountered a connection error and is not queryable"));
    }), i);
  };
  K.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
    var t;
    return r || (t = new this._Promise(function(n, i) {
      r = a((s) => s ? i(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  K.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  K.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once("_done", function() {
        t._pulseQueryQueue();
      });
    }
  };
  K.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {}) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  K.prototype.ref = function() {};
  K.prototype.unref = function() {};
  K.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(r, e, t);
  };
  K.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var Ln = T((gp, mo) => {
  p();
  mo.exports = yo();
});
var ot = T((vp, at) => {
  p();
  var dl = eo(), yl = tt(), ml = En(), wl = io(), { DatabaseError: gl } = vn(), bl = a((r) => {
    var e;
    return e = class extends wl {
      constructor(n) {
        super(n, r);
      }
    }, a(e, "BoundPool"), e;
  }, "poolFactory"), Fn = a(function(r) {
    this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = Je(), this.DatabaseError = gl;
  }, "PG");
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? at.exports = new Fn(Ln()) : (at.exports = new Fn(dl), Object.defineProperty(at.exports, "native", {
    configurable: true,
    enumerable: false,
    get() {
      var r = null;
      try {
        r = new Fn(Ln());
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND")
          throw e;
      }
      return Object.defineProperty(at.exports, "native", { value: r }), r;
    }
  }));
});
p();
p();
Fe();
Zt();
p();
var pa = Object.defineProperty;
var da = Object.defineProperties;
var ya = Object.getOwnPropertyDescriptors;
var bi = Object.getOwnPropertySymbols;
var ma = Object.prototype.hasOwnProperty;
var wa = Object.prototype.propertyIsEnumerable;
var vi = a((r, e, t) => (e in r) ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t, "__defNormalProp");
var ga = a((r, e) => {
  for (var t in e || (e = {}))
    ma.call(e, t) && vi(r, t, e[t]);
  if (bi)
    for (var t of bi(e))
      wa.call(e, t) && vi(r, t, e[t]);
  return r;
}, "__spreadValues");
var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
var va = 1008000;
var xi = new Uint8Array(new Uint16Array([258]).buffer)[0] === 2;
var xa = new TextDecoder;
var Jt = new TextEncoder;
var yt = Jt.encode("0123456789abcdef");
var mt = Jt.encode("0123456789ABCDEF");
var Sa = Jt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var Si = Sa.slice();
Si[62] = 45;
Si[63] = 95;
var He;
var wt;
function Ea(r, { alphabet: e, scratchArr: t } = {}) {
  if (!He)
    if (He = new Uint16Array(256), wt = new Uint16Array(256), xi)
      for (let C = 0;C < 256; C++)
        He[C] = yt[C & 15] << 8 | yt[C >>> 4], wt[C] = mt[C & 15] << 8 | mt[C >>> 4];
    else
      for (let C = 0;C < 256; C++)
        He[C] = yt[C & 15] | yt[C >>> 4] << 8, wt[C] = mt[C & 15] | mt[C >>> 4] << 8;
  r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
  let n = r.length, i = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(r.buffer, r.byteOffset, s), c = new Uint32Array(o.buffer, o.byteOffset, i), l = e === "upper" ? wt : He, f = 0, y = 0, g;
  if (xi)
    for (;f < s; )
      g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
  else
    for (;f < s; )
      g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
  for (f <<= 2;f < n; )
    o[f] = l[r[f++]];
  return xa.decode(o.subarray(0, n));
}
a(Ea, "_toHex");
function Aa(r, e = {}) {
  let t = "", n = r.length, i = va >>> 1, s = Math.ceil(n / i), o = new Uint16Array(s > 1 ? i : n);
  for (let u = 0;u < s; u++) {
    let c = u * i, l = c + i;
    t += Ea(r.subarray(c, l), ba(ga({}, e), { scratchArr: o }));
  }
  return t;
}
a(Aa, "_toHexChunked");
function Ei(r, e = {}) {
  return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
}
a(Ei, "toHex");
p();
var gt2 = class gt3 {
  constructor(e, t) {
    this.strings = e;
    this.values = t;
  }
  toParameterizedQuery(e = { query: "", params: [] }) {
    let { strings: t, values: n } = this;
    for (let i = 0, s = t.length;i < s; i++)
      if (e.query += t[i], i < n.length) {
        let o = n[i];
        if (o instanceof Ge)
          e.query += o.sql;
        else if (o instanceof Ce)
          if (o.queryData instanceof gt3)
            o.queryData.toParameterizedQuery(e);
          else {
            if (o.queryData.params?.length)
              throw new Error("This query is not composable");
            e.query += o.queryData.query;
          }
        else {
          let { params: u } = e;
          u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
        }
      }
    return e;
  }
};
a(gt2, "SqlTemplate");
var $e = gt2;
var Xt = class Xt2 {
  constructor(e) {
    this.sql = e;
  }
};
a(Xt, "UnsafeRawSql");
var Ge = Xt;
p();
function bt() {
  typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
}
a(bt, "warnIfBrowser");
Fe();
var as = Se(At());
var us = Se(rt());
var _t = class _t2 extends Error {
  constructor(t) {
    super(t);
    E(this, "name", "NeonDbError");
    E(this, "severity");
    E(this, "code");
    E(this, "detail");
    E(this, "hint");
    E(this, "position");
    E(this, "internalPosition");
    E(this, "internalQuery");
    E(this, "where");
    E(this, "schema");
    E(this, "table");
    E(this, "column");
    E(this, "dataType");
    E(this, "constraint");
    E(this, "file");
    E(this, "line");
    E(this, "routine");
    E(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
  }
};
a(_t, "NeonDbError");
var be = _t;
var is2 = "transaction() expects an array of queries, or a function returning an array of queries";
var Ru = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Lu(r) {
  return r instanceof d ? "\\x" + Ei(r) : r;
}
a(Lu, "encodeBuffersAsBytea");
function ss(r) {
  let { query: e, params: t } = r instanceof $e ? r.toParameterizedQuery() : r;
  return { query: e, params: t.map((n) => Lu((0, us.prepareValue)(n))) };
}
a(ss, "prepareQuery");
function cs(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i,
  readOnly: s,
  deferrable: o,
  authToken: u,
  disableWarningInBrowsers: c
} = {}) {
  if (!r)
    throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l;
  try {
    l = Yt(r);
  } catch {
    throw new Error("Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r));
  }
  let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
  if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C)
    throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function D(P, ...I) {
    if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I)))
      throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
    return new Ce(Y, new $e(P, I));
  }
  a(D, "templateFn"), D.query = (P, I, w) => new Ce(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ge(P), D.transaction = async (P, I) => {
    if (typeof P == "function" && (P = P(D)), !Array.isArray(P))
      throw new Error(is2);
    P.forEach((W) => {
      if (!(W instanceof Ce))
        throw new Error(is2);
    });
    let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
    return Y(w, Z, I);
  };
  async function Y(P, I, w) {
    let { fetchEndpoint: Z, fetchFunction: W } = ce, J = Array.isArray(P) ? { queries: P.map((ee) => ss(ee)) } : ss(P), X = n ?? {}, se = e ?? false, oe = t ?? false, R = i, j = s, le = o;
    w !== undefined && (w.fetchOptions !== undefined && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== undefined && (se = w.arrayMode), w.fullResults !== undefined && (oe = w.fullResults), w.isolationLevel !== undefined && (R = w.isolationLevel), w.readOnly !== undefined && (j = w.readOnly), w.deferrable !== undefined && (le = w.deferrable)), I !== undefined && !Array.isArray(I) && I.fetchOptions !== undefined && (X = { ...X, ...I.fetchOptions });
    let de = u;
    !Array.isArray(I) && I?.authToken !== undefined && (de = I.authToken);
    let We = typeof Z == "function" ? Z(g, A, { jwtAuth: de !== undefined }) : Z, fe = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, _e = await Fu(de);
    _e && (fe.Authorization = `Bearer ${_e}`), Array.isArray(P) && (R !== undefined && (fe["Neon-Batch-Isolation-Level"] = R), j !== undefined && (fe["Neon-Batch-Read-Only"] = String(j)), le !== undefined && (fe["Neon-Batch-Deferrable"] = String(le))), c || ce.disableWarningInBrowsers || bt();
    let ye;
    try {
      ye = await (W ?? fetch)(We, { method: "POST", body: JSON.stringify(J), headers: fe, ...X });
    } catch (ee) {
      let M = new be(`Error connecting to database: ${ee}`);
      throw M.sourceError = ee, M;
    }
    if (ye.ok) {
      let ee = await ye.json();
      if (Array.isArray(P)) {
        let M = ee.results;
        if (!Array.isArray(M))
          throw new be("Neon internal error: unexpected result format");
        return M.map(($, me) => {
          let Ot = I[me] ?? {}, vo = Ot.arrayMode ?? se, xo = Ot.fullResults ?? oe;
          return os($, { arrayMode: vo, fullResults: xo, types: Ot.types });
        });
      } else {
        let M = I ?? {}, $ = M.arrayMode ?? se, me = M.fullResults ?? oe;
        return os(ee, { arrayMode: $, fullResults: me, types: M.types });
      }
    } else {
      let { status: ee } = ye;
      if (ee === 400) {
        let M = await ye.json(), $ = new be(M.message);
        for (let me of Ru)
          $[me] = M[me] ?? undefined;
        throw $;
      } else {
        let M = await ye.text();
        throw new be(`Server error (HTTP status ${ee}): ${M}`);
      }
    }
  }
  return a(Y, "execute"), D;
}
a(cs, "neon");
var dr = class dr2 {
  constructor(e, t, n) {
    this.execute = e;
    this.queryData = t;
    this.opts = n;
  }
  then(e, t) {
    return this.execute(this.queryData, this.opts).then(e, t);
  }
  catch(e) {
    return this.execute(this.queryData, this.opts).catch(e);
  }
  finally(e) {
    return this.execute(this.queryData, this.opts).finally(e);
  }
};
a(dr, "NeonQueryPromise");
var Ce = dr;
function os(r, {
  arrayMode: e,
  fullResults: t,
  types: n
}) {
  let i = new as.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i.getTypeParser(c.dataTypeID)), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(c.map((l, f) => [s[f], l === null ? null : o[f](l)])));
  return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i, r) : u;
}
a(os, "processQueryResult");
async function Fu(r) {
  if (typeof r == "string")
    return r;
  if (typeof r == "function")
    try {
      return await Promise.resolve(r());
    } catch (e) {
      let t = new be("Error getting auth token.");
      throw e instanceof Error && (t = new be(`Error getting auth token: ${e.message}`)), t;
    }
}
a(Fu, "getAuthToken");
p();
var go = Se(ot());
p();
var wo = Se(ot());
var kn = class kn2 extends wo.Client {
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i = typeof this.config != "string" && this.config?.host !== undefined || typeof this.config != "string" && this.config?.connectionString !== undefined || m.env.PGHOST !== undefined, s = m.env.USER ?? m.env.USERNAME;
    if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null)
      throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect)
      return o;
    let l = this.connection;
    if (u && l.on("connect", () => l.stream.emit("data", "S")), c) {
      l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
      let f = this.ssl ? "sslconnect" : "connect";
      l.on(f, () => {
        this.neonConfig.disableWarningInBrowsers || bt(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    if (typeof crypto > "u" || crypto.subtle === undefined || crypto.subtle.importKey === undefined)
      throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
    let n = crypto.subtle, i = this.saslSession, s = this.password, o = t.data;
    if (i.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string")
      throw new Error("SASL: protocol error");
    let u = Object.fromEntries(o.split(",").map((M) => {
      if (!/^.=/.test(M))
        throw new Error("SASL: Invalid attribute pair entry");
      let $ = M[0], me = M.substring(2);
      return [$, me];
    })), c = u.r, l = u.s, f = u.i;
    if (!c || !/^[!-+--~]+$/.test(c))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64");
    if (!f || !/^[1-9][0-9]*$/.test(f))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count");
    if (!c.startsWith(i.clientNonce))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    if (c.length === i.clientNonce.length)
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder, C = A.encode(s), D = await n.importKey("raw", C, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]), Y = new Uint8Array(await n.sign("HMAC", D, d.concat([g, d.from([0, 0, 0, 1])]))), P = Y;
    for (var I = 0;I < y - 1; I++)
      Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(P.map((M, $) => P[$] ^ Y[$]));
    let w = P, Z = await n.importKey("raw", w, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest("SHA-256", W), X = "n=*,r=" + i.clientNonce, se = "r=" + c + ",s=" + l + ",i=" + y, oe = "c=biws,r=" + c, R = X + "," + se + "," + oe, j = await n.importKey("raw", J, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var le = new Uint8Array(await n.sign("HMAC", j, A.encode(R))), de = d.from(W.map((M, $) => W[$] ^ le[$])), We = de.toString("base64");
    let fe = await n.importKey("raw", w, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]), _e = await n.sign("HMAC", fe, A.encode("Server Key")), ye = await n.importKey("raw", _e, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var ee = d.from(await n.sign("HMAC", ye, A.encode(R)));
    i.message = "SASLResponse", i.serverSignature = ee.toString("base64"), i.response = oe + ",p=" + We, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(kn, "NeonClient");
var ut = kn;
Fe();
var bo = Se(Bt());
function vl(r, e) {
  if (e)
    return { callback: e, result: undefined };
  let t, n, i = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i, result: s };
}
a(vl, "promisify");
var Un = class Un2 extends go.Pool {
  constructor() {
    super(...arguments);
    E(this, "Client", ut);
    E(this, "hasFetchUnsupportedListeners", false);
    E(this, "addListener", this.on);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i) {
    if (!ce.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function")
      return super.query(t, n, i);
    typeof n == "function" && (i = n, n = undefined);
    let s = vl(this.Promise, i);
    i = s.callback;
    try {
      let o = new bo.default(this.options), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
      cs(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i(undefined, A)).catch((A) => i(A));
    } catch (o) {
      i(o);
    }
    return s.result;
  }
};
a(Un, "NeonPool");
var Mn = Un;
Fe();
var ct = Se(ot());
var export_DatabaseError = ct.DatabaseError;
var export_defaults = ct.defaults;
var export_escapeIdentifier = ct.escapeIdentifier;
var export_escapeLiteral = ct.escapeLiteral;
var export_types = ct.types;
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/

// ../../node_modules/drizzle-orm/neon-serverless/driver.js
init_entity();
init_logger();
init_db();
init_dialect();
init_relations();
init_utils();

// ../../node_modules/drizzle-orm/neon-serverless/session.js
init_cache();
init_entity();
init_logger();
init_pg_core();
init_session();
init_sql();
init_utils();

class NeonPreparedQuery extends PgPreparedQuery {
  constructor(client, queryString, params, logger22, cache, queryMetadata, cacheConfig, fields, name, _isResponseInArrayMode, customResultMapper) {
    super({ sql: queryString, params }, cache, queryMetadata, cacheConfig);
    this.client = client;
    this.params = params;
    this.logger = logger22;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
    this.rawQueryConfig = {
      name,
      text: queryString,
      types: {
        getTypeParser: (typeId, format) => {
          if (typeId === export_types.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return export_types.getTypeParser(typeId, format);
        }
      }
    };
    this.queryConfig = {
      name,
      text: queryString,
      rowMode: "array",
      types: {
        getTypeParser: (typeId, format) => {
          if (typeId === export_types.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === export_types.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return export_types.getTypeParser(typeId, format);
        }
      }
    };
  }
  static [entityKind] = "NeonPreparedQuery";
  rawQueryConfig;
  queryConfig;
  async execute(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.rawQueryConfig.text, params);
    const { fields, client, rawQueryConfig: rawQuery, queryConfig: query, joinsNotNullableMap, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      return await this.queryWithCache(rawQuery.text, params, async () => {
        return await client.query(rawQuery, params);
      });
    }
    const result = await this.queryWithCache(query.text, params, async () => {
      return await client.query(query, params);
    });
    return customResultMapper ? customResultMapper(result.rows) : result.rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
  }
  all(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.rawQueryConfig.text, params);
    return this.queryWithCache(this.rawQueryConfig.text, params, async () => {
      return await this.client.query(this.rawQueryConfig, params);
    }).then((result) => result.rows);
  }
  values(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.rawQueryConfig.text, params);
    return this.queryWithCache(this.queryConfig.text, params, async () => {
      return await this.client.query(this.queryConfig, params);
    }).then((result) => result.rows);
  }
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
}

class NeonSession extends PgSession {
  constructor(client, dialect2, schema2, options = {}) {
    super(dialect2);
    this.client = client;
    this.schema = schema2;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger;
    this.cache = options.cache ?? new NoopCache;
  }
  static [entityKind] = "NeonSession";
  logger;
  cache;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return new NeonPreparedQuery(this.client, query.sql, query.params, this.logger, this.cache, queryMetadata, cacheConfig, fields, name, isResponseInArrayMode, customResultMapper);
  }
  async query(query, params) {
    this.logger.logQuery(query, params);
    const result = await this.client.query({
      rowMode: "array",
      text: query,
      values: params
    });
    return result;
  }
  async queryObjects(query, params) {
    return this.client.query(query, params);
  }
  async count(sql22) {
    const res = await this.execute(sql22);
    return Number(res["rows"][0]["count"]);
  }
  async transaction(transaction, config = {}) {
    const session2 = this.client instanceof Mn ? new NeonSession(await this.client.connect(), this.dialect, this.schema, this.options) : this;
    const tx = new NeonTransaction(this.dialect, session2, this.schema);
    await tx.execute(sql`begin ${tx.getTransactionConfigSQL(config)}`);
    try {
      const result = await transaction(tx);
      await tx.execute(sql`commit`);
      return result;
    } catch (error) {
      await tx.execute(sql`rollback`);
      throw error;
    } finally {
      if (this.client instanceof Mn) {
        session2.client.release();
      }
    }
  }
}

class NeonTransaction extends PgTransaction {
  static [entityKind] = "NeonTransaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new NeonTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (e) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw e;
    }
  }
}

// ../../node_modules/drizzle-orm/neon-serverless/driver.js
class NeonDriver {
  constructor(client, dialect2, options = {}) {
    this.client = client;
    this.dialect = dialect2;
    this.options = options;
  }
  static [entityKind] = "NeonDriver";
  createSession(schema2) {
    return new NeonSession(this.client, this.dialect, schema2, {
      logger: this.options.logger,
      cache: this.options.cache
    });
  }
}

class NeonDatabase extends PgDatabase {
  static [entityKind] = "NeonServerlessDatabase";
}
function construct3(client, config = {}) {
  const dialect2 = new PgDialect({ casing: config.casing });
  let logger22;
  if (config.logger === true) {
    logger22 = new DefaultLogger;
  } else if (config.logger !== false) {
    logger22 = config.logger;
  }
  let schema2;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
    schema2 = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new NeonDriver(client, dialect2, { logger: logger22, cache: config.cache });
  const session2 = driver.createSession(schema2);
  const db2 = new NeonDatabase(dialect2, session2, schema2);
  db2.$client = client;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
function drizzle3(...params) {
  if (typeof params[0] === "string") {
    const instance = new Mn({
      connectionString: params[0]
    });
    return construct3(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ws, ...drizzleConfig } = params[0];
    if (ws) {
      ce.webSocketConstructor = ws;
    }
    if (client)
      return construct3(client, drizzleConfig);
    const instance = typeof connection === "string" ? new Mn({
      connectionString: connection
    }) : new Mn(connection);
    return construct3(instance, drizzleConfig);
  }
  return construct3(params[0], params[1]);
}
((drizzle22) => {
  function mock(config) {
    return construct3({}, config);
  }
  drizzle22.mock = mock;
})(drizzle3 || (drizzle3 = {}));

// src/neon/manager.ts
init_drizzle_orm();
import { logger as logger22, validateUuid as validateUuid3 } from "@elizaos/core";

// ../../node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// src/neon/manager.ts
class NeonConnectionManager {
  pool;
  db;
  _closed = false;
  connectionString;
  rlsServerId;
  constructor(connectionString, rlsServerId) {
    this.connectionString = connectionString;
    this.rlsServerId = rlsServerId;
    if (typeof WebSocket === "undefined") {
      ce.webSocketConstructor = wrapper_default;
    }
    this.pool = new Mn({
      connectionString
    });
    this.db = drizzle3(this.pool, { casing: "snake_case" });
  }
  getDatabase() {
    return this.db;
  }
  getConnection() {
    return this.pool;
  }
  async testConnection() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      logger22.error({ src: "plugin:sql:neon", error: error instanceof Error ? error.message : String(error) }, "Failed to connect to Neon database");
      return false;
    }
  }
  async withIsolationContext(entityId, callback) {
    const dataIsolationEnabled = process.env.ENABLE_DATA_ISOLATION === "true";
    return await this.db.transaction(async (tx) => {
      if (dataIsolationEnabled) {
        if (this.rlsServerId) {
          await tx.execute(sql`SELECT set_config('app.server_id', ${this.rlsServerId}, true)`);
        }
        if (entityId) {
          if (!validateUuid3(entityId)) {
            throw new Error(`Invalid UUID format for entity context: ${entityId}`);
          }
          await tx.execute(sql`SELECT set_config('app.entity_id', ${entityId}, true)`);
        }
      }
      return await callback(tx);
    });
  }
  async close() {
    if (this._closed)
      return;
    this._closed = true;
    await this.pool.end();
  }
  isClosed() {
    return this._closed;
  }
  getConnectionString() {
    return this.connectionString;
  }
  getRlsServerId() {
    return this.rlsServerId;
  }
}

// src/utils.node.ts
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
function isNeonDatabase(url) {
  return url.includes("neon.tech") || url.includes("neon.database");
}
function expandTildePath(filepath) {
  if (filepath && filepath.startsWith("~")) {
    return path.join(process.cwd(), filepath.slice(1));
  }
  return filepath;
}
function resolveEnvFile(startDir = process.cwd()) {
  let currentDir = startDir;
  while (true) {
    const candidate = path.join(currentDir, ".env");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  return path.join(startDir, ".env");
}
function resolvePgliteDir(dir, fallbackDir) {
  const envPath = resolveEnvFile();
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
  let monoPath;
  if (existsSync(path.join(process.cwd(), "packages", "core"))) {
    monoPath = process.cwd();
  } else {
    const twoUp = path.resolve(process.cwd(), "../..");
    if (existsSync(path.join(twoUp, "packages", "core"))) {
      monoPath = twoUp;
    }
  }
  const base = dir ?? process.env.PGLITE_DATA_DIR ?? fallbackDir ?? (monoPath ? path.join(monoPath, ".eliza", ".elizadb") : undefined) ?? path.join(process.cwd(), ".eliza", ".elizadb");
  const resolved = expandTildePath(base);
  const legacyPath = path.join(process.cwd(), ".elizadb");
  if (resolved === legacyPath) {
    const newPath = path.join(process.cwd(), ".eliza", ".elizadb");
    process.env.PGLITE_DATA_DIR = newPath;
    return newPath;
  }
  return resolved;
}

// src/index.node.ts
init_migration_service();
init_rls();
var GLOBAL_SINGLETONS = Symbol.for("@elizaos/plugin-sql/global-singletons");
var globalSymbols = globalThis;
if (!globalSymbols[GLOBAL_SINGLETONS]) {
  globalSymbols[GLOBAL_SINGLETONS] = {};
}
var globalSingletons = globalSymbols[GLOBAL_SINGLETONS];
function createDatabaseAdapter(config, agentId) {
  if (config.postgresUrl) {
    const useNeonDriver = isNeonDatabase(config.postgresUrl);
    const dataIsolationEnabled = process.env.ENABLE_DATA_ISOLATION === "true";
    let rlsServerId;
    let managerKey = "default";
    if (dataIsolationEnabled) {
      const rlsServerIdString = process.env.ELIZA_SERVER_ID;
      if (!rlsServerIdString) {
        throw new Error("[Data Isolation] ENABLE_DATA_ISOLATION=true requires ELIZA_SERVER_ID environment variable");
      }
      rlsServerId = stringToUuid(rlsServerIdString);
      managerKey = rlsServerId;
      logger23.debug({
        src: "plugin:sql",
        rlsServerId: rlsServerId.slice(0, 8),
        serverIdString: rlsServerIdString
      }, "Using connection pool for RLS server");
    }
    const fullManagerKey = `${managerKey}:${useNeonDriver ? "neon" : "pg"}`;
    if (!globalSingletons.postgresConnectionManagers) {
      globalSingletons.postgresConnectionManagers = new Map;
    }
    let manager = globalSingletons.postgresConnectionManagers.get(fullManagerKey);
    if (manager && manager.isClosed()) {
      logger23.debug({ src: "plugin:sql", managerKey: fullManagerKey.slice(0, 16) }, "Existing connection pool was closed, recreating");
      globalSingletons.postgresConnectionManagers.delete(fullManagerKey);
      manager = undefined;
    }
    if (!manager) {
      if (useNeonDriver) {
        logger23.debug({ src: "plugin:sql:neon", managerKey: fullManagerKey.slice(0, 16) }, "Creating new Neon serverless connection pool");
        manager = new NeonConnectionManager(config.postgresUrl, rlsServerId);
      } else {
        logger23.debug({ src: "plugin:sql", managerKey: fullManagerKey.slice(0, 16) }, "Creating new PostgreSQL connection pool");
        manager = new PostgresConnectionManager(config.postgresUrl, rlsServerId);
      }
      globalSingletons.postgresConnectionManagers.set(fullManagerKey, manager);
    }
    if (useNeonDriver) {
      return new NeonDatabaseAdapter(agentId, manager);
    }
    return new PgDatabaseAdapter(agentId, manager);
  }
  const dataDir = resolvePgliteDir(config.dataDir);
  if (dataDir && !dataDir.includes("://")) {
    mkdirSync(dataDir, { recursive: true });
  }
  if (!globalSingletons.pgLiteClientManager) {
    globalSingletons.pgLiteClientManager = new PGliteClientManager({ dataDir });
  }
  return new PgliteDatabaseAdapter(agentId, globalSingletons.pgLiteClientManager);
}
var plugin = {
  name: "@elizaos/plugin-sql",
  description: "A plugin for SQL database access with dynamic schema migrations",
  priority: 0,
  schema: exports_schema,
  init: async (_config, runtime) => {
    runtime.logger.info({ src: "plugin:sql", agentId: runtime.agentId }, "plugin-sql (node) init starting");
    const adapterRegistered = await runtime.isReady().then(() => true).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Database adapter not registered")) {
        runtime.logger.info({ src: "plugin:sql", agentId: runtime.agentId }, "No pre-registered database adapter detected; registering adapter");
      } else {
        runtime.logger.warn({ src: "plugin:sql", agentId: runtime.agentId, error: message }, "Database adapter readiness check error; proceeding to register adapter");
      }
      return false;
    });
    if (adapterRegistered) {
      runtime.logger.info({ src: "plugin:sql", agentId: runtime.agentId }, "Database adapter already registered, skipping creation");
      return;
    }
    const postgresUrl = runtime.getSetting("POSTGRES_URL");
    const dataDir = runtime.getSetting("PGLITE_DATA_DIR");
    const dbAdapter = createDatabaseAdapter({
      dataDir: typeof dataDir === "string" ? dataDir : undefined,
      postgresUrl: typeof postgresUrl === "string" ? postgresUrl : undefined
    }, runtime.agentId);
    runtime.registerDatabaseAdapter(dbAdapter);
    runtime.logger.info({ src: "plugin:sql", agentId: runtime.agentId }, "Database adapter created and registered");
  }
};
var index_node_default = plugin;
export {
  uninstallRLS,
  setServerContext,
  plugin,
  installRLSFunctions,
  getOrCreateRlsServer,
  index_node_default as default,
  createDatabaseAdapter,
  assignAgentToServer,
  applyRLSToNewTables,
  DatabaseMigrationService
};

//# debugId=C3847503A96345A164756E2164756E21
//# sourceMappingURL=index.node.js.map
