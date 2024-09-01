import type { ObjectValue, PrimitiveValue } from '../json/raw';

/**
 * A generic "field" that can be used to define
 * primitive value fields.
 *
 * Replaces "attribute" for primitive value fields.
 * Can also be used to eject from deep-tracking of
 * objects or arrays.
 *
 * A major difference between "field" and "attribute"
 * is that "type" points to a legacy transform on
 * "attribute" that a serializer *might* use, while
 * "type" points to a new-style transform on "field"
 * that a record implmentation *must* use.
 *
 * @typedoc
 */
export type GenericField = {
  kind: 'field';
  name: string;
  /**
   * the name of the transform to use, if any
   * @typedoc
   */
  type?: string;
  /**
   * Options to pass to the transform, if any
   *
   * Must comply to the specific transform's options
   * schema.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * A field that can be used to alias one key to another
 * key present in the cache version of the resource.
 *
 * Unlike DerivedField, an AliasField may write to its
 * source when a record is in an editable mode.
 *
 * AliasFields may utilize a transform, specified by type,
 * to pre/post process the field.
 *
 * An AliasField may also specify a `kind` via options.
 * `kind` may be any other valid field kind other than
 *
 * - `@hash`
 * - `@id`
 * - `@local`
 * - `derived`
 *
 * This allows an AliasField to rename any field in the cache.
 *
 * Alias fields are generally intended to be used to support migrating
 * between different schemas, though there are times where they are useful
 * as a form of advanced derivation when used with a transform. For instance,
 * an AliasField could be used to expose both a string and a Date version of the
 * same field, with both being capable of being written to.
 *
 * @typedoc
 */
export type AliasField = {
  kind: 'alias';
  name: string;
  type: null; // should always be null

  /**
   * The field def for which this is an alias.
   *
   * @typedoc
   */
  options:
    | GenericField
    | ObjectField
    | SchemaObjectField
    | ArrayField
    | SchemaArrayField
    | ResourceField
    | CollectionField
    | LegacyAttributeField
    | LegacyBelongsToField
    | LegacyHasManyField;
};

/**
 * Represents a field whose value is the primary
 * key of the resource.
 *
 * This allows any field to serve as the primary
 * key while still being able to drive identity
 * needs within the system.
 *
 * This is useful for resources that use for instance
 * 'uuid', 'urn' or 'entityUrn' or 'primaryKey' as their
 * primary key field instead of 'id'.
 *
 * @typedoc
 */
export type IdentityField = {
  kind: '@id';

  /**
   * The name of the field that serves as the
   * primary key for the resource.
   *
   * @typedoc
   */
  name: string;
};

/**
 * Represents a specialized field whose computed value
 * will be used as the primary key of a schema-object
 * for serializability and comparison purposes.
 *
 * This field functions similarly to derived fields in that
 * it is non-settable, derived state but differs in that
 * it is only able to compute off of cache state and is given
 * no access to a record instance.
 *
 * This means that if a hashing function wants to compute its value
 * taking into account transformations and derivations it must
 * perform those itself.
 *
 * A schema-array can declare its "key" value to be `@hash` if
 * a schema-object has such a field.
 *
 * Only one hash field is permittable per schema-object, and
 * it should be placed in the `ResourceSchema`'s `@id` field
 * in place of an `IdentityField`.
 *
 * @typedoc
 */
export type HashField = {
  kind: '@hash';

  /**
   * The name of the field that serves as the
   * hash for the resource.
   *
   * Only required if access to this value by
   * the UI is desired, it can be `null` otherwise.
   *
   * @typedoc
   */
  name: string | null;

  /**
   * The name of a function to run to compute the hash.
   * The function will only have access to the cached
   * data for the record.
   *
   * @typedoc
   */
  type: string;

  /**
   * Any options that should be provided to the hash
   * function.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * Represents a field whose value is a local
 * value that is not stored in the cache, nor
 * is it sent to the server.
 *
 * Local fields can be written to, and their
 * value is both memoized and reactive (though
 * not deep-tracked).
 *
 * Because their state is not derived from the cache
 * data or the server, they represent a divorced
 * uncanonical source of state.
 *
 * For this reason Local fields should be used sparingly.
 *
 * Currently, while we document this feature here,
 * only allow our own SchemaRecord should utilize them
 * and the feature should be considered private.
 *
 * Example use cases that drove the creation of local
 * fields are states like `isDestroying` and `isDestroyed`
 * which are specific to a record instance but not
 * stored in the cache. We wanted to be able to drive
 * these fields from schema the same as all other fields.
 *
 * Don't make us regret this decision.
 *
 * @typedoc
 */
export type LocalField = {
  kind: '@local';
  name: string;
  /**
   * Not currently utilized, we are considering
   * allowing transforms to operate on local fields
   *
   * @typedoc
   */
  type?: string;
  options?: { defaultValue?: PrimitiveValue };
};

/**
 * Represents a field whose value is an object
 * with keys pointing to values that are primitive
 * values.
 *
 * If values of the keys are not primitives, or
 * if the key/value pairs have well-defined shape,
 * use 'schema-object' instead.
 *
 * @typedoc
 */
export type ObjectField = {
  kind: 'object';
  name: string;

  /**
   * The name of a transform to pass the entire object
   * through before displaying or serializing it.
   *
   * @typedoc
   */
  type?: string;

  /**
   * Options to pass to the transform, if any
   *
   * Must comply to the specific transform's options
   * schema.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * Represents a field whose value is an object
 * with a well-defined structure described by
 * a non-resource schema.
 *
 * If the object's structure is not well-defined,
 * use 'object' instead.
 *
 * @typedoc
 */
export type SchemaObjectField = {
  kind: 'schema-object';
  name: string;

  /**
   * The name of the schema that describes the
   * structure of the object.
   *
   * These schemas
   *
   * @typedoc
   */
  type: string;

  options?: {
    /**
     * Whether this SchemaObject is Polymorphic.
     *
     * If the SchemaObject is polymorphic, `options.type` must also be supplied.
     *
     * @typedoc
     */
    polymorphic?: boolean;

    /**
     * If the SchemaObject is Polymorphic, the key on the raw cache data to use
     * as the "resource-type" value for the schema-object.
     *
     * Defaults to "type".
     *
     * @typedoc
     */
    type?: string;
  };
};

/**
 * Represents a field whose value is an array
 * of primitive values.
 *
 * If the array's elements are not primitive
 * values, use 'schema-array' instead.
 *
 * @typedoc
 */
export type ArrayField = {
  kind: 'array';
  name: string;

  /**
   * The name of a transform to pass each item
   * in the array through before displaying or
   * or serializing it.
   *
   * @typedoc
   */
  type?: string;

  /**
   * Options to pass to the transform, if any
   *
   * Must comply to the specific transform's options
   * schema.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * Represents a field whose value is an array
 * of objects with a well-defined structure
 * described by a non-resource schema.
 *
 * If the array's elements are not well-defined,
 * use 'array' instead.
 *
 * @typedoc
 */
export type SchemaArrayField = {
  kind: 'schema-array';
  name: string;

  /**
   * The name of the schema that describes the
   * structure of the objects in the array.
   *
   * @typedoc
   */
  type: string;

  /**
   * Options for configuring the behavior of the
   * SchemaArray.
   *
   * @typedoc
   */

  /**
   * Options for configuring the behavior of the
   * SchemaArray.
   *
   * @typedoc
   */
  options?: {
    /**
     * Configures how the SchemaArray determines whether
     * an object in the cache is the same as an object
     * previously used to instantiate one of the schema-objects
     * it contains.
     *
     * The default is `'@identity'`.
     *
     * Valid options are:
     *
     * - `'@identity'` (default) : the cached object's referential identity will be used.
     *       This may result in significant instability when resource data is updated from the API
     * - `'@index'`              : the cached object's index in the array will be used.
     *       This is only a good choice for arrays that rarely if ever change membership
     * - `'@hash'`               : will lookup the `@hash` function supplied in the ResourceSchema for
     *       The contained schema-object and use the computed result to determine and compare identity.
     * - <field-name> (string)   : the name of a field to use as the key, only GenericFields (kind `field`)
     *       Are valid field names for this purpose. The cache state without transforms applied will be
     *       used when comparing values. The field value should be unique enough to guarantee two schema-objects
     *       of the same type will not collide.
     *
     * @typedoc
     */
    key?: '@identity' | '@index' | '@hash' | string;

    /**
     * Whether this SchemaArray is Polymorphic.
     *
     * If the SchemaArray is polymorphic, `options.type` must also be supplied.
     *
     * @typedoc
     */
    polymorphic?: boolean;

    /**
     * If the SchemaArray is Polymorphic, the key on the raw cache data to use
     * as the "resource-type" value for the schema-object.
     *
     * Defaults to "type".
     *
     * @typedoc
     */
    type?: string;
  };
};

/**
 * Represents a field whose value is derived
 * from other fields in the schema.
 *
 * The value is read-only, and is not stored
 * in the cache, nor is it sent to the server.
 *
 * Usage of derived fields should be minimized
 * to scenarios where the derivation is known
 * to be safe. For instance, derivations that
 * required fields that are not always loaded
 * or that require access to related resources
 * that may not be loaded should be avoided.
 *
 * @typedoc
 */
export type DerivedField = {
  kind: 'derived';
  name: string;

  /**
   * The name of the derivation to use.
   *
   * Derivations are functions that take the
   * record, options, and the name of the field
   * as arguments, and return the derived value.
   *
   * Derivations are memoized, and are only
   * recomputed when the fields they depend on
   * change.
   *
   * Derivations are not stored in the cache,
   * and are not sent to the server.
   *
   * Derivation functions must be explicitly
   * registered with the schema service.
   *
   * @typedoc
   */
  type: string;

  /**
   * Options to pass to the derivation, if any
   *
   * Must comply to the specific derivation's
   * options schema.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * Represents a field that is a reference to
 * another resource.
 *
 * @typedoc
 */
export type ResourceField = {
  kind: 'resource';
  name: string;

  /**
   * The name of the resource that this field
   * refers to. In the case of a polymorphic
   * relationship, this should be the trait
   * or abstract type.
   *
   * @typedoc
   */
  type: string;

  /**
   * Options for resources are optional. If
   * not present, all options are presumed
   * to be falsey
   *
   * @typedoc
   */
  options?: {
    /**
     * Whether the relationship is async
     *
     * If true, it is expected that the cache
     * data for this field will contain a link
     * that can be used to fetch the related
     * resource when needed.
     *
     * @typedoc
     */
    async?: boolean;

    /**
     * The name of the inverse field on the
     * related resource that points back to
     * this field on this resource to form a
     * bidirectional relationship.
     *
     * If null, the relationship is unidirectional.
     *
     * @typedoc
     */
    inverse?: string | null;

    /**
     * If this field is satisfying a polymorphic
     * relationship on another resource, then this
     * should be set to the trait or abstract type
     * that this resource implements.
     *
     * @typedoc
     */
    as?: string;

    /**
     * Whether this field is a polymorphic relationship,
     * meaning that it can point to multiple types of
     * resources so long as they implement the trait
     * or abstract type specified in `type`.
     *
     * @typedoc
     */
    polymorphic?: boolean;
  };
};

/**
 * Represents a field that is a reference to
 * a collection of other resources, potentially
 * paginate.
 *
 * @typedoc
 */
export type CollectionField = {
  kind: 'collection';
  name: string;

  /**
   * The name of the resource that this field
   * refers to. In the case of a polymorphic
   * relationship, this should be the trait
   * or abstract type.
   *
   * @typedoc
   */
  type: string;

  /**
   * Options for resources are optional. If
   * not present, all options are presumed
   * to be falsey
   *
   * @typedoc
   */
  options?: {
    /**
     * Whether the relationship is async
     *
     * If true, it is expected that the cache
     * data for this field will contain links
     * that can be used to fetch the related
     * resources when needed.
     *
     * When false, it is expected that all related
     * resources are loaded together with this resource,
     * and that the cache data for this field will
     * contain the full list of pointers.
     *
     * When true, it is expected that the relationship
     * is paginated. If the relationship is not paginated,
     * then the cache data for "page 1" would contain the
     * full list of pointers, and loading "page 1" would
     * load all related resources.
     *
     * @typedoc
     */
    async?: boolean;

    /**
     * The name of the inverse field on the
     * related resource that points back to
     * this field on this resource to form a
     * bidirectional relationship.
     *
     * If null, the relationship is unidirectional.
     *
     * @typedoc
     */
    inverse?: string | null;

    /**
     * If this field is satisfying a polymorphic
     * relationship on another resource, then this
     * should be set to the trait or abstract type
     * that this resource implements.
     *
     * @typedoc
     */
    as?: string;

    /**
     * Whether this field is a polymorphic relationship,
     * meaning that it can point to multiple types of
     * resources so long as they implement the trait
     * or abstract type specified in `type`.
     *
     * @typedoc
     */
    polymorphic?: boolean;
  };
};

/**
 * > [!CAUTION]
 * > This Field is LEGACY
 *
 * A generic "field" that can be used to define
 * primitive value fields.
 *
 * If the field points to an object or array,
 * it will not be deep-tracked.
 *
 * Transforms when defined are legacy transforms
 * that a serializer *might* use, but their usage
 * is not guaranteed.
 *
 * @typedoc
 */
export type LegacyAttributeField = {
  kind: 'attribute';
  name: string;
  /**
   * The name of the transform to use, if any
   *
   * @typedoc
   */
  type?: string | null;
  /**
   * Options to pass to the transform, if any
   *
   * Must comply to the specific transform's options
   * schema.
   *
   * @typedoc
   */
  options?: ObjectValue;
};

/**
 * > [!CAUTION]
 * > This Field is LEGACY
 *
 * Represents a field that is a reference to
 * another resource.
 *
 * This is the legacy version of the `ResourceField`.
 *
 * @typedoc
 */
export type LegacyBelongsToField = {
  kind: 'belongsTo';
  name: string;

  /**
   * The name of the resource that this field
   * refers to. In the case of a polymorphic
   * relationship, this should be the trait
   * or abstract type.
   *
   * @typedoc
   */
  type: string;

  /**
   * Options for belongsTo are mandatory.
   *
   * @typedoc
   */
  options: {
    /**
     * Whether the relationship is async
     *
     * If true, it is expected that the cache
     * data for this field will contain a link
     * or a pointer that can be used to fetch
     * the related resource when needed.
     *
     * Pointers are highly discouraged.
     *
     * @typedoc
     */
    async: boolean;

    /**
     * The name of the inverse field on the
     * related resource that points back to
     * this field on this resource to form a
     * bidirectional relationship.
     *
     * If null, the relationship is unidirectional.
     *
     * @typedoc
     */
    inverse: string | null;

    /**
     * If this field is satisfying a polymorphic
     * relationship on another resource, then this
     * should be set to the trait or abstract type
     * that this resource implements.
     *
     * @typedoc
     */
    as?: string;

    /**
     * Whether this field is a polymorphic relationship,
     * meaning that it can point to multiple types of
     * resources so long as they implement the trait
     * or abstract type specified in `type`.
     *
     * @typedoc
     */
    polymorphic?: boolean;

    /**
     * When omitted, the cache data for this field will
     * clear local state of all changes except for the
     * addition of records still in the "new" state any
     * time the remote data for this field is updated.
     *
     * When set to `false`, the cache data for this field
     * will instead intelligently commit any changes from
     * local state that are present in the remote data,
     * leaving any remaining changes in local state still.
     *
     * @typedoc
     */
    resetOnRemoteUpdate?: false;
  };
};

/**
 * > [!CAUTION]
 * > This Field is LEGACY
 *
 * Represents a field that is a reference to
 * a collection of other resources.
 *
 * This is the legacy version of the `CollectionField`.
 *
 * @typedoc
 */
export type LegacyHasManyField = {
  kind: 'hasMany';
  name: string;
  type: string;

  /**
   * Options for hasMany are mandatory.
   *
   * @typedoc
   */
  options: {
    /**
     * Whether the relationship is async
     *
     * If true, it is expected that the cache
     * data for this field will contain links
     * or pointers that can be used to fetch
     * the related resources when needed.
     *
     * When false, it is expected that all related
     * resources are loaded together with this resource,
     * and that the cache data for this field will
     * contain the full list of pointers.
     *
     * hasMany relationships do not support pagination.
     *
     * @typedoc
     */
    async: boolean;

    /**
     * The name of the inverse field on the
     * related resource that points back to
     * this field on this resource to form a
     * bidirectional relationship.
     *
     * If null, the relationship is unidirectional.
     *
     * @typedoc
     */
    inverse: string | null;

    /**
     * If this field is satisfying a polymorphic
     * relationship on another resource, then this
     * should be set to the trait or abstract type
     * that this resource implements.
     *
     * @typedoc
     */
    as?: string;

    /**
     * Whether this field is a polymorphic relationship,
     * meaning that it can point to multiple types of
     * resources so long as they implement the trait
     * or abstract type specified in `type`.
     *
     * @typedoc
     */
    polymorphic?: boolean;

    /**
     * When omitted, the cache data for this field will
     * clear local state of all changes except for the
     * addition of records still in the "new" state any
     * time the remote data for this field is updated.
     *
     * When set to `false`, the cache data for this field
     * will instead intelligently commit any changes from
     * local state that are present in the remote data,
     * leaving any remaining changes in local state still.
     *
     * @typedoc
     */
    resetOnRemoteUpdate?: false;
  };
};

export type FieldSchema =
  | GenericField
  | AliasField
  | LocalField
  | ObjectField
  | SchemaObjectField
  | ArrayField
  | SchemaArrayField
  | DerivedField
  | ResourceField
  | CollectionField
  | LegacyAttributeField
  | LegacyBelongsToField
  | LegacyHasManyField;

export type ResourceSchema = {
  legacy?: boolean;
  /**
   * For primary resources, this should be an IdentityField
   *
   * for schema-objects, this should be either a HashField or null
   *
   * @typedoc
   */
  identity: IdentityField | HashField | null;
  /**
   * The name of the schema
   *
   * For cacheable resources, this should be the
   * primary resource type.
   *
   * For object schemas, this should be the name
   * of the object schema. object schemas should
   * follow the following guidelines for naming
   *
   * - for globally shared objects: The pattern `$field:${KlassName}` e.g. `$field:AddressObject`
   * - for resource-specific objects: The pattern `$${ResourceKlassName}:$field:${KlassName}` e.g. `$User:$field:ReusableAddress`
   * - for inline objects: The pattern `$${ResourceKlassName}.${fieldPath}:$field:anonymous` e.g. `$User.shippingAddress:$field:anonymous`
   *
   * @typedoc
   */
  type: string;
  traits?: string[];
  fields: FieldSchema[];
};

export type LegacyFieldSchema = LegacyAttributeField | LegacyBelongsToField | LegacyHasManyField;
export type LegacyRelationshipSchema = LegacyBelongsToField | LegacyHasManyField;
