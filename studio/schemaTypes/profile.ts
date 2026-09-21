import {defineField, defineType} from 'sanity'
import {nonBlank, publishedId, requiredText} from './validation'

export const profile = defineType({
  name: 'profile', title: 'Profile', type: 'document',
  validation: rule => rule.custom(value => !value || publishedId(value._id) === 'profile' || 'Use the fixed Profile editor.'),
  fields: [
    defineField({name: 'name', type: 'string', validation: requiredText}),
    defineField({name: 'professionalTitle', type: 'string', validation: requiredText}),
    defineField({name: 'email', type: 'string', validation: rule => rule.required().email().custom(nonBlank)}),
    defineField({name: 'availabilityStatus', type: 'string', validation: requiredText}),
    defineField({name: 'links', type: 'object', validation: rule => rule.required(), fields: [
      defineField({name: 'github', type: 'url', validation: rule => rule.required().uri({scheme: ['http', 'https'], allowRelative: false})}),
      defineField({name: 'linkedin', type: 'url', validation: rule => rule.required().uri({scheme: ['http', 'https'], allowRelative: false})}),
    ]}),
  ],
  preview: {select: {title: 'name', subtitle: 'professionalTitle'}},
})
