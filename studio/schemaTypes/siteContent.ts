import {defineArrayMember, defineField, defineType} from 'sanity'
import {educationIdentity, publishedId, requiredText, stableIdPattern, textArray} from './validation'

export const siteContent = defineType({
  name: 'siteContent', title: 'Site Content', type: 'document',
  validation: rule => rule.custom(value => !value || publishedId(value._id) === 'siteContent' || 'Use the fixed Site Content editor.'),
  fields: [
    defineField({name: 'hero', type: 'object', validation: rule => rule.required(), fields: [textArray('roles')]}),
    defineField({name: 'about', type: 'object', validation: rule => rule.required(), fields: [
      defineField({name: 'label', type: 'string', validation: requiredText}),
      defineField({name: 'heading', type: 'string', validation: requiredText}),
      defineField({name: 'intro', type: 'string', validation: requiredText}),
      textArray('story'), textArray('beyondCode'), textArray('currentFocus'),
      defineField({name: 'currentFocusSummary', type: 'string', validation: requiredText}),
      textArray('strengths'),
      defineField({name: 'education', type: 'array', description: 'Education in editorial order; keep entry identities when reordering.',
        validation: rule => rule.required().min(1).custom((items: {_key?: string; stableId?: string}[] | undefined) => {
          const ids = (items ?? []).map(item => item.stableId).filter(Boolean)
          return new Set(ids).size === ids.length || 'Education stableIds must be unique within About.'
        }),
        of: [defineArrayMember({name: 'educationEntry', type: 'object', fields: [
          defineField({name: 'stableId', title: 'Stable ID', type: 'string',
            description: 'Assign before first publication. Keep this identity when editing or reordering; published changes are rejected for the same entry.',
            validation: rule => rule.required().regex(stableIdPattern).custom(educationIdentity)}),
          defineField({name: 'institution', type: 'string', validation: requiredText}),
          defineField({name: 'program', type: 'string', validation: requiredText}),
          defineField({name: 'startYear', type: 'number', validation: rule => rule.required().integer().min(1900).max(2100)}),
          defineField({name: 'endYear', type: 'number', validation: rule => rule.required().integer().min(1900).max(2100).min(rule.valueOfField('startYear'))}),
        ], preview: {select: {title: 'program', subtitle: 'institution'}}})],
      }),
    ]}),
    defineField({name: 'currentWork', type: 'object', validation: rule => rule.required(), fields: [
      defineField({name: 'primaryWork', type: 'string', validation: requiredText}),
      textArray('buildLog'), textArray('clientWork', 0), textArray('focus'),
    ]}),
  ],
  preview: {prepare: () => ({title: 'Site Content'})},
})
