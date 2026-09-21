import {defineArrayMember, defineField, type StringRule, type ValidationContext} from 'sanity'

// Studio-only queries. Never use a moving API version for identity validation.
export const API_VERSION = '2026-09-21'
export const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const publishedId = (id: string) => id.replace(/^drafts\./, '')
export const nonBlank = (value: string | undefined) =>
  value == null || value.trim().length > 0 || 'Must contain non-whitespace text.'
export const requiredText = (rule: StringRule) => rule.required().custom(nonBlank)

export async function uniqueStableId(value: string | undefined, context: ValidationContext) {
  if (!value || !stableIdPattern.test(value)) return true // Field rules report format/required errors.
  const id = publishedId(context.document?._id ?? '')
  const client = context.getClient({apiVersion: API_VERSION}).withConfig({useCdn: false, perspective: 'raw'})
  const result = await client.fetch<{duplicate: boolean; established: string | null}>(
    `{
      "duplicate": count(*[_type == $type && stableId == $value && !(_id in [$id, $draftId])]) > 0,
      "established": *[_id == $id][0].stableId
    }`,
    {type: context.document?._type, value, id, draftId: `drafts.${id}`},
  )
  if (result.duplicate) return 'This stableId already belongs to another document of this type.'
  if (result.established && result.established !== value) return 'A published stableId cannot be changed.'
  return true
}

export function stableIdField() {
  return defineField({
    name: 'stableId', title: 'Stable ID', type: 'string',
    description: 'Assign deliberately before first publication. Domain identity, not a title, slug or Sanity ID. Published identity changes are rejected; draft-only IDs remain editable.',
    validation: rule => rule.required().regex(stableIdPattern).custom(uniqueStableId),
  })
}

export function textArray(name: string, minimum = 1) {
  return defineField({
    name, type: 'array', description: 'Plain semantic text in editorial order.',
    initialValue: [],
    of: [defineArrayMember({type: 'string', validation: requiredText})],
    validation: rule => rule.required().min(minimum),
  })
}

export function uniqueReferences(values: readonly {_ref?: string}[] | undefined) {
  const ids = (values ?? []).flatMap(value => value?._ref ? [publishedId(value._ref)] : [])
  return new Set(ids).size === ids.length || 'Duplicate references are not allowed.'
}

export function technologyReferences() {
  return defineField({
    name: 'technologies', type: 'array', initialValue: [],
    description: 'Related technologies; visual grouping stays in application code.',
    of: [defineArrayMember({type: 'reference', to: [{type: 'technology'}], validation: rule => rule.required()})],
    validation: rule => rule.required().custom<{_ref?: string}[]>(uniqueReferences),
  })
}

export async function educationIdentity(value: string | undefined, context: ValidationContext) {
  const parent = context.parent as {_key?: string} | undefined
  if (!value || !parent?._key) return true
  const established = await context.getClient({apiVersion: API_VERSION})
    .withConfig({useCdn: false, perspective: 'raw'})
    .fetch<string | null>('*[_id == $id][0].about.education[_key == $key][0].stableId', {
      id: publishedId(context.document?._id ?? ''), key: parent._key,
    })
  return !established || established === value || 'A published education entry must retain its stableId.'
}
